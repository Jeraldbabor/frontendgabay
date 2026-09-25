"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { Role, UserProfile } from "@gabay/types";
import { api } from "@/shared/lib/api-client";
import { useAction, useResource } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/form";
import { Skeleton } from "@/shared/components/ui/page";
import { useToast } from "@/shared/components/ui/toast";
import { UserAvatar } from "@/shared/components/ui/user-avatar";
import { dateLabel } from "@/shared/lib/utils";
import styles from "./admin-users.module.css";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  emailVerified: boolean;
  profile: UserProfile | null;
  createdAt: string;
};

type StatusFilter = "all" | "active" | "inactive";

export function AdminUsersPage() {
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const action = useAction();
  const { toast } = useToast();

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchDraft.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [searchDraft]);

  const users = useResource<AdminUser[]>(
    `/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );

  const filtered = useMemo(() => {
    const records = users.data ?? [];
    if (status === "all") return records;
    return records.filter((user) =>
      status === "active" ? user.active : !user.active,
    );
  }, [status, users.data]);

  const totals = useMemo(() => {
    const records = users.data ?? [];
    return {
      total: records.length,
      active: records.filter((user) => user.active).length,
      verified: records.filter((user) => user.emailVerified).length,
    };
  }, [users.data]);

  async function setActive(user: AdminUser) {
    const saved = await action.run(
      () =>
        api.patch<{ id: string; active: boolean }>(`/admin/users/${user.id}`, {
          active: !user.active,
        }),
      "",
      (message) =>
        toast({
          title: "Account access was not updated",
          description: message,
          tone: "error",
        }),
    );
    if (!saved) return;
    if (selected?.id === user.id)
      setSelected({ ...selected, active: saved.active });
    users.reload();
    toast({
      title: saved.active
        ? "Teacher account activated"
        : "Teacher account paused",
      description: saved.active
        ? `${user.name} can sign in again.`
        : `${user.name}'s active sessions have been closed.`,
      tone: "success",
    });
  }

  const hasFilters = Boolean(searchDraft || status !== "all");

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="users-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <ShieldCheck size={14} /> ADMIN · PEOPLE
          </p>
          <h1 id="users-title">The people behind every classroom.</h1>
          <p>
            See each teacher’s profile, recognize accounts quickly, and manage
            access with the context you need.
          </p>
        </div>
        <div className={styles.stats} aria-label="User overview">
          <div>
            <span className={styles.statIcon}>
              <Users size={18} />
            </span>
            <strong>{users.loading ? "—" : totals.total}</strong>
            <small>accounts in view</small>
          </div>
          <div>
            <span className={styles.statIcon}>
              <UserCheck size={18} />
            </span>
            <strong>{users.loading ? "—" : totals.active}</strong>
            <small>active accounts</small>
          </div>
          <div>
            <span className={styles.statIcon}>
              <BadgeCheck size={18} />
            </span>
            <strong>{users.loading ? "—" : totals.verified}</strong>
            <small>verified emails</small>
          </div>
        </div>
      </section>

      <section className={styles.filters} aria-labelledby="user-filters-title">
        <div className={styles.filterHeading}>
          <div>
            <p>FIND AND MANAGE</p>
            <h2 id="user-filters-title">Teacher accounts</h2>
          </div>
          {hasFilters && (
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setSearchDraft("");
                setSearch("");
                setStatus("all");
              }}
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </div>
        <div className={styles.filterControls}>
          <label className={styles.searchField}>
            <span>Search users</span>
            <Search size={17} />
            <Input
              aria-label="Search users"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search by name or email"
            />
          </label>
          <div className={styles.statusFilter}>
            <span>
              <SlidersHorizontal size={14} /> Account status
            </span>
            <div>
              {(["all", "active", "inactive"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={status === value}
                  className={status === value ? styles.activeFilter : ""}
                  onClick={() => setStatus(value)}
                >
                  {value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.resultsHeading}>
        <div>
          <p>ACCOUNT DIRECTORY</p>
          <h2>
            {users.loading
              ? "Loading teacher accounts…"
              : `${filtered.length} ${filtered.length === 1 ? "account" : "accounts"}`}
          </h2>
        </div>
        <span>
          {search || status !== "all"
            ? "Results reflect your active filters."
            : "Up to 100 recent accounts are shown."}
        </span>
      </div>

      {users.error ? (
        <div className={styles.errorState} role="alert">
          <CircleOff size={22} />
          <div>
            <strong>Teacher accounts could not be loaded</strong>
            <span>{users.error.message}</span>
          </div>
          <Button variant="outline" size="sm" onClick={users.reload}>
            Try again
          </Button>
        </div>
      ) : users.loading ? (
        <div className={styles.userGrid} aria-label="Loading teacher accounts">
          {Array.from({ length: 6 }, (_, index) => (
            <div className={styles.userSkeleton} key={index}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
              <Skeleton className="mt-6 h-16" />
              <Skeleton className="mt-5 h-10" />
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className={styles.userGrid}>
          {filtered.map((user) => (
            <article className={styles.userCard} key={user.id}>
              <div className={styles.cardTop}>
                <div className={styles.identity}>
                  <UserAvatar
                    name={user.name}
                    avatarUrl={user.profile?.avatarUrl}
                    size="md"
                  />
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>
                <span
                  className={
                    user.active ? styles.activeBadge : styles.inactiveBadge
                  }
                >
                  <span /> {user.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className={styles.cardMeta}>
                <div>
                  <span>Role</span>
                  <strong>
                    {user.role === "ADMIN" ? "Administrator" : "Teacher"}
                  </strong>
                </div>
                <div>
                  <span>Position</span>
                  <strong>{user.profile?.position || "Not added"}</strong>
                </div>
                <div>
                  <span>Joined</span>
                  <strong>{dateLabel(user.createdAt)}</strong>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(user)}
                >
                  View profile
                </Button>
                {user.role === "USER" && (
                  <Button
                    type="button"
                    variant={user.active ? "destructive" : "outline"}
                    size="sm"
                    disabled={action.busy}
                    onClick={() => setActive(user)}
                  >
                    {user.active ? "Pause access" : "Activate"}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span>
            <Users size={25} />
          </span>
          <h3>No accounts match this view</h3>
          <p>Try another name, email, or account status.</p>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchDraft("");
                setSearch("");
                setStatus("all");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {selected && (
        <div className={styles.modalLayer}>
          <button
            type="button"
            aria-label="Close teacher profile"
            className={styles.backdrop}
            onClick={() => setSelected(null)}
          />
          <section
            className={styles.profilePanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-profile-title"
          >
            <div className={styles.panelHeader}>
              <div>
                <p>TEACHER PROFILE</p>
                <h2 id="teacher-profile-title">Account details</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close teacher profile"
                onClick={() => setSelected(null)}
              >
                <X />
              </Button>
            </div>

            <div className={styles.panelIdentity}>
              <UserAvatar
                name={selected.name}
                avatarUrl={selected.profile?.avatarUrl}
                size="xl"
              />
              <h3>{selected.name}</h3>
              <p>{selected.profile?.position || "Educator"}</p>
              <div className={styles.panelBadges}>
                <span
                  className={
                    selected.active ? styles.activeBadge : styles.inactiveBadge
                  }
                >
                  {selected.active ? "Active account" : "Inactive account"}
                </span>
                <span className={styles.roleBadge}>
                  {selected.role === "ADMIN" ? "Administrator" : "Teacher"}
                </span>
              </div>
            </div>

            <div className={styles.contactList}>
              <div>
                <Mail />
                <span>
                  <small>Email</small>
                  <strong>{selected.email}</strong>
                </span>
                {selected.emailVerified && <CheckCircle2 />}
              </div>
              <div>
                <MapPin />
                <span>
                  <small>School and location</small>
                  <strong>
                    {[
                      selected.profile?.school,
                      selected.profile?.division,
                      selected.profile?.region,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Not added yet"}
                  </strong>
                </span>
              </div>
              <div>
                <CalendarDays />
                <span>
                  <small>Member since</small>
                  <strong>{dateLabel(selected.createdAt)}</strong>
                </span>
              </div>
            </div>

            <div className={styles.teachingDetails}>
              <div>
                <span>
                  <BookOpen size={15} /> Grade levels
                </span>
                <p>
                  {selected.profile?.gradeLevels.length
                    ? selected.profile.gradeLevels
                        .map((grade) =>
                          grade === 0 ? "Kindergarten" : `Grade ${grade}`,
                        )
                        .join(", ")
                    : "No grade levels added"}
                </p>
              </div>
              <div>
                <span>
                  <BookOpen size={15} /> Learning areas
                </span>
                <p>
                  {selected.profile?.learningAreas.join(", ") ||
                    "No learning areas added"}
                </p>
              </div>
            </div>

            {selected.role === "USER" && (
              <div className={styles.panelAction}>
                <div>
                  <strong>Account access</strong>
                  <span>
                    {selected.active
                      ? "Pausing access also closes active sessions."
                      : "Activate this account to restore sign-in access."}
                  </span>
                </div>
                <Button
                  type="button"
                  variant={selected.active ? "destructive" : "default"}
                  disabled={action.busy}
                  onClick={() => setActive(selected)}
                >
                  {selected.active ? "Pause access" : "Activate account"}
                </Button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
