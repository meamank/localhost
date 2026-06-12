import { initLlama } from "llama.rn";
import { useModel } from "../context/ModelContext";
import { modelStore } from "../store/modelStore";
import { LocalModel } from "../types";

export function useModelInit() {
  const {
    releaseModel,
    setActiveModelId,
    updateModelStatus,
    setIsInitializing,
    llamaContextRef,
  } = useModel();

  async function initModel(model: LocalModel) {
    console.log("Initializing");
    setIsInitializing(true);
    await releaseModel();
    updateModelStatus(model.id, "initializing");

    try {
      const ctx = await initLlama({
        model: model.filePath,
        n_gpu_layers: model.nGpuLayers,
        n_ctx: model.nCtx,
      });

      llamaContextRef.current = ctx;
      await modelStore.saveLastModelId(model.id);
      updateModelStatus(model.id, "ready");
      setActiveModelId(model.id);
      setIsInitializing(false);
    } catch (error) {
      llamaContextRef.current = null;
      updateModelStatus(model.id, "error");
      setIsInitializing(false);
    }
  }

  return { initModel };
}
