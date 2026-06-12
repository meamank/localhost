export interface ModelMeta {
  id: string;
  org: string;
  logo_url: string;
  name: string;
  description?: string;
  ramRequiredGB?: number;
  fileName: string;
  size: number;
  downloadUrl?: string;
  nGpuLayers: number;
  nCtx: number;
}

export type ModelStatus =
  | "not downloaded"
  | "paused"
  | "downloaded"
  | "downloading"
  | "initializing"
  | "ready"
  | "error";

export interface LocalModel extends ModelMeta {
  status: ModelStatus;
  filePath: string;
  downloadProgress?: number;
  isFromDevice: boolean;
  error?: string;
}

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  tokenCount?: number;
  tokensPerSecond?: number;
  isStreaming?: boolean;
  input_per_second?: number;
  tokens_evaluated?: number;
  prompt_ms?: number;
  tokens_predicted?: number;
  predicted_ms?: number;
};
