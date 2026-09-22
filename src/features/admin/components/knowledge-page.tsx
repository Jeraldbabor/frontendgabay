"use client";
import { useState } from "react";
import { Upload, FileText, Pencil, Trash2 } from "lucide-react";
import { api } from "@/shared/lib/api-client";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  Input,
  Textarea,
  Select,
  Feedback,
} from "@/shared/components/ui/form";
import { PageHeader, Badge, EmptyState } from "@/shared/components/ui/page";
import { dateLabel, label } from "@/shared/lib/utils";
type Knowledge = {
  id: string;
  title: string;
  category: string;
  description: string;
  version: string;
  academicYear: string;
  effectiveDate: string | null;
  source: string;
  official: boolean;
  active: boolean;
  allowRetrieval: boolean;
  currentVersion: boolean;
  createdAt: string;
};
const categories = [
  "CURRICULUM",
  "BOW",
  "ILAW",
  "ASSESSMENT",
  "TOS",
  "EXAM",
  "SYLLABUS",
  "POLICY",
  "MEMORANDUM",
  "LESSON_EXEMPLAR",
  "TEACHING_STRATEGY",
  "SCHOOL_FORM",
  "TEMPLATE",
  "OTHER",
];
export function KnowledgePage() {
  const docs = useResource<Knowledge[]>("/knowledge");
  const action = useAction();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Knowledge | null>(null);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    for (const key of [
      "official",
      "active",
      "allowRetrieval",
      "currentVersion",
    ])
      form.set(key, String(form.get(key) === "on"));
    if (!form.get("effectiveDate")) form.delete("effectiveDate");
    await action.run(async () => {
      if (editing) {
        const body = Object.fromEntries(form);
        await api.patch(`/knowledge/${editing.id}`, {
          ...body,
          official: body.official === "true",
          active: body.active === "true",
          allowRetrieval: body.allowRetrieval === "true",
          currentVersion: body.currentVersion === "true",
        });
      } else await api.post("/knowledge", form);
      docs.reload();
      setAdding(false);
      setEditing(null);
    }, "Knowledge document saved.");
  }
  return (
    <>
      <PageHeader
        eyebrow="ADMIN · KNOWLEDGE BASE"
        title="Build on trusted knowledge."
        description="Maintain the official documents, current versions, and retrieval permissions that guide GABAY."
      >
        <Button
          onClick={() => {
            setEditing(null);
            setAdding(!adding);
          }}
        >
          <Upload />
          {adding ? "Close form" : "Upload reference"}
        </Button>
      </PageHeader>
      <Feedback
        error={action.error || docs.error?.message}
        success={action.success}
      />
      {adding && (
        <form
          key={editing?.id ?? "new"}
          onSubmit={save}
          className="panel my-6 grid gap-5 p-6 sm:grid-cols-2"
        >
          <Field label="Title">
            <Input
              name="title"
              required
              minLength={2}
              maxLength={200}
              defaultValue={editing?.title}
            />
          </Field>
          <Field label="Category">
            <Select
              name="category"
              defaultValue={editing?.category ?? "CURRICULUM"}
            >
              {categories.map((c) => (
                <option value={c} key={c}>
                  {label(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              name="description"
              maxLength={2000}
              defaultValue={editing?.description}
            />
          </Field>
          <Field label="Version">
            <Input
              name="version"
              defaultValue={editing?.version ?? "1.0"}
              required
              maxLength={30}
            />
          </Field>
          <Field label="Academic year">
            <Input
              name="academicYear"
              defaultValue={editing?.academicYear}
              maxLength={30}
            />
          </Field>
          <Field label="Effective date">
            <Input
              name="effectiveDate"
              type="date"
              defaultValue={editing?.effectiveDate?.slice(0, 10)}
            />
          </Field>
          <Field label="Source / issuing office">
            <Input
              name="source"
              defaultValue={editing?.source}
              maxLength={1000}
            />
          </Field>
          {!editing && (
            <Field
              label="PDF, DOCX, or TXT file"
              className="sm:col-span-2"
              hint="Up to 10 MB. Upload a replacement as a new version, then deactivate the old version."
            >
              <Input
                name="file"
                type="file"
                accept=".pdf,.docx,.txt"
                required
              />
            </Field>
          )}
          <div className="flex flex-wrap gap-5 sm:col-span-2">
            {(
              [
                "official",
                "active",
                "allowRetrieval",
                "currentVersion",
              ] as const
            ).map((key) => (
              <label key={key} className="flex gap-2 text-xs">
                <input
                  type="checkbox"
                  name={key}
                  defaultChecked={editing?.[key] ?? true}
                />
                {key.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </div>
          <Button disabled={action.busy} className="sm:col-span-2">
            {action.busy ? "Processing document…" : "Save knowledge document"}
          </Button>
        </form>
      )}
      <div className="mt-6 space-y-4">
        {docs.data?.map((doc) => (
          <div className="panel p-6" key={doc.id}>
            <div className="flex items-start gap-4">
              <span className="tool-icon mint">
                <FileText size={21} />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={doc.official ? "teal" : "gray"}>
                    {doc.official ? "Official reference" : "Unofficial"}
                  </Badge>
                  <Badge
                    tone={
                      doc.active && doc.allowRetrieval && doc.currentVersion
                        ? "teal"
                        : "amber"
                    }
                  >
                    {doc.active && doc.allowRetrieval && doc.currentVersion
                      ? "Available for retrieval"
                      : "Excluded from retrieval"}
                  </Badge>
                </div>
                <h2 className="mb-2 mt-3 text-base font-semibold">
                  {doc.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {label(doc.category)} · Version {doc.version} ·{" "}
                  {dateLabel(doc.createdAt)}
                </p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {doc.source}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label={`Edit ${doc.title}`}
                onClick={() => {
                  setEditing(doc);
                  setAdding(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                aria-label={`Delete ${doc.title}`}
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete “${doc.title}” and remove it from retrieval?`,
                    )
                  )
                    void action.run(async () => {
                      await api.delete(`/knowledge/${doc.id}`);
                      docs.reload();
                    });
                }}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {docs.data?.length === 0 && (
        <EmptyState
          title="The foundation for trusted guidance"
          description="Upload verified official documents to make them available for source-aware generation."
        />
      )}
    </>
  );
}
