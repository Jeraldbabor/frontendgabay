"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import type { SessionUser } from "@gabay/types";
import { api } from "@/shared/lib/api-client";
import { useAction } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Field, Input, Select, Feedback } from "@/shared/components/ui/form";
import { useAuth } from "../hooks/auth-provider";
export function AuthForm({
  mode,
}: {
  mode:
    | "login"
    | "register"
    | "forgot-password"
    | "reset-password"
    | "verify-email";
}) {
  const action = useAction();
  const auth = useAuth();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const titles = {
    login: "Welcome back, teacher.",
    register: "A little support. A lot of possibility.",
    "forgot-password": "Let’s get you back in.",
    "reset-password": "Create a new password.",
    "verify-email": "Verify your email.",
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    await action.run(async () => {
      if (mode === "login" || mode === "register") {
        const body =
          mode === "register"
            ? {
                ...values,
                gradeLevels: [Number(values.grade)],
                learningAreas: String(values.learningArea)
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }
            : values;
        if ("grade" in body) {
          delete body.grade;
          delete body.learningArea;
        }
        const response = await api.post<{ user: SessionUser }>(
          `/auth/${mode}`,
          body,
        );
        auth.accept(response.user);
        router.replace(
          response.user.role === "ADMIN" ? "/admin" : "/dashboard",
        );
      } else {
        const token =
          new URLSearchParams(window.location.search).get("token") ?? "";
        await api.post(
          `/auth/${mode}`,
          mode === "forgot-password" ? values : { ...values, token },
        );
        setDone(true);
      }
    });
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[#103f42] p-14 text-white lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            <BookOpen size={23} />
          </span>
          gabay<span className="self-start pt-1 text-xs text-teal-200">AI</span>
        </Link>
        <div className="relative z-10 my-auto max-w-md py-16">
          <span className="mb-8 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs text-teal-100">
            <Sparkles className="mr-2 size-4" />A little guidance goes a long
            way
          </span>
          <h2 className="text-5xl font-medium leading-[1.18] tracking-tight">
            More time for
            <br />
            what matters.
            <br />
            <span className="text-[#b7e7c4]">Your learners.</span>
          </h2>
          <p className="mt-7 max-w-sm text-base leading-8 text-teal-50/70">
            Plan thoughtfully. Teach confidently. Bring your best ideas to the
            classroom, with GABAY by your side.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-teal-50/70">
          <ShieldCheck size={16} />
          Made for educators in the Philippines
        </p>
        <div className="absolute -bottom-44 -right-44 size-[550px] rounded-full border-[80px] border-white/[0.035]" />
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div
          className={`w-full ${mode === "register" ? "max-w-xl" : "max-w-sm"}`}
        >
          <Link
            href="/"
            className="mb-10 block text-xl font-bold text-primary lg:hidden"
          >
            gabay AI
          </Link>
          <p className="eyebrow mb-3">Your teaching companion</p>
          <h1 className="mb-3 text-3xl font-semibold leading-tight tracking-tight">
            {titles[mode]}
          </h1>
          <p className="mb-8 text-sm leading-6 text-muted-foreground">
            {mode === "login"
              ? "Sign in and pick up where your inspiration left off."
              : mode === "register"
                ? "Create your free account and make room for better teaching."
                : "We’ll help you securely access your teaching workspace."}
          </p>
          {done ? (
            <div className="space-y-5">
              <Feedback
                success={
                  mode === "forgot-password"
                    ? "If your account exists, an email with the next steps has been sent."
                    : mode === "verify-email"
                      ? "Your email has been verified."
                      : "Your password has been updated."
                }
              />
              <Button asChild>
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <Feedback error={action.error} />
              {mode === "register" && (
                <Field label="Full name">
                  <Input
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Your full name"
                  />
                </Field>
              )}
              {["login", "register", "forgot-password"].includes(mode) && (
                <Field label="Email address">
                  <Input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@school.edu.ph"
                    maxLength={254}
                  />
                </Field>
              )}
              {["login", "register", "reset-password"].includes(mode) && (
                <Field
                  label="Password"
                  hint={
                    mode !== "login" ? "Use at least 12 characters." : undefined
                  }
                >
                  <Input
                    name="password"
                    type="password"
                    required
                    minLength={mode === "login" ? 1 : 12}
                    maxLength={128}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    placeholder="Enter your password"
                  />
                </Field>
              )}
              {mode === "register" && (
                <>
                  <Field label="Confirm password">
                    <Input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="School">
                      <Input name="school" required maxLength={200} />
                    </Field>
                    <Field label="Position">
                      <Input
                        name="position"
                        defaultValue="Teacher"
                        maxLength={120}
                      />
                    </Field>
                    <Field label="Division">
                      <Input name="division" maxLength={120} />
                    </Field>
                    <Field label="Region">
                      <Input name="region" maxLength={120} />
                    </Field>
                    <Field label="Grade level">
                      <Select name="grade" defaultValue="8">
                        {Array.from({ length: 13 }, (_, i) => (
                          <option key={i} value={i}>
                            {i === 0 ? "Kindergarten" : `Grade ${i}`}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field
                      label="Learning areas"
                      hint="Separate subjects with commas."
                    >
                      <Input
                        name="learningArea"
                        defaultValue="Science"
                        maxLength={100}
                      />
                    </Field>
                  </div>
                </>
              )}
              {mode === "login" && (
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
              <Button className="w-full" disabled={action.busy}>
                {action.busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : mode === "register"
                      ? "Create free account"
                      : mode === "verify-email"
                        ? "Verify email"
                        : "Continue"}
                <ArrowRight />
              </Button>
            </form>
          )}
          <div className="mt-7 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New to GABAY?{" "}
                <Link href="/register" className="font-semibold text-primary">
                  Create an account
                </Link>
              </>
            ) : (
              <Link href="/login" className="font-semibold text-primary">
                Back to sign in
              </Link>
            )}
          </div>
          <p className="mt-10 text-center text-xs leading-6 text-muted-foreground">
            GABAY supports your professional judgment.
            <br />
            Teachers remain at the heart of every lesson.
          </p>
        </div>
      </main>
    </div>
  );
}
