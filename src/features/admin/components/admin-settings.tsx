"use client";
import { Save } from "lucide-react";
import Link from "next/link";
import { api } from "@/shared/lib/api-client";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Field, Input, Textarea, Feedback } from "@/shared/components/ui/form";
import { PageHeader, Loading, Badge } from "@/shared/components/ui/page";
type Plan = {
  id: string;
  name: string;
  priceCentavos: number;
  durationDays: number;
  monthlyCredits: number;
  storageLimitMb: number;
  limits: { feature: string; enabled: boolean }[];
};
export function AdminSettings() {
  const settings = useResource<Record<string, string>>("/admin/settings");
  const plans = useResource<Plan[]>("/subscriptions/plans");
  const status = useResource<{
    configured: boolean;
    model: string | null;
    semanticRetrieval: boolean;
  }>("/ai/status");
  const action = useAction();
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    await action.run(
      () => api.patch("/admin/settings", { ...settings.data, ...body }),
      "Platform settings saved.",
    );
  }
  async function plan(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await action.run(async () => {
      await api.patch(`/admin/plans/${id}`, {
        name: form.get("name"),
        priceCentavos: Number(form.get("priceCentavos")),
        durationDays: Number(form.get("durationDays")),
        monthlyCredits: Number(form.get("monthlyCredits")),
        storageLimitMb: Number(form.get("storageLimitMb")),
        features: form.getAll("features"),
      });
      plans.reload();
    }, "Plan settings saved.");
  }
  if (settings.loading) return <Loading />;
  return (
    <>
      <PageHeader
        eyebrow="ADMIN · SETTINGS"
        title="Set the direction for GABAY."
        description="Manage platform rules, payment instructions, and plan access from one place."
      />
      <Feedback
        error={action.error || settings.error?.message}
        success={action.success}
      />
      <div className="panel my-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-sm font-semibold">OpenAI connection</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {status.data?.configured
              ? `Model: ${status.data.model}`
              : "Configure the API key and model in the backend environment."}{" "}
            Keys are never displayed or stored in this screen.
          </p>
        </div>
        <Badge tone={status.data?.configured ? "teal" : "amber"}>
          {status.data?.configured ? "Configured" : "Not configured"}
        </Badge>
      </div>
      <form onSubmit={save} className="panel space-y-5 p-6">
        <Field
          label="Administrator AI rules"
          hint="Define teaching rules that apply after official source requirements. Avoid adding secrets or personal data."
        >
          <Textarea
            name="aiRules"
            className="min-h-40"
            maxLength={10000}
            defaultValue={settings.data?.aiRules ?? ""}
          />
        </Field>
        <div className="rounded-xl border border-border bg-secondary p-5">
          <p className="mb-3 text-sm">
            Wallets, QR images, duration prices, and checkout instructions are
            managed in Payment setup.
          </p>
          <Button asChild variant="outline">
            <Link href="/admin/payment-settings">Manage payment options</Link>
          </Button>
        </div>
        <Button disabled={action.busy}>
          <Save />
          Save platform settings
        </Button>
      </form>
      <h2 className="mb-5 mt-8 text-lg font-semibold">
        Subscription plans & feature access
      </h2>
      <div className="grid items-start gap-6 xl:grid-cols-2">
        {plans.data?.map((p) => (
          <form
            key={p.id}
            onSubmit={(e) => plan(e, p.id)}
            className="panel space-y-5 p-6"
          >
            <Field label="Plan name">
              <Input
                name="name"
                required
                minLength={2}
                maxLength={100}
                defaultValue={p.name}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["priceCentavos", "Price (centavos)", p.priceCentavos],
                ["durationDays", "Duration (days)", p.durationDays],
                ["monthlyCredits", "Monthly AI credits", p.monthlyCredits],
                ["storageLimitMb", "Reference storage (MB)", p.storageLimitMb],
              ].map(([name, title, value]) => (
                <Field key={String(name)} label={String(title)}>
                  <Input
                    type="number"
                    name={String(name)}
                    required
                    min={
                      name === "durationDays" || name === "storageLimitMb"
                        ? 1
                        : 0
                    }
                    max={name === "durationDays" ? 365 : 1000000}
                    defaultValue={value}
                  />
                </Field>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "CHAT",
                "ILAW",
                "ASSESSMENT",
                "MATERIAL",
                "INTERVENTION",
                "TOS",
                "EXAM",
                "PRESENTATION",
                "EXPORT",
              ].map((feature) => (
                <label key={feature} className="flex gap-2 text-xs">
                  <input
                    type="checkbox"
                    name="features"
                    value={feature}
                    defaultChecked={p.limits.some(
                      (l) => l.feature === feature && l.enabled,
                    )}
                  />
                  {feature}
                </label>
              ))}
            </div>
            <Button variant="outline" disabled={action.busy}>
              Save plan
            </Button>
          </form>
        ))}
      </div>
    </>
  );
}
