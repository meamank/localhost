import { Directory, File, Paths } from "expo-file-system";
import { useRef } from "react";
import { useModel } from "../context/ModelContext";
import { ModelMeta } from "../types";

export function useModelDownload() {
  const { addLocalModel, updateModelStatus } = useModel();
  const downloadTasksRef = useRef(
    new Map<string, ReturnType<typeof File.createDownloadTask>>(),
  );
  // Start downloading model
  async function downloadModel(model: ModelMeta) {
    if (!model?.downloadUrl) return;

    try {
      const destDir = new Directory(Paths.document);
      const modelsDir = new Directory(destDir, "models");

      if (!modelsDir.exists) {
        modelsDir.create();
      }

      const destFile = new File(modelsDir, model.fileName);

      updateModelStatus(model.id, "downloading", 0);

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

      await task.downloadAsync();

      downloadTasksRef.current.delete(model.id);

      addLocalModel({
        ...model,
        status: "downloaded",
        filePath: destFile.uri,
        isFromDevice: false,
      });
    } catch (error) {
      console.error("Download Failed:", error);
      updateModelStatus(model.id, "error");
      downloadTasksRef.current.delete(model.id);
    }
  }

  // Cancel Downloading

  async function cancelDownload(model: ModelMeta) {
    const task = downloadTasksRef.current.get(model.id);

    if (task) {
      try {
        task.cancel();
      } catch (error) {
        console.warn("Error cancelling task:", error);
      }

      downloadTasksRef.current.delete(model.id);
      updateModelStatus(model.id, "not downloaded");

      // Delete the partial file
      const destDir = new Directory(Paths.document);
      const modelsDir = new Directory(destDir, "models");
      const destFile = new File(modelsDir, model.fileName);

      if (destFile.exists) {
        destFile.delete();
      }
    }
  }

  // Pause Downloading

  async function pauseDownloading(model: ModelMeta) {
    const task = downloadTasksRef.current.get(model.id);

    if (task) {
      try {
        task.pause();
      } catch (error) {
        console.error("Error Pausing task", error);
      }

      updateModelStatus(model.id, "paused");
    }
  }

  // Resume Downloading

  async function resumeDownloading(model: ModelMeta) {
    const task = downloadTasksRef.current.get(model.id);

    if (task) {
      try {
        await task.resumeAsync();
        updateModelStatus(model.id, "downloading");
      } catch (error) {
        console.error("Error resuming task", error);
      }
    }
  }

  return { downloadModel, cancelDownload, pauseDownloading, resumeDownloading };
}
