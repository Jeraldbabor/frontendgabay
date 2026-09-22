"use client";

/* eslint-disable @next/next/no-img-element -- Administrators may configure runtime QR URLs. */
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CreditCard,
  Plus,
  Save,
  Trash2,
  Wallet,
} from "lucide-react";
import type {
  PaymentCheckoutCatalog,
  PaymentCheckoutConfig,
  PaymentMethod,
  PaymentOffer,
} from "@gabay/types";
import { api } from "@/shared/lib/api-client";
import { useAction, useResource } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Feedback, Field, Input, Textarea } from "@/shared/components/ui/form";
import { Badge, PageHeader } from "@/shared/components/ui/page";
import { useToast } from "@/shared/components/ui/toast";
import { PaymentSettingsSkeleton } from "./billing-skeletons";

export function PaymentSettingsPage() {
  const resource = useResource<PaymentCheckoutCatalog>(
    "/admin/payment-settings",
  );
  return (
    <>
      <PageHeader
        eyebrow="ADMIN · PAYMENT SETUP"
        title="Your payment options, your way."
        description="Manage wallets, QR images, payment instructions, and Plus durations. Changes apply to new submissions; pending payments keep their agreed price and duration."
      />
      <div className="my-5 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/subscription">Open subscription page</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/payments">Review payment proofs</Link>
        </Button>
      </div>
      {resource.loading ? (
        <PaymentSettingsSkeleton />
      ) : resource.error ? (
        <>
          <Feedback error={resource.error.message} />
          <Button onClick={resource.reload}>Try again</Button>
        </>
      ) : (
        resource.data && (
          <PaymentSettingsEditor
            key={resource.data.revision}
            initial={resource.data}
          />
        )
      )}
    </>
  );
}

