"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  ImageUp,
  Mail,
  MapPin,
  Save,
  School,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { SessionUser } from "@gabay/types";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { BrandingFields } from "@/features/templates/components/branding-fields";
import {
  readLayout,
  type Layout,
} from "@/features/templates/services/template.service";
import { api } from "@/shared/lib/api-client";
import { useAction, useResource } from "@/shared/hooks/use-resource";
import { Button } from "@/shared/components/ui/button";
import { Feedback, Field, Input } from "@/shared/components/ui/form";
import { Skeleton } from "@/shared/components/ui/page";
import { useToast } from "@/shared/components/ui/toast";
import { UserAvatar } from "@/shared/components/ui/user-avatar";
import styles from "./settings.module.css";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];

export function SettingsPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const profileAction = useAction();
  const avatarAction = useAction();
  const brandingAction = useAction();
  const branding = useResource<Layout>("/templates/branding");
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const user = auth.user;

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const profileSignals = [
    user?.name,
    user?.profile?.school,
    user?.profile?.position,
    user?.profile?.gradeLevels.length,
    user?.profile?.learningAreas.length,
  ];
  const profileProgress = Math.round(
    (profileSignals.filter(Boolean).length / profileSignals.length) * 100,
  );

  function chooseAvatar(file?: File) {
    setAvatarError("");
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setAvatarError("Choose a PNG or JPEG image.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Choose an image smaller than 2 MB.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setAvatarFile(file);
  }

  function clearAvatarSelection() {
    setAvatarFile(null);
    setAvatarError("");
    if (fileInput.current) fileInput.current.value = "";
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    const form = new FormData();
    form.append("file", avatarFile);
    const account = await avatarAction.run(
      () => api.post<SessionUser>("/auth/profile/avatar", form),
      "",
      (message) =>
        toast({
          title: "Profile photo was not saved",
          description: message,
          tone: "error",
        }),
    );
    if (!account) return;
    auth.accept(account);
    clearAvatarSelection();
    toast({
      title: "Profile photo updated",
      description: "Your new photo now appears across your GABAY account.",
      tone: "success",
    });
  }

  async function removeAvatar() {
    const account = await avatarAction.run(
      () => api.delete<SessionUser>("/auth/profile/avatar"),
      "",
      (message) =>
        toast({
          title: "Profile photo was not removed",
          description: message,
          tone: "error",
        }),
    );
    if (!account) return;
    auth.accept(account);
    toast({
      title: "Profile photo removed",
      description: "Your initials will be shown instead.",
      tone: "success",
    });
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const account = await profileAction.run(
      () =>
        api.patch<SessionUser>("/auth/profile", {
          ...values,
          gradeLevels: String(values.gradeLevels)
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .map(Number),
          learningAreas: String(values.learningAreas)
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      "",
      (message) =>
        toast({
          title: "Profile was not saved",
          description: message,
          tone: "error",
        }),
    );
    if (!account) return;
    auth.accept(account);
    toast({
      title: "Teaching profile updated",
      description: "Your account details and planning defaults are saved.",
      tone: "success",
    });
  }

  async function saveBranding(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const layout = readLayout(new FormData(e.currentTarget));
    const saved = await brandingAction.run(
      () => api.patch("/templates/branding", { layout }),
      "",
      (message) =>
        toast({
          title: "Branding was not saved",
          description: message,
          tone: "error",
        }),
    );
    if (!saved) return;
    toast({
      title: "Document branding saved",
      description: "New exports will use these default details.",
      tone: "success",
    });
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="settings-title">
        <div>
          <p className={styles.eyebrow}>
            <Sparkles size={14} /> ACCOUNT & PREFERENCES
          </p>
          <h1 id="settings-title">Your teaching identity, all in one place.</h1>
          <p>
            Keep your profile recognizable and your teaching defaults ready for
            every lesson, assessment, and export.
          </p>
        </div>
        <div className={styles.heroProfile}>
          <UserAvatar
            name={user?.name ?? "GABAY educator"}
            avatarUrl={user?.profile?.avatarUrl}
            size="lg"
          />
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.profile?.position || "Educator"}</span>
            <div className={styles.progressTrack} aria-hidden="true">
              <span style={{ width: `${profileProgress}%` }} />
            </div>
            <small>{profileProgress}% profile complete</small>
          </div>
        </div>
      </section>

      <Feedback
        error={
          avatarError ||
          avatarAction.error ||
          profileAction.error ||
          brandingAction.error ||
          branding.error?.message
        }
      />

      <div className={styles.layout}>
        <section className={`${styles.card} ${styles.photoCard}`}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionIcon}>
              <Camera size={18} />
            </span>
            <div>
              <h2>Profile photo</h2>
              <p>Help administrators recognize your account at a glance.</p>
            </div>
          </div>

          <div className={styles.photoWorkspace}>
            <UserAvatar
              name={user?.name ?? "GABAY educator"}
              avatarUrl={avatarPreview ?? user?.profile?.avatarUrl}
              size="xl"
              className={styles.largeAvatar}
            />
            <div className={styles.photoActions}>
              <input
                ref={fileInput}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                onChange={(event) => chooseAvatar(event.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInput.current?.click()}
                disabled={avatarAction.busy}
              >
                <ImageUp />
                {user?.profile?.avatarUrl ? "Choose new photo" : "Choose photo"}
              </Button>
              {avatarFile && (
                <>
                  <Button
                    type="button"
                    onClick={uploadAvatar}
                    disabled={avatarAction.busy}
                  >
                    <CheckCircle2 />
                    Save photo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAvatarSelection}
                    disabled={avatarAction.busy}
                  >
                    <X />
                    Cancel
                  </Button>
                </>
              )}
              {!avatarFile && user?.profile?.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAvatar}
                  disabled={avatarAction.busy}
                  className={styles.removeButton}
                >
                  <Trash2 />
                  Remove photo
                </Button>
              )}
            </div>
          </div>
          <div className={styles.photoHint}>
            <ShieldCheck size={16} />
            <span>
              PNG or JPEG, up to 2 MB. A square, well-lit photo works best. Your
              photo is visible only inside your GABAY workspace.
            </span>
          </div>
        </section>

        <form
          onSubmit={saveProfile}
          className={`${styles.card} ${styles.profileCard}`}
        >
          <div className={styles.sectionHeading}>
            <span className={styles.sectionIcon}>
              <UserRound size={18} />
            </span>
            <div>
              <h2>Teaching profile</h2>
              <p>These details personalize planning tools and exports.</p>
            </div>
          </div>

          <div className={styles.accountStrip}>
            <span className={styles.accountMail}>
              <Mail size={15} />
              <span>
                <small>Account email</small>
                <strong>{user?.email}</strong>
              </span>
            </span>
            <span
              className={
                user?.emailVerified ? styles.verifiedBadge : styles.pendingBadge
              }
            >
              {user?.emailVerified ? "Verified" : "Verification pending"}
            </span>
          </div>

          {!user?.emailVerified && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={profileAction.busy}
              onClick={async () => {
                const sent = await profileAction.run(
                  () => api.post("/auth/request-verification"),
                  "",
                );
                if (sent)
                  toast({
                    title: "Verification email requested",
                    description: "Check your inbox for the next step.",
                    tone: "success",
                  });
              }}
            >
              <Mail />
              Send verification email
            </Button>
          )}

          <div className={styles.fieldsGrid}>
            <Field label="Full name" className={styles.fullField}>
              <Input
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={user?.name}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Position">
              <Input
                name="position"
                maxLength={120}
                defaultValue={user?.profile?.position ?? ""}
                placeholder="e.g. Science Teacher"
              />
            </Field>
            <Field label="School">
              <Input
                name="school"
                maxLength={200}
                defaultValue={user?.profile?.school ?? ""}
                placeholder="School name"
              />
            </Field>
            <Field label="Division">
              <Input
                name="division"
                maxLength={120}
                defaultValue={user?.profile?.division ?? ""}
                placeholder="Schools division"
              />
            </Field>
            <Field label="Region">
              <Input
                name="region"
                maxLength={120}
                defaultValue={user?.profile?.region ?? ""}
                placeholder="Region"
              />
            </Field>
            <Field
              label="Grade levels"
              hint="Separate grades with commas. Use 0 for Kindergarten."
            >
              <Input
                name="gradeLevels"
                defaultValue={user?.profile?.gradeLevels.join(", ") ?? ""}
                placeholder="e.g. 7, 8, 9"
              />
            </Field>
            <Field label="Learning areas">
              <Input
                name="learningAreas"
                defaultValue={user?.profile?.learningAreas.join(", ") ?? ""}
                placeholder="e.g. Science, Mathematics"
              />
            </Field>
          </div>

          <div className={styles.formFooter}>
            <span>Changes update your workspace immediately.</span>
            <Button disabled={profileAction.busy}>
              <Save />
              Save teaching profile
            </Button>
          </div>
        </form>

        <form
          onSubmit={saveBranding}
          className={`${styles.card} ${styles.brandingCard}`}
        >
          <div className={styles.sectionHeading}>
            <span className={styles.sectionIcon}>
              <BookOpen size={18} />
            </span>
            <div>
              <h2>Default document branding</h2>
              <p>
                Applied when you export without choosing a specific template.
              </p>
            </div>
          </div>
          <div className={styles.brandingNote}>
            <School size={17} />
            <span>
              Official locked template fields keep their approved formatting.
              These defaults apply only where customization is allowed.
            </span>
          </div>
          {branding.loading ? (
            <div className={styles.brandingSkeleton}>
              <Skeleton className="h-11" />
              <Skeleton className="h-11" />
              <Skeleton className="h-28" />
            </div>
          ) : branding.data ? (
            <BrandingFields
              key={JSON.stringify(branding.data)}
              layout={branding.data}
            />
          ) : null}
          <div className={styles.formFooter}>
            <span className={styles.locationHint}>
              <MapPin size={14} /> Saved to your account
            </span>
            <Button disabled={brandingAction.busy || !branding.data}>
              <Save />
              Save branding
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
