import { modelStore } from "../store/modelStorage";
import { useModelStore } from "../store/modelStore";
import { LocalModel } from "../types";

export function useModelSelection() {
  const setActiveModelId = useModelStore((state) => state.setActiveModelId);

  async function selectModel(model: LocalModel) {
    try {
      await modelStore.saveLastModelId(model.id);
      setActiveModelId(model.id);
    } catch (error) {
      console.error("Failed to save selected model", error);
    }
  }

  return { selectModel };
}
