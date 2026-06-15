import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalModel } from "../types";

const LAST_MODEL_ID = "last_model_id";
const DOWNLOADED_MODELS_KEY = "downloaded_models";

export const modelStore = {
  async saveLastModelId(id: string): Promise<void> {
    return AsyncStorage.setItem(LAST_MODEL_ID, id);
  },

  async getLastModelId(): Promise<string | null> {
    return AsyncStorage.getItem(LAST_MODEL_ID);
  },

  async clearLastModelId(): Promise<void> {
    return AsyncStorage.removeItem(LAST_MODEL_ID);
  },

  async saveDownloadedModels(models: LocalModel[]): Promise<void> {
    const cleaned = models.map((model) => ({
      ...model,
      status: "downloaded" as const,
      downloadProgress: undefined,
      error: undefined,
    }));
    return AsyncStorage.setItem(DOWNLOADED_MODELS_KEY, JSON.stringify(cleaned));
  },

  async getDownloadedModels(): Promise<LocalModel[]> {
    const data = await AsyncStorage.getItem(DOWNLOADED_MODELS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  },

  async saveModelSizes(sizes: Record<string, number>): Promise<void> {
    return AsyncStorage.setItem("model_sizes_cache", JSON.stringify(sizes));
  },

  async getModelSizes(): Promise<Record<string, number>> {
    const data = await AsyncStorage.getItem("model_sizes_cache");
    if (!data) return {};
    return JSON.parse(data);
  },
};
