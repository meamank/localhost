import * as Device from "expo-device";
import { File, Paths } from "expo-file-system";
import { LlamaContext } from "llama.rn";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { modelStore } from "../store/modelStore";
import { LocalModel, ModelStatus } from "../types";

interface ModelContextType {
  localModels: LocalModel[];
  activeModelId: string | null;
  llamaContextRef: React.RefObject<LlamaContext | null>;
  isInitializing: boolean;
  deviceInfo: { totalRam: number; freeStorage: number } | null;
  setIsInitializing: (isInit: boolean) => void;

  addLocalModel: (model: LocalModel) => Promise<void>;
  removeLocalModel: (id: string) => Promise<void>;
  updateModelStatus: (
    id: string,
    status: ModelStatus,
    progress?: number,
  ) => void;
  setActiveModelId: (id: string) => void;
  releaseModel: () => Promise<void>;
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

  const [deviceInfo, setDeviceInfo] = useState<{
    totalRam: number;
    freeStorage: number;
  } | null>(null);

  const llamaContextRef = useRef<LlamaContext | null>(null);

  // Update Model Status

  const updateModelStatus = (
    id: string,
    status: ModelStatus,
    progress?: number,
  ) => {
    setLocalModels((prev) =>
      prev.map((model) =>
        model.id === id
          ? { ...model, status, downloadProgress: progress }
          : model,
      ),
    );
  };

  // Add Local Model

  const addLocalModel = async (model: LocalModel) => {
    const updated = [...localModels, model];
    setLocalModels(updated);

    await modelStore.saveDownloadedModels(updated);
  };

  // Release Model to free RAM

  const releaseModel = async () => {
    if (llamaContextRef.current) {
      await llamaContextRef.current.release();
      llamaContextRef.current = null;
    }
    setActiveModelId(null);
  };

  // Delete local model

  const removeLocalModel = async (id: string) => {
    if (activeModelId === id) {
      await releaseModel();
    }

    const model = localModels.find((model) => model.id === id);

    if (model?.filePath) {
      const file = new File(model.filePath);
      if (file.exists) {
        file.delete();
      }
    }

    const updated = localModels.filter((model) => model.id !== id);
    setLocalModels(updated);
    await modelStore.saveDownloadedModels(updated);
  };

  // set active Model used for chat

  const setActiveModel = async (id: string) => {
    setActiveModelId(id);
    await modelStore.saveLastModelId(id);

    //Todo
  };

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        const savedModels = await modelStore.getDownloadedModels();
        setLocalModels(savedModels);

        const lastActiveModel = await modelStore.getLastModelId();

        if (lastActiveModel) {
          setActiveModelId(lastActiveModel);
        }

        //Get RAM details

        const ramBytes = Device.totalMemory || 0;
        const ramGB = ramBytes / (1024 * 1024 * 1024);

        const freeDiskBytes = Paths.availableDiskSpace;
        const freeDiskGB = freeDiskBytes / (1024 * 1024 * 1024);

        setDeviceInfo({
          totalRam: ramGB,
          freeStorage: freeDiskGB,
        });
      } catch (error) {
        console.error("Failed to initialize");
      }
    };
    initializeStorage();
  }, []);

  return (
    <ModelContext.Provider
      value={{
        localModels,
        activeModelId,
        llamaContextRef,
        isInitializing,
        deviceInfo,
        setIsInitializing,
        addLocalModel,
        removeLocalModel,
        updateModelStatus,
        setActiveModelId,
        releaseModel,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}
