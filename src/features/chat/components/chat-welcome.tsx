import {
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import styles from "./chat.module.css";

const starters = [
  {
    icon: BookOpen,
    title: "Plan a lesson",
    description: "Turn a topic into a classroom moment.",
    prompt: "Help me plan an interactive Grade 8 Science lesson.",
    tone: "sage",
  },
  {
    icon: ClipboardCheck,
    title: "Build an assessment",
    description: "Find out what your learners know.",
    prompt:
      "Help me create a formative assessment for my class. Ask me about the grade level, subject, and learning objective first.",
    tone: "sand",
  },
  {
    icon: Lightbulb,
    title: "Make it click",
    description: "Explain a tricky idea in a simple way.",
    prompt:
      "Help me explain a tricky concept in simple language, with an example my learners can relate to. Ask me which concept and grade level.",
    tone: "lilac",
  },
  {
    icon: Sparkles,
    title: "Reach every learner",
    description: "Explore activities for different needs.",
    prompt:
      "Suggest differentiated activities for mixed-ability learners. Ask me about my class and the topic first.",
    tone: "blue",
  },
];

export function ChatWelcome({
  name,
  onPrompt,
}: {
  name?: string;
  onPrompt: (prompt: string) => void;
}) {
  return (
    <div className={styles.welcome}>
      <div className={styles.welcomeInner}>
        <div className={styles.emblem} aria-hidden="true">
          <Sparkles size={30} strokeWidth={1.5} />
          <span />
          <i />
        </div>
        <p className={styles.eyebrow}>
          A LITTLE GUIDANCE. A WORLD OF POSSIBILITIES.
        </p>
        <h2>
          Good ideas start <br />
          with a <span>conversation.</span>
        </h2>
        <p className={styles.intro}>
          {name ? `Hi, ${name}. ` : ""}A lesson to plan, a concept to untangle,
          or a fresh perspective.
          <br className="hidden sm:block" /> Let’s make room for your next
          teaching idea.
        </p>
        <div className={styles.starters}>
          {starters.map(({ icon: Icon, ...item }) => (
            <button
              key={item.title}
              className={styles.starter}
              onClick={() => onPrompt(item.prompt)}
            >
              <span className={`${styles.starterIcon} ${styles[item.tone]}`}>
                <Icon size={19} strokeWidth={1.7} />
              </span>
              <span className={styles.starterText}>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <ArrowUpRight size={16} className={styles.starterArrow} />
            </button>
          ))}
        </div>
        <p className={styles.starterHint}>
          Choose an idea above, or start with your own below.
        </p>
      </div>
    </div>
  );
}
