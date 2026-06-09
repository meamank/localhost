export interface ModelMeta {
  id: string;
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
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  tokenCount?: number;
  tokensPerSecond?: number;
  isStreaming?: boolean;
};
