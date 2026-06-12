import { ModelMeta } from "@/src/types/index";
export const AVAILABLE_MODELS: ModelMeta[] = [
  {
    id: "unsloth/gemma-4-E2B-it-qat-GGUF",
    org: "unsloth",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/62ecdc18b72a69615d6bd857/E4lkPz1TZNLzIFr_dR273.png",
    name: "Gemma 4 E2B - IT QAT ",
    description:
      "Gemma 4 family optimized with Quantization-Aware Training (QAT)",
    size: 2.19,
    ramRequiredGB: 5,
    downloadUrl:
      "https://huggingface.co/unsloth/gemma-4-E2B-it-qat-GGUF/resolve/main/gemma-4-E2B-it-qat-UD-Q2_K_XL.gguf",
    fileName: "gemma-4-E2B-it-qat-GGUF",
    nGpuLayers: 99,
    nCtx: 2048,
  },
  {
    id: "bartowski/gemma3-1b-q6k",
    org: "Bartowski",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/6435718aaaef013d1aec3b8b/XKf-8MA47tjVAM6SCX0MP.jpeg",
    name: "Gemma 3 1B - Q6K",
    description: "Near-perfect quality",
    size: 1.01,
    ramRequiredGB: 4,
    downloadUrl:
      "https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF/resolve/main/google_gemma-3-1b-it-Q6_K.gguf",
    fileName: "gemma-3-1b-it-Q6_K.gguf",
    nGpuLayers: 99,
    nCtx: 2048,
  },
  {
    id: "bartowski/gemma3-1b-q4km",
    org: "Bartowski",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/6435718aaaef013d1aec3b8b/XKf-8MA47tjVAM6SCX0MP.jpeg",
    name: "Gemma 3 1B - Q4KM",
    description: "Best balance of quality and speed.",
    size: 0.81,
    ramRequiredGB: 3,
    downloadUrl:
      "https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF/resolve/main/google_gemma-3-1b-it-Q4_K_M.gguf",
    fileName: "gemma-3-1b-it-Q4_K_M.gguf",
    nGpuLayers: 99,
    nCtx: 2048,
  },
  {
    id: "bartowski/gemma3-1b-q3kxl",
    org: "Bartowski",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/6435718aaaef013d1aec3b8b/XKf-8MA47tjVAM6SCX0MP.jpeg",
    name: "Gemma 3 1B - Q3KXL",
    description:
      "For devices with limited RAM. Keeps key layers at high precision.",
    size: 0.75,
    ramRequiredGB: 2.5,
    downloadUrl:
      "https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF/resolve/main/google_gemma-3-1b-it-Q3_K_XL.gguf",
    fileName: "gemma-3-1b-it-Q3_K_XL.gguf",
    nGpuLayers: 99,
    nCtx: 2048,
  },
  {
    id: "unsloth/Qwen3.5-4B-MTP-GGUF",
    org: "unsloth",
    logo_url:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/62ecdc18b72a69615d6bd857/E4lkPz1TZNLzIFr_dR273.png",
    name: "Qwen 3.5 4B - MTP ",
    description: "Qwen 3.5 4B Q4_K_M",
    size: 2.83,
    ramRequiredGB: 5,
    downloadUrl:
      "https://huggingface.co/unsloth/Qwen3.5-4B-MTP-GGUF/resolve/main/Qwen3.5-4B-Q4_K_M.gguf",
    fileName: "qwen3.5-4B-MTP-GGUF",
    nGpuLayers: 99,
    nCtx: 2048,
  },
];
