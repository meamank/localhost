import * as DocumentPicker from "expo-document-picker";
import { useRef, useState } from "react";
import Toast from "react-native-toast-message";

export interface Attachment {
  id: string;
  type: "image" | "document";
  uri: string;
  name?: string;
  status: "loading" | "ready";
}

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "heif",
];

export const useAttachment = () => {
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const attachmentRef = useRef<Attachment>(null);
  attachmentRef.current = attachment;

  const getFileType = (extension: string): "image" | "document" => {
    return IMAGE_EXTENSIONS.includes(extension.toLowerCase())
      ? "image"
      : "document";
  };

  const pickAttachment = async () => {
    const fileResult = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf"],
      copyToCacheDirectory: true,
    });

    if (fileResult.canceled || !fileResult.assets[0]) return;

    try {
      const asset = fileResult.assets[0];

      const fileExtension: string = asset.uri.split(".").pop() || "";
      const fileName =
        asset.name?.split(".")[0] ||
        asset.uri.split("/").pop()?.split(".")[0] ||
        "Unnamed";

      const attachmentId = `doc-${Date.now()}`;

      if (fileResult.assets) {
        const newAttachment: Attachment = {
          id: attachmentId,
          type: getFileType(fileExtension),
          uri: asset.uri,
          name: asset.name || fileName,
          status: "ready",
        };
        setAttachment(newAttachment);
        return newAttachment;
      } else {
        Toast.show({
          type: "info",
          text1: "Failed to process document.",
        });
        return null;
      }
    } catch (error) {
      Toast.show({
        type: "info",
        text1: "Error reading document.",
      });
      return null;
    }
  };

  const removeAttachment = (id?: string) => {
    setAttachment(null);
    attachmentRef.current = null;
  };

  return { attachment, pickAttachment, removeAttachment };
};
