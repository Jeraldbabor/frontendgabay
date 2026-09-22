"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Crown,
  History,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import type {
  PaymentCheckoutCatalog,
  PaymentRecord,
  SubscriptionSummary,
} from "@gabay/types";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { useResource } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Feedback } from "@/shared/components/ui/form";
import { PageHeader, Badge } from "@/shared/components/ui/page";
import { dateLabel, pesos } from "@/shared/lib/utils";
import { PaymentModal } from "./payment-modal";
import {
  PaymentHistorySkeleton,
  SubscriptionSkeleton,
} from "./billing-skeletons";

type Plan = {
  id: string;
  code: string;
  name: string;
  priceCentavos: number;
  durationDays: number;
  monthlyCredits: number;
  storageLimitMb: number;
};
export function SubscriptionPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const summary = useResource<SubscriptionSummary>("/subscriptions/me");
  const plans = useResource<Plan[]>("/subscriptions/plans");
  const checkout = useResource<PaymentCheckoutCatalog>("/payments/checkout");
  const payments = useResource<PaymentRecord[]>("/payments");
  const offer =
    checkout.data?.offers.find((o) => o.id === "base") ??
    checkout.data?.offers[0];
  if (summary.loading || plans.loading || checkout.loading)
    return <SubscriptionSkeleton />;
  return (
    <>
      <PageHeader
        eyebrow="SUBSCRIPTION"
        title="A little more room to create."
        description="Choose the support that fits your teaching day. Simple plans, flexible payments, and your work always in your library."
      />
      <Feedback
        error={
          summary.error?.message ||
          plans.error?.message ||
          payments.error?.message ||
          checkout.error?.message
        }
      />
      {user?.role === "ADMIN" && (
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/payment-settings">
            <Settings2 />
            Manage payment options
          </Link>
        </Button>
      )}
      <div className="panel my-6 flex flex-wrap items-center justify-between gap-6 p-6">
        <div className="flex gap-4">
          <span className="tool-icon mint">
            <CreditCard size={21} />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Your current plan</p>
            <h2 className="mt-1 text-xl font-semibold">
              GABAY {summary.data?.plan === "PLUS" ? "Plus" : "Free"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.data?.expiresAt
                ? `Active until ${dateLabel(summary.data.expiresAt)}`
                : "No subscription expiration"}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-64">
          <p className="mb-3 flex justify-between gap-6 text-xs">
            <span>AI generation credits</span>
            <strong>
              {summary.data?.used ?? 0} / {summary.data?.monthlyLimit ?? 0} used
            </strong>
          </p>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{
                width: `${Math.min(100, ((summary.data?.used ?? 0) / Math.max(1, summary.data?.monthlyLimit ?? 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Resets each calendar month (UTC).
          </p>
        </div>
      </div>
      <div className="mb-7 grid gap-5 md:grid-cols-2">
        {plans.data?.map((plan) => (
          <section
            className={`panel p-7 ${plan.code === "PLUS" ? "border-primary/40 bg-[#f1f6ee]" : ""}`}
            key={plan.id}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.code === "PLUS" && <Badge>MORE POSSIBILITIES</Badge>}
            </div>
            <p className="my-5 text-4xl font-semibold tracking-tight">
              {pesos(
                plan.code === "PLUS" && offer
                  ? offer.priceCentavos
                  : plan.priceCentavos,
              )}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {plan.priceCentavos
                  ? `/ ${plan.code === "PLUS" && offer ? offer.durationDays : plan.durationDays} days`
                  : "to get started"}
              </span>
            </p>
            <div className="space-y-3 text-sm">
              {[
                `${plan.monthlyCredits} AI generations per month`,
                `${plan.storageLimitMb} MB reference storage`,
                ...(plan.code === "PLUS"
                  ? [
                      "Examinations, presentations & intervention",
                      "DOCX, PDF & PowerPoint exports",
                    ]
                  : [
                      "Core lesson and assessment tools",
                      "Your own teaching document library",
                    ]),
              ].map((text) => (
                <p key={text} className="flex items-center gap-3">
                  <Check size={15} className="shrink-0 text-primary" />
                  {text}
                </p>
              ))}
            </div>
            {plan.code === "PLUS" && (
              <>
                <Button className="mt-6 w-full" onClick={() => setOpen(true)}>
                  <Crown />
                  {summary.data?.plan === "PLUS"
                    ? "Renew Plus"
                    : "Upgrade to Plus"}
                  <ArrowRight />
                </Button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Choose your wallet and duration in the payment window.
                </p>
              </>
            )}
          </section>
        ))}
      </div>
      <div className="mb-7 flex items-start gap-3 rounded-xl border border-border bg-white px-5 py-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs leading-6 text-muted-foreground">
          Payment proofs are reviewed by your administrator. Plus starts after
          approval; renewals add time to your remaining active subscription.
          There are no automatic charges.
        </p>
      </div>
      <section className="panel p-6">
        <div className="mb-5 flex items-center gap-3">
          <History size={20} className="text-primary" />
          <h2 className="font-semibold">Your payment history</h2>
        </div>
        {payments.loading ? (
          <PaymentHistorySkeleton />
        ) : payments.data?.length ? (
          <div className="divide-y divide-border">
            {payments.data.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {pesos(payment.amountCentavos)} ·{" "}
                    {payment.checkout?.methodName ?? "GCash"}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {payment.checkout?.offerName ?? "Plus"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateLabel(payment.createdAt)} · Ref. {payment.reference}
                  </p>
                  {payment.reviewNote && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {payment.reviewNote}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/api/payments/${payment.id}/proof`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    View receipt
                  </a>
                  <Badge
                    tone={
                      payment.status === "PENDING"
                        ? "amber"
                        : payment.status === "REJECTED"
                          ? "gray"
                          : "teal"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-5 text-center text-sm text-muted-foreground">
            Your submitted payments will appear here.
          </p>
        )}
      </section>
      {open && (
        <PaymentModal
          onClose={() => setOpen(false)}
          onSubmitted={() => payments.reload()}
        />
      )}
    </>
  );
}
