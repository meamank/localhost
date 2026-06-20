import { useCallback, useRef } from "react";
import Toast from "react-native-toast-message";

import { ExpoResourceFetcher } from "react-native-executorch-expo-resource-fetcher";

import { useModelStore } from "../store/modelStore";
import { ModelMeta } from "../types";

export function useModelDownload() {
  const addLocalModel = useModelStore((state) => state.addLocalModel);
  const removeLocalModel = useModelStore((state) => state.removeLocalModel);
  const updateModelStatus = useModelStore((state) => state.updateModelStatus);
  const lastProgressMap = useRef<
    Record<string, { time: number; progress: number }>
  >({});

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
        lastProgressMap.current[model.id] = { time: Date.now(), progress: 0 };

        // fetcher takes an array of urls for parallel downloading of .pte and tokenizer and config(if avaliable)
        const sources = [model.downloadUrl, model.tokenizerUrl];
        if (model.tokenizerConfigUrl) {
          sources.push(model.tokenizerConfigUrl);
        }

        let downloadDone = false;
        let lastReportedPercent = -1;
        let lastReportTime = Date.now();
        const MS_PER_FRAME = 16;

        updateModelStatus(model.id, "downloading", 0);

        const result = await ExpoResourceFetcher.fetch(
          (progress) => {
            const currentPercent = Math.floor(progress * 100);
            if (
              !downloadDone &&
              currentPercent !== lastReportedPercent &&
              lastReportTime + MS_PER_FRAME < Date.now()
            ) {
              lastReportedPercent = currentPercent;
              lastReportTime = Date.now();
              updateModelStatus(model.id, "downloading", progress);
            }
          },
          ...sources,
        );

        // ExpoResourceFetcher.fetch returns { paths, wasDownloaded }
        const paths = Array.isArray(result) ? result : result?.paths;

        if (paths && paths.length > 0) {
          const currentState = useModelStore.getState().modelStates[model.id];
          if (
            currentState &&
            (currentState.status === "not downloaded" ||
              currentState.status === "error" ||
              currentState.status === "paused")
          ) {
            // Download was interrupted, don't mark as downloaded
            return;
          }
          downloadDone = true;
          updateModelStatus(model.id, "downloaded", 1);

          const totalSize = await getModelTotalSize(model);
          addLocalModel({
            ...model,
            filePath: paths[0],
            tokenizerPath: paths[1],
            tokenizerConfigPath: sources.length === 3 ? paths[2] : undefined,
            status: "downloaded",
            size: totalSize,
          });
        }
      } catch (error: any) {
        const isCancelled =
          error?.message?.includes("canceled") ||
          error?.message?.includes("interrupted") ||
          error?.message?.includes("canceled"); // 'canceled' is used by Expo
          
        if (isCancelled) {
          Toast.show({
            type: "info",
            text1: "Download Canceled",
          });
        } else {
          updateModelStatus(model.id, "error");
          Toast.show({
            type: "error",
            text1: "Download failed",
            text2: error?.message || "An unexpected error occurred",
          });
        }
      }
    },
    [addLocalModel, updateModelStatus, getModelTotalSize],
  );

  // ─── Pause ───────────────────────────────────────────────────────────────────

  const pauseDownloading = useCallback(
    async (model: ModelMeta) => {
      updateModelStatus(model.id, "paused");
      try {
        const sources = [model.downloadUrl, model.tokenizerUrl];
        if (model.tokenizerConfigUrl) {
          sources.push(model.tokenizerConfigUrl);
        }
        await ExpoResourceFetcher.pauseFetching(...sources);
      } catch (e) {
        console.warn("Failed to pause fetching", e);
      }
    },
    [updateModelStatus],
  );

  // ─── Resume ──────────────────────────────────────────────────────────────────

  const resumeDownloading = useCallback(
    async (model: ModelMeta) => {
      updateModelStatus(model.id, "downloading");
      try {
        const sources = [model.downloadUrl, model.tokenizerUrl];
        if (model.tokenizerConfigUrl) {
          sources.push(model.tokenizerConfigUrl);
        }
        await ExpoResourceFetcher.resumeFetching(...sources);
      } catch (e) {
        console.warn("Failed to resume fetching", e);
      }
    },
    [updateModelStatus],
  );

  // ─── Cancel ──────────────────────────────────────────────────────────────────

  const cancelDownloading = useCallback(
    async (model: ModelMeta) => {
      updateModelStatus(model.id, "not downloaded");
      try {
        const sources = [model.downloadUrl, model.tokenizerUrl];
        if (model.tokenizerConfigUrl) {
          sources.push(model.tokenizerConfigUrl);
        }
        await ExpoResourceFetcher.cancelFetching(...sources);
      } catch (e) {
        console.warn("Failed to cancel fetching", e);
      }
    },
    [updateModelStatus],
  );

  const deleteDownloaded = useCallback(
    async (model: ModelMeta) => {
      try {
        const sources = [model.downloadUrl, model.tokenizerUrl];
        if (model.tokenizerConfigUrl) {
          sources.push(model.tokenizerConfigUrl);
        }
        await ExpoResourceFetcher.deleteResources(...sources);
      } catch (e) {
        console.warn("Failed to delete resources", e);
      } finally {
        await removeLocalModel(model.id);
      }
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
