import * as Device from "expo-device";
import { File, Paths } from "expo-file-system";
import { initLlama, LlamaContext } from "llama.rn";
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
          ? {
              ...model,
              status,
              ...(progress !== undefined && { downloadProgress: progress }),
            }
          : model,
      ),
    );
  };

  // Add Local Model

  const addLocalModel = async (model: LocalModel) => {
    setLocalModels((prev) => {
      const updated = [...prev, model];
      modelStore.saveDownloadedModels(updated);
      return updated;
    });
  };

  // Release Model to free RAM

  const releaseModel = async () => {
    console.log("Model released: ", activeModelId);
    if (llamaContextRef.current) {
      await llamaContextRef.current.release();
      llamaContextRef.current = null;
    }
    console.log("in release model: Context Status", llamaContextRef.current);
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

    setLocalModels((prev) => {
      const updated = prev.filter((model) => model.id !== id);
      modelStore.saveDownloadedModels(updated);
      return updated;
    });
  };

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setIsInitializing(true);
        let savedModels = await modelStore.getDownloadedModels();
        const lastActiveModel = await modelStore.getLastModelId();

        if (lastActiveModel) {
          const modelToInit = savedModels.find((m) => m.id === lastActiveModel);
          if (modelToInit && modelToInit.filePath) {
            try {
              const ctx = await initLlama({
                model: modelToInit.filePath,
                n_gpu_layers: modelToInit.nGpuLayers,
                n_ctx: modelToInit.nCtx,
              });
              llamaContextRef.current = ctx;

              // Set status to ready
              savedModels = savedModels.map((m) =>
                m.id === lastActiveModel ? { ...m, status: "ready" } : m,
              );
              setActiveModelId(lastActiveModel);
            } catch (err) {
              console.error("Failed to auto-init model on boot:", err);
              // Fallback to downloaded state
              savedModels = savedModels.map((m) =>
                m.id === lastActiveModel ? { ...m, status: "downloaded" } : m,
              );
              setActiveModelId(null);
            }
          } else {
            setActiveModelId(null);
          }
        }

        setLocalModels(savedModels);

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
