"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Plus, Trash2, CheckCheck } from "lucide-react";
import type { SavedDocument } from "@gabay/types";
import { api } from "@/shared/lib/api-client";
import { useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Input, Field, Feedback } from "@/shared/components/ui/form";
import { PageHeader } from "@/shared/components/ui/page";
export function TosPage() {
  const router = useRouter();
  const action = useAction();
  const [topics, setTopics] = useState([
    { title: "", competency: "", hours: "1" },
  ]);
  const [bloom, setBloom] = useState([
    { level: "Remember", percentage: 20 },
    { level: "Understand", percentage: 30 },
    { level: "Apply", percentage: 20 },
    { level: "Analyze", percentage: 15 },
    { level: "Evaluate", percentage: 10 },
    { level: "Create", percentage: 5 },
  ]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await action.run(() =>
      api.post<SavedDocument>("/tos", {
        title: form.get("title"),
        totalItems: Number(form.get("totalItems")),
        topics: topics.map((t) => ({ ...t, hours: Number(t.hours) })),
        bloom,
      }),
    );
    if (result) router.push(`/library/${result.id}`);
  }
  return (
    <>
      <PageHeader
        eyebrow="TABLE OF SPECIFICATIONS"
        title="Give your assessment a strong foundation."
        description="Balance teaching time, topics, and thinking skills with an exact, validated assessment blueprint."
      />
      <form onSubmit={submit} className="space-y-6">
        <div className="panel grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Examination title">
            <Input
              name="title"
              required
              minLength={2}
              maxLength={200}
              placeholder="e.g. Grade 8 Science — Term 1"
            />
          </Field>
          <Field label="Total examination items">
            <Input
              name="totalItems"
              type="number"
              min={1}
              max={200}
              defaultValue={50}
              required
            />
          </Field>
        </div>
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Topics & teaching time</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Each topic needs its actual number of teaching hours.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setTopics((v) => [
                  ...v,
                  { title: "", competency: "", hours: "1" },
                ])
              }
              disabled={topics.length >= 50}
            >
              <Plus />
              Add topic
            </Button>
          </div>
          <div className="space-y-4">
            {topics.map((t, i) => (
              <div
                className="grid items-end gap-3 rounded-xl bg-muted p-4 md:grid-cols-[1fr_1fr_100px_40px]"
                key={i}
              >
                <Field label={`Topic ${i + 1}`}>
                  <Input
                    required
                    value={t.title}
                    maxLength={200}
                    onChange={(e) =>
                      setTopics((v) =>
                        v.map((r, j) =>
                          j === i ? { ...r, title: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Competency">
                  <Input
                    value={t.competency}
                    maxLength={1000}
                    onChange={(e) =>
                      setTopics((v) =>
                        v.map((r, j) =>
                          j === i ? { ...r, competency: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Hours">
                  <Input
                    type="number"
                    min={0.01}
                    max={10000}
                    step={0.01}
                    required
                    value={t.hours}
                    onChange={(e) =>
                      setTopics((v) =>
                        v.map((r, j) =>
                          j === i ? { ...r, hours: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove topic ${i + 1}`}
                  disabled={topics.length === 1}
                  onClick={() => setTopics((v) => v.filter((_, j) => j !== i))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <h2 className="font-semibold">Bloom’s cognitive distribution</h2>
          <p className="mb-5 mt-1 text-xs text-muted-foreground">
            Set the share of each thinking skill. Percentages must total exactly
            100%.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {bloom.map((b, i) => (
              <Field key={b.level} label={`${b.level} (%)`}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  required
                  value={b.percentage}
                  onChange={(e) =>
                    setBloom((v) =>
                      v.map((r, j) =>
                        j === i
                          ? { ...r, percentage: Number(e.target.value) }
                          : r,
                      ),
                    )
                  }
                />
              </Field>
            ))}
          </div>
        </div>
        <div className="flex gap-3 rounded-xl bg-secondary p-5 text-primary">
          <CheckCheck className="size-5 shrink-0" />
          <p className="text-xs leading-6">
            GABAY calculates allocations using teaching hours and reconciles
            rounding so topic totals and Bloom totals match your requested item
            count. Review the blueprint before generating an exam.
          </p>
        </div>
        <Feedback error={action.error} />
        <div className="flex justify-end">
          <Button disabled={action.busy}>
            <Calculator />
            {action.busy ? "Calculating…" : "Calculate & save TOS"}
          </Button>
        </div>
      </form>
    </>
  );
}
