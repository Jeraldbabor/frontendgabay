"use client";
import { useState } from "react";
import { Plus, PanelsTopLeft, Lock, Upload } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { api } from "@/shared/lib/api-client";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Field, Input, Select, Feedback } from "@/shared/components/ui/form";
import { PageHeader, Badge, EmptyState } from "@/shared/components/ui/page";
import { BrandingFields } from "./branding-fields";
import {
  defaultLayout,
  readLayout,
  type Layout,
} from "../services/template.service";
import { label } from "@/shared/lib/utils";
type Template = {
  id: string;
  ownerId: string | null;
  name: string;
  kind: string;
  official: boolean;
  locked: boolean;
  active: boolean;
  editableFields: string[];
  layout: Layout;
  assets: { id: string; kind: string }[];
};
export function TemplatesPage({ admin = false }: { admin?: boolean }) {
  const { user } = useAuth();
  const templates = useResource<Template[]>("/templates");
  const action = useAction();
  const [editing, setEditing] = useState<Template | null>(null);
  const [adding, setAdding] = useState(false);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      kind: form.get("kind"),
      official: admin && form.get("official") === "on",
      locked: admin && form.get("locked") === "on",
      active: form.get("active") === "on",
      editableFields: String(form.get("editableFields") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      layout: readLayout(form),
    };
    await action.run(async () => {
      if (editing) await api.patch(`/templates/${editing.id}`, body);
      else await api.post("/templates", body);
      templates.reload();
      setAdding(false);
      setEditing(null);
    }, "Template saved.");
  }
  async function asset(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const kind = String(form.get("kind"));
    form.delete("kind");
    await action.run(async () => {
      await api.post(`/templates/${id}/assets/${kind}`, form);
      templates.reload();
    }, "Branding asset saved.");
  }
  return (
    <>
      <PageHeader
        eyebrow={admin ? "PLATFORM TEMPLATES" : "MY TEMPLATES"}
        title="Your work. Your school’s identity."
        description="Save the formatting you use most, and give each document a familiar, professional finish."
      >
        <Button
          onClick={() => {
            setEditing(null);
            setAdding(!adding);
          }}
        >
          <Plus />
          {adding ? "Close form" : "New template"}
        </Button>
      </PageHeader>
      <Feedback
        error={action.error || templates.error?.message}
        success={action.success}
      />
      {adding && (
        <form
          key={editing?.id ?? "new"}
          onSubmit={save}
          className="panel my-6 space-y-5 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Template name">
              <Input
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={editing?.name}
              />
            </Field>
            <Field label="Document type">
              <Select name="kind" defaultValue={editing?.kind ?? "ILAW"}>
                {[
                  "ILAW",
                  "ASSESSMENT",
                  "TOS",
                  "EXAM",
                  "WORKSHEET",
                  "ACTIVITY",
                  "PRESENTATION",
                  "RUBRIC",
                  "REMEDIATION",
                  "MATERIAL",
                ].map((k) => (
                  <option key={k} value={k}>
                    {label(k)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <BrandingFields
            layout={
              editing?.layout ?? {
                ...defaultLayout,
                schoolName: user?.profile?.school ?? "",
                teacherName: user?.name ?? "",
              }
            }
          />
          <div className="flex flex-wrap gap-5">
            <label className="flex gap-2 text-xs">
              <input
                name="active"
                type="checkbox"
                defaultChecked={editing?.active ?? true}
              />
              Active
            </label>
            {admin && (
              <>
                <label className="flex gap-2 text-xs">
                  <input
                    name="official"
                    type="checkbox"
                    defaultChecked={editing?.official ?? true}
                  />
                  Official template
                </label>
                <label className="flex gap-2 text-xs">
                  <input
                    name="locked"
                    type="checkbox"
                    defaultChecked={editing?.locked ?? false}
                  />
                  Lock formatting
                </label>
              </>
            )}
          </div>
          {admin && (
            <Field
              label="Editable fields in locked templates"
              hint="Use comma-separated field names: schoolName, teacherName, header, footer, font, paperSize, orientation, marginMm."
            >
              <Input
                name="editableFields"
                defaultValue={
                  editing?.editableFields.join(", ") ?? "teacherName"
                }
              />
            </Field>
          )}
          <Button disabled={action.busy}>
            {action.busy ? "Saving…" : "Save template"}
          </Button>
        </form>
      )}
      <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
        {templates.data?.map((template) => (
          <div className="panel p-6" key={template.id}>
            <div className="flex items-center justify-between">
              <span className="tool-icon mint">
                <PanelsTopLeft size={20} />
              </span>
              <div className="flex gap-2">
                <Badge tone={template.official ? "teal" : "gray"}>
                  {template.official ? "Official" : "Personal"}
                </Badge>
                {template.locked && (
                  <Lock className="size-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <h2 className="mb-2 mt-5 text-lg font-semibold">{template.name}</h2>
            <p className="text-xs text-muted-foreground">
              {label(template.kind)} · {template.layout.paperSize} ·{" "}
              {template.layout.font} · {template.layout.orientation}
            </p>
            <div className="my-5 rounded-xl border border-border bg-muted p-5 text-center">
              <p className="text-xs font-semibold">
                {template.layout.schoolName || "Your school name"}
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {template.layout.header || "Document header"}
              </p>
              <div className="mx-auto my-5 h-12 w-3/4 space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-1.5 rounded bg-[#dce5df]" />
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground">
                {template.layout.footer.slice(0, 70)}
              </p>
            </div>
            {(template.ownerId === user?.id ||
              (admin && template.ownerId === null)) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(template);
                    setAdding(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit template
                </Button>
                <form
                  onSubmit={(e) => asset(e, template.id)}
                  className="mt-4 space-y-3 border-t border-border pt-4"
                >
                  <div className="flex gap-3">
                    <Select aria-label="Branding asset type" name="kind">
                      <option value="logo">School logo</option>
                      <option value="signature">Signature</option>
                      <option value="departmentLogo">Department logo</option>
                      <option value="header">Header image</option>
                      <option value="footer">Footer image</option>
                      <option value="watermark">Watermark</option>
                      <option value="seal">School seal</option>
                    </Select>
                    <Input
                      aria-label="Choose image asset"
                      type="file"
                      name="file"
                      accept="image/png,image/jpeg"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={action.busy}
                  >
                    <Upload />
                    Upload branding image
                  </Button>
                  {template.assets.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Saved assets:{" "}
                      {template.assets.map((a) => a.kind).join(", ")}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        ))}
      </div>
      {templates.data?.length === 0 && (
        <EmptyState
          title="Your signature style starts here"
          description="Create an ILAW, exam, or worksheet template, then choose it when exporting a document."
        />
      )}
    </>
  );
}
