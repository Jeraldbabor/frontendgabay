"use client";

import { Copy, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/shared/components/ui/toast";
import { Skeleton } from "@/shared/components/ui/page";
import type { ChatMessage } from "../types";
import styles from "./chat.module.css";

export function ChatMessages({
  messages,
  pendingMessage,
  loading,
}: {
  messages: ChatMessage[];
  pendingMessage: string;
  loading: boolean;
}) {
  const { toast } = useToast();
  async function copy(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: "Response copied", tone: "success" });
    } catch {
      toast({
        title: "Couldn’t copy the response",
        description: "Select the response text and copy it manually.",
        tone: "error",
      });
    }
  }

  if (loading)
    return (
      <div
        className={styles.messages}
        role="status"
        aria-label="Loading conversation"
      >
        <Skeleton className="ml-auto h-20 w-3/4 rounded-2xl" />
        <div className="space-y-3 py-5">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );

  const visible = pendingMessage
    ? [...messages, { role: "user", content: pendingMessage, sources: [] }]
    : messages;
  return (
    <div className={styles.messages} role="log" aria-label="Conversation">
      <div className={styles.conversationStart}>
        <span />A little space to think together
        <span />
      </div>
      {visible.map((message, index) => (
        <article
          key={message.id ?? index}
          className={
            message.role === "user"
              ? styles.userMessage
              : styles.assistantMessage
          }
        >
          <div className={styles.messageAuthor}>
            {message.role !== "user" && (
              <span className={styles.assistantAvatar}>
                <Sparkles size={15} />
              </span>
            )}
            {message.role === "user" ? "You" : "GABAY"}
            {message.role !== "user" && <small>Teaching companion</small>}
          </div>
          <div className={styles.messageContent}>{message.content}</div>
          {message.sources?.length > 0 && (
            <div className={styles.sources}>
              {message.sources.map((source, sourceIndex) => (
                <span
                  key={`${source.documentId}-${sourceIndex}`}
                  title={
                    source.official ? "Official source" : "Personal reference"
                  }
                >
                  <BookOpen size={12} />
                  {source.official ? "Official · " : "Reference · "}
                  {source.title}
                </span>
              ))}
            </div>
          )}
          {message.role !== "user" && (
            <button
              className={styles.copyButton}
              onClick={() => void copy(message.content)}
              aria-label="Copy response"
            >
              <Copy size={13} />
              Copy response
            </button>
          )}
        </article>
      ))}
      {pendingMessage && (
        <div role="status" className={styles.thinking}>
          <span className={styles.assistantAvatar}>
            <Sparkles size={15} />
          </span>
          <span>Thinking through your idea</span>
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
}
