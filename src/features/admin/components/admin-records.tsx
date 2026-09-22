"use client";
import { useState } from "react";
import Link from "next/link";
import type { PaymentCheckoutSnapshot } from "@gabay/types";
import { Search, Check, X, ExternalLink } from "lucide-react";
import { api } from "@/shared/lib/api-client";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Input, Textarea, Feedback } from "@/shared/components/ui/form";
import { useToast } from "@/shared/components/ui/toast";
import {
  PageHeader,
  Loading,
  EmptyState,
  Badge,
} from "@/shared/components/ui/page";
import { dateLabel, label, pesos } from "@/shared/lib/utils";
type Row = Record<string, unknown> & {
  id: string;
  user?: { name: string; email: string };
  plan?: { name: string };
  checkout?: PaymentCheckoutSnapshot | null;
};
const config = {
  users: {
    title: "The people behind the learning.",
    description: "View teacher profiles and manage platform access.",
    columns: ["name", "email", "role", "active", "createdAt"],
  },
  payments: {
    title: "A careful review. A confident upgrade.",
    description:
      "Verify wallet transactions and their selected durations before approving subscriptions.",
    columns: [
      "user",
      "senderName",
      "paymentMethod",
      "duration",
      "reference",
      "amountCentavos",
      "paidAt",
      "status",
    ],
  },
  subscriptions: {
    title: "Keep your teachers connected.",
    description: "Review active and historical subscription periods.",
    columns: ["user", "plan", "startsAt", "expiresAt"],
  },
  usage: {
    title: "Understand the work behind every request.",
    description: "Monitor AI features, tokens, status, and estimated cost.",
    columns: [
      "user",
      "feature",
      "model",
      "inputTokens",
      "outputTokens",
      "estimatedCost",
      "status",
      "createdAt",
    ],
  },
  documents: {
    title: "The ideas taking shape.",
    description: "A platform overview of generated teaching documents.",
    columns: ["user", "title", "kind", "createdAt"],
  },
  audit: {
    title: "Accountability, in the details.",
    description: "A chronological record of important administration actions.",
    columns: ["actorId", "action", "resource", "resourceId", "createdAt"],
  },
};
export function AdminRecords({ kind }: { kind: keyof typeof config }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [note, setNote] = useState("");
  const action = useAction();
  const { toast } = useToast();
  const resource = useResource<Row[]>(
    `/admin/${kind}${kind === "users" ? `?search=${encodeURIComponent(search)}` : ""}`,
  );
  const info = config[kind];
  function display(row: Row, key: string) {
    const value = row[key];
    if (key === "user") return row.user?.name ?? "—";
    if (key === "plan") return row.plan?.name ?? "—";
    if (key === "paymentMethod") return row.checkout?.methodName ?? "GCash";
    if (key === "duration")
      return row.checkout
        ? `${row.checkout.offerName} · ${row.checkout.durationDays} days`
        : "Legacy Plus";
    if (key === "amountCentavos") return pesos(Number(value));
    if (key === "active") return value ? "Active" : "Inactive";
    if (key === "estimatedCost")
      return value === null
        ? "Not configured"
        : `USD ${Number(value).toFixed(6)}`;
    if (key.endsWith("At") && typeof value === "string")
      return dateLabel(value);
    return value === null ? "—" : String(value ?? "—");
  }
  async function review(approve: boolean) {
    if (!selected) return;
    const result = await action.run(
      async () => {
        await api.post(`/admin/payments/${selected.id}/review`, {
          approve,
          note,
        });
        return true;
      },
      "",
      (message) =>
        toast({
          title: "Payment review was not saved",
          description: message,
          tone: "error",
        }),
    );
    if (!result) return;
    setSelected(null);
    setNote("");
    resource.reload();
    toast({
      title: approve ? "Payment approved" : "Payment rejected",
      description: approve
        ? "The subscription is now active."
        : "The review decision is now visible to the teacher.",
      tone: "success",
    });
  }
  return (
    <>
      <PageHeader
        eyebrow={`ADMIN · ${label(kind)}`}
        title={info.title}
        description={info.description}
      />
      <Feedback
        error={action.error || resource.error?.message}
        success={action.success}
      />
      {kind === "payments" && (
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/payment-settings">
            Manage wallets, QR images & pricing
          </Link>
        </Button>
      )}
      {kind === "users" && (
        <div className="relative my-5 max-w-md">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            placeholder="Search by name or email"
          />
        </div>
      )}
      {selected && (
        <section className="panel my-6 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {kind === "payments" ? "Review payment" : "Teacher profile"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close details"
              onClick={() => setSelected(null)}
            >
              <X />
            </Button>
          </div>
          {kind === "payments" ? (
            <>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p>Sender: {String(selected.senderName)}</p>
                <p>Reference: {String(selected.reference)}</p>
                <p>Amount: {pesos(Number(selected.amountCentavos))}</p>
                <p>Date: {dateLabel(String(selected.paidAt))}</p>
                <p>Wallet: {selected.checkout?.methodName ?? "GCash"}</p>
                <p>
                  Duration:{" "}
                  {selected.checkout
                    ? `${selected.checkout.offerName} (${selected.checkout.durationDays} days)`
                    : "Legacy Plus plan"}
                </p>
                {selected.checkout && (
                  <p className="sm:col-span-2">
                    Paid to: {selected.checkout.accountName} ·{" "}
                    {selected.checkout.accountNumber}
                  </p>
                )}
                {Boolean(selected.senderNote) && (
                  <p className="whitespace-pre-wrap sm:col-span-2">
                    Sender note: {String(selected.senderNote)}
                  </p>
                )}
              </div>
              <a
                href={`/api/payments/${selected.id}/proof`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Open private proof of payment
                <ExternalLink size={14} />
              </a>
              <Textarea
                aria-label="Review note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                placeholder="Review note or rejection reason"
              />
              {selected.status === "PENDING" ? (
                <div className="flex gap-3">
                  <Button disabled={action.busy} onClick={() => review(true)}>
                    <Check />
                    Approve & activate Plus
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={action.busy}
                    onClick={() => review(false)}
                  >
                    <X />
                    Reject payment
                  </Button>
                </div>
              ) : (
                <Badge>{String(selected.status)}</Badge>
              )}
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(
                (selected.profile ?? {}) as Record<string, unknown>,
              )
                .filter(([k]) => !["id", "userId"].includes(k))
                .map(([key, value]) => (
                  <p key={key} className="text-xs">
                    <strong>{label(key)}: </strong>
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </p>
                ))}
            </div>
          )}
        </section>
      )}
      {resource.loading ? (
        <Loading />
      ) : resource.data?.length ? (
        <div className="panel table-scroll mt-5">
          <table>
            <thead>
              <tr>
                {info.columns.map((col) => (
                  <th key={col}>{col.replace(/([A-Z])/g, " $1")}</th>
                ))}
                {["users", "payments"].includes(kind) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {resource.data.map((row) => (
                <tr key={row.id}>
                  {info.columns.map((col) => (
                    <td
                      className={col === "email" ? "text-muted-foreground" : ""}
                      key={col}
                    >
                      {col === "status" || col === "role" ? (
                        <Badge tone={row[col] === "PENDING" ? "amber" : "gray"}>
                          {display(row, col)}
                        </Badge>
                      ) : (
                        display(row, col)
                      )}
                    </td>
                  ))}
                  {kind === "users" && (
                    <td>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(row)}
                        >
                          Profile
                        </Button>
                        {row.role === "USER" && (
                          <Button
                            disabled={action.busy}
                            size="sm"
                            variant={row.active ? "destructive" : "outline"}
                            onClick={() =>
                              action.run(async () => {
                                await api.patch(`/admin/users/${row.id}`, {
                                  active: !row.active,
                                });
                                resource.reload();
                              }, "User access updated.")
                            }
                          >
                            {row.active ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                  {kind === "payments" && (
                    <td>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(row);
                          setNote(String(row.reviewNote ?? ""));
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nothing needs your attention here yet"
          description="Records will appear as teachers use the platform."
        />
      )}
    </>
  );
}
