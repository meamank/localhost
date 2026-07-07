import { initLlama, LlamaContext } from "llama.rn";
import { create } from "zustand";
import { modelStore } from "./modelStorage";

interface LlamaState {
  llamaContext: LlamaContext | null;
  isModelLoading: boolean;
  isModelReady: boolean;
  initModel: (modelPath: string) => Promise<void>;
  releaseModel: () => Promise<void>;
}

export const useLlamaStore = create<LlamaState>((set, get) => ({
  llamaContext: null,
  isModelLoading: false,
  isModelReady: false,

  initModel: async (modelPath) => {
    if (!modelPath) return;

    const existing = get().llamaContext;
    if (existing) {
      console.log(
        "[llamaStore] Releasing previous context before loading new model",
      );
      await existing.release();
      set({ llamaContext: null, isModelReady: false });
    }

    try {
      set({ isModelLoading: true, isModelReady: false });
      console.log("[llamaStore] Loading model:", modelPath);

      const context = await initLlama({
        model: modelPath,
        use_mlock: true,
        n_gpu_layers: 99,
        n_ctx: 2048,
      });

      console.log("[llamaStore] Model loaded successfully");
      set({ llamaContext: context, isModelReady: true });
    } catch (error) {
      console.error("[llamaStore] Failed to load model:", error);
      set({ llamaContext: null, isModelReady: false });
    } finally {
      set({ isModelLoading: false });
    }
  },

  releaseModel: async () => {
    const context = get().llamaContext;

    if (context) {
      console.log("[llamaStore] Releasing model context");
      await context.release();
      set({ llamaContext: null, isModelReady: false });
    }
    await modelStore.clearLastModelId();
  },
}));
