"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Plus,
  ArrowUpRight,
  Upload,
  Trash2,
} from "lucide-react";
import type { SavedDocument } from "@gabay/types";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { api } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/button";
import { Input, Field, Select, Feedback } from "@/shared/components/ui/form";
import {
  PageHeader,
  EmptyState,
  Badge,
  Loading,
} from "@/shared/components/ui/page";
import { dateLabel, label } from "@/shared/lib/utils";
const kinds = [
  "ILAW",
  "ASSESSMENT",
  "TOS",
  "EXAM",
  "WORKSHEET",
  "ACTIVITY",
  "PRESENTATION",
  "RUBRIC",
  "REMEDIATION",
  "ENRICHMENT",
  "WAYS_FORWARD",
  "MATERIAL",
];
export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [tab, setTab] = useState("documents");
  const action = useAction();
  const documents = useResource<SavedDocument[]>(
    `/documents?search=${encodeURIComponent(search)}${kind ? `&kind=${kind}` : ""}`,
  );
  const uploads = useResource<
    {
      id: string;
      title: string;
      category: string;
      size: number;
      createdAt: string;
    }[]
  >(tab === "uploads" ? "/knowledge" : null);
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    await action.run(async () => {
      await api.post("/knowledge", data);
      uploads.reload();
      form.reset();
    }, "Your reference is ready to use.");
  }
  return (
    <>
      <PageHeader
        eyebrow="MY LIBRARY"
        title="Good ideas deserve a home."
        description="Your lessons, materials, and references — organized, editable, and ready for the next class."
      >
        <Button asChild>
          <Link href="/ilaw">
            <Plus />
            Create something new
          </Link>
        </Button>
      </PageHeader>
      <div className="mb-6 flex gap-2">
        <Button
          variant={tab === "documents" ? "default" : "outline"}
          onClick={() => setTab("documents")}
        >
          My documents
        </Button>
        <Button
          variant={tab === "uploads" ? "default" : "outline"}
          onClick={() => setTab("uploads")}
        >
          Uploaded references
        </Button>
      </div>
      <Feedback
        error={
          action.error || documents.error?.message || uploads.error?.message
        }
        success={action.success}
      />
      {tab === "documents" ? (
        <>
          <div className="mb-6 mt-4 flex flex-wrap gap-3">
            <div className="relative min-w-60 flex-1">
              <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Search documents"
                className="pl-10"
                placeholder="Find something you created…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              aria-label="Filter document type"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="max-w-52"
            >
              <option value="">All document types</option>
              {kinds.map((k) => (
                <option value={k} key={k}>
                  {label(k)}
                </option>
              ))}
            </Select>
          </div>
          {documents.loading ? (
            <Loading />
          ) : documents.data?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {documents.data.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/library/${doc.id}`}
                  className="tool-card group"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="tool-icon mint">
                      <FileText size={21} />
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </div>
                  <Badge tone="gray">{label(doc.kind)}</Badge>
                  <h2 className="mb-2 mt-3 line-clamp-2 text-base font-semibold">
                    {doc.title}
                  </h2>
                  <p className="mb-6 line-clamp-2 text-xs leading-6 text-muted-foreground">
                    {doc.content.summary}
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-4 text-[10px] text-muted-foreground">
                    <span>Edited {dateLabel(doc.updatedAt)}</span>
                    <span>Version {doc.version}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Make room for your next great idea"
              description="Create a lesson, assessment, or TOS. It will appear here so you can keep building on it."
            >
              <Button asChild>
                <Link href="/ilaw">Create your first document</Link>
              </Button>
            </EmptyState>
          )}
        </>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {uploads.data?.length ? (
              uploads.data.map((file) => (
                <div
                  className="panel flex items-center gap-4 p-5"
                  key={file.id}
                >
                  <FileText className="text-primary" />
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">{file.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {label(file.category)} · {(file.size / 1024).toFixed(0)}{" "}
                      KB · {dateLabel(file.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${file.title}`}
                    onClick={() => {
                      if (window.confirm(`Delete reference “${file.title}”?`))
                        void action.run(async () => {
                          await api.delete(`/knowledge/${file.id}`);
                          uploads.reload();
                        });
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="Bring your references along"
                description="Upload a syllabus, module, or teaching guide. Select it when generating content with My files + official documents."
              />
            )}
          </div>
          <form onSubmit={upload} className="panel space-y-5 p-6">
            <Upload size={22} className="text-primary" />
            <h2 className="font-semibold">Add a teaching reference</h2>
            <Field label="Title">
              <Input name="title" required minLength={2} maxLength={200} />
            </Field>
            <Field label="Category">
              <Select name="category">
                <option value="SYLLABUS">Syllabus</option>
                <option value="LESSON_EXEMPLAR">Lesson material</option>
                <option value="CURRICULUM">Curriculum reference</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="OTHER">Other reference</option>
              </Select>
            </Field>
            <Field
              label="Reference file"
              hint="PDF, DOCX, or UTF-8 TXT. Up to 10 MB. Scanned PDFs need OCR first."
            >
              <Input
                name="file"
                type="file"
                required
                accept=".pdf,.docx,.txt"
              />
            </Field>
            <Button className="w-full" disabled={action.busy}>
              {action.busy ? "Reading your document…" : "Upload reference"}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
