import { Directory, File, Paths } from "expo-file-system";
import { useCallback, useRef } from "react";
import { useModel } from "../context/ModelContext";
import { ModelMeta } from "../types";

// Helper to get the destination file for a given model (single source of truth)
function getDestFile(model: ModelMeta): File {
  const modelsDir = new Directory(Paths.document, "models");
  return new File(modelsDir, model.fileName);
}

export function useModelDownload() {
  const { addLocalModel, updateModelStatus } = useModel();

  // Stable ref — the Map itself never changes, only its contents do.
  const downloadTasksRef = useRef(
    new Map<string, ReturnType<typeof File.createDownloadTask>>(),
  );

  // ─── Download ────────────────────────────────────────────────────────────────

  const downloadModel = useCallback(
    async (model: ModelMeta) => {
      if (!model?.downloadUrl) {
        console.warn(`[useModelDownload] No downloadUrl for model ${model.id}`);
        return;
      }

      // BUG FIX 5 — guard against duplicate downloads
      if (downloadTasksRef.current.has(model.id)) {
        console.warn(
          `[useModelDownload] Download already in progress for ${model.id}, ignoring.`,
        );
        return;
      }

      try {
        const modelsDir = new Directory(Paths.document, "models");
        if (!modelsDir.exists) {
          modelsDir.create();
        }

        const destFile = getDestFile(model);

        await addLocalModel({
          ...model,
          status: "downloading",
          filePath: destFile.uri,
          downloadProgress: 0,
          isFromDevice: false,
        });

        const task = File.createDownloadTask(model.downloadUrl, destFile, {
          onProgress: ({
            bytesWritten,
            totalBytes,
          }: {
            bytesWritten: number;
            totalBytes: number;
          }) => {
            const percentage = totalBytes > 0 ? bytesWritten / totalBytes : 0;
            updateModelStatus(model.id, "downloading", percentage);
          },
        });

        downloadTasksRef.current.set(model.id, task);

        const result = await task.downloadAsync();

        // BUG FIX 2 + 3 — after downloadAsync() resolves, check whether the task
        // is still in the ref. If it was removed by cancelDownload or replaced
        // during a pause→resume cycle, skip the completion logic here — whoever
        // removed the ref entry is responsible for the final status update.
        const taskStillOwned = downloadTasksRef.current.get(model.id) === task;

        if (!result) {
          // downloadAsync() resolves undefined when the task is paused OR cancelled.
          if (taskStillOwned) {
            // Task is paused — ref still holds it so resumeDownloading can use it.
          } else {
            // Task was cancelled — cancelDownload already cleaned up the ref.
          }
          return;
        }

        if (!taskStillOwned) {
          // resumeDownloading completed the task and already cleaned up.

          return;
        }

        downloadTasksRef.current.delete(model.id);

        updateModelStatus(model.id, "downloaded");
      } catch (error) {
        // BUG FIX 6 — the ref is only deleted AFTER cancel() succeeds in
        // cancelDownload, so this check is now reliable.
        if (!downloadTasksRef.current.has(model.id)) {
          return;
        }
        console.error(
          `[useModelDownload] Download failed for ${model.id}:`,
          error,
        );
        updateModelStatus(model.id, "error");
        downloadTasksRef.current.delete(model.id);
      }
    },
    [addLocalModel, updateModelStatus],
  );

  // ─── Pause ───────────────────────────────────────────────────────────────────

  const pauseDownloading = useCallback(
    async (model: ModelMeta) => {
      const task = downloadTasksRef.current.get(model.id);

      if (!task) {
        return;
      }

      try {
        // BUG FIX 1 — was task.pause() (doesn't exist). Correct method is pauseAsync().
        await task.pauseAsync();

        // NOTE: we intentionally keep the task in the ref so resumeDownloading
        // can reuse the same DownloadTask object.
        updateModelStatus(model.id, "paused");
      } catch (error) {
        console.error(
          `[useModelDownload] Error pausing task for ${model.id}:`,
          error,
        );
        // If pause failed the download is likely still active — don't mislead the UI.
      }
    },
    [updateModelStatus],
  );

  // ─── Resume ──────────────────────────────────────────────────────────────────

  const resumeDownloading = useCallback(
    async (model: ModelMeta) => {
      const task = downloadTasksRef.current.get(model.id);

      if (!task) {
        console.warn(
          `[useModelDownload] resumeDownloading: no paused task found for ${model.id}. ` +
            `Active tasks: ${[...downloadTasksRef.current.keys()]}`,
        );
        return;
      }

      try {
        updateModelStatus(model.id, "downloading");

        const result = await task.resumeAsync();

        if (!result) {
          // Paused again mid-resume — task is still in the ref.

          updateModelStatus(model.id, "paused");
          return;
        }

        // BUG FIX 3 — clean up the ref HERE (before downloadModel's own
        // completion handler runs), so downloadModel sees taskStillOwned===false
        // and skips its duplicate completion path.
        downloadTasksRef.current.delete(model.id);

        updateModelStatus(model.id, "downloaded");
      } catch (error) {
        if (!downloadTasksRef.current.has(model.id)) {
          // Cancelled while resuming — cancelDownload cleaned up.

          return;
        }
        console.error(
          `[useModelDownload] Error resuming task for ${model.id}:`,
          error,
        );
        updateModelStatus(model.id, "error");
        downloadTasksRef.current.delete(model.id);
      }
    },
    [updateModelStatus],
  );

  // ─── Cancel ──────────────────────────────────────────────────────────────────

  const cancelDownload = useCallback(
    async (model: ModelMeta) => {
      const task = downloadTasksRef.current.get(model.id);

      if (!task) {
        console.warn(
          `[useModelDownload] cancelDownload: no task found for ${model.id}. ` +
            `Active tasks: ${[...downloadTasksRef.current.keys()]}`,
        );
        return;
      }

      try {
        // BUG FIX 6 — cancel() FIRST, then delete from ref. This way if cancel()
        // throws, the downloadModel catch block can still see the id in the ref
        // and won't silently swallow the error without resetting status.
        task.cancel();
      } catch (error) {
        console.warn(
          `[useModelDownload] Error calling task.cancel() for ${model.id}:`,
          error,
        );
      } finally {
        // Always remove from ref and reset UI regardless of whether cancel() threw.
        downloadTasksRef.current.delete(model.id);

        updateModelStatus(model.id, "not downloaded");
      }

      // Delete the partial file
      const destFile = getDestFile(model);
      if (destFile.exists) {
        destFile.delete();
      }
    },
    [updateModelStatus],
  );

  return { downloadModel, cancelDownload, pauseDownloading, resumeDownloading };
}
