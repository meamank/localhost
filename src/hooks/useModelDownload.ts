import { useCallback } from "react";
import { ResourceFetcher } from "react-native-executorch";
import { ExpoResourceFetcher } from "react-native-executorch-expo-resource-fetcher";
import { useModel } from "../context/ModelContext";
import { ModelMeta } from "../types";

export function useModelDownload() {
  const { addLocalModel, updateModelStatus, removeLocalModel } = useModel();

  const getModelTotalSize = useCallback(
    async (model: ModelMeta) => {
      const sources = [model.downloadUrl, model.tokenizerUrl];
      if (model.tokenizerConfigUrl) {
        sources.push(model.tokenizerConfigUrl);
      }
      const totalSize = await ExpoResourceFetcher.getFilesTotalSize(...sources);
      return totalSize;
    },
    [updateModelStatus],
  );

  // ─── Download ─────────────────────

  const downloadModel = useCallback(
    async (model: ModelMeta) => {
      if (!model?.downloadUrl) {
        console.warn(`[useModelDownload] No downloadUrl for model ${model.id}`);
        return;
      }

      try {
        updateModelStatus(model.id, "downloading", 0);

        // fetcher takes an array of urls for parallel downloading of .pte and tokenizer and config(if avaliable)
        const sources = [model.downloadUrl, model.tokenizerUrl];
        if (model.tokenizerConfigUrl) {
          sources.push(model.tokenizerConfigUrl);
        }

        const localPaths = await ResourceFetcher.fetch(
          (progress) => {
            updateModelStatus(model.id, "downloading", progress);
          },
          ...sources,
        );

        if (localPaths && localPaths.length > 0) {
          const totalSize = await getModelTotalSize(model);
          addLocalModel({
            ...model,
            filePath: localPaths[0],
            tokenizerPath: localPaths[1],
            tokenizerConfigPath:
              sources.length === 3 ? localPaths[2] : undefined,
            status: "downloaded",
            size: totalSize,
          });
        }
      } catch (error) {
        updateModelStatus(model.id, "error");
        console.error(error);
      }
    },
    [addLocalModel, updateModelStatus, getModelTotalSize],
  );

  // ─── Pause ───────────────────────────────────────────────────────────────────

  const pauseDownloading = useCallback(
    async (model: ModelMeta) => {
      const sources = [model.downloadUrl, model.tokenizerUrl];
      if (model.tokenizerConfigUrl) {
        sources.push(model.tokenizerConfigUrl);
      }
      await ExpoResourceFetcher.pauseFetching(...sources);
      updateModelStatus(model.id, "paused");
    },
    [updateModelStatus],
  );

  // ─── Resume ──────────────────────────────────────────────────────────────────

  const resumeDownloading = useCallback(
    async (model: ModelMeta) => {
      const sources = [model.downloadUrl, model.tokenizerUrl];
      if (model.tokenizerConfigUrl) {
        sources.push(model.tokenizerConfigUrl);
      }
      await ExpoResourceFetcher.resumeFetching(...sources);
      updateModelStatus(model.id, "downloaded");
    },
    [updateModelStatus],
  );

  // ─── Cancel ──────────────────────────────────────────────────────────────────

  const cancelDownloading = useCallback(
    async (model: ModelMeta) => {
      const sources = [model.downloadUrl, model.tokenizerUrl];
      if (model.tokenizerConfigUrl) {
        sources.push(model.tokenizerConfigUrl);
      }
      await ExpoResourceFetcher.cancelFetching(...sources);
      updateModelStatus(model.id, "not downloaded");
    },
    [updateModelStatus],
  );

  const deleteDownloaded = useCallback(
    async (model: ModelMeta) => {
      const sources = [model.downloadUrl, model.tokenizerUrl];
      if (model.tokenizerConfigUrl) {
        sources.push(model.tokenizerConfigUrl);
      }
      await ExpoResourceFetcher.deleteResources(...sources);
      await removeLocalModel(model.id);
    },
    [removeLocalModel],
  );

  return {
    downloadModel,
    cancelDownloading,
    pauseDownloading,
    resumeDownloading,
    deleteDownloaded,
  };
}
