"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, BookOpen, Plus, Trash2 } from "lucide-react";
import type { CompetencyRecord, BowRecord } from "@gabay/types";
import { api } from "@/shared/lib/api-client";
import { useResource, useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  Input,
  Select,
  Textarea,
  Feedback,
} from "@/shared/components/ui/form";
import {
  PageHeader,
  EmptyState,
  Loading,
  Badge,
} from "@/shared/components/ui/page";
export function CurriculumPage({
  bow = false,
  admin = false,
}: {
  bow?: boolean;
  admin?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [term, setTerm] = useState("");
  const [week, setWeek] = useState("");
  const [subject, setSubject] = useState("");
  const [adding, setAdding] = useState(false);
  const action = useAction();
  const query = new URLSearchParams({
    ...(search ? { search } : {}),
    ...(grade ? { grade } : {}),
    ...(term ? { term } : {}),
    ...(week ? { week } : {}),
    ...(subject ? { learningArea: subject } : {}),
  }).toString();
  const records = useResource<CompetencyRecord[] | BowRecord[]>(
    `/${bow ? "budget-of-work" : "curriculum"}?${query}`,
  );
  const competencies = useResource<CompetencyRecord[]>(
    admin && bow ? "/curriculum" : null,
  );
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    await action.run(async () => {
      await api.post(
        bow ? "/budget-of-work" : "/curriculum",
        bow
          ? { ...data, days: Number(data.days), minutes: Number(data.minutes) }
          : {
              ...data,
              grade: Number(data.grade),
              term: Number(data.term),
              week: Number(data.week),
              official: data.official === "on",
            },
      );
      setAdding(false);
      records.reload();
    }, "Curriculum record saved.");
  }
  return (
    <>
      <PageHeader
        eyebrow={bow ? "BUDGET OF WORK" : "CURRICULUM"}
        title={
          bow ? "A clear path through the term." : "Begin with what matters."
        }
        description={
          bow
            ? "Connect competencies, teaching time, and your weekly lesson plans."
            : "Explore learning competencies and turn a clear intention into a meaningful lesson."
        }
      >
        {admin && (
          <Button onClick={() => setAdding(!adding)}>
            <Plus />
            {adding ? "Close form" : bow ? "Add BOW record" : "Add competency"}
          </Button>
        )}
      </PageHeader>
      <Feedback
        error={action.error || records.error?.message}
        success={action.success}
      />
      {adding && (
        <form
          onSubmit={save}
          className="panel my-6 grid gap-5 p-6 sm:grid-cols-2"
        >
          {bow ? (
            <>
              <Field label="Learning competency" className="sm:col-span-2">
                <Select name="competencyId" required>
                  {competencies.data?.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.description}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Teaching days">
                <Input
                  name="days"
                  type="number"
                  min={1}
                  max={30}
                  defaultValue={5}
                />
              </Field>
              <Field label="Total teaching minutes">
                <Input
                  name="minutes"
                  type="number"
                  min={1}
                  max={2400}
                  defaultValue={300}
                />
              </Field>
              <Field label="Remarks">
                <Input name="remarks" maxLength={2000} />
              </Field>
              <Field label="Version">
                <Input name="version" defaultValue="1.0" maxLength={30} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Grade">
                <Input
                  name="grade"
                  type="number"
                  min={0}
                  max={12}
                  defaultValue={8}
                />
              </Field>
              <Field label="Learning area">
                <Input
                  name="learningArea"
                  required
                  defaultValue="Science"
                  maxLength={100}
                />
              </Field>
              <Field label="Term">
                <Input
                  name="term"
                  type="number"
                  min={1}
                  max={4}
                  defaultValue={1}
                />
              </Field>
              <Field label="Week">
                <Input
                  name="week"
                  type="number"
                  min={1}
                  max={52}
                  defaultValue={1}
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  name="description"
                  minLength={10}
                  maxLength={4000}
                  required
                />
              </Field>
              <Field label="Verified competency code (optional)">
                <Input name="code" maxLength={100} />
              </Field>
              <Field label="Academic year">
                <Input
                  name="academicYear"
                  placeholder="2026–2027"
                  required
                  maxLength={20}
                />
              </Field>
              <Field label="Source" className="sm:col-span-2">
                <Input
                  name="source"
                  placeholder="Document title and reference"
                  maxLength={500}
                />
              </Field>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" name="official" />
                Official reference verified by administrator
              </label>
            </>
          )}
          <Button className="sm:col-span-2" disabled={action.busy}>
            Save record
          </Button>
        </form>
      )}
      <div className="panel mb-6 mt-5 flex flex-wrap gap-3 p-4">
        <div className="relative min-w-52 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-3.5 text-muted-foreground"
          />
          <Input
            className="pl-10"
            aria-label="Search competencies"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a topic or competency…"
          />
        </div>
        <Select
          aria-label="Filter grade"
          className="w-auto"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="">All grades</option>
          {Array.from({ length: 13 }, (_, i) => (
            <option value={i} key={i}>
              Grade {i}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Learning area filter"
          className="max-w-40"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Learning area"
        />
        <Select
          aria-label="Filter term"
          className="w-auto"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        >
          <option value="">All terms</option>
          {[1, 2, 3, 4].map((i) => (
            <option value={i} key={i}>
              Term {i}
            </option>
          ))}
        </Select>
        <Input
          aria-label="Filter week"
          type="number"
          className="max-w-28"
          min={1}
          max={52}
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          placeholder="Week"
        />
      </div>
      {records.loading ? (
        <Loading />
      ) : records.data?.length ? (
        <div className="space-y-4">
          {records.data.map((record) => {
            const c = "competency" in record ? record.competency : record;
            const link = new URLSearchParams({
              grade: String(c.grade),
              subject: c.learningArea,
              term: String(c.term),
              week: String(c.week),
              competency: c.description,
              topic: c.description.slice(0, 150),
            }).toString();
            return (
              <div key={record.id} className="panel p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="tool-icon mint">
                      <BookOpen size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-primary">
                        Grade {c.grade} · {c.learningArea}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Term {c.term} · Week {c.week}
                        {c.code ? ` · ${c.code}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge tone={c.official ? "teal" : "amber"}>
                    {c.official
                      ? "Official source"
                      : "Planning reference · Verify before use"}
                  </Badge>
                </div>
                <h2 className="my-5 max-w-4xl text-base font-medium leading-7">
                  {c.description}
                </h2>
                {"days" in record && (
                  <p className="mb-4 text-xs text-muted-foreground">
                    {record.days} days · {record.minutes} minutes · Version{" "}
                    {record.version}
                    {record.remarks ? ` · ${record.remarks}` : ""}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-[10px] text-muted-foreground">
                    Source: {c.source || "No official source provided"}
                  </p>
                  <div className="flex gap-2">
                    {admin && !bow && (
                      <Button
                        size="icon"
                        variant="destructive"
                        aria-label="Archive competency"
                        onClick={() => {
                          if (window.confirm("Archive this competency?"))
                            void action.run(async () => {
                              await api.delete(`/curriculum/${c.id}`);
                              records.reload();
                            });
                        }}
                      >
                        <Trash2 />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/assessments?${link}`}>
                        Create assessment
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/ilaw?${link}`}>
                        Create ILAW
                        <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="A clear starting point is on its way"
          description={
            admin
              ? "Add curriculum records and verified sources for your teachers."
              : "No competencies match these filters. Try another grade or ask your administrator to add curriculum records."
          }
        />
      )}
    </>
  );
}
