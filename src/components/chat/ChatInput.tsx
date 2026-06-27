import { Attachment } from "@/src/hooks/useAttachment";
import { useModelStore } from "@/src/store/modelStore";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { Icon } from "../Icon";
import AttachmentThumbnail from "./AttachmentThumbnail";

interface ChatInputProps {
  isGenerating: boolean;
  isReady: boolean;
  onSend: (text: string, attachment?: Attachment) => void;
  onStop: () => void;
  attachment?: Attachment;
  removeAttachment?: () => void;
  pickAttachment: () => void;
  isExtractingText?: boolean;
}

export default function ChatInput({
  isGenerating,
  isReady,
  onSend,
  onStop,
  attachment,
  removeAttachment,
  pickAttachment,
  isExtractingText,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const activeModelId = useModelStore((state) => state.activeModelId);
  const colorScheme = useColorScheme();

  const iconColor = colorScheme === "light" ? "#ffffff" : "#0d0d00";
  const spinnerColor = colorScheme === "dark" ? "#ffffff" : "#000000";

  const isLoadingAttachment = attachment?.status !== "ready";

  const handleSend = () => {
    const trimmed = text.trim();
    if ((trimmed || attachment) && !isGenerating && !isExtractingText) {
      onSend(trimmed, attachment);
      setText("");
    }
  };

  const handleAttach = () => {
    pickAttachment();
  };

  return isGenerating ? (
    <View className="flex-1 flex-row justify-end items-center py-1">
      <Pressable
        onPress={onStop}
        className="bg-foreground-primary rounded-full h-12 w-12 items-center justify-center"
      >
        <Icon name="stop" size={24} color={iconColor} />
      </Pressable>
    </View>
  ) : (
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
          disabled={isGenerating || isExtractingText}
        >
          <Text className="text-foreground-primary text-4xl">+</Text>
        </Pressable>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={
            isExtractingText
              ? "Reading file..."
              : isReady
                ? "Ask Anything"
                : "Load a Model first.."
          }
          placeholderTextColor="#8f8f8f"
          multiline
          maxLength={2000}
          editable={isReady && !isGenerating && !isExtractingText}
          className="max-h-32 min-h-11 flex-1 text-base text-foreground-primary"
          onSubmitEditing={handleSend}
        />

        {/* 3-State Action Button Area */}
        <View className="justify-center items-center min-w-10 min-h-10">
          {isExtractingText ? (
            <ActivityIndicator size="small" color={spinnerColor} />
          ) : isGenerating ? (
            <Pressable
              onPress={onStop}
              className="bg-foreground-primary rounded-full p-1"
            >
              <Icon name="stop" size={32} color={iconColor} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() && !attachment}
              className={`bg-foreground-primary rounded-full p-1 ${!text.trim() && !attachment ? "opacity-50" : "opacity-100"}`}
            >
              <Icon name="arrow-up" size={28} color={iconColor} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
