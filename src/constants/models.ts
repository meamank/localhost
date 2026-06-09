import { ModelMeta } from "@/src/types/index";
export const AVAILABLE_MODELS: ModelMeta[] = [
  {
    id: "gemma3-1b-q6k",
    name: "Gemma 3 1B · High Quality",
    description: "Near-perfect quality. Best for flagship phones.",
    size: 1.01,
    ramRequiredGB: 4,
    downloadUrl:
      "https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF/resolve/main/google_gemma-3-1b-it-Q6_K.gguf",
    fileName: "gemma-3-1b-it-Q6_K.gguf",
    nGpuLayers: 99,
    nCtx: 2048,
  },
  {
    id: "gemma3-1b-q4km",
    name: "Gemma 3 1B · Balanced",
    description: "Best balance of quality and speed. Works on most phones.",
    size: 0.81,
    ramRequiredGB: 3,
    downloadUrl:
      "https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf",
    fileName: "gemma-3-1b-it-Q4_K_M.gguf",
    nGpuLayers: 99,
    nCtx: 2048,
  },
  {
    id: "gemma3-1b-q3kxl",
    name: "Gemma 3 1B · Low RAM",
    description:
      "For devices with limited RAM. Keeps key layers at high precision.",
    size: 0.75,
    ramRequiredGB: 2.5,
    downloadUrl:
      "https://huggingface.co/bartowski/google_gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q3_K_XL.gguf",
    fileName: "gemma-3-1b-it-Q3_K_XL.gguf",
    nGpuLayers: 99,
    nCtx: 2048,
  },
  {
    id: "gemma3-1b-qat-q4",
    name: "Gemma 3 1B · QAT",
    description:
      "Google's quantization-aware trained version. Same size, noticeably smarter.",
    size: 0.72,
    ramRequiredGB: 3,
    downloadUrl:
      "https://huggingface.co/bartowski/google_gemma-3-1b-it-qat-GGUF/resolve/main/google_gemma-3-1b-it-qat-Q4_K_M.gguf",
    fileName: "gemma-3-1b-it-qat-q4_k_m.gguf",
    nGpuLayers: 99,
    nCtx: 2048,
  },
];
