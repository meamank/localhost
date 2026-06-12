import { useModel } from "@/src/context/ModelContext";
import { useState } from "react";
import { Pressable, TextInput, useColorScheme, View } from "react-native";
import { Icon } from "../Icon";
interface ChatInputProps {
  isGenerating: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export default function ChatInput({
  isGenerating,
  onSend,
  onStop,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const { activeModelId } = useModel();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "light" ? "#ffffff" : "#0d0d00";

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View className="px-4 py-3">
      <View className="flex-row rounded-full bg-background-tertiary pl-4 pr-1.5 pt-1.5 pb-1.5 items-center gap-2">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`${activeModelId ? "Ask Anything" : "Load a Model first.."}`}
          placeholderTextColor="#8f8f8f"
          multiline
          maxLength={2000}
          editable={!isGenerating && !!activeModelId}
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
            disabled={!text.trim()}
            className="bg-foreground-primary rounded-full p-1 disabled:opacity-80"
          >
            <Icon name="arrow-up" size={28} color={iconColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
