import { useModel } from "@/src/context/ModelContext";
import { Attachment } from "@/src/hooks/useAttachment";
import { useState } from "react";
import { Pressable, Text, TextInput, useColorScheme, View } from "react-native";
import { Icon } from "../Icon";
import AttachmentThumbnail from "./AttachmentThumbnail";
interface ChatInputProps {
  isGenerating: boolean;
  isReady: boolean;
  onSend: (text: string, imagePath?: string, attachment?: Attachment) => void;
  onStop: () => void;
  attachment?: Attachment;
  removeAttachment?: () => void;
  pickAttachment: () => void;
}

export default function ChatInput({
  isGenerating,
  isReady,
  onSend,
  onStop,
  attachment,
  removeAttachment,
  pickAttachment,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const { activeModelId } = useModel();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "light" ? "#ffffff" : "#0d0d00";

  const isLoadingAttachment = attachment?.status !== "ready";

  const handleSend = () => {
    const trimmed = text.trim();
    if (isLoadingAttachment && !trimmed) return;
    onSend(trimmed, attachment?.uri, attachment || undefined);
    setText("");
    removeAttachment?.();
  };

  const handleAttach = () => {
    pickAttachment();
  };

  return (
    <View
      className={`flex-col bg-background-tertiary pl-4 pr-1.5 pt-1.5 pb-1.5 flex-1 ${attachment ? "rounded-2xl" : "rounded-full"}`}
    >
      {attachment && removeAttachment && (
        <View className="mb-2 mt-1 self-start">
          <AttachmentThumbnail
            attachment={attachment}
            onRemove={removeAttachment}
          />
        </View>
      )}
      <View className="flex-row items-center gap-2">
        <Pressable
          className="bg-background-tertiary w-14 h-14 rounded-full justify-center items-center"
          onPress={() => handleAttach()}
        >
          <Text className="text-foreground-primary text-4xl">+</Text>
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`${isReady ? "Ask Anything" : "Load a Model first.."}`}
          placeholderTextColor="#8f8f8f"
          multiline
          maxLength={2000}
          editable={!isGenerating && isReady}
          className="max-h-32 min-h-11 flex-1 text-base text-foreground-primary"
          onSubmitEditing={handleSend}
        />

        {isGenerating ? (
          // Stop button
          <Pressable
            onPress={onStop}
            className="bg-foreground-primary rounded-full p-1"
          >
            <Icon name="stop" size={32} color={iconColor} />
          </Pressable>
        ) : (
          // Send button
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() && !attachment}
            className="bg-foreground-primary rounded-full p-1 disabled:opacity-80"
          >
            <Icon name="arrow-up" size={28} color={iconColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
