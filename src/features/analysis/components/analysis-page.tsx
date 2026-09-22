"use client";
import { useState } from "react";
import Link from "next/link";
import { ChartNoAxesCombined, ArrowRight } from "lucide-react";
import { api } from "@/shared/lib/api-client";
import { useAction, useResource } from "@/shared/hooks/use-resource";
import { parseScoreRows } from "../services/score-import";
import { Button } from "@/shared/components/ui/button";
import { Field, Input, Textarea, Feedback } from "@/shared/components/ui/form";
import { PageHeader, Badge } from "@/shared/components/ui/page";
type AnalysisResult = {
  id: string;
  statistics: {
    count: number;
    mean: number;
    median: number;
    meanPercentageScore: number;
    masteryRate: number;
    standardDeviation: number;
  };
  groups: Record<string, number>;
  learners: {
    name: string;
    score: number;
    percentage: number;
    group: string;
  }[];
  items: {
    number: number;
    difficultyIndex: number;
    discriminationIndex: number | null;
    correctPercentage: number;
    distractors: Record<string, number>;
    competency: string;
  }[];
  competencyPerformance: {
    competency: string;
    correctPercentage: number;
    items: number;
  }[];
  method: string;
};
export function AnalysisPage() {
  const action = useAction();
  const [scores, setScores] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const history =
    useResource<{ id: string; title: string; result: AnalysisResult }[]>(
      "/analysis",
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = await action.run(() =>
      api.post<AnalysisResult>("/analysis", {
        title: form.get("title"),
        maxScore: Number(form.get("maxScore")),
        masteryThreshold: Number(form.get("threshold")),
        learners: parseScoreRows(scores),
        answerKey: String(form.get("answerKey") ?? "").trim()
          ? String(form.get("answerKey"))
              .split(",")
              .map((s) => s.trim())
          : [],
        competencies: String(form.get("competencies") ?? "").trim()
          ? String(form.get("competencies"))
              .split(",")
              .map((s) => s.trim())
          : [],
      }),
    );
    if (data) {
      setResult(data);
      history.reload();
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="GRADES & ANALYSIS"
        title="See the learning behind the scores."
        description="Understand class performance, spot learning gaps, and find a thoughtful next step for every learner."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[400px_1fr]">
        <form onSubmit={submit} className="panel space-y-5 p-6">
          <Field label="Assessment or class title">
            <Input
              name="title"
              minLength={2}
              maxLength={200}
              required
              placeholder="Grade 8 Science — Quiz 1"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Maximum score">
              <Input
                name="maxScore"
                type="number"
                min={1}
                max={10000}
                required
                defaultValue={20}
              />
            </Field>
            <Field label="Mastery threshold (%)">
              <Input
                name="threshold"
                type="number"
                min={0}
                max={100}
                required
                defaultValue={75}
              />
            </Field>
          </div>
          <Field
            label="Learner scores"
            hint="One row per learner: learner code, score. Use unique codes and avoid unnecessary personal information."
          >
            <Textarea
              className="min-h-48 font-mono text-xs"
              value={scores}
              onChange={(e) => setScores(e.target.value)}
              required
              placeholder={"Learner 01, 16\nLearner 02, 12\nLearner 03, 18"}
            />
          </Field>
          <Field
            label="Import simple CSV"
            hint="Columns: learner, score, followed by optional item responses."
          >
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file)
                  void action.run(async () => {
                    if (file.size > 1024 * 1024)
                      throw new Error("Choose a CSV smaller than 1 MB.");
                    setScores(await file.text());
                  });
              }}
            />
          </Field>
          <details className="rounded-xl bg-muted p-4">
            <summary className="cursor-pointer text-xs font-semibold">
              Include item analysis
            </summary>
            <div className="mt-4 space-y-4">
              <Field
                label="Answer key"
                hint="Comma-separated answers. Add one response per item after each learner’s score. Maximum score must equal the item count; GABAY derives scores from responses."
              >
                <Input name="answerKey" placeholder="A, C, B, D" />
              </Field>
              <Field label="Competencies per item (optional)">
                <Input
                  name="competencies"
                  placeholder="Faults, Faults, Waves, Waves"
                />
              </Field>
            </div>
          </details>
          <Feedback error={action.error} />
          <Button className="w-full" disabled={action.busy}>
            <ChartNoAxesCombined />
            {action.busy ? "Analyzing…" : "Analyze & save results"}
          </Button>
        </form>
        <section>
          {result ? (
            <>
              <div className="mb-5 grid grid-cols-2 gap-3">
                {[
                  ["Mean score", result.statistics.mean.toFixed(2)],
                  [
                    "Mean percentage",
                    `${result.statistics.meanPercentageScore.toFixed(1)}%`,
                  ],
                  [
                    "Mastery rate",
                    `${result.statistics.masteryRate.toFixed(1)}%`,
                  ],
                  ["Learners", result.statistics.count],
                ].map(([name, value]) => (
                  <div className="panel p-5" key={name}>
                    <p className="text-xs text-muted-foreground">{name}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="panel mb-5 p-6">
                <h2 className="mb-5 font-semibold">
                  Where support can make a difference
                </h2>
                {Object.entries(result.groups).map(([name, count]) => (
                  <div key={name} className="mb-4">
                    <div className="mb-2 flex justify-between text-xs">
                      <span>{name}</span>
                      <strong>{count} learners</strong>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${(count / result.statistics.count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="mt-3">
                  <Link
                    href={`/intervention?topic=Targeted%20learning%20support&context=${encodeURIComponent(JSON.stringify({ statistics: result.statistics, groups: result.groups, competencies: result.competencyPerformance }))}`}
                  >
                    Create an intervention plan
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="panel table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Learner code</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Suggested support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.learners.map((l) => (
                      <tr key={l.name}>
                        <td>{l.name}</td>
                        <td>{l.score}</td>
                        <td>{l.percentage.toFixed(1)}%</td>
                        <td>
                          <Badge
                            tone={l.group === "Remediation" ? "amber" : "teal"}
                          >
                            {l.group}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.items.length > 0 && (
                <div className="panel table-scroll mt-5">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Difficulty index</th>
                        <th>Discrimination</th>
                        <th>Responses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.items.map((i) => (
                        <tr key={i.number}>
                          <td>{i.number}</td>
                          <td>{i.difficultyIndex.toFixed(2)}</td>
                          <td>
                            {i.discriminationIndex === null
                              ? "Needs ≥4 learners"
                              : i.discriminationIndex.toFixed(2)}
                          </td>
                          <td>
                            {Object.entries(i.distractors)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-5 text-xs leading-6 text-muted-foreground">
                {result.method}
              </p>
            </>
          ) : (
            <div className="panel p-8">
              <div className="tool-icon mint mb-6">
                <ChartNoAxesCombined />
              </div>
              <h2 className="text-xl font-semibold">
                A clearer picture. A better next step.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Add your class scores to see descriptive statistics, mastery,
                and learner groupings. Add item responses for difficulty,
                discrimination, and distractor analysis.
              </p>
              <p className="mt-5 rounded-xl bg-secondary p-4 text-xs leading-6 text-primary">
                All calculations use validated score data. These percentages are
                not official transmuted DepEd grades.
              </p>
            </div>
          )}
          {history.data && history.data.length > 0 && (
            <div className="panel mt-5 p-6">
              <h2 className="mb-4 text-sm font-semibold">Previous analyses</h2>
              <div className="space-y-2">
                {history.data.map((h) => (
                  <button
                    key={h.id}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-secondary"
                    onClick={() => setResult({ ...h.result, id: h.id })}
                  >
                    {h.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
