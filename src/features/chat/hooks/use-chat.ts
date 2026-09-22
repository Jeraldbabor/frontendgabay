"use client";

import { useRef, useState } from "react";
import type { SourceMode, SourceReference } from "@gabay/types";
import { api } from "@/shared/lib/api-client";
import { useResource } from "@/shared/hooks/use-resource";
import type { ChatMessage, Conversation } from "../types";

export function useChat() {
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<SourceMode>("OFFICIAL_AI");
  const [uploads, setUploads] = useState<string[]>([]);
  const [pendingMessage, setPendingMessage] = useState("");
  const [loadingId, setLoadingId] = useState<string>();
  const [error, setError] = useState("");
  // Guard consecutive clicks before React has committed the pending state.
  const inFlight = useRef(false);
  const conversations = useResource<Conversation[]>("/ai/conversations");
  const status = useResource<{ configured: boolean }>("/ai/status");
  const files = useResource<{ id: string; title: string }[]>(
    mode === "PERSONAL_OFFICIAL" ? "/knowledge" : null,
  );
  const busy = Boolean(pendingMessage || loadingId);
  const canSend =
    !busy && draft.trim().length >= 2 && status.data?.configured === true;

  function newChat() {
    if (inFlight.current) return;
    setConversationId(undefined);
    setMessages([]);
    setDraft("");
    setError("");
  }

  async function loadConversation(id: string) {
    if (inFlight.current || id === conversationId) return;
    inFlight.current = true;
    setLoadingId(id);
    setError("");
    try {
      const history = await api.get<ChatMessage[]>(`/ai/conversations/${id}`);
      setConversationId(id);
      setMessages(history);
      setDraft("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "This conversation could not be loaded. Try again.",
      );
    } finally {
      inFlight.current = false;
      setLoadingId(undefined);
    }
  }

  async function send() {
    if (!canSend || inFlight.current) return;
    const content = draft.trim();
    inFlight.current = true;
    setPendingMessage(content);
    setError("");
    try {
      const result = await api.post<{
        conversationId: string;
        answer: string;
        sources: SourceReference[];
      }>("/ai/chat", {
        message: content,
        conversationId,
        sourceMode: mode,
        uploadIds: mode === "PERSONAL_OFFICIAL" ? uploads : [],
      });
      setMessages((current) => [
        ...current,
        { role: "user", content, sources: [] },
        { role: "assistant", content: result.answer, sources: result.sources },
      ]);
      setConversationId(result.conversationId);
      setDraft("");
      conversations.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Your message could not be sent. Your draft is saved here so you can try again.",
      );
    } finally {
      inFlight.current = false;
      setPendingMessage("");
    }
  }

  return {
    conversationId,
    messages,
    draft,
    setDraft,
    mode,
    setMode,
    uploads,
    setUploads,
    pendingMessage,
    loadingId,
    error,
    busy,
    canSend,
    conversations,
    status,
    files,
    newChat,
    loadConversation,
    send,
  };
}

export type ChatController = ReturnType<typeof useChat>;
