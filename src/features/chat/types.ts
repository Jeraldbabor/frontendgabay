import type { SourceReference } from "@gabay/types";

export type ChatMessage = {
  id?: string;
  role: string;
  content: string;
  sources: SourceReference[];
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};
