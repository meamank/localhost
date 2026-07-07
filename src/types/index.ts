import { Attachment } from "../hooks/useAttachment";

export interface ModelMeta {
  id: string;

  name: string;
}

export type ModelStatus =
  | "not downloaded"
  | "paused"
  | "downloaded"
  | "downloading"
  | "initializing"
  | "ready"
  | "error";

export interface LocalModel {
  id: string;
  type: "image" | "document" | "model";
  uri: string;
  name?: string;
  status: "loading" | "ready";
}

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  media?: Attachment;
  timestamp: number;
  tokenCount?: number;
  tokensPerSecond?: number;
  isStreaming?: boolean;
  isHidden?: boolean;
  input_per_second?: number;
  tokens_evaluated?: number;
  prompt_ms?: number;
  tokens_predicted?: number;
  predicted_ms?: number;
};

export interface ModelConfig {
  systemPrompt?: string;
  repetitionPenalty?: number;
  temperature?: number;
  topP?: number;
}
