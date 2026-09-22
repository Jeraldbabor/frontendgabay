"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { BowRecord, CompetencyRecord } from "@gabay/types";
import { api } from "@/shared/lib/api-client";
import { useAction, useResource } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import {
  Feedback,
  Field,
  Input,
  Select,
  Textarea,
} from "@/shared/components/ui/form";
import { EmptyState, Skeleton } from "@/shared/components/ui/page";
import styles from "./curriculum.module.css";

function gradeLabel(grade: number | string) {
  return Number(grade) === 0 ? "Kindergarten" : `Grade ${grade}`;
}

function CurriculumSkeleton() {
  return (
    <div className={styles.cardList} aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div className={styles.skeletonCard} key={item}>
          <div className={styles.skeletonTop}>
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-7 w-28" />
          </div>
          <Skeleton className="mt-6 h-5 w-4/5" />
          <Skeleton className="mt-3 h-5 w-2/3" />
          <div className={styles.skeletonFooter}>
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CurriculumPage({
  bow = false,
  admin = false,
}: {
  bow?: boolean;
  admin?: boolean;
}) {
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [term, setTerm] = useState("");
  const [week, setWeek] = useState("");
  const [subject, setSubject] = useState("");
  const [adding, setAdding] = useState(false);
  const action = useAction();

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchDraft.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const query = useMemo(
    () =>
      new URLSearchParams({
        ...(search ? { search } : {}),
        ...(grade ? { grade } : {}),
        ...(term ? { term } : {}),
        ...(week ? { week } : {}),
        ...(subject.trim() ? { learningArea: subject.trim() } : {}),
      }).toString(),
    [grade, search, subject, term, week],
  );

  const records = useResource<CompetencyRecord[] | BowRecord[]>(
    `/${bow ? "budget-of-work" : "curriculum"}?${query}`,
  );
  const competencies = useResource<CompetencyRecord[]>(
    admin && bow ? "/curriculum" : null,
  );
  const filterCount = [search, grade, subject.trim(), term, week].filter(
    Boolean,
  ).length;
  const searchPending = searchDraft.trim() !== search;
  const resultCount = records.data?.length ?? 0;
  const resultNoun = bow ? "BOW record" : "competency";

  function clearFilters() {
    setSearchDraft("");
    setSearch("");
    setGrade("");
    setSubject("");
    setTerm("");
    setWeek("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
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
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="curriculum-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            <Sparkles size={13} />
            {bow ? "Budget of work" : "Curriculum library"}
          </p>
          <h1 id="curriculum-heading" className={styles.heroTitle}>
            {bow ? "Map the term with clarity." : "Find the right place to begin."}
          </h1>
          <p className={styles.heroDescription}>
            {bow
              ? "Connect competencies, teaching time, and weekly lesson planning in one focused view."
              : "Explore learning competencies, check their source, and carry the right context into your next lesson or assessment."}
          </p>
          {admin && (
            <Button className={styles.addButton} onClick={() => setAdding(!adding)}>
              {adding ? <X /> : <Plus />}
              {adding ? "Close form" : bow ? "Add BOW record" : "Add competency"}
            </Button>
          )}
        </div>
        <div className={styles.heroAside}>
          <div className={styles.resultStat}>
            <span className={styles.statIcon}>
              <BookOpen size={20} />
            </span>
            <span>
              <strong>{records.loading ? "—" : resultCount}</strong>
              <small>
                {resultNoun}
                {resultCount === 1 ? "" : "s"} in view
              </small>
            </span>
          </div>
          {!admin && (
            <Link
              className={styles.companionLink}
              href={bow ? "/curriculum" : "/budget-of-work"}
            >
              <span className={styles.companionIcon}>
                <CalendarDays size={19} />
              </span>
              <span>
                <small>{bow ? "Return to" : "Continue planning"}</small>
                <strong>{bow ? "Curriculum" : "Budget of Work"}</strong>
              </span>
              <ArrowRight size={17} />
            </Link>
          )}
        </div>
      </section>

      <Feedback
        error={action.error || records.error?.message}
        success={action.success}
      />

      {adding && (
        <form onSubmit={save} className={styles.addForm}>
          <div className={styles.formHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Administrator entry</p>
              <h2>{bow ? "Add a budget-of-work record" : "Add a competency"}</h2>
            </div>
            <p>Required fields are checked before the record is saved.</p>
          </div>
          <div className={styles.formGrid}>
            {bow ? (
              <>
                <Field label="Learning competency" className="sm:col-span-2">
                  <Select name="competencyId" required>
                    {competencies.data?.map((competency) => (
                      <option value={competency.id} key={competency.id}>
                        {competency.description}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Teaching days">
                  <Input name="days" type="number" min={1} max={30} defaultValue={5} />
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
                  <Input name="grade" type="number" min={0} max={12} defaultValue={8} />
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
                  <Input name="term" type="number" min={1} max={4} defaultValue={1} />
                </Field>
                <Field label="Week">
                  <Input name="week" type="number" min={1} max={52} defaultValue={1} />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <Textarea name="description" minLength={10} maxLength={4000} required />
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
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="official" />
                  Official reference verified by administrator
                </label>
              </>
            )}
            <Button className="sm:col-span-2" disabled={action.busy}>
              {action.busy ? <LoaderCircle className="animate-spin" /> : <Plus />}
              Save record
            </Button>
          </div>
        </form>
      )}

      <section className={styles.filters} aria-labelledby="filter-heading">
        <div className={styles.filterHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Discover and refine</p>
            <h2 id="filter-heading">Find a learning competency</h2>
          </div>
          {filterCount > 0 && (
            <button type="button" className={styles.resetButton} onClick={clearFilters}>
              <RotateCcw size={14} />
              Reset {filterCount} filter{filterCount === 1 ? "" : "s"}
            </button>
          )}
        </div>

        <div className={styles.filterGrid}>
          <label className={styles.searchField}>
            <span>Search</span>
            <span className={styles.inputWrap}>
              <Search size={17} />
              <Input
                className={styles.searchInput}
                aria-label="Search competencies"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search a topic, code, or competency"
              />
              {searchPending && <LoaderCircle className={styles.searchSpinner} size={16} />}
            </span>
          </label>

          <label className={styles.filterField}>
            <span>Grade level</span>
            <Select
              aria-label="Filter grade"
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            >
              <option value="">All grades</option>
              {Array.from({ length: 13 }, (_, value) => (
                <option value={value} key={value}>
                  {gradeLabel(value)}
                </option>
              ))}
            </Select>
          </label>

          <label className={styles.filterField}>
            <span>Learning area</span>
            <Input
              aria-label="Learning area filter"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Science"
            />
          </label>

          <label className={styles.filterField}>
            <span>Term</span>
            <Select
              aria-label="Filter term"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            >
              <option value="">All terms</option>
              {[1, 2, 3, 4].map((value) => (
                <option value={value} key={value}>
                  Term {value}
                </option>
              ))}
            </Select>
          </label>

          <label className={styles.filterField}>
            <span>Week</span>
            <Input
              aria-label="Filter week"
              type="number"
              min={1}
              max={52}
              value={week}
              onChange={(event) => setWeek(event.target.value)}
              placeholder="Any week"
            />
          </label>
        </div>

        {filterCount > 0 && (
          <div className={styles.activeFilters} aria-label="Active filters">
            <span className={styles.activeFilterLabel}>
              <Filter size={13} /> Active
            </span>
            {search && (
              <button type="button" onClick={() => setSearchDraft("")}>
                “{search}” <X size={12} />
              </button>
            )}
            {grade && (
              <button type="button" onClick={() => setGrade("")}>
                {gradeLabel(grade)} <X size={12} />
              </button>
            )}
            {subject.trim() && (
              <button type="button" onClick={() => setSubject("")}>
                {subject.trim()} <X size={12} />
              </button>
            )}
            {term && (
              <button type="button" onClick={() => setTerm("")}>
                Term {term} <X size={12} />
              </button>
            )}
            {week && (
              <button type="button" onClick={() => setWeek("")}>
                Week {week} <X size={12} />
              </button>
            )}
          </div>
        )}
      </section>

      <section
        className={styles.results}
        aria-labelledby="results-heading"
        aria-busy={records.loading}
      >
        <div className={styles.resultsHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Planning references</p>
            <h2 id="results-heading">
              {records.loading
                ? "Finding the best matches…"
                : `${resultCount} ${resultNoun}${resultCount === 1 ? "" : "s"} found`}
            </h2>
          </div>
          <p aria-live="polite">
            {filterCount > 0
              ? "Results reflect your active filters."
              : "Browse everything currently available to your workspace."}
          </p>
        </div>

        {records.loading ? (
          <CurriculumSkeleton />
        ) : records.data?.length ? (
          <div className={styles.cardList}>
            {records.data.map((record) => {
              const competency =
                "competency" in record ? record.competency : record;
              const link = new URLSearchParams({
                grade: String(competency.grade),
                subject: competency.learningArea,
                term: String(competency.term),
                week: String(competency.week),
                competency: competency.description,
                topic: competency.description.slice(0, 150),
              }).toString();

              return (
                <article key={record.id} className={styles.recordCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.recordIdentity}>
                      <span className={styles.recordIcon}>
                        <BookOpen size={20} />
                      </span>
                      <div>
                        <div className={styles.identityLine}>
                          <span>{gradeLabel(competency.grade)}</span>
                          <i aria-hidden="true" />
                          <span>{competency.learningArea}</span>
                        </div>
                        <p>
                          Term {competency.term} · Week {competency.week}
                          {competency.code ? ` · ${competency.code}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        competency.official
                          ? styles.officialBadge
                          : styles.referenceBadge
                      }
                    >
                      {competency.official ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {competency.official ? "Official source" : "Planning reference"}
                    </span>
                  </div>

                  <h3 className={styles.recordTitle}>{competency.description}</h3>

                  <div className={styles.recordFacts}>
                    <span>
                      <GraduationCap size={15} />
                      {gradeLabel(competency.grade)} · {competency.learningArea}
                    </span>
                    <span>
                      <CalendarDays size={15} />
                      Term {competency.term}, week {competency.week}
                    </span>
                    {"days" in record && (
                      <span>
                        <Clock3 size={15} />
                        {record.days} days · {record.minutes} minutes
                      </span>
                    )}
                  </div>

                  {"days" in record && (record.version || record.remarks) && (
                    <p className={styles.bowNote}>
                      Version {record.version}
                      {record.remarks ? ` · ${record.remarks}` : ""}
                    </p>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.sourceBlock}>
                      <span>Source</span>
                      <p>
                        {competency.source ||
                          "No source is listed. Verify this reference before classroom use."}
                      </p>
                    </div>
                    <div className={styles.cardActions}>
                      {admin && !bow && (
                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label="Archive competency"
                          onClick={() => {
                            if (window.confirm("Archive this competency?"))
                              void action.run(async () => {
                                await api.delete(`/curriculum/${competency.id}`);
                                records.reload();
                              });
                          }}
                        >
                          <Trash2 />
                        </Button>
                      )}
                      <Button
                        className={styles.actionButton}
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link href={`/assessments?${link}`}>Create assessment</Link>
                      </Button>
                      <Button className={styles.actionButton} size="sm" asChild>
                        <Link href={`/ilaw?${link}`}>
                          Create ILAW
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No competencies match this view"
            description={
              admin
                ? "Add curriculum records and verified sources for your teachers."
                : filterCount > 0
                  ? "Try clearing a filter or broadening your search."
                  : "Ask your administrator to add curriculum records for your grade and learning area."
            }
          >
            {filterCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                <RotateCcw /> Clear all filters
              </Button>
            )}
          </EmptyState>
        )}
      </section>
    </div>
  );
}
