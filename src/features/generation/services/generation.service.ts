import type { DocumentKind, SavedDocument, SourceMode } from "@gabay/types";
import { api } from "@/shared/lib/api-client";
export function generateDocument(
  form: FormData,
  kind: DocumentKind,
  sourceMode: SourceMode,
  instructions: string,
  uploadIds: string[],
) {
  const text = (key: string) => String(form.get(key) ?? "");
  const number = (key: string, fallback: number) =>
    form.get(key) === null || form.get(key) === ""
      ? fallback
      : Number(form.get(key));
  const mixText = text("questionMix");
  const questionMix = mixText.trim()
    ? mixText
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [count, ...type] = line.trim().split(/\s+/);
          if (!Number.isInteger(Number(count)) || !type.length)
            throw new Error(
              "Use one question type per line, for example: 10 Multiple Choice",
            );
          return { count: Number(count), type: type.join(" ") };
        })
    : [];
  return api.post<SavedDocument>("/ai/generate", {
    kind,
    topic: text("topic"),
    grade: number("grade", 8),
    learningArea: text("learningArea") || "Science",
    competency: text("competency"),
    term: number("term", 1),
    week: number("week", 1),
    duration: number("duration", 60),
    learners: number("learners", 40),
    language: text("language") || "English",
    context: text("context"),
    instructions,
    sourceMode,
    uploadIds,
    numberOfItems: number("numberOfItems", 10),
    difficulty: text("difficulty") || "Mixed",
    bloom: text("bloom") || "Mixed",
    questionMix,
    ...(text("sourceDocumentId")
      ? { sourceDocumentId: text("sourceDocumentId") }
      : {}),
    ...(text("tosId") ? { tosId: text("tosId") } : {}),
    ...(text("revisionSection")
      ? { revisionSection: text("revisionSection") }
      : {}),
  });
}
