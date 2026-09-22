"use client";
import { Save } from "lucide-react";
import type { SessionUser } from "@gabay/types";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { api } from "@/shared/lib/api-client";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Field, Input, Feedback } from "@/shared/components/ui/form";
import { PageHeader, Badge } from "@/shared/components/ui/page";
import { BrandingFields } from "@/features/templates/components/branding-fields";
import {
  readLayout,
  type Layout,
} from "@/features/templates/services/template.service";
export function SettingsPage() {
  const auth = useAuth();
  const action = useAction();
  const branding = useResource<Layout>("/templates/branding");
  const user = auth.user;
  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    await action.run(async () => {
      const response = await api.patch<SessionUser>("/auth/profile", {
        ...values,
        gradeLevels: String(values.gradeLevels)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map(Number),
        learningAreas: String(values.learningAreas)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      auth.accept(response);
    }, "Your profile is updated.");
  }
  async function saveBranding(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const layout = readLayout(new FormData(e.currentTarget));
    await action.run(
      () => api.patch("/templates/branding", { layout }),
      "Your default branding is saved.",
    );
  }
  return (
    <>
      <PageHeader
        eyebrow="SETTINGS"
        title="Make this space your own."
        description="Keep your teaching profile and default document formatting up to date."
      />
      <Feedback
        error={action.error || branding.error?.message}
        success={action.success}
      />
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
        <form onSubmit={saveProfile} className="panel space-y-5 p-6">
          <h2 className="font-semibold">Teaching profile</h2>
          <Field label="Full name">
            <Input
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={user?.name}
            />
          </Field>
          <div className="flex items-center justify-between rounded-xl bg-muted p-4">
            <span className="text-xs">{user?.email}</span>
            <Badge tone={user?.emailVerified ? "teal" : "amber"}>
              {user?.emailVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
          {!user?.emailVerified && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={action.busy}
              onClick={() =>
                action.run(
                  () => api.post("/auth/request-verification"),
                  "Verification email requested.",
                )
              }
            >
              Send verification email
            </Button>
          )}
          {(["school", "division", "region", "position"] as const).map(
            (key) => (
              <Field key={key} label={key[0].toUpperCase() + key.slice(1)}>
                <Input
                  name={key}
                  maxLength={key === "school" ? 200 : 120}
                  defaultValue={user?.profile?.[key] ?? ""}
                />
              </Field>
            ),
          )}
          <Field
            label="Grade levels"
            hint="Separate grades with commas, e.g. 7, 8. Use 0 for Kindergarten."
          >
            <Input
              name="gradeLevels"
              defaultValue={user?.profile?.gradeLevels.join(", ") ?? ""}
            />
          </Field>
          <Field label="Learning areas">
            <Input
              name="learningAreas"
              defaultValue={user?.profile?.learningAreas.join(", ") ?? ""}
            />
          </Field>
          <Button disabled={action.busy}>
            <Save />
            Save profile
          </Button>
        </form>
        <form onSubmit={saveBranding} className="panel space-y-5 p-6">
          <h2 className="font-semibold">Default document branding</h2>
          <p className="text-xs leading-6 text-muted-foreground">
            Used when you export without a specific template. Official locked
            template fields keep their approved formatting.
          </p>
          {branding.data && (
            <BrandingFields
              key={JSON.stringify(branding.data)}
              layout={branding.data}
            />
          )}
          <Button disabled={action.busy || !branding.data}>
            <Save />
            Save branding
          </Button>
        </form>
      </div>
    </>
  );
}
