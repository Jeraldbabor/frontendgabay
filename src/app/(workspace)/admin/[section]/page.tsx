import { notFound } from "next/navigation";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { AdminRecords } from "@/features/admin/components/admin-records";
import { AdminSettings } from "@/features/admin/components/admin-settings";
import { KnowledgePage } from "@/features/admin/components/knowledge-page";
import { CurriculumPage } from "@/features/curriculum/components/curriculum-page";
import { TemplatesPage } from "@/features/templates/components/templates-page";
import { PaymentSettingsPage } from "@/features/billing/components/payment-settings-page";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "analytics") return <AdminDashboard />;
  if (section === "settings") return <AdminSettings />;
  if (section === "payment-settings") return <PaymentSettingsPage />;
  if (section === "knowledge") return <KnowledgePage />;
  if (section === "curriculum") return <CurriculumPage admin />;
  if (section === "budget-of-work") return <CurriculumPage admin bow />;
  if (section === "templates") return <TemplatesPage admin />;
  if (
    [
      "users",
      "payments",
      "subscriptions",
      "usage",
      "documents",
      "audit",
    ].includes(section)
  )
    return (
      <AdminRecords
        kind={
          section as
            | "users"
            | "payments"
            | "subscriptions"
            | "usage"
            | "documents"
            | "audit"
        }
      />
    );
  notFound();
}
