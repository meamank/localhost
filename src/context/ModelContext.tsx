import { createContext, useContext, useEffect, useState } from "react";
import { modelStore } from "../store/modelStore";
import { LocalModel, ModelStatus } from "../types";

interface ModelContextType {
  localModels: LocalModel[];
  activeModelId: string | null;
  isInitializing: boolean;
  setIsInitializing: (isInit: boolean) => void;

  isModelReady: boolean;
  setIsModelReady: (isReady: boolean) => void;

  addLocalModel: (model: LocalModel) => Promise<void>;
  updateModelStatus: (
    id: string,
    status: ModelStatus,
    progress?: number,
  ) => void;
  setActiveModelId: (id: string | null) => void;
  removeLocalModel: (id: string) => Promise<void>;
}

const ModelContext = createContext<ModelContextType | null>(null);

export const useModel = (): ModelContextType => {
  const ctx = useContext(ModelContext);

  if (!ctx) throw new Error("useModel must be used inside <ModelProvider>");

  return ctx;
};

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  // Update Model Status

  const updateModelStatus = (
    id: string,
    status: ModelStatus,
    progress?: number,
  ) => {
    setLocalModels((prev) => {
      const exists = prev.some((m) => m.id === id);
      if (!exists) {
        return [
          ...prev,
          {
            id,
            status,
            downloadProgress: progress,
          } as unknown as LocalModel,
        ];
      }

      return prev.map((model) =>
        model.id === id
          ? {
              ...model,
              status,
              ...(progress !== undefined && { downloadProgress: progress }),
            }
          : model,
      );
    });
  };

  // Add Local Model

  const addLocalModel = async (model: LocalModel) => {
    setLocalModels((prev) => {
      // If it exists, replace it
      const exists = prev.some((m) => m.id === model.id);
      const updated = exists
        ? prev.map((m) => (m.id === model.id ? model : m))
        : [...prev, model];
      modelStore.saveDownloadedModels(updated);
      return updated;
    });
  };

  const removeLocalModel = async (id: string) => {
    setLocalModels((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      modelStore.saveDownloadedModels(updated);
      return updated;
    });

    if (activeModelId === id) {
      setActiveModelId(null);
      await modelStore.clearLastModelId();
    }
  };

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setIsInitializing(true);
        // Load the downloaded models list from storage
        const savedModels = await modelStore.getDownloadedModels();
        setLocalModels(savedModels);

        // Remember which model the user had active previously
        const lastActiveModel = await modelStore.getLastModelId();
        if (lastActiveModel) {
          const exists = savedModels.some((m) => m.id === lastActiveModel);
          if (exists) {
            setActiveModelId(lastActiveModel);
          } else {
            await modelStore.clearLastModelId();
          }
        }
      } catch (error) {
        console.error("Failed to load models from storage on boot", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeStorage();
  }, []);

  return (
    <ModelContext.Provider
      value={{
        localModels,
        activeModelId,
        isInitializing,
        setIsInitializing,
        isModelReady,
        setIsModelReady,
        addLocalModel,
        updateModelStatus,
        setActiveModelId,
        removeLocalModel,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}
