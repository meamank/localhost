import { ModelMeta } from "@/src/types/index";
import {
  LLAMA3_2_1B,
  QWEN3_5_0_8B_QUANTIZED,
  SMOLLM2_1_135M_QUANTIZED,
  SMOLLM2_1_1_7B_QUANTIZED,
} from "react-native-executorch/src/constants/modelUrls";

export const AVAILABLE_MODELS: ModelMeta[] = [
  {
    id: QWEN3_5_0_8B_QUANTIZED.modelName,
    org: "Qwen",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/620760a26e3b7210c2ff1943/-s1gyJfvbE1RgO5iBeNOi.png",
    name: "Qwen 3.5 0.8B",
    description: "Quantized Qwen 3.5 0.8B model for ExecuTorch",
    size: 0.8,
    fileName: "qwen_3_5_0_8b.pte",
    downloadUrl: QWEN3_5_0_8B_QUANTIZED.modelSource,
    tokenizerUrl: QWEN3_5_0_8B_QUANTIZED.tokenizerSource,
    tokenizerConfigUrl: QWEN3_5_0_8B_QUANTIZED.tokenizerConfigSource,
  },
  {
    id: LLAMA3_2_1B.modelName,
    org: "Meta",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/6306637482810a0a58bc28a0/F31h_U99Wv1xN_Vf7I4b8.png",
    name: "Llama 3.2 1B",
    description: "Llama 3.2 1B base model for ExecuTorch",
    size: 1.0,
    fileName: "llama_3_2_1b.pte",
    downloadUrl: LLAMA3_2_1B.modelSource,
    tokenizerUrl: LLAMA3_2_1B.tokenizerSource,
    tokenizerConfigUrl: LLAMA3_2_1B.tokenizerConfigSource,
  },
  {
    id: SMOLLM2_1_135M_QUANTIZED.modelName,
    org: "HuggingFace",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/1628186175628-608b0870ed292b001a1538fc.jpeg",
    name: "SmolLM2.1 135M",
    description: "Quantized SmolLM2.1 135M for ExecuTorch",
    size: 0.15,
    fileName: "smollm2_1_135m.pte",
    downloadUrl: SMOLLM2_1_135M_QUANTIZED.modelSource,
    tokenizerUrl: SMOLLM2_1_135M_QUANTIZED.tokenizerSource,
    tokenizerConfigUrl: SMOLLM2_1_135M_QUANTIZED.tokenizerConfigSource,
  },
  {
    id: SMOLLM2_1_1_7B_QUANTIZED.modelName,
    org: "HuggingFace",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/1628186175628-608b0870ed292b001a1538fc.jpeg",
    name: "SmolLM2.1 1.7B",
    description: "Quantized SmolLM2.1 1.7B for ExecuTorch",
    size: 1.8,
    fileName: "smollm2_1_1_7b.pte",
    downloadUrl: SMOLLM2_1_1_7B_QUANTIZED.modelSource,
    tokenizerUrl: SMOLLM2_1_1_7B_QUANTIZED.tokenizerSource,
    tokenizerConfigUrl: SMOLLM2_1_1_7B_QUANTIZED.tokenizerConfigSource,
  },
];
