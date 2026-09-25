"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  CalendarDays,
  Sparkles,
  ClipboardCheck,
  Table2,
  Layers,
  ChartNoAxesCombined,
  HeartHandshake,
  Library,
  PanelsTopLeft,
  CreditCard,
  Settings2,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ChevronRight,
  Users,
  ShieldCheck,
  FileCheck2,
  Activity,
  ScrollText,
} from "lucide-react";
import { AuthGate, useAuth } from "@/features/auth/hooks/auth-provider";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { UserAvatar } from "@/shared/components/ui/user-avatar";
const teacherNav = [
  {
    section: "WORKSPACE",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/chat", label: "GABAY Chat", icon: MessageSquare },
    ],
  },
  {
    section: "PLAN & CREATE",
    items: [
      { href: "/curriculum", label: "Curriculum", icon: BookOpen },
      { href: "/budget-of-work", label: "Budget of Work", icon: CalendarDays },
      { href: "/ilaw", label: "ILAW Planner", icon: Sparkles },
      { href: "/assessments", label: "Assessments", icon: ClipboardCheck },
      { href: "/tos", label: "Table of Specifications", icon: Table2 },
      { href: "/materials", label: "Teaching Materials", icon: Layers },
    ],
  },
  {
    section: "REFLECT & ORGANIZE",
    items: [
      {
        href: "/analysis",
        label: "Grades & Analysis",
        icon: ChartNoAxesCombined,
      },
      { href: "/intervention", label: "Intervention", icon: HeartHandshake },
      { href: "/library", label: "My Library", icon: Library },
      { href: "/templates", label: "My Templates", icon: PanelsTopLeft },
    ],
  },
];
const adminNav = [
  {
    section: "PLATFORM",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/curriculum", label: "Curriculum", icon: BookOpen },
      {
        href: "/admin/budget-of-work",
        label: "Budget of Work",
        icon: CalendarDays,
      },
      { href: "/admin/knowledge", label: "Knowledge Base", icon: Library },
      { href: "/admin/templates", label: "Templates", icon: PanelsTopLeft },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      {
        href: "/admin/payment-settings",
        label: "Payment setup",
        icon: Settings2,
      },
      {
        href: "/admin/subscriptions",
        label: "Subscriptions",
        icon: FileCheck2,
      },
      { href: "/admin/usage", label: "AI Usage", icon: Activity },
      { href: "/admin/documents", label: "Generated Documents", icon: Layers },
      {
        href: "/admin/analytics",
        label: "Analytics",
        icon: ChartNoAxesCombined,
      },
      { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
      { href: "/admin/settings", label: "Settings", icon: Settings2 },
    ],
  },
];
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isAdmin = pathname.startsWith("/admin");
  const isChat = pathname === "/chat";
  const nav = isAdmin ? adminNav : teacherNav;
  const current =
    nav.flatMap((n) => n.items).find((n) => n.href === pathname)?.label ??
    (pathname.startsWith("/library/")
      ? "Document"
      : pathname === "/settings"
        ? "Settings"
        : "Subscription");
  return (
    <AuthGate admin={isAdmin}>
      <div className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only z-50 rounded bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {open && (
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/25 lg:hidden"
          />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-border bg-white transition-transform lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-24 shrink-0 items-center justify-between px-7">
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className="flex items-center gap-2.5"
            >
              <span className="brand-mark">
                <BookOpen size={22} strokeWidth={1.8} />
              </span>
              <span className="text-[27px] font-bold tracking-[-1.2px] text-[#123e42]">
                gabay
                <span className="ml-1 align-top text-[10px] font-semibold tracking-normal text-primary">
                  AI
                </span>
              </span>
            </Link>
            <button
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-4">
            {nav.map((group) => (
              <div key={group.section} className="mb-5">
                <p className="mb-2 px-3 text-[9px] font-bold tracking-[0.15em] text-[#9aa7a6]">
                  {group.section}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      onClick={() => setOpen(false)}
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "nav-item",
                        pathname === item.href && "active",
                      )}
                    >
                      <item.icon size={17} strokeWidth={1.7} />
                      <span>{item.label}</span>
                      {item.href === "/chat" && (
                        <span className="ml-auto size-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="shrink-0 border-t border-border p-4">
            {!isAdmin && (
              <>
                <Link
                  href="/subscription"
                  className={cn(
                    "nav-item",
                    pathname === "/subscription" && "active",
                  )}
                >
                  <CreditCard size={17} />
                  Subscription
                  <ArrowUpRight size={14} className="ml-auto" />
                </Link>
                <Link
                  href="/settings"
                  className={cn(
                    "nav-item",
                    pathname === "/settings" && "active",
                  )}
                >
                  <Settings2 size={17} />
                  Settings
                </Link>
              </>
            )}
            {user?.role === "ADMIN" && (
              <Link
                className="nav-item"
                href={isAdmin ? "/dashboard" : "/admin"}
              >
                <ShieldCheck size={17} />
                {isAdmin ? "Teacher workspace" : "Admin workspace"}
              </Link>
            )}
            <button
              className="nav-item w-full"
              onClick={() => logout().catch((e) => setLogoutError(e.message))}
            >
              <LogOut size={17} />
              Sign out
            </button>
            {logoutError && (
              <p role="alert" className="text-xs text-red-600">
                {logoutError}
              </p>
            )}
          </div>
        </aside>
        <div className="lg:ml-[250px]">
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border bg-white/95 px-5 backdrop-blur md:px-9">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                className="lg:hidden"
                onClick={() => setOpen(true)}
              >
                <Menu />
              </Button>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {isAdmin ? "Administration" : "My workspace"}
              </span>
              <ChevronRight className="hidden size-3 text-muted-foreground sm:inline" />
              <span className="text-xs font-semibold">{current}</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="hidden items-center gap-2 text-[11px] text-muted-foreground md:inline-flex">
                <span className="size-1.5 rounded-full bg-primary" />
                Your space to grow
              </span>
              <span className="h-6 border-l border-border" />
              <Link href="/settings" className="flex items-center gap-3">
                <UserAvatar
                  name={user?.name ?? "GABAY educator"}
                  avatarUrl={user?.profile?.avatarUrl}
                  size="sm"
                />
                <span className="hidden sm:block">
                  <span className="block text-xs font-semibold">
                    {user?.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {isAdmin
                      ? "Platform administrator"
                      : user?.profile?.position || "Educator"}
                  </span>
                </span>
              </Link>
            </div>
          </header>
          <main
            id="main-content"
            className={cn(
              "mx-auto max-w-[1500px]",
              isChat ? "p-2 md:p-5" : "px-5 py-8 md:px-9 md:py-9",
            )}
          >
            {children}
          </main>
          {!isChat && (
            <footer className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-2 px-9 pb-7 pt-3 text-[10px] text-[#94a09f]">
              <span>
                Thoughtfully made for the teachers who make a difference.
              </span>
              <span>GABAY AI · Plan. Teach. Grow.</span>
            </footer>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