function PaymentSettingsEditor({
  initial,
}: {
  initial: PaymentCheckoutCatalog;
}) {
  const { revision, ...startingConfig } = initial;
  const [config, setConfig] = useState<PaymentCheckoutConfig>(startingConfig);
  const [dirty, setDirty] = useState(false);
  const action = useAction();
  const { toast } = useToast();
  const revisionRef = useRef(revision);
  function method(id: string, patch: Partial<PaymentMethod>) {
    setDirty(true);
    setConfig((old) => ({
      ...old,
      methods: old.methods.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }
  function offer(id: string, patch: Partial<PaymentOffer>) {
    setDirty(true);
    setConfig((old) => ({
      ...old,
      offers: old.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }
  function move(kind: "methods" | "offers", index: number, direction: number) {
    setDirty(true);
    setConfig((old) => {
      const list = [...old[kind]];
      [list[index], list[index + direction]] = [
        list[index + direction],
        list[index],
      ];
      return { ...old, [kind]: list };
    });
  }
  async function upload(id: string, file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      toast({
        title: "QR image could not be uploaded",
        description: "Upload a PNG or JPEG QR image up to 2 MB.",
        tone: "error",
      });
      return;
    }
    const asset = await action.run(
      async () => {
        const body = new FormData();
        body.set("file", file);
        return api.post<{ id: string }>("/admin/payment-settings/qr", body);
      },
      "",
      (message) =>
        toast({
          title: "QR image could not be uploaded",
          description: message,
          tone: "error",
        }),
    );
    if (!asset) return;
    method(id, { qrAssetId: asset.id, qrUrl: "" });
    toast({
      title: "QR image ready",
      description: "Save payment settings to publish it.",
      tone: "success",
    });
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await action.run(
      () =>
        api.patch<PaymentCheckoutCatalog>("/admin/payment-settings", {
          revision: revisionRef.current,
          config,
        }),
      "",
      (message) =>
        toast({
          title: "Payment settings were not saved",
          description: message,
          tone: "error",
        }),
    );
    if (!result) return;
    const { revision: nextRevision, ...nextConfig } = result;
    revisionRef.current = nextRevision;
    setConfig(nextConfig);
    setDirty(false);
    toast({
      title: "Payment settings saved",
      description: "Your checkout now shows the enabled options.",
      tone: "success",
    });
  }
  async function reloadLatest() {
    const result = await action.run(
      () => api.get<PaymentCheckoutCatalog>("/admin/payment-settings"),
      "",
      (message) =>
        toast({
          title: "Saved settings could not be loaded",
          description: message,
          tone: "error",
        }),
    );
    if (!result) return;
    const { revision: nextRevision, ...nextConfig } = result;
    revisionRef.current = nextRevision;
    setConfig(nextConfig);
    setDirty(false);
    toast({
      title: "Saved settings restored",
      description: "Unsaved edits on this page were discarded.",
      tone: "info",
    });
  }
  function removeMethod(wallet: PaymentMethod, index: number) {
    setConfig((old) => ({
      ...old,
      methods: old.methods.filter((item) => item.id !== wallet.id),
    }));
    setDirty(true);
    toast({
      title: `${wallet.name} removed from this draft`,
      description: "Save payment settings to publish the change.",
      tone: "info",
      duration: 8000,
      action: {
        label: "Undo",
        onClick: () => {
          setConfig((old) => {
            if (old.methods.some((item) => item.id === wallet.id)) return old;
            const methods = [...old.methods];
            methods.splice(Math.min(index, methods.length), 0, wallet);
            return { ...old, methods };
          });
          setDirty(true);
        },
      },
    });
  }
  function removeOffer(duration: PaymentOffer, index: number) {
    setConfig((old) => ({
      ...old,
      offers: old.offers.filter((item) => item.id !== duration.id),
    }));
    setDirty(true);
    toast({
      title: `${duration.name} removed from this draft`,
      description: "Save payment settings to publish the change.",
      tone: "info",
      duration: 8000,
      action: {
        label: "Undo",
        onClick: () => {
          setConfig((old) => {
            if (old.offers.some((item) => item.id === duration.id)) return old;
            const offers = [...old.offers];
            offers.splice(Math.min(index, offers.length), 0, duration);
            return { ...old, offers };
          });
          setDirty(true);
        },
      },
    });
  }
  function removeQr(wallet: PaymentMethod) {
    const qrAssetId = wallet.qrAssetId;
    if (!qrAssetId) return;
    method(wallet.id, { qrAssetId: null });
    toast({
      title: `QR image removed from ${wallet.name}`,
      description: "Save payment settings to publish the change.",
      tone: "info",
      duration: 8000,
      action: {
        label: "Undo",
        onClick: () => method(wallet.id, { qrAssetId }),
      },
    });
  }
  return (
    <form onSubmit={save} className="space-y-7">
      <Feedback error={action.error} />
      <fieldset disabled={action.busy} className="min-w-0 space-y-7">
        <section className="panel space-y-4 p-6">
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-primary" />
            <h2 className="font-semibold">Checkout message</h2>
          </div>
          <Field label="Message shown at the top of the payment window">
            <Textarea
              value={config.notice}
              onChange={(e) => {
                setDirty(true);
                setConfig({ ...config, notice: e.target.value });
              }}
              maxLength={1000}
              placeholder="Explain payment and review instructions to teachers."
            />
          </Field>
        </section>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Payment methods</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enable wallets only after checking the recipient and QR image.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={config.methods.length >= 12}
              onClick={() => {
                setDirty(true);
                setConfig((old) => ({
                  ...old,
                  methods: [
                    ...old.methods,
                    {
                      id: crypto.randomUUID(),
                      name: "New wallet",
                      accountName: "",
                      accountNumber: "",
                      instructions: "",
                      qrAssetId: null,
                      qrUrl: "",
                      enabled: false,
                    },
                  ],
                }));
                toast({
                  title: "Payment method added",
                  description: "Complete its details, then save to publish it.",
                  tone: "success",
                });
              }}
            >
              <Plus />
              Add payment method
            </Button>
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-2">
            {config.methods.map((wallet, index) => (
              <article key={wallet.id} className="panel space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-primary" />
                  <h3 className="mr-auto font-semibold">{wallet.name}</h3>
                  <Badge tone={wallet.enabled ? "teal" : "gray"}>
                    {wallet.enabled ? "Enabled" : "Hidden"}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${wallet.name} up`}
                    disabled={index === 0}
                    onClick={() => move("methods", index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${wallet.name} down`}
                    disabled={index === config.methods.length - 1}
                    onClick={() => move("methods", index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </div>
                <Field label="Wallet or bank name">
                  <Input
                    value={wallet.name}
                    required
                    minLength={2}
                    maxLength={60}
                    onChange={(e) =>
                      method(wallet.id, { name: e.target.value })
                    }
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Recipient account name">
                    <Input
                      value={wallet.accountName}
                      required={wallet.enabled}
                      maxLength={120}
                      onChange={(e) =>
                        method(wallet.id, { accountName: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Account number or handle">
                    <Input
                      value={wallet.accountNumber}
                      required={wallet.enabled}
                      maxLength={80}
                      onChange={(e) =>
                        method(wallet.id, { accountNumber: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="rounded-xl border border-dashed border-border bg-[#f7faf6] p-4">
                  {(wallet.qrAssetId || wallet.qrUrl) && (
                    <img
                      src={
                        wallet.qrAssetId
                          ? `/api/payments/qr/${wallet.qrAssetId}`
                          : wallet.qrUrl
                      }
                      alt={`${wallet.name} QR preview`}
                      width={160}
                      height={160}
                      referrerPolicy="no-referrer"
                      className="mx-auto mb-4 h-40 w-40 rounded-lg bg-white object-contain"
                    />
                  )}
                  <Field
                    label="Upload payment QR"
                    hint="PNG or JPEG, up to 2 MB. Upload your own recipient QR image."
                  >
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => upload(wallet.id, e.target.files?.[0])}
                    />
                  </Field>
                  {wallet.qrAssetId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeQr(wallet)}
                    >
                      Remove QR image
                    </Button>
                  )}
                </div>
                <Field label="Or use an HTTPS QR image URL">
                  <Input
                    type="url"
                    disabled={Boolean(wallet.qrAssetId)}
                    value={wallet.qrUrl}
                    maxLength={1000}
                    placeholder="https://…"
                    onChange={(e) =>
                      method(wallet.id, { qrUrl: e.target.value })
                    }
                  />
                </Field>
                <Field label="Wallet instructions (optional)">
                  <Textarea
                    value={wallet.instructions}
                    maxLength={1000}
                    onChange={(e) =>
                      method(wallet.id, { instructions: e.target.value })
                    }
                  />
                </Field>
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={wallet.enabled}
                      onChange={(e) =>
                        method(wallet.id, { enabled: e.target.checked })
                      }
                    />
                    Enable in checkout
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    aria-label={`Remove ${wallet.name}`}
                    onClick={() => removeMethod(wallet, index)}
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Plus durations & prices</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the total price in pesos. Labels and badges appear exactly
                as written.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={config.offers.length >= 12}
              onClick={() => {
                setDirty(true);
                setConfig((old) => ({
                  ...old,
                  offers: [
                    ...old.offers,
                    {
                      id: crypto.randomUUID(),
                      name: "New duration",
                      durationDays: 30,
                      priceCentavos: 5000,
                      description: "",
                      badge: "",
                      enabled: false,
                    },
                  ],
                }));
                toast({
                  title: "Subscription duration added",
                  description:
                    "Set its price and access period, then save to publish it.",
                  tone: "success",
                });
              }}
            >
              <Plus />
              Add duration
            </Button>
          </div>
          <div className="space-y-4">
            {config.offers.map((duration, index) => (
              <article className="panel p-5" key={duration.id}>
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="mr-auto font-semibold">{duration.name}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${duration.name} up`}
                    disabled={index === 0}
                    onClick={() => move("offers", index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${duration.name} down`}
                    disabled={index === config.offers.length - 1}
                    onClick={() => move("offers", index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    aria-label={`Remove ${duration.name}`}
                    disabled={config.offers.length === 1}
                    onClick={() => removeOffer(duration, index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <Field label="Duration label">
                    <Input
                      required
                      value={duration.name}
                      minLength={2}
                      maxLength={80}
                      onChange={(e) =>
                        offer(duration.id, { name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Access days">
                    <Input
                      type="number"
                      required
                      min={1}
                      max={365}
                      value={duration.durationDays}
                      onChange={(e) =>
                        offer(duration.id, {
                          durationDays: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Total price (PHP)">
                    <Input
                      type="number"
                      required
                      min={0.01}
                      max={100000}
                      step="0.01"
                      value={duration.priceCentavos / 100}
                      onChange={(e) =>
                        offer(duration.id, {
                          priceCentavos: Math.round(
                            Number(e.target.value) * 100,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Supporting text">
                    <Input
                      value={duration.description}
                      maxLength={160}
                      onChange={(e) =>
                        offer(duration.id, { description: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Badge (optional)">
                    <Input
                      value={duration.badge}
                      maxLength={30}
                      placeholder="Best value"
                      onChange={(e) =>
                        offer(duration.id, { badge: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={duration.enabled}
                    onChange={(e) =>
                      offer(duration.id, { enabled: e.target.checked })
                    }
                  />
                  Offer this duration in checkout
                </label>
              </article>
            ))}
          </div>
        </section>
      </fieldset>
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white/95 p-4 shadow-sm backdrop-blur">
        <p className="text-xs text-muted-foreground">
          {dirty
            ? "You have unsaved changes. Save to publish them."
            : "All payment settings are saved."}
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={action.busy}
            onClick={reloadLatest}
          >
            Discard draft & reload
          </Button>
          <Button disabled={action.busy || !dirty}>
            <Save />
            {action.busy ? "Saving…" : "Save payment settings"}
          </Button>
        </div>
      </div>
    </form>
  );
}
