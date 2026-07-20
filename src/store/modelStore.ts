import Toast from "react-native-toast-message";
import { create } from "zustand";
import { LocalModel } from "../types";
import { modelStore } from "./modelStorage";

interface ModelState {
  //state
  localModels: LocalModel[];
  activeModelId: string | null;
  isInitializing: boolean;

  //Actions
  setIsInitializing: (isInit: boolean) => void;
  setActiveModelId: (id: string | null) => void;
  setLocalModels: (models: LocalModel[]) => void;
  initializeStore: () => void;
  addLocalModel: (model: LocalModel) => Promise<void>;
  removeLocalModel: (id: string) => Promise<void>;
}

export const useModelStore = create<ModelState>((set, get) => ({
  //Initial States
  localModels: [],
  activeModelId: null,
  isInitializing: false,

  //Actions
  setIsInitializing: (isInit) => set({ isInitializing: isInit }),
  setActiveModelId: async (id) => {
    if (id) {
      await modelStore.saveLastModelId(id);
    } else {
      await modelStore.clearLastModelId();
    }
    set({ activeModelId: id });
  },
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
        type: "custom",
        text1: "Failed to load Models from storage",
        props: { type: "error" },
      });
    } finally {
      set({ isInitializing: false });
    }
  },

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
}));

export const useActiveModel = () => {
  return useModelStore(
    (state) =>
      state.localModels.find((model) => model.id === state.activeModelId) ||
      null,
  );
};
