"use client";

import { useEffect, useState, type RefObject } from "react";
import Link from "next/link";
import {
  ArrowUp,
  BookOpen,
  ChevronDown,
  FileText,
  Info,
  LoaderCircle,
  X,
} from "lucide-react";
import type { SourceMode } from "@gabay/types";
import { Skeleton } from "@/shared/components/ui/page";
import { useToast } from "@/shared/components/ui/toast";
import type { ChatController } from "../hooks/use-chat";
import styles from "./chat.module.css";

const sourceModes: { value: SourceMode; label: string; description: string }[] =
  [
    {
      value: "OFFICIAL_AI",
      label: "AI + official sources",
      description: "Combine AI knowledge with official references.",
    },
    {
      value: "OFFICIAL_ONLY",
      label: "Official sources only",
      description: "Ground the response in official documents.",
    },
    {
      value: "GENERAL",
      label: "General AI knowledge",
      description: "Explore ideas using general AI knowledge.",
    },
    {
      value: "PERSONAL_OFFICIAL",
      label: "My files + official sources",
      description: "Include up to 10 references from your library.",
    },
  ];

export function ChatComposer({
  chat,
  inputRef,
}: {
  chat: ChatController;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const { toast } = useToast();
  const current = sourceModes.find((item) => item.value === chat.mode)!;
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
  }, [chat.draft, inputRef]);

  return (
    <div className={styles.composerArea}>
      {chat.error && (
        <div className={styles.error} role="alert">
          <Info size={16} />
          <span>{chat.error}</span>
        </div>
      )}
      {chat.status.error ? (
        <div className={styles.error} role="alert">
          <span>We couldn’t check chat availability.</span>
          <button onClick={chat.status.reload}>Retry</button>
        </div>
      ) : chat.status.data?.configured === false ? (
        <div className={styles.setupNotice}>
          <Info size={14} />
          <span>
            <strong>Your thinking space is ready.</strong> AI replies will be
            available once your administrator connects AI.
          </span>
        </div>
      ) : chat.status.loading ? (
        <div className={styles.setupNotice} role="status">
          <LoaderCircle size={14} className="animate-spin" />
          Checking chat availability…
        </div>
      ) : null}
      <form
        className={styles.composer}
        onKeyDown={(event) => {
          if (event.key === "Escape" && sourcesOpen) {
            setSourcesOpen(false);
            inputRef.current?.focus();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          void chat.send();
        }}
      >
        {sourcesOpen && (
          <div className={styles.sourceSettings} id="chat-source-settings">
            <div className={styles.sourceHeading}>
              <strong>Choose your knowledge sources</strong>
              <button
                type="button"
                aria-label="Close source settings"
                onClick={() => setSourcesOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div
              className={styles.sourceOptions}
              role="radiogroup"
              aria-label="Knowledge sources"
            >
              {sourceModes.map((item) => (
                <label
                  key={item.value}
                  className={
                    chat.mode === item.value ? styles.sourceSelected : ""
                  }
                >
                  <input
                    type="radio"
                    name="chat-source-mode"
                    value={item.value}
                    checked={chat.mode === item.value}
                    disabled={chat.busy}
                    onChange={() => chat.setMode(item.value)}
                  />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </label>
              ))}
            </div>
            {chat.mode === "PERSONAL_OFFICIAL" && (
              <div className={styles.filePicker}>
                <div className={styles.fileHeading}>
                  <span>My references · {chat.uploads.length}/10 selected</span>
                  <Link href="/library">Manage library ↗</Link>
                </div>
                {chat.files.loading ? (
                  <div role="status" aria-label="Loading references">
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : chat.files.error ? (
                  <p role="alert">
                    References couldn’t load.{" "}
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={chat.files.reload}
                    >
                      Try again
                    </button>
                  </p>
                ) : chat.files.data?.length === 0 ? (
                  <p>Upload a reference in My Library to use it here.</p>
                ) : (
                  <div className={styles.fileList}>
                    {chat.files.data?.map((file) => (
                      <label key={file.id}>
                        <input
                          type="checkbox"
                          checked={chat.uploads.includes(file.id)}
                          disabled={chat.busy}
                          onChange={(event) => {
                            if (
                              event.target.checked &&
                              chat.uploads.length >= 10
                            ) {
                              toast({
                                title: "Choose up to 10 references",
                                tone: "info",
                              });
                              return;
                            }
                            chat.setUploads((selected) =>
                              event.target.checked
                                ? [...selected, file.id]
                                : selected.filter((id) => id !== file.id),
                            );
                          }}
                        />
                        <FileText size={14} />
                        <span>{file.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <textarea
          ref={inputRef}
          className={styles.messageInput}
          aria-label="Message GABAY"
          aria-describedby="chat-composer-hint"
          placeholder="What are you working on today?"
          value={chat.draft}
          onChange={(event) => chat.setDraft(event.target.value)}
          maxLength={6000}
          rows={2}
          disabled={chat.busy}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              window.matchMedia("(pointer: fine)").matches
            ) {
              event.preventDefault();
              if (chat.canSend) void chat.send();
            }
          }}
        />
        <div className={styles.composerToolbar}>
          <button
            type="button"
            className={`${styles.sourceTrigger} ${sourcesOpen ? styles.sourceTriggerOpen : ""}`}
            aria-expanded={sourcesOpen}
            aria-controls="chat-source-settings"
            onClick={() => setSourcesOpen((open) => !open)}
          >
            <BookOpen size={14} />
            <span>
              {current.label}
              {chat.mode === "PERSONAL_OFFICIAL" && chat.uploads.length > 0
                ? ` · ${chat.uploads.length}`
                : ""}
            </span>
            <ChevronDown size={13} />
          </button>
          <div className={styles.sendGroup}>
            <span className={styles.characterCount}>
              {chat.draft.length.toLocaleString()}
              <span> / 6,000</span>
            </span>
            <button
              className={styles.sendButton}
              type="submit"
              aria-label="Send message"
              disabled={!chat.canSend}
              title={
                chat.status.data?.configured === false
                  ? "AI replies are awaiting administrator setup"
                  : "Send message"
              }
            >
              {chat.pendingMessage ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <ArrowUp size={20} />
              )}
            </button>
          </div>
        </div>
      </form>
      <div className={styles.composerFootnote} id="chat-composer-hint">
        <span>GABAY can make mistakes. Review important details.</span>
        <span className={styles.keyboardHint}>
          Enter to send <span>·</span> Shift + Enter for a new line
        </span>
      </div>
    </div>
  );
}
