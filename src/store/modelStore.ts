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
    const models = await AsyncStorage.getItem(DOWNLOADED_MODELS_KEY);
    return models != null ? JSON.parse(models) : [];
  },
};
