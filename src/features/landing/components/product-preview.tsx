"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import styles from "./landing.module.css";

const views = [
  { id: "plan", label: "Plan a lesson", icon: BookOpen },
  { id: "assess", label: "Build an assessment", icon: ClipboardList },
  { id: "analyze", label: "Understand your class", icon: BarChart3 },
] as const;
type View = (typeof views)[number]["id"];

export function ProductPreview() {
  const [view, setView] = useState<View>("plan");
  return (
    <div className={styles.previewSection} id="preview">
      <div
        className={styles.previewTabs}
        role="group"
        aria-label="Explore the product preview"
      >
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className={styles.previewStage}>
        <div className={styles.floatingNote} aria-hidden="true">
          <span>
            <CheckCheck size={20} />
          </span>
          <div>
            <strong>A little less busywork.</strong>
            <small>A little more possibility.</small>
          </div>
        </div>
        <div className={styles.productWindow}>
          <div className={styles.windowBar}>
            <span className={styles.windowDots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              <span className={styles.statusDot} /> Your teaching workspace
            </span>
            <span className={styles.sampleLabel}>SAMPLE PREVIEW</span>
          </div>
          <div className={styles.productBody}>
            <aside className={styles.previewSidebar} aria-hidden="true">
              <div className={styles.previewBrand}>
                <BookOpen size={21} /> gabay <small>AI</small>
              </div>
              <small>YOUR WORKSPACE</small>
              <span>
                <LayoutDashboard size={15} /> Overview
              </span>
              <span className={view === "plan" ? styles.sideActive : ""}>
                <BookOpen size={15} /> ILAW lessons
              </span>
              <span className={view === "assess" ? styles.sideActive : ""}>
                <ClipboardList size={15} /> Assessments
              </span>
              <span className={view === "analyze" ? styles.sideActive : ""}>
                <BarChart3 size={15} /> Learner analysis
              </span>
              <span>
                <FolderOpen size={15} /> My library
              </span>
              <div className={styles.sidebarBottom}>
                <Sparkles size={20} />
                <strong>Your ideas, with a little help.</strong>
                <small>Let’s make room for great teaching.</small>
              </div>
            </aside>
            <div className={styles.previewMain}>
              <div className={styles.previewTopline}>
                <span>
                  My workspace <ChevronRight size={12} />{" "}
                  {view === "plan"
                    ? "ILAW lesson"
                    : view === "assess"
                      ? "Assessment"
                      : "Learner analysis"}
                </span>
                <span className={styles.teacherAvatar}>T</span>
              </div>
              <div
                className={styles.previewContent}
                key={view}
                aria-live="polite"
                aria-atomic="true"
              >
                <div className={styles.previewHeading}>
                  <div>
                    <p>LET’S MAKE LEARNING HAPPEN</p>
                    <h3>
                      {view === "plan"
                        ? "Your next lightbulb moment."
                        : view === "assess"
                          ? "A clearer picture of learning."
                          : "Every learner has a next step."}
                    </h3>
                  </div>
                  <span className={styles.previewAction}>
                    <Plus size={14} />{" "}
                    {view === "plan"
                      ? "New lesson"
                      : view === "assess"
                        ? "New assessment"
                        : "New analysis"}
                  </span>
                </div>
                <div className={styles.previewDocument}>
                  <div className={styles.documentTitle}>
                    <span className={styles.documentIcon}>
                      {view === "analyze" ? (
                        <BarChart3 size={23} />
                      ) : (
                        <FileText size={23} />
                      )}
                    </span>
                    <div>
                      <h4>
                        {view === "analyze"
                          ? "Science 8 · Class overview"
                          : "Exploring ecosystems"}
                      </h4>
                      <p>
                        Grade 8 <span>·</span> Science <span>·</span>{" "}
                        {view === "plan"
                          ? "60 minutes"
                          : view === "assess"
                            ? "Sample questions"
                            : "Illustrative data"}
                      </p>
                    </div>
                    <span className={styles.draftBadge}>
                      {view === "analyze" ? "Sample" : "Draft"}
                    </span>
                  </div>
                  {view === "plan" && (
                    <div className={styles.lessonRows}>
                      {[
                        [
                          "I",
                          "Intentions",
                          "Explain how living things depend on one another.",
                        ],
                        [
                          "L",
                          "Learning experiences",
                          "Build a food web. Trace the connections. Share discoveries.",
                        ],
                        [
                          "A",
                          "Assessment",
                          "Use an exit ticket to check each learner’s understanding.",
                        ],
                        [
                          "W",
                          "Ways forward",
                          "Revisit misconceptions and plan the next learning step.",
                        ],
                      ].map(([letter, title, text]) => (
                        <div key={letter}>
                          <span>{letter}</span>
                          <div>
                            <strong>{title}</strong>
                            <p>{text}</p>
                          </div>
                          <Check size={14} />
                        </div>
                      ))}
                    </div>
                  )}
                  {view === "assess" && (
                    <div className={styles.assessmentPreview}>
                      <span>
                        01 <span>MULTIPLE CHOICE</span>
                      </span>
                      <h5>Which organism is a producer in a food web?</h5>
                      <div className={styles.answerGrid}>
                        {[
                          "A. Grass",
                          "B. Grasshopper",
                          "C. Frog",
                          "D. Snake",
                        ].map((answer, i) => (
                          <span
                            key={answer}
                            className={i === 0 ? styles.correctAnswer : ""}
                          >
                            {answer}
                            {i === 0 && <Check size={14} />}
                          </span>
                        ))}
                      </div>
                      <p>
                        <CheckCheck size={14} /> Answer key and explanation
                        included for review.
                      </p>
                    </div>
                  )}
                  {view === "analyze" && (
                    <div className={styles.analysisPreview}>
                      <div className={styles.chartHeader}>
                        <span>Topic mastery</span>
                        <strong>Sample class</strong>
                      </div>
                      {[
                        ["Food chains", 86],
                        ["Ecosystems", 72],
                        ["Energy transfer", 58],
                      ].map(([label, value]) => (
                        <div className={styles.chartRow} key={label}>
                          <span>{label}</span>
                          <div>
                            <i style={{ width: `${value}%` }} />
                          </div>
                          <strong>{value}%</strong>
                        </div>
                      ))}
                      <p>
                        <Sparkles size={14} /> Next focus: revisit energy
                        transfer with a guided activity.
                      </p>
                    </div>
                  )}
                  <div className={styles.documentFooter}>
                    <span>
                      <CheckCheck size={14} />{" "}
                      {view === "analyze"
                        ? "Insights for your next lesson"
                        : "Made for you to review and refine"}
                    </span>
                    <span>
                      <ArrowDownToLine size={14} /> Export
                    </span>
                  </div>
                </div>
                <div className={styles.previewHint}>
                  <Sparkles size={15} />
                  <span>
                    Your teaching expertise. A little extra support from GABAY.
                  </span>
                  <ArrowUpRight size={15} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <span className={styles.previewSticker} aria-hidden="true">
          <Sparkles size={18} /> Teacher-led. GABAY-assisted.
        </span>
      </div>
      <p className={styles.previewCaption}>
        <Search size={13} aria-hidden="true" /> Explore a sample above. Your own
        workspace starts with a free account.
      </p>
    </div>
  );
}
