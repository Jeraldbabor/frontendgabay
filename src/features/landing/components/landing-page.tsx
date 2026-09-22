import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Heart,
  Layers3,
  Lightbulb,
  MousePointer2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { plans, questions } from "../data/content";
import { LandingMotion } from "./landing-motion";
import { LandingNav } from "./landing-nav";
import { ProductPreview } from "./product-preview";
import styles from "./landing.module.css";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <LandingNav />
      <LandingMotion>
        <main id="main-content" tabIndex={-1}>
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={`${styles.container} ${styles.heroInner}`}>
              <div className={styles.heroCopy}>
                <span className={styles.heroBadge}>
                  <span /> A little guidance goes a long way{" "}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
                <h1 id="hero-title">
                  Less paperwork.
                  <br />
                  <span>
                    More lightbulb moments.
                    <svg
                      viewBox="0 0 600 16"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d="M3 11 Q290 -1 596 9 M85 15 Q320 7 529 13" />
                    </svg>
                  </span>
                </h1>
                <p>
                  Your ideas belong in the classroom. Let GABAY help with the
                  planning,
                  <br className={styles.desktopBreak} /> assessments, and
                  everything that gets you there.
                </p>
                <div className={styles.heroActions}>
                  <Link href="/register" className={styles.button}>
                    Start teaching with GABAY{" "}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                  <a href="#preview" className={styles.secondaryButton}>
                    <span className={styles.playIcon}>
                      <MousePointer2 size={14} aria-hidden="true" />
                    </span>{" "}
                    Take a look inside
                  </a>
                </div>
                <p className={styles.heroFinePrint}>
                  <Check size={14} aria-hidden="true" /> Free to get started{" "}
                  <span /> No payment details needed
                </p>
              </div>
              <span className={styles.heroSpark} aria-hidden="true">
                ✳
              </span>
              <span className={styles.heroDoodle} aria-hidden="true">
                <Lightbulb size={32} strokeWidth={1.4} />
                <span>
                  for your next
                  <br />
                  bright idea
                </span>
              </span>
              <ProductPreview />
            </div>
          </section>

          <div
            className={`${styles.container} ${styles.purposeStrip}`}
            data-reveal
          >
            <p>
              Thoughtfully built for
              <br />
              <strong>Philippine educators.</strong>
            </p>
            <span>
              <BookOpen size={21} aria-hidden="true" /> Lesson planning
            </span>
            <span>
              <ClipboardCheck size={21} aria-hidden="true" /> Meaningful
              assessments
            </span>
            <span>
              <BarChart3 size={21} aria-hidden="true" /> Learner insights
            </span>
            <span>
              <Heart size={21} aria-hidden="true" /> Teacher-led, always
            </span>
          </div>

          <section
            id="features"
            className={`${styles.container} ${styles.section}`}
            aria-labelledby="features-title"
          >
            <div className={styles.sectionHeading} data-reveal>
              <span className={styles.eyebrow}>
                A LITTLE HELP. A BIG DIFFERENCE.
              </span>
              <h2 id="features-title">
                Your teaching day,
                <br />
                <span>a little lighter.</span>
              </h2>
              <p>
                From your first idea to your next lesson,
                <br />
                keep the work that matters in one thoughtful space.
              </p>
            </div>
            <div className={styles.featureGrid}>
              <article
                className={`${styles.featureCard} ${styles.planningCard}`}
                data-reveal
              >
                <span className={styles.featureIcon}>
                  <Sparkles size={23} aria-hidden="true" />
                </span>
                <h3>
                  A starting point for
                  <br />
                  your brightest ideas.
                </h3>
                <p>
                  Turn your teaching goals and selected references into ILAW
                  lesson drafts. Review, refine, and make them your own.
                </p>
                <div className={styles.ideaCard} aria-hidden="true">
                  <div>
                    <span>
                      <BookOpen size={15} /> ILAW LESSON
                    </span>
                    <span>Grade 8</span>
                  </div>
                  <strong>Let’s explore ecosystems.</strong>
                  <p>Learning starts with a little curiosity.</p>
                  <div className={styles.miniChecklist}>
                    <span>
                      <Check size={12} /> Set the intention
                    </span>
                    <span>
                      <Check size={12} /> Spark a conversation
                    </span>
                    <span>
                      <Check size={12} /> Make learning visible
                    </span>
                  </div>
                  <span className={styles.ideaTag}>
                    <Sparkles size={12} /> Your next lesson starts here
                  </span>
                </div>
              </article>
              <article
                className={`${styles.featureCard} ${styles.assessCard}`}
                data-reveal
              >
                <span className={styles.featureIcon}>
                  <ClipboardCheck size={23} aria-hidden="true" />
                </span>
                <h3>Make every question count.</h3>
                <p>
                  Build assessments, organize a table of specifications, and
                  connect questions to your learning goals.
                </p>
                <div className={styles.questionCard} aria-hidden="true">
                  <span>MORE THAN A TEST</span>
                  <div>
                    <span>01</span>
                    <strong>What have we discovered?</strong>
                    <Check size={16} />
                  </div>
                  <i />
                  <i />
                  <div className={styles.questionTags}>
                    <span>Assessments</span>
                    <span>TOS & exams</span>
                  </div>
                </div>
              </article>
              <article
                className={`${styles.featureCard} ${styles.insightCard}`}
                data-reveal
              >
                <div>
                  <span className={styles.featureIcon}>
                    <BarChart3 size={23} aria-hidden="true" />
                  </span>
                  <h3>
                    See the learner
                    <br />
                    behind the score.
                  </h3>
                  <p>
                    Spot patterns, understand topic mastery, and find a
                    thoughtful next step for your class.
                  </p>
                </div>
                <div className={styles.miniChart} aria-hidden="true">
                  <span>A CLEARER PICTURE</span>
                  <div>
                    {[42, 63, 51, 78, 66, 90, 83].map((height, i) => (
                      <i key={i} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <small>Small insights. Meaningful next steps.</small>
                </div>
              </article>
              <article
                className={`${styles.featureCard} ${styles.libraryCard}`}
                data-reveal
              >
                <span className={styles.featureIcon}>
                  <FolderOpen size={23} aria-hidden="true" />
                </span>
                <h3>
                  Your work.
                  <br />
                  All together.
                </h3>
                <p>
                  Keep references, templates, and teaching documents ready for
                  the next good idea.
                </p>
                <div className={styles.fileChips} aria-hidden="true">
                  <span>
                    <FileText size={16} /> Lesson notes.pdf
                  </span>
                  <span>
                    <Layers3 size={16} /> My teaching library{" "}
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </article>
            </div>
          </section>

          <section
            id="how-it-works"
            className={styles.workflowSection}
            aria-labelledby="workflow-title"
          >
            <div className={styles.container}>
              <div className={styles.workflowIntro} data-reveal>
                <div>
                  <span className={styles.eyebrow}>
                    YOUR EXPERTISE. A LITTLE EXTRA SUPPORT.
                  </span>
                  <h2 id="workflow-title">
                    From “where do I start?”
                    <br />
                    to “ready for class.”
                  </h2>
                </div>
                <p>
                  You bring the knowledge of your learners.
                  <br />
                  GABAY helps you put your ideas to work.
                </p>
              </div>
              <div className={styles.steps}>
                {[
                  {
                    number: "01",
                    icon: BookOpen,
                    title: "Bring your teaching goals",
                    text: "Choose your grade, subject, and topic. Add the references that matter to your lesson.",
                  },
                  {
                    number: "02",
                    icon: Sparkles,
                    title: "Create with a little guidance",
                    text: "Draft lessons and assessments, organize your materials, or explore your class results.",
                  },
                  {
                    number: "03",
                    icon: ShieldCheck,
                    title: "Make it yours. Bring it to class.",
                    text: "Review the details, add your own approach, and save work you can keep building on.",
                  },
                ].map(({ number, icon: Icon, title, text }) => (
                  <article key={number} data-reveal>
                    <div>
                      <span>{number}</span>
                      <Icon size={23} aria-hidden="true" />
                    </div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="pricing"
            className={`${styles.container} ${styles.section} ${styles.pricingSection}`}
            aria-labelledby="pricing-title"
          >
            <div className={styles.sectionHeading} data-reveal>
              <span className={styles.eyebrow}>
                SMALL PRICE. MORE POSSIBILITIES.
              </span>
              <h2 id="pricing-title">
                Good teaching support.
                <br />
                <span>Room in your budget.</span>
              </h2>
              <p>
                Start free. Choose a little more support when you need it.
                <br />
                Simple plans, with no automatic renewal.
              </p>
            </div>
            <div className={styles.pricingGrid}>
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`${styles.priceCard} ${plan.featured ? styles.plusCard : ""}`}
                  data-reveal
                >
                  {plan.featured && (
                    <span className={styles.plusRibbon}>
                      <Sparkles size={13} aria-hidden="true" /> A LITTLE MORE
                      GABAY
                    </span>
                  )}
                  <div className={styles.planHeading}>
                    <span className={styles.featureIcon}>
                      {plan.featured ? (
                        <Sparkles size={22} aria-hidden="true" />
                      ) : (
                        <BookOpen size={22} aria-hidden="true" />
                      )}
                    </span>
                    <h3>{plan.name}</h3>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                  <p className={styles.price}>
                    <span>₱</span>
                    {plan.price}
                    <small>{plan.period}</small>
                  </p>
                  <Link
                    href="/register"
                    className={
                      plan.featured ? styles.button : styles.secondaryButton
                    }
                  >
                    {plan.cta}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                  <span className={styles.planListLabel}>
                    YOUR TEACHING TOOLKIT
                  </span>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={16} aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className={styles.planFootnote}>
                    {plan.featured
                      ? "Choose a wallet and duration. Access starts after approval."
                      : "No payment details needed. Upgrade when you’re ready."}
                  </p>
                </article>
              ))}
            </div>
            <p className={styles.pricingNote}>
              Starting plan offers. Confirm current prices and limits in your
              account before upgrading.
              <br />
              AI tools are available when enabled for your workspace.
            </p>
          </section>

          <section
            id="faq"
            className={`${styles.container} ${styles.faqSection}`}
            aria-labelledby="faq-title"
          >
            <div data-reveal>
              <span className={styles.eyebrow}>A LITTLE CLARITY</span>
              <h2 id="faq-title">
                Good questions.
                <br />
                <span>Clear answers.</span>
              </h2>
              <p>
                A few things you might be wondering
                <br />
                before you make yourself at home.
              </p>
              <span className={styles.faqArt} aria-hidden="true">
                <BookOpen size={46} strokeWidth={1.2} />
                <Sparkles size={26} />
              </span>
            </div>
            <div className={styles.faqList} data-reveal>
              {questions.map(({ question, answer }) => (
                <details key={question}>
                  <summary>
                    {question}
                    <ChevronDown size={18} aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section
            className={`${styles.container} ${styles.ctaSection}`}
            aria-labelledby="cta-title"
            data-reveal
          >
            <span className={styles.ctaSpark} aria-hidden="true">
              ✳
            </span>
            <span className={styles.eyebrow}>FOR THE WORK ONLY YOU CAN DO</span>
            <h2 id="cta-title">
              Your next great lesson
              <br />
              starts with a little <span>gabay.</span>
            </h2>
            <p>More room for your ideas. More time for your learners.</p>
            <Link href="/register" className={styles.button}>
              Find your little extra support{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <small>Start free. Make it your own.</small>
          </section>
        </main>
        <footer className={`${styles.container} ${styles.footer}`}>
          <div>
            <Link
              href="/#main-content"
              className={styles.brand}
              aria-label="GABAY AI home"
            >
              <span className={styles.brandIcon}>
                <BookOpen size={21} aria-hidden="true" />
              </span>
              gabay<span className={styles.brandAi}>AI</span>
            </Link>
            <p>A little guidance goes a long way.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQs</a>
            <Link href="/login">Log in</Link>
          </nav>
          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} GABAY AI</span>
            <span>
              Made with care for Philippine educators{" "}
              <Heart size={12} aria-hidden="true" />
            </span>
          </div>
        </footer>
      </LandingMotion>
    </div>
  );
}
