"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Info,
  BookOpen,
} from "lucide-react";
import type { DocumentKind, SavedDocument, SourceMode } from "@gabay/types";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import {
  Field,
  Input,
  Select,
  Textarea,
  Feedback,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { PageHeader, Badge } from "@/shared/components/ui/page";
import { SourceSelector } from "./source-selector";
import { generateDocument } from "../services/generation.service";
import { label } from "@/shared/lib/utils";
const details = {
  ILAW: {
    title: "A lesson with purpose.",
    description:
      "Bring intentions, experiences, assessment, and ways forward together in one thoughtful plan.",
  },
  ASSESSMENT: {
    title: "Make every question count.",
    description:
      "Create aligned assessments with answer keys, topic mapping, and the right level of challenge.",
  },
  MATERIAL: {
    title: "Bring learning to life.",
    description:
      "Create something your learners can read, explore, practice, and remember.",
  },
  REMEDIATION: {
    title: "Every learner has a next step.",
    description:
      "Turn learning gaps into focused support, reinforcement, and opportunities to grow.",
  },
};
export function GenerationWorkspace({
  feature,
}: {
  feature: "ILAW" | "ASSESSMENT" | "MATERIAL" | "REMEDIATION";
}) {
  const search = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const action = useAction();
  const validKinds: DocumentKind[] =
    feature === "ASSESSMENT"
      ? ["ASSESSMENT", "EXAM", "RUBRIC"]
      : feature === "MATERIAL"
        ? ["WORKSHEET", "ACTIVITY", "PRESENTATION", "MATERIAL", "ENRICHMENT"]
        : feature === "REMEDIATION"
          ? ["REMEDIATION", "ENRICHMENT", "WAYS_FORWARD"]
          : ["ILAW"];
  const requested = search.get("kind") as DocumentKind | null;
  const [kind, setKind] = useState<DocumentKind>(
    requested && validKinds.includes(requested) ? requested : validKinds[0],
  );
  const [mode, setMode] = useState<SourceMode>("OFFICIAL_AI");
  const [instructions, setInstructions] = useState(
    search.get("instructions") ?? "",
  );
  const [uploadIds, setUploadIds] = useState<string[]>([]);
  const status = useResource<{ configured: boolean }>("/ai/status");
  const sources = useResource<{ id: string; title: string }[]>(
    mode === "PERSONAL_OFFICIAL" ? "/knowledge" : null,
  );
  const documents = useResource<SavedDocument[]>("/documents");
  const info = details[feature];
  const isAssessment = kind === "ASSESSMENT" || kind === "EXAM";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await action.run(() =>
      generateDocument(form, kind, mode, instructions, uploadIds),
    );
    if (result) router.push(`/library/${result.id}`);
  }
  return (
    <>
      <PageHeader
        eyebrow={
          feature === "ILAW"
            ? "ILAW PLANNER"
            : feature === "ASSESSMENT"
              ? "ASSESSMENTS"
              : feature === "MATERIAL"
                ? "TEACHING MATERIALS"
                : "INTERVENTION"
        }
        title={info.title}
        description={info.description}
      />
      {status.data && !status.data.configured && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
          <Info className="mt-1 size-4 shrink-0" />
          <p>
            AI generation will be available once your administrator configures
            OpenAI. You can already browse curriculum, calculate a TOS, organize
            templates, and analyze scores.
          </p>
        </div>
      )}
      <div className="grid items-start gap-7 xl:grid-cols-[1fr_300px]">
        <form onSubmit={submit} className="space-y-6">
          <div className="panel p-6 md:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="tool-icon mint">
                <BookOpen size={19} />
              </span>
              <div>
                <h2 className="text-base font-semibold">
                  Start with the essentials
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  A little context helps GABAY understand your classroom.
                </p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {validKinds.length > 1 && (
                <Field
                  label="What would you like to create?"
                  className="sm:col-span-2"
                >
                  <Select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as DocumentKind)}
                  >
                    {validKinds.map((k) => (
                      <option key={k} value={k}>
                        {label(k)}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label="Grade level">
                <Select
                  name="grade"
                  defaultValue={
                    search.get("grade") ??
                    String(user?.profile?.gradeLevels[0] ?? 8)
                  }
                >
                  {Array.from({ length: 13 }, (_, i) => (
                    <option value={i} key={i}>
                      {i === 0 ? "Kindergarten" : `Grade ${i}`}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Learning area">
                <Input
                  name="learningArea"
                  required
                  maxLength={100}
                  defaultValue={
                    search.get("subject") ??
                    user?.profile?.learningAreas[0] ??
                    "Science"
                  }
                />
              </Field>
              <Field label="Topic" className="sm:col-span-2">
                <Input
                  name="topic"
                  required
                  minLength={2}
                  maxLength={500}
                  placeholder="e.g. Understanding earthquakes and faults"
                  defaultValue={search.get("topic") ?? ""}
                />
              </Field>
              <Field
                label="Learning competency"
                className="sm:col-span-2"
                hint="Use a verified competency description. GABAY won’t invent official codes."
              >
                <Textarea
                  name="competency"
                  maxLength={2000}
                  placeholder="What should your learners know or be able to do?"
                  defaultValue={search.get("competency") ?? ""}
                />
              </Field>
              <Field label="Term">
                <Select name="term" defaultValue={search.get("term") ?? "1"}>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      Term {n}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Teaching week">
                <Input
                  name="week"
                  type="number"
                  min={1}
                  max={52}
                  defaultValue={search.get("week") ?? 1}
                />
              </Field>
              <Field label="Duration (minutes)">
                <Input
                  name="duration"
                  type="number"
                  min={5}
                  max={480}
                  defaultValue={60}
                />
              </Field>
              <Field label="Number of learners">
                <Input
                  name="learners"
                  type="number"
                  min={1}
                  max={300}
                  defaultValue={40}
                />
              </Field>
              <Field label="Language">
                <Select name="language">
                  <option>English</option>
                  <option>Filipino</option>
                  <option>English and Filipino</option>
                </Select>
              </Field>
              <Field label="Start from a saved document">
                <Select
                  name="sourceDocumentId"
                  defaultValue={search.get("from") ?? ""}
                >
                  <option value="">Start fresh</option>
                  {documents.data
                    ?.filter((d) => d.kind !== "TOS")
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                </Select>
              </Field>
              {kind === "EXAM" && (
                <Field label="Validated TOS" className="sm:col-span-2">
                  <Select
                    name="tosId"
                    required
                    defaultValue={search.get("tos") ?? ""}
                  >
                    <option value="">Select a TOS</option>
                    {documents.data
                      ?.filter((d) => d.kind === "TOS")
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title}
                        </option>
                      ))}
                  </Select>
                </Field>
              )}
              {isAssessment && (
                <>
                  <Field label="Number of items">
                    <Input
                      name="numberOfItems"
                      type="number"
                      min={1}
                      max={200}
                      defaultValue={20}
                    />
                  </Field>
                  <Field label="Difficulty">
                    <Select name="difficulty">
                      <option>Mixed</option>
                      <option>Easy</option>
                      <option>Moderate</option>
                      <option>Challenging</option>
                    </Select>
                  </Field>
                  <Field
                    label="Mixed question types (optional)"
                    hint="One per line: 10 Multiple Choice, 5 Identification. These counts replace the item count."
                    className="sm:col-span-2"
                  >
                    <Textarea
                      name="questionMix"
                      placeholder={
                        "10 Multiple Choice\n5 Identification\n2 Essay"
                      }
                    />
                  </Field>
                </>
              )}
              <Field label="Class context" className="sm:col-span-2">
                <Textarea
                  name="context"
                  maxLength={3000}
                  placeholder="Tell us about learner needs, available materials, or your local context."
                  defaultValue={search.get("context") ?? ""}
                />
              </Field>
            </div>
          </div>
          <div className="panel space-y-5 p-6 md:p-7">
            <h2 className="text-base font-semibold">Make it your own</h2>
            <SourceSelector value={mode} onChange={setMode} />
            {mode === "PERSONAL_OFFICIAL" && (
              <div className="space-y-2">
                {sources.data?.length ? (
                  sources.data.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={uploadIds.includes(s.id)}
                        onChange={(e) =>
                          setUploadIds((ids) =>
                            e.target.checked
                              ? [...ids, s.id]
                              : ids.filter((id) => id !== s.id),
                          )
                        }
                      />
                      {s.title}
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Upload personal references in My Library first.
                  </p>
                )}
              </div>
            )}
            <Field label="Additional instructions">
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                maxLength={6000}
                placeholder="What would make this especially helpful for your learners?"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {[
                "Make it interactive",
                "Add differentiated activities",
                "Include ICT integration",
                "Use local examples",
                "Include remediation",
              ].map((text) => (
                <button
                  type="button"
                  key={text}
                  onClick={() =>
                    setInstructions((v) => (v ? `${v}\n${text}` : text))
                  }
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary"
                >
                  + {text}
                </button>
              ))}
            </div>
          </div>
          <input
            type="hidden"
            name="revisionSection"
            value={search.get("section") ?? ""}
          />
          <Feedback error={action.error} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Saved to your library. Always yours to edit.
            </p>
            <Button
              type="submit"
              disabled={action.busy || status.data?.configured === false}
            >
              <Sparkles />
              {action.busy
                ? "Creating your document…"
                : `Generate ${kind === "ILAW" ? "ILAW lesson" : label(kind).toLowerCase()}`}
              <ArrowRight />
            </Button>
          </div>
        </form>
        <aside className="space-y-5">
          <div className="panel p-6">
            <Badge>THOUGHTFULLY STRUCTURED</Badge>
            <h3 className="mb-5 mt-4 text-lg font-semibold">
              A little guidance
              <br />
              at every step.
            </h3>
            {(feature === "ILAW"
              ? [
                  [
                    "I",
                    "Intentions",
                    "Begin with meaningful learning outcomes.",
                  ],
                  [
                    "L",
                    "Learning Experiences",
                    "Make room for practice and discovery.",
                  ],
                  ["A", "Assessment", "Find evidence of understanding."],
                  ["W", "Ways Forward", "Plan what each learner needs next."],
                ]
              : [
                  [
                    "1",
                    "Build on evidence",
                    "Use verified references and clear inputs.",
                  ],
                  [
                    "2",
                    "Review and refine",
                    "Check alignment with your learners’ needs.",
                  ],
                  [
                    "3",
                    "Bring it to class",
                    "Export, share, and make it your own.",
                  ],
                ]
            ).map(([letter, title, description]) => (
              <div className="mb-5 flex gap-3" key={letter}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-semibold text-primary">
                  {letter}
                </span>
                <div>
                  <h4 className="text-xs font-semibold">{title}</h4>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-[#eef2e9] p-5">
            <ShieldCheck size={20} className="mb-3 text-primary" />
            <h3 className="text-sm font-semibold">
              Your expertise comes first.
            </h3>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              GABAY helps with the groundwork. You bring the context, care, and
              professional judgment.
            </p>
            <Link
              href="/library"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              Explore your library
              <ArrowUpRightIcon />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={13} />;
}
