"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, Menu, X } from "lucide-react";
import styles from "./landing.module.css";

const links = [
  ["Features", "#features"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
  ["FAQs", "#faq"],
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return (
    <header className={styles.header}>
      <nav
        className={`${styles.container} ${styles.nav}`}
        aria-label="Main navigation"
      >
        <Link
          href="/#main-content"
          className={styles.brand}
          aria-label="GABAY AI home"
          onClick={() => setOpen(false)}
        >
          <span className={styles.brandIcon}>
            <BookOpen size={22} aria-hidden="true" />
          </span>
          gabay<span className={styles.brandAi}>AI</span>
        </Link>
        <div className={styles.desktopLinks}>
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginLink}>
            Log in
          </Link>
          <Link
            href="/register"
            className={`${styles.button} ${styles.navSignup}`}
          >
            Sign up <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            ref={trigger}
            type="button"
            className={styles.menuButton}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <div
          id="mobile-navigation"
          className={styles.mobileLinks}
          hidden={!open}
        >
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
