"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Download,
  Pencil,
  Save,
  Trash2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { SavedDocument, StructuredContent, TosResult } from "@gabay/types";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { api, downloadFile } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  Input,
  Select,
  Textarea,
  Feedback,
} from "@/shared/components/ui/form";
import { Badge, Loading } from "@/shared/components/ui/page";
import { label, dateLabel } from "@/shared/lib/utils";
export function DocumentPage({ id }: { id: string }) {
  const doc = useResource<SavedDocument>(`/documents/${id}`);
  const templates =
    useResource<{ id: string; name: string; kind: string }[]>("/templates");
  const action = useAction();
  const router = useRouter();
  const [draft, setDraft] = useState<StructuredContent | null>(null);
  const [tab, setTab] = useState("content");
  const [format, setFormat] = useState("docx");
  const [template, setTemplate] = useState("");
  if (doc.loading) return <Loading />;
  if (!doc.data)
    return <Feedback error={doc.error?.message ?? "Document not found."} />;
  const document = doc.data;
  const content = draft ?? document.content;
  const tos = document.metadata.tos as TosResult | undefined;
  const target =
    document.kind === "ILAW"
      ? "/ilaw"
      : document.kind === "ASSESSMENT" ||
          document.kind === "EXAM" ||
          document.kind === "RUBRIC"
        ? "/assessments"
        : document.kind === "REMEDIATION" || document.kind === "WAYS_FORWARD"
          ? "/intervention"
          : "/materials";
  function sectionChange(
    index: number,
    field: "heading" | "body",
    value: string,
  ) {
    setDraft({
      ...content,
      sections: content.sections.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    });
  }
  return (
    <>
      <Link
        href="/library"
        className="mb-5 inline-flex items-center gap-2 text-xs text-muted-foreground"
      >
        <ArrowLeft size={14} />
        Back to your library
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>{label(document.kind)}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {document.title}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Updated {dateLabel(document.updatedAt)} · Version {document.version}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Duplicate document"
            disabled={action.busy}
            onClick={() =>
              action.run(async () => {
                const copy = await api.post<SavedDocument>(
                  `/documents/${id}/duplicate`,
                );
                router.push(`/library/${copy.id}`);
              })
            }
          >
            <Copy />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete document"
            disabled={action.busy}
            onClick={() => {
              if (
                window.confirm("Delete this document? This cannot be undone.")
              )
                void action.run(async () => {
                  await api.delete(`/documents/${id}`);
                  router.push("/library");
                });
            }}
          >
            <Trash2 />
          </Button>
          {document.kind !== "TOS" && (
            <Button
              variant="outline"
              onClick={() =>
                setDraft(draft ? null : structuredClone(document.content))
              }
            >
              <Pencil />
              {draft ? "Cancel editing" : "Edit document"}
            </Button>
          )}
          {draft && (
            <Button
              disabled={action.busy}
              onClick={() =>
                action.run(async () => {
                  await api.patch(`/documents/${id}`, {
                    version: document.version,
                    content: draft,
                  });
                  setDraft(null);
                  doc.reload();
                }, "Changes saved.")
              }
            >
              <Save />
              Save changes
            </Button>
          )}
        </div>
      </div>
      <Feedback error={action.error} success={action.success} />
      <div className="my-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0">
          <div className="mb-4 flex gap-2">
            {["content", "sources", "alignment"]
              .filter((t) => t !== "alignment" || document.kind === "ILAW")
              .map((t) => (
                <Button
                  key={t}
                  variant={tab === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTab(t)}
                >
                  {label(t)}
                </Button>
              ))}
          </div>
          <article className="panel space-y-7 p-6 md:p-10">
            {tab === "content" ? (
              <>
                {draft ? (
                  <>
                    <Field label="Document title">
                      <Input
                        value={content.title}
                        onChange={(e) =>
                          setDraft({ ...content, title: e.target.value })
                        }
                        maxLength={200}
                      />
                    </Field>
                    <Field label="Summary">
                      <Textarea
                        value={content.summary}
                        onChange={(e) =>
                          setDraft({ ...content, summary: e.target.value })
                        }
                      />
                    </Field>
                  </>
                ) : (
                  <p className="text-sm leading-7 text-muted-foreground">
                    {content.summary}
                  </p>
                )}
                {tos && (
                  <div className="table-scroll rounded-xl border border-border">
                    <table>
                      <thead>
                        <tr>
                          <th>Topic</th>
                          <th>Hours</th>
                          <th>Weight</th>
                          <th>Items</th>
                          {[
                            "Remember",
                            "Understand",
                            "Apply",
                            "Analyze",
                            "Evaluate",
                            "Create",
                          ]
                            .filter((level) => level in tos.bloomTotals)
                            .map((b) => (
                              <th key={b}>{b}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tos.topics.map((t) => (
                          <tr key={t.title}>
                            <td>{t.title}</td>
                            <td>{t.hours}</td>
                            <td>{t.percentage}%</td>
                            <td>{t.items}</td>
                            {[
                              "Remember",
                              "Understand",
                              "Apply",
                              "Analyze",
                              "Evaluate",
                              "Create",
                            ]
                              .filter((level) => level in tos.bloomTotals)
                              .map((b) => (
                                <td key={b}>{t.distribution[b]}</td>
                              ))}
                          </tr>
                        ))}
                        <tr className="bg-secondary font-semibold">
                          <td>Total</td>
                          <td>{tos.totalHours}</td>
                          <td>100%</td>
                          <td>{tos.totalItems}</td>
                          {[
                            "Remember",
                            "Understand",
                            "Apply",
                            "Analyze",
                            "Evaluate",
                            "Create",
                          ]
                            .filter((level) => level in tos.bloomTotals)
                            .map((level) => (
                              <td key={level}>{tos.bloomTotals[level]}</td>
                            ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {content.sections.map((section, i) => (
                  <section key={i} className="border-t border-border pt-6">
                    {draft ? (
                      <div className="space-y-3">
                        <Input
                          aria-label={`Section ${i + 1} title`}
                          value={section.heading}
                          onChange={(e) =>
                            sectionChange(i, "heading", e.target.value)
                          }
                        />
                        <Textarea
                          aria-label={`Section ${i + 1} content`}
                          className="min-h-48"
                          value={section.body}
                          onChange={(e) =>
                            sectionChange(i, "body", e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <h2 className="text-lg font-semibold text-primary">
                            {section.heading}
                          </h2>
                          {document.kind === "ILAW" && (
                            <Link
                              href={`/ilaw?from=${id}&section=${encodeURIComponent(section.heading)}&topic=${encodeURIComponent(document.title)}`}
                              className="text-[10px] text-muted-foreground hover:text-primary"
                            >
                              Regenerate section
                            </Link>
                          )}
                        </div>
                        <div className="prose-content">{section.body}</div>
                      </>
                    )}
                  </section>
                ))}
                {content.questions.map((q, index) => (
                  <section
                    key={q.number}
                    className="border-t border-border pt-5"
                  >
                    {draft ? (
                      <div className="space-y-3">
                        <Field label={`Question ${q.number}`}>
                          <Textarea
                            value={q.question}
                            onChange={(e) =>
                              setDraft({
                                ...content,
                                questions: content.questions.map((v, i) =>
                                  i === index
                                    ? { ...v, question: e.target.value }
                                    : v,
                                ),
                              })
                            }
                          />
                        </Field>
                        <Field label="Answer">
                          <Input
                            value={q.answer}
                            onChange={(e) =>
                              setDraft({
                                ...content,
                                questions: content.questions.map((v, i) =>
                                  i === index
                                    ? { ...v, answer: e.target.value }
                                    : v,
                                ),
                              })
                            }
                          />
                        </Field>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium">
                          {q.number}. {q.question}
                        </h3>
                        <ol className="mb-3 mt-3 space-y-1 pl-5 text-sm">
                          {q.options.map((o, i) => (
                            <li key={i}>
                              {String.fromCharCode(65 + i)}. {o}
                            </li>
                          ))}
                        </ol>
                        <details className="rounded-lg bg-muted p-3 text-xs">
                          <summary className="cursor-pointer font-medium">
                            Answer & mapping
                          </summary>
                          <p className="mt-3">
                            {q.answer} — {q.explanation}
                          </p>
                          <p className="mt-2 text-muted-foreground">
                            {q.topic} · {q.competency} · {q.bloom} ·{" "}
                            {q.difficulty}
                          </p>
                        </details>
                      </>
                    )}
                  </section>
                ))}
              </>
            ) : tab === "sources" ? (
              <>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary" />
                  <h2 className="text-lg font-semibold">
                    Know where it comes from
                  </h2>
                </div>
                {document.sources.length ? (
                  document.sources.map((source) => (
                    <div
                      key={source.documentId}
                      className="rounded-xl border border-border p-5"
                    >
                      <Badge tone={source.official ? "teal" : "gray"}>
                        {source.official
                          ? "Official source used"
                          : "User file used"}
                      </Badge>
                      <h3 className="mb-2 mt-3 font-semibold">
                        {source.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {source.source} · Version {source.version}
                      </p>
                      {source.excerpt && (
                        <blockquote className="mt-4 border-l-2 border-primary pl-4 text-xs leading-6 text-muted-foreground">
                          {source.excerpt}
                        </blockquote>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No official source was used. This is a teacher-created or
                    AI-assisted recommendation.
                  </p>
                )}
                <p className="text-xs leading-6 text-muted-foreground">
                  References support the content; generated documents are not
                  official DepEd issuances.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">Review the alignment</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  This is a structure and coverage check. Review the
                  relationship between the competency, activities, and
                  assessment using your professional judgment.
                </p>
                {[
                  "Do intentions address the selected competency?",
                  "Do learning experiences practice the intended skills?",
                  "Does assessment measure the intended outcomes?",
                  "Are activities appropriate for the grade and class context?",
                  "Are differentiation and ways forward actionable?",
                ].map((text) => (
                  <label
                    className="flex items-start gap-3 text-sm leading-6"
                    key={text}
                  >
                    <input type="checkbox" className="mt-1.5" />
                    {text}
                  </label>
                ))}
                <Badge tone="amber">
                  Teacher review · No official compliance score
                </Badge>
              </>
            )}
          </article>
        </section>
        <aside className="space-y-5">
          <div className="panel space-y-4 p-5">
            <h2 className="text-sm font-semibold">Ready for the classroom</h2>
            <Field label="Export format">
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="docx">Word document (.docx)</option>
                <option value="pdf">PDF document (.pdf)</option>
                <option value="pptx">PowerPoint (.pptx)</option>
              </Select>
            </Field>
            <Field label="Document template">
              <Select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option value="">My default branding</option>
                {templates.data
                  ?.filter((t) => t.kind === document.kind)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Button
              className="w-full"
              disabled={action.busy}
              onClick={() =>
                action.run(() =>
                  downloadFile(
                    `/documents/${id}/export?format=${format}${template ? `&templateId=${template}` : ""}`,
                    `${document.title}.${format}`,
                  ),
                )
              }
            >
              <Download />
              Export document
            </Button>
          </div>
          <div className="panel space-y-3 p-5">
            <h2 className="mb-4 text-sm font-semibold">
              Keep the learning going
            </h2>
            {(document.kind === "TOS"
              ? [
                  [
                    "Generate examination",
                    `/assessments?kind=EXAM&tos=${id}&topic=${encodeURIComponent(document.title)}`,
                  ],
                ]
              : [
                  [
                    "Create a worksheet",
                    `/materials?kind=WORKSHEET&from=${id}&topic=${encodeURIComponent(document.title)}`,
                  ],
                  [
                    "Generate assessment",
                    `/assessments?from=${id}&topic=${encodeURIComponent(document.title)}`,
                  ],
                  [
                    "Create presentation",
                    `/materials?kind=PRESENTATION&from=${id}&topic=${encodeURIComponent(document.title)}`,
                  ],
                  [
                    "Plan remediation",
                    `/intervention?from=${id}&topic=${encodeURIComponent(document.title)}`,
                  ],
                  [
                    "Regenerate content",
                    `${target}?kind=${document.kind}&from=${id}&topic=${encodeURIComponent(document.title)}`,
                  ],
                ]
            ).map(([name, href]) => (
              <Link
                key={name}
                href={href}
                className="flex items-center gap-2 rounded-lg p-2 text-xs text-primary hover:bg-secondary"
              >
                <Sparkles size={14} />
                {name}
              </Link>
            ))}
          </div>
          <div className="p-3 text-xs leading-6 text-muted-foreground">
            {document.content.warnings.map((warning, i) => (
              <p key={i} className="mb-3">
                {warning}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
