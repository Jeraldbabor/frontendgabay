"use client";

import { useEffect, useRef, useState } from "react";
import { History, Plus, Sparkles, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/auth-provider";
import { Modal } from "@/shared/components/ui/modal";
import { useChat } from "../hooks/use-chat";
import { ConversationList } from "./conversation-list";
import { ChatWelcome } from "./chat-welcome";
import { ChatComposer } from "./chat-composer";
import { ChatMessages } from "./chat-messages";
import styles from "./chat.module.css";

export function ChatPage() {
  const { user } = useAuth();
  const chat = useChat();
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollArea = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const activeTitle = chat.conversations.data?.find(
    (item) => item.id === chat.conversationId,
  )?.title;

  useEffect(() => {
    const area = scrollArea.current;
    if (!area) return;
    area.scrollTo({
      top: chat.messages.length || chat.pendingMessage ? area.scrollHeight : 0,
      behavior: "instant",
    });
  }, [chat.messages, chat.pendingMessage, chat.loadingId]);

  function newChat() {
    chat.newChat();
    input.current?.focus();
  }

  return (
    <div className={styles.workspace}>
      <aside
        className={styles.desktopHistory}
        aria-label="Conversation history"
      >
        <ConversationList chat={chat} onSelect={() => input.current?.focus()} />
      </aside>
      <section className={styles.chatPanel} aria-label="GABAY chat workspace">
        <header className={styles.chatHeader}>
          <div className={styles.headerIdentity}>
            <span className={styles.headerIcon}>
              <Sparkles size={19} strokeWidth={1.7} />
            </span>
            <div>
              <h1>
                GABAY Chat <span>AI</span>
              </h1>
              <p title={activeTitle}>
                {activeTitle || "Your everyday teaching companion"}
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.statusPill}>
              <i
                className={chat.status.data?.configured ? styles.readyDot : ""}
              />
              {chat.status.loading
                ? "Connecting"
                : chat.status.error
                  ? "Unavailable"
                  : chat.status.data?.configured
                    ? "Ready to help"
                    : "Awaiting AI setup"}
            </span>
            <button
              className={styles.historyToggle}
              aria-label="Open conversation history"
              onClick={() => setHistoryOpen(true)}
            >
              <History size={18} />
            </button>
            <button
              className={styles.headerNewChat}
              aria-label="Start a new conversation"
              title="New conversation"
              onClick={newChat}
              disabled={chat.busy}
            >
              <Plus size={18} />
            </button>
          </div>
        </header>
        <div
          className={styles.scrollArea}
          ref={scrollArea}
          role="region"
          aria-label="Chat messages"
          tabIndex={0}
        >
          {!chat.messages.length && !chat.pendingMessage && !chat.loadingId ? (
            <ChatWelcome
              name={user?.name.split(" ")[0]}
              onPrompt={(prompt) => {
                chat.setDraft(prompt);
                input.current?.focus();
              }}
            />
          ) : (
            <ChatMessages
              messages={chat.messages}
              pendingMessage={chat.pendingMessage}
              loading={Boolean(chat.loadingId)}
            />
          )}
        </div>
        <ChatComposer chat={chat} inputRef={input} />
      </section>
      {historyOpen && (
        <Modal
          labelledBy="chat-history-title"
          onClose={() => setHistoryOpen(false)}
          className={styles.historyModal}
        >
          <div className={styles.modalHeading}>
            <h2 id="chat-history-title">Your conversations</h2>
            <button
              aria-label="Close conversation history"
              onClick={() => setHistoryOpen(false)}
            >
              <X size={19} />
            </button>
          </div>
          <ConversationList
            chat={chat}
            onSelect={() => setHistoryOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
