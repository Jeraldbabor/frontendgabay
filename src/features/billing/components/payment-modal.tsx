"use client";

/* eslint-disable @next/next/no-img-element -- QR and receipt previews use runtime URLs. */
import { useEffect, useId, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Crown,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import type { PaymentCheckoutCatalog } from "@gabay/types";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { api } from "@/shared/lib/api-client";
import { useAction, useResource } from "@/shared/hooks/use-resource";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { Feedback, Field, Input, Textarea } from "@/shared/components/ui/form";
import { useToast } from "@/shared/components/ui/toast";
import { pesos } from "@/shared/lib/utils";
import { PaymentModalSkeleton } from "./billing-skeletons";
import styles from "./payment.module.css";

export function PaymentModal({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { user } = useAuth();
  const checkout = useResource<PaymentCheckoutCatalog>("/payments/checkout");
  const action = useAction();
  const { toast } = useToast();
  const [methodId, setMethodId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const upload = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const formId = useId();
  const method =
    checkout.data?.methods.find((m) => m.id === methodId) ??
    checkout.data?.methods[0];
  const offer =
    checkout.data?.offers.find((o) => o.id === offerId) ??
    checkout.data?.offers[0];
  const qr = method?.qrAssetId
    ? `/api/payments/qr/${method.qrAssetId}`
    : method?.qrUrl;
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  function selectFile(candidate?: File) {
    if (!candidate) return;
    if (
      !["image/png", "image/jpeg"].includes(candidate.type) ||
      candidate.size > 10 * 1024 * 1024
    ) {
      const message = "Choose a PNG or JPEG receipt, up to 10 MB.";
      setFileError(message);
      toast({
        title: "Receipt could not be attached",
        description: message,
        tone: "error",
      });
      return;
    }
    setFileError("");
    setFile(candidate);
    setPreview(URL.createObjectURL(candidate));
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!method || !offer || !file || !checkout.data || action.busy) return;
    const data = new FormData(event.currentTarget);
    data.delete("durationChoice");
    data.set("proof", file);
    data.set("methodId", method.id);
    data.set("offerId", offer.id);
    data.set("checkoutRevision", checkout.data.revision);
    data.set("amountCentavos", String(offer.priceCentavos));
    const result = await action.run(
      async () => {
        await api.post("/payments", data);
        return true;
      },
      "",
      (message) =>
        toast({
          title: "Payment was not submitted",
          description: message,
          tone: "error",
        }),
    );
    if (!result) return;
    setSubmitted(true);
    onSubmitted();
    toast({
      title: "Payment proof submitted",
      description: "Your administrator can now review your receipt.",
      tone: "success",
    });
  }
  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      busy={action.busy}
      className={styles.modal}
    >
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.crown}>
            <Crown size={19} />
          </span>
          <h2 id={titleId}>
            {submitted ? "Payment proof received" : "Upgrade to GABAY Plus"}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Close payment window"
            disabled={action.busy}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        {submitted ? (
          <div className={styles.success} role="status">
            <CheckCircle2 size={48} />
            <h3>You’re all set for review.</h3>
            <p>
              Your {method?.name} payment proof for {offer?.name} has been
              submitted. Your administrator will verify it before activating
              Plus.
            </p>
            <p>You can follow its status in your payment history.</p>
            <Button onClick={onClose}>Back to subscription</Button>
          </div>
        ) : (
          <>
            <div className={styles.body}>
              {checkout.loading ? (
                <PaymentModalSkeleton />
              ) : checkout.error ? (
                <div className={styles.loading}>
                  <Feedback error={checkout.error.message} />
                  <Button variant="outline" onClick={checkout.reload}>
                    Try again
                  </Button>
                </div>
              ) : (
                <>
                  <div className={styles.notice}>
                    <ShieldCheck size={19} />
                    <p>
                      {checkout.data?.notice ||
                        "Payments are reviewed by an administrator before Plus access is activated."}
                    </p>
                  </div>
                  {!method || !offer ? (
                    <div className={styles.empty}>
                      <QrCode size={40} />
                      <h3>Payment options are being prepared.</h3>
                      <p>
                        Your administrator needs to enable a payment method and
                        duration. You can keep using your current plan in the
                        meantime.
                      </p>
                      <Button variant="outline" onClick={checkout.reload}>
                        Refresh payment options
                      </Button>
                    </div>
                  ) : (
                    <form
                      id={formId}
                      onSubmit={submit}
                      className={styles.columns}
                    >
                      <fieldset
                        disabled={action.busy}
                        className={styles.walletColumn}
                      >
                        <legend className={styles.label}>
                          Where do you want to pay?
                        </legend>
                        <div
                          className={styles.wallets}
                          role="group"
                          aria-label="Payment method"
                        >
                          {checkout.data?.methods.map((wallet) => (
                            <button
                              type="button"
                              key={wallet.id}
                              aria-pressed={method.id === wallet.id}
                              onClick={() => {
                                setMethodId(wallet.id);
                                setCopied(false);
                              }}
                            >
                              <strong>{wallet.name}</strong>
                              <span>{wallet.accountName}</span>
                            </button>
                          ))}
                        </div>
                        <div className={styles.qrCard}>
                          <div className={styles.qrImage}>
                            {qr ? (
                              <img
                                key={qr}
                                src={qr}
                                alt={`${method.name} payment QR code for ${method.accountName}`}
                                width={400}
                                height={400}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div>
                                <QrCode size={60} strokeWidth={1.2} />
                                <strong>Pay to the account below</strong>
                                <span>A QR image hasn’t been added yet.</span>
                              </div>
                            )}
                          </div>
                          <p className={styles.accountName}>
                            {method.accountName}
                          </p>
                          <div className={styles.accountNumber}>
                            <span>{method.accountNumber}</span>
                            <button
                              type="button"
                              aria-label="Copy payment account"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    method.accountNumber,
                                  );
                                  setCopied(true);
                                  toast({
                                    title: "Account copied",
                                    description: `${method.name} account ${method.accountNumber} is on your clipboard.`,
                                    tone: "success",
                                  });
                                } catch {
                                  const message =
                                    "Copy is unavailable. Select and copy the account number above.";
                                  setFileError(message);
                                  toast({
                                    title: "Could not copy the account",
                                    description: message,
                                    tone: "error",
                                  });
                                }
                              }}
                            >
                              {copied ? (
                                <Check size={15} />
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>
                          </div>
                          <span className={styles.copyStatus} role="status">
                            {copied
                              ? "Account copied"
                              : "Verify the recipient before sending"}
                          </span>
                          <div className={styles.sendExactly}>
                            <span>Send exactly</span>
                            <strong>{pesos(offer.priceCentavos)}</strong>
                          </div>
                        </div>
                        {method.instructions && (
                          <p className={styles.walletInstructions}>
                            {method.instructions}
                          </p>
                        )}
                        <p className={styles.smallPrint}>
                          Any transfer fees charged by your wallet are separate.
                        </p>
                      </fieldset>
                      <fieldset
                        disabled={action.busy}
                        className={styles.detailsColumn}
                      >
                        <legend className={styles.label}>
                          Choose your duration
                        </legend>
                        <div className={styles.offers}>
                          {checkout.data?.offers.map((duration) => (
                            <label
                              key={duration.id}
                              className={
                                offer.id === duration.id
                                  ? styles.selectedOffer
                                  : ""
                              }
                            >
                              <input
                                type="radio"
                                name="durationChoice"
                                value={duration.id}
                                checked={offer.id === duration.id}
                                onChange={() => setOfferId(duration.id)}
                              />
                              <span>
                                <strong>
                                  {duration.name}
                                  {duration.badge && <em>{duration.badge}</em>}
                                </strong>
                                <small>
                                  {duration.description ||
                                    `${duration.durationDays} days of Plus access`}
                                </small>
                              </span>
                              <b>{pesos(duration.priceCentavos)}</b>
                            </label>
                          ))}
                        </div>
                        <p className={styles.instructions}>
                          Send <strong>{pesos(offer.priceCentavos)}</strong>{" "}
                          through {method.name}, save your receipt, and attach
                          it below. Plus access is added after approval.
                        </p>
                        <div className={styles.formGrid}>
                          <Field label="Your name">
                            <Input
                              name="senderName"
                              required
                              minLength={2}
                              maxLength={120}
                              defaultValue={user?.name}
                              autoComplete="name"
                            />
                          </Field>
                          <Field label="Account email">
                            <Input
                              type="email"
                              value={user?.email ?? ""}
                              readOnly
                            />
                          </Field>
                          <Field label="Transaction reference">
                            <Input
                              name="reference"
                              required
                              minLength={6}
                              maxLength={64}
                              pattern="[A-Za-z0-9][A-Za-z0-9 \-]{5,63}"
                              placeholder="Reference from your receipt"
                            />
                          </Field>
                          <Field label="Payment date">
                            <Input
                              name="paidAt"
                              type="date"
                              required
                              defaultValue={new Date().toLocaleDateString(
                                "en-CA",
                              )}
                              max={new Date().toLocaleDateString("en-CA")}
                            />
                          </Field>
                        </div>
                        <Field
                          label="Note (optional)"
                          hint={`${note.length}/500`}
                        >
                          <Textarea
                            name="senderNote"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={500}
                            placeholder="Anything your administrator should know"
                          />
                        </Field>
                        <div
                          className={styles.upload}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (!action.busy)
                              selectFile(event.dataTransfer.files[0]);
                          }}
                        >
                          <input
                            ref={upload}
                            type="file"
                            accept="image/png,image/jpeg"
                            aria-label="Payment screenshot"
                            onChange={(event) =>
                              selectFile(event.target.files?.[0])
                            }
                          />
                          <button
                            type="button"
                            onClick={() => upload.current?.click()}
                          >
                            <UploadCloud size={25} />
                            <strong>
                              {file
                                ? "Replace payment screenshot"
                                : "Attach payment screenshot"}
                            </strong>
                            <span>
                              Choose an image or drop it here · PNG / JPEG · Up
                              to 10 MB
                            </span>
                          </button>
                          {file && (
                            <div className={styles.receipt}>
                              {preview && (
                                <img
                                  src={preview}
                                  alt="Selected payment receipt"
                                  width={48}
                                  height={48}
                                />
                              )}
                              <span>{file.name}</span>
                              <button
                                type="button"
                                aria-label="Remove payment screenshot"
                                onClick={() => {
                                  setFile(null);
                                  setPreview("");
                                  if (upload.current) upload.current.value = "";
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </fieldset>
                    </form>
                  )}
                </>
              )}
            </div>
            <footer className={styles.footer}>
              <Feedback error={action.error || fileError} />
              <Button
                type="submit"
                form={formId}
                disabled={
                  !method || !offer || !file || action.busy || checkout.loading
                }
                className="w-full"
              >
                {action.busy ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Submitting payment proof…
                  </>
                ) : (
                  `Send payment proof${offer ? ` for ${pesos(offer.priceCentavos)}` : ""}`
                )}
              </Button>
              <p>
                {file
                  ? "Your receipt is private and reviewed by your administrator."
                  : "Attach your receipt to submit. No automatic charges."}
              </p>
            </footer>
          </>
        )}
      </div>
    </Modal>
  );
}
