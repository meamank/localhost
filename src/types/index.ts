export interface ModelMeta {
  id: string;
  org: string;
  logo_url: string;
  name: string;
  description?: string;
  fileName: string;
  size: number;
  downloadUrl: string;
  tokenizerUrl: string; // Path to tokenizer.model
  tokenizerConfigUrl?: string; // Path to tokenizer_config.json
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
  filePath: string; // Path to the .pte model file
  tokenizerPath: string; // Path to tokenizer.model
  tokenizerConfigPath?: string; // Path to tokenizer_config.json
  downloadProgress?: number;
  isFromDevice?: boolean;
  size: number;
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

export interface ModelConfig {
  systemPrompt?: string;
  repetitionPenalty?: number;
  temperature?: number;
  topP?: number;
}
