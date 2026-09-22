"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  FileText,
  ClipboardCheck,
  Table2,
  Layers,
  Presentation,
  Plus,
  BookOpen,
  MessageSquare,
  CalendarDays,
  Zap,
} from "lucide-react";
import type { SubscriptionSummary } from "@gabay/types";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { useResource } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Badge, Loading, EmptyState } from "@/shared/components/ui/page";
import { Feedback } from "@/shared/components/ui/form";
import { dateLabel, label } from "@/shared/lib/utils";
type Dashboard = {
  documentCount: number;
  recentDocuments: {
    id: string;
    title: string;
    kind: string;
    updatedAt: string;
  }[];
  notifications: { id: string; title: string; body: string }[];
};
const tools = [
  {
    name: "ILAW lesson plan",
    detail: "Turn a competency into a classroom moment.",
    href: "/ilaw",
    icon: Sparkles,
    tone: "mint",
  },
  {
    name: "Assessment",
    detail: "Ask the right questions. See the learning.",
    href: "/assessments",
    icon: ClipboardCheck,
    tone: "peach",
  },
  {
    name: "Table of Specifications",
    detail: "A balanced blueprint for every exam.",
    href: "/tos",
    icon: Table2,
    tone: "lavender",
  },
  {
    name: "Worksheet & activity",
    detail: "Make learning something they can do.",
    href: "/materials?kind=WORKSHEET",
    icon: Layers,
    tone: "blue",
  },
  {
    name: "Presentation",
    detail: "Bring your next big idea to life.",
    href: "/materials?kind=PRESENTATION",
    icon: Presentation,
    tone: "yellow",
  },
  {
    name: "Explore curriculum",
    detail: "Find the competency. Start with purpose.",
    href: "/curriculum",
    icon: BookOpen,
    tone: "mint",
  },
];
export function DashboardPage() {
  const { user } = useAuth();
  const dashboard = useResource<Dashboard>("/dashboard");
  const subscription = useResource<SubscriptionSummary>("/subscriptions/me");
  if (dashboard.loading) return <Loading />;
  return (
    <>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-2">A fresh space for your ideas</p>
          <h1 className="text-[30px] font-semibold tracking-tight">
            Hello, {user?.name.split(" ")[0]}.{" "}
            <span className="font-normal">Let’s make an impact.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A little less paperwork. A little more possibility.
          </p>
        </div>
        <span className="hidden items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted-foreground xl:inline-flex">
          <CalendarDays size={14} />
          {dateLabel(new Date())}
        </span>
      </div>
      <Feedback
        error={dashboard.error?.message || subscription.error?.message}
      />
      <section className="welcome-banner mb-7">
        <div className="relative z-10 max-w-xl">
          <Badge>YOUR TEACHING COMPANION</Badge>
          <h2 className="mb-3 mt-5 text-[30px] font-semibold leading-tight tracking-tight text-[#183e38]">
            Good teaching starts
            <br />
            with a little guidance.
          </h2>
          <p className="max-w-sm text-sm leading-7 text-[#5c746c]">
            From the first lesson idea to the next learning breakthrough — we’re
            here to help you along the way.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/ilaw">
              <Plus />
              Create a lesson plan
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="banner-art hidden md:block" aria-hidden="true">
          <div className="art-orbit" />
          <div className="art-orbit second" />
          <div className="floating-card card-a">
            <span className="art-icon">
              <Sparkles size={23} />
            </span>
            <strong>A spark of inspiration</strong>
            <span>Intentions → Learning</span>
            <i />
            <i />
          </div>
          <div className="floating-card card-b">
            <span className="art-icon peach">
              <ClipboardCheck size={22} />
            </span>
            <strong>A moment of growth</strong>
            <span>Assessment → Ways Forward</span>
            <div className="flex gap-1 pt-3">
              {[25, 36, 30, 48, 60, 52, 72].map((h, i) => (
                <b key={i} style={{ height: h }} />
              ))}
            </div>
          </div>
          <div className="sparkle-dot">
            <Sparkles size={24} />
          </div>
        </div>
      </section>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "AI credits available",
            value: subscription.data?.remaining ?? "—",
            detail: `of ${subscription.data?.monthlyLimit ?? "—"} this month`,
            icon: Zap,
          },
          {
            title: "In your library",
            value: dashboard.data?.documentCount ?? 0,
            detail: "Ideas ready for the classroom",
            icon: FileText,
          },
          {
            title: "Your current plan",
            value:
              subscription.data?.plan === "PLUS" ? "GABAY Plus" : "GABAY Free",
            detail: subscription.data?.expiresAt
              ? `Active until ${dateLabel(subscription.data.expiresAt)}`
              : "Your teaching journey starts here",
            icon: Sparkles,
          },
        ].map((stat) => (
          <div key={stat.title} className="panel flex items-center gap-4 p-5">
            <span className="rounded-xl bg-muted p-3 text-primary">
              <stat.icon size={20} strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground">{stat.title}</p>
              <p className="my-1 text-xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-7 xl:grid-cols-[1fr_290px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                What will you create today?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Your everyday tools, a little more thoughtful.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="tool-card group"
              >
                <div className="flex items-center justify-between">
                  <span className={`tool-icon ${tool.tone}`}>
                    <tool.icon size={21} strokeWidth={1.6} />
                  </span>
                  <ArrowUpRight className="size-4 text-[#abb8b5] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{tool.name}</h3>
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                  {tool.detail}
                </p>
              </Link>
            ))}
          </div>
          <div className="mb-4 mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Pick up where you left off
            </h2>
            <Link
              href="/library"
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              View library
              <ArrowRight size={14} />
            </Link>
          </div>
          {dashboard.data?.recentDocuments.length ? (
            <div className="panel overflow-hidden">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>DOCUMENT</th>
                      <th>TYPE</th>
                      <th>LAST EDITED</th>
                      <th>
                        <span className="sr-only">Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.data.recentDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <Link
                            href={`/library/${doc.id}`}
                            className="flex items-center gap-3 font-medium"
                          >
                            <span className="rounded-lg bg-secondary p-2 text-primary">
                              <FileText size={16} />
                            </span>
                            {doc.title}
                          </Link>
                        </td>
                        <td>
                          <Badge tone="gray">{label(doc.kind)}</Badge>
                        </td>
                        <td className="whitespace-nowrap text-muted-foreground">
                          {dateLabel(doc.updatedAt)}
                        </td>
                        <td>
                          <Link
                            href={`/library/${doc.id}`}
                            aria-label={`Open ${doc.title}`}
                          >
                            <ArrowUpRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Your next great lesson starts here"
              description="Everything you create is saved in your library, ready to edit, reuse, and make your own."
            >
              <Button variant="outline" asChild>
                <Link href="/ilaw">Create your first lesson</Link>
              </Button>
            </EmptyState>
          )}
        </div>
        <aside className="space-y-5">
          <div className="chat-promo">
            <span className="mb-5 inline-flex rounded-xl bg-white/10 p-3">
              <MessageSquare size={23} strokeWidth={1.5} />
            </span>
            <h3 className="text-xl font-medium leading-snug">
              A thinking partner.
              <br />
              Whenever you need one.
            </h3>
            <p className="mt-3 text-xs leading-6 text-teal-100/65">
              Untangle an idea, explore an activity, or find a fresh way to
              explain a tricky topic.
            </p>
            <Link
              href="/chat"
              className="mt-6 flex items-center justify-between border-t border-white/15 pt-4 text-xs font-semibold"
            >
              Let’s talk to GABAY
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="panel p-5">
            <span className="eyebrow">Your teaching focus</span>
            <div className="mt-5 flex gap-3">
              <span className="tool-icon mint">
                <BookOpen size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {user?.profile?.learningAreas.join(", ") ||
                    "Your learning areas"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user?.profile?.gradeLevels
                    .map((g) => (g === 0 ? "Kindergarten" : `Grade ${g}`))
                    .join(" · ") || "Add your grade levels"}
                </p>
              </div>
            </div>
            <p className="mt-5 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
              “The art of teaching is the art of assisting discovery.”
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              — Mark Van Doren
            </p>
          </div>
          {dashboard.data?.notifications.map((n) => (
            <div key={n.id} className="panel p-5">
              <h3 className="text-sm font-semibold">{n.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {n.body}
              </p>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
