"use client";
import Link from "next/link";
import {
  Users,
  CreditCard,
  Library,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useResource } from "@/shared/hooks/use-resource";
import { PageHeader, Loading } from "@/shared/components/ui/page";
import { Feedback } from "@/shared/components/ui/form";
import { pesos } from "@/shared/lib/utils";
export function AdminDashboard() {
  const data = useResource<Record<string, number | null>>("/admin/dashboard");
  if (data.loading) return <Loading />;
  const d = data.data;
  const cards = [
    ["Total users", d?.totalUsers ?? 0],
    ["Active users", d?.activeUsers ?? 0],
    ["Free users", d?.freeUsers ?? 0],
    ["Plus users", d?.plusUsers ?? 0],
    ["Pending payments", d?.pendingPayments ?? 0],
    ["Approved payments", d?.approvedPayments ?? 0],
    ["Active subscriptions", d?.activeSubscriptions ?? 0],
    ["AI requests today", d?.aiRequestsToday ?? 0],
    ["AI requests this month", d?.aiRequestsMonth ?? 0],
    ["Knowledge documents", d?.knowledgeDocuments ?? 0],
    ["Generated documents", d?.generatedDocuments ?? 0],
    ["Subscription revenue", pesos(d?.revenueCentavos ?? 0)],
    [
      "Estimated AI cost",
      d?.estimatedCostUsd == null
        ? "Rates not configured"
        : `USD ${d.estimatedCostUsd.toFixed(4)}`,
    ],
  ];
  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="A clear view of your platform."
        description="Support your teachers, maintain trusted references, and keep GABAY running smoothly."
      />
      <Feedback error={data.error?.message} />
      <div className="mb-7 flex gap-4 rounded-2xl bg-[#eaf2e6] p-6">
        <ShieldCheck className="shrink-0 text-primary" />
        <div>
          <h2 className="font-semibold">
            Good guidance starts with trusted sources.
          </h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            Keep curriculum, templates, and official documents current. Only
            administrator-verified, active references are treated as
            authoritative.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, value]) => (
          <div className="panel p-5" key={title}>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
        ))}
      </div>
      <h2 className="mb-4 mt-8 text-lg font-semibold">Platform essentials</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            name: "Review payments",
            description: "Verify wallet receipts and activate subscriptions.",
            href: "/admin/payments",
            icon: CreditCard,
          },
          {
            name: "Manage knowledge",
            description:
              "Maintain the references behind source-aware generation.",
            href: "/admin/knowledge",
            icon: Library,
          },
          {
            name: "Support your teachers",
            description: "View profiles and manage account access.",
            href: "/admin/users",
            icon: Users,
          },
          {
            name: "Review AI activity",
            description:
              "Track generation requests, tokens, and estimated cost.",
            href: "/admin/usage",
            icon: Activity,
          },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="tool-card flex items-center gap-4"
          >
            <span className="tool-icon mint">
              <item.icon size={20} />
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">{item.name}</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
            <ArrowRight size={16} className="text-primary" />
          </Link>
        ))}
      </div>
    </>
  );
}
