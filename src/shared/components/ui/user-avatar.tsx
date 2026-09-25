"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

const sizes = {
  sm: "size-9 text-[11px]",
  md: "size-12 text-sm",
  lg: "size-20 text-xl",
  xl: "size-28 text-2xl",
};

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "G"
  );
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const source = avatarUrl
    ? avatarUrl.startsWith("blob:") ||
      avatarUrl.startsWith("data:") ||
      avatarUrl.startsWith("/api/")
      ? avatarUrl
      : `/api${avatarUrl}`
    : null;

  useEffect(() => setFailed(false), [source]);

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#e5f1e9] font-semibold text-[#23634f] ring-1 ring-inset ring-[#d4e5da]",
        sizes[size],
        className,
      )}
      aria-label={`${name} profile photo`}
    >
      {source && !failed ? (
        // Protected profile photos must be requested by the browser with its auth cookie.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
