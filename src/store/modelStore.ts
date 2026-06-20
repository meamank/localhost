import { ExpoResourceFetcher } from "react-native-executorch-expo-resource-fetcher";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { AVAILABLE_MODELS } from "../constants/models";
import { LocalModel, ModelConfig, ModelStatus } from "../types";
import { modelStore } from "./modelStorage";

interface ModelState {
  //state
  localModels: LocalModel[];
  activeModelId: string | null;
  isModelready: boolean;
  isInitializing: boolean;
  activeModelConfig: ModelConfig | null;
  modelSizes: Record<string, number>;
  modelStates: Record<string, { progress: number; status: ModelStatus }>;
  //Actions

  setIsInitializing: (isInit: boolean) => void;
  setIsModelReady: (isReady: boolean) => void;
  setActiveModelId: (id: string | null) => void;
  updateModelStatus: (
    id: string,
    status: ModelStatus,
    progress?: number,
  ) => void;
  setLocalModels: (models: LocalModel[]) => void;
  initializeStore: () => void;
  addLocalModel: (model: LocalModel) => Promise<void>;
  removeLocalModel: (id: string) => Promise<void>;
  setModelSizes: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  //Initial States
  localModels: [],
  activeModelId: null,
  isModelready: false,
  isInitializing: false,
  activeModelConfig: null,
  modelSizes: {},
  modelStates: {},

  //Actions

  setIsInitializing: (isInit) => set({ isInitializing: isInit }),
  setIsModelReady: (isReady) => set({ isModelready: isReady }),
  setActiveModelId: (id) => set({ activeModelId: id }),
  setLocalModels: (models) => set({ localModels: models }),
  initializeStore: async () => {
    set({ isInitializing: true });

    try {
      const savedModels = await modelStore.getDownloadedModels();
      const lastActiveModelId = await modelStore.getLastModelId();
      let finalActiveModelId = null;
      if (lastActiveModelId) {
        const exists = savedModels.some(
          (model) => model.id === lastActiveModelId,
        );
        if (exists) {
          finalActiveModelId = lastActiveModelId;
        } else {
          await modelStore.clearLastModelId();
        }
      }

      set({ localModels: savedModels, activeModelId: finalActiveModelId });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to load Models from storage",
      });
    } finally {
      set({ isInitializing: false });
    }

    // get().setModelSizes();
  },
  updateModelStatus: (id, status, progress) =>
    set((state) => ({
      modelStates: {
        ...state.modelStates,
        [id]: {
          status,
          progress: progress ?? state.modelStates[id]?.progress ?? 0,
        },
      },
    })),
  addLocalModel: async (model) => {
    const currentModels = get().localModels;

    const exists = currentModels.some((m) => m.id === model.id);

    const updated = exists
      ? currentModels.map((m) => (m.id === model.id ? model : m))
      : [...currentModels, model];

    await modelStore.saveDownloadedModels(updated);

    set({ localModels: updated });
  },
  removeLocalModel: async (id) => {
    const updated = get().localModels.filter((model) => model.id !== id);

    await modelStore.saveDownloadedModels(updated);

    if (get().activeModelId === id) {
      await modelStore.clearLastModelId();
      set({ localModels: updated, activeModelId: null });
    } else {
      set({ localModels: updated });
    }
  },

  setModelSizes: async () => {
    const cachedSizes = await modelStore.getModelSizes();
    set({ modelSizes: cachedSizes });

    const remainingModels = AVAILABLE_MODELS.filter(
      (model) => !cachedSizes[model.id],
    );
    if (remainingModels.length === 0) {
      console.log("serving from cache");
    }
    if (remainingModels.length > 0) {
      console.log("getting remaining sizes");
      const BATCH_SIZE = 3;
      let currentSizes = { ...cachedSizes };

      for (let i = 0; i < remainingModels.length; i += BATCH_SIZE) {
        const batch = remainingModels.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (model) => {
            try {
              const sources = [model.downloadUrl, model.tokenizerUrl];
              if (model.tokenizerConfigUrl) {
                sources.push(model.tokenizerConfigUrl);
              }
              const size = await ExpoResourceFetcher.getFilesTotalSize(
                ...sources,
              );
              currentSizes[model.id] = size;
            } catch (e) {
              console.warn(
                `[ModelContext] Failed to fetch size for ${model.id}`,
                e,
              );
            }
          }),
        );

        await modelStore.saveModelSizes(currentSizes);

        set({ modelSizes: currentSizes });
      }
    }
  },
}));

export const useActiveModel = () => {
  return useModelStore(
    (state) =>
      state.localModels.find((model) => model.id === state.activeModelId) ||
      null,
  );
};
