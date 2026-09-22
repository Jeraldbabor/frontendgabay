"use client";

import {
  MessageSquare,
  Plus,
  Search,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/shared/components/ui/page";
import type { ChatController } from "../hooks/use-chat";
import styles from "./chat.module.css";

export function ConversationList({
  chat,
  onSelect,
}: {
  chat: ChatController;
  onSelect?: () => void;
}) {
  const [search, setSearch] = useState("");
  const items = chat.conversations.data?.filter((item) =>
    item.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className={styles.history}>
      <div className={styles.historyTop}>
        <span className={styles.eyebrow}>YOUR THINKING SPACE</span>
        <button
          className={styles.newChat}
          disabled={chat.busy}
          onClick={() => {
            chat.newChat();
            onSelect?.();
          }}
        >
          <Plus size={17} /> New conversation <span>↗</span>
        </button>
        <label className={styles.search}>
          <Search size={15} aria-hidden="true" />
          <input
            aria-label="Search conversations"
            placeholder="Search conversations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <div className={styles.historyList}>
        <div className={styles.historyLabel}>
          <span>Recent conversations</span>
          <span>{chat.conversations.data?.length ?? ""}</span>
        </div>
        {chat.conversations.loading ? (
          <div
            role="status"
            aria-label="Loading conversations"
            className="space-y-4 px-3 py-4"
          >
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-9 w-full" />
            ))}
          </div>
        ) : chat.conversations.error ? (
          <div className={styles.historyEmpty} role="alert">
            <p>We couldn’t load your conversations.</p>
            <button
              className={styles.textButton}
              onClick={chat.conversations.reload}
            >
              Try again
            </button>
          </div>
        ) : items?.length ? (
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                className={`${styles.conversation} ${chat.conversationId === item.id || chat.loadingId === item.id ? styles.selected : ""}`}
                aria-current={
                  chat.conversationId === item.id ? "true" : undefined
                }
                disabled={chat.busy}
                onClick={() => {
                  void chat.loadConversation(item.id);
                  onSelect?.();
                }}
                title={item.title}
              >
                <MessageSquare size={16} />
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {new Date(item.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.historyEmpty}>
            <span className={styles.emptyHistoryIcon}>
              <MessageSquare size={21} strokeWidth={1.5} />
            </span>
            <strong>
              {search.trim() ? "No matching conversations" : "A fresh start"}
            </strong>
            <p>
              {search.trim()
                ? "Try another word or clear your search."
                : "Your conversations will be saved here. Pick up an idea whenever you’re ready."}
            </p>
            {search.trim() && (
              <button
                className={styles.textButton}
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      <Link href="/library" className={styles.libraryLink}>
        <BookOpen size={18} />
        <span>
          <strong>Bring your own references</strong>
          <small>Explore My Library</small>
        </span>
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
