import ChatInput from "@/src/components/chat/ChatInput";
import MessageList from "@/src/components/chat/MessageList";
import { Icon } from "@/src/components/Icon";
import { useColorScheme } from "@/src/components/useColorScheme";
import iconColors from "@/src/constants/IconColors";

import { useAttachment } from "@/src/hooks/useAttachment";
import { useChat } from "@/src/hooks/useChat";
import { useModelStore } from "@/src/store/modelStore";
import { Stack } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
export default function ChatScreen() {
  const {
    messages,
    isGenerating,
    isReady,
    sendMessage,
    clearChat,
    stopGeneration,
    response,
    generatedTokensCount,
    promptTokenCount,
    totalTokenCount,
    isExtractingText,
  } = useChat();
  const { pickAttachment, attachment, removeAttachment } = useAttachment();

  const isInitializing = useModelStore((state) => state.isInitializing);
  const activeModelId = useModelStore((state) => state.activeModelId);
  const localModels = useModelStore((state) => state.localModels);
  const setIsModelReady = useModelStore((state) => state.setIsModelReady);

  const colorScheme = useColorScheme();

  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const generationStartTimeRef = useRef(0);

  const activeModel = localModels.find((model) => model.id === activeModelId);
  const activeModelName = activeModel?.name || "Nirvah";

  useEffect(() => {
    setIsModelReady(isReady);
  }, [isReady, setIsModelReady]);

  useEffect(() => {
    if (isGenerating) {
      generationStartTimeRef.current = performance.now();
      setTokensPerSecond(0);
    } else if (generationStartTimeRef.current > 0) {
      const elapsed =
        (performance.now() - generationStartTimeRef.current) / 1000;
      const tokens = generatedTokensCount();
      if (elapsed > 0 && tokens > 0) {
        setTokensPerSecond(Math.round(tokens / elapsed));
      }
      generationStartTimeRef.current = 0;
    }
  }, [isGenerating]);

  const stackOptions = useMemo(
    () => ({
      title: activeModelName,
      headerRight: () => (
        <Pressable
          onPress={() => console.log("pressed")}
          style={{ paddingRight: 16 }}
        >
          <Icon
            name="settings"
            size={28}
            color={iconColors[colorScheme].primary}
          />
        </Pressable>
      ),
    }),
    [activeModelName, activeModelId, colorScheme],
  );

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8 bg-background-primary">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-sm text-white/50">Loading model…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-primary">
      <Stack.Screen options={stackOptions} />

      <MessageList
        messages={messages}
        activeModelId={activeModelId}
        tokensPerSecond={tokensPerSecond}
        isExtractingText={isExtractingText}
      />

      <KeyboardStickyView
        offset={{
          closed: -100,
          opened: 0,
        }}
      >
        <View className="flex-row px-3 py-2 gap-2">
          <ChatInput
            isGenerating={isGenerating}
            isReady={isReady}
            onSend={sendMessage}
            onStop={stopGeneration}
            attachment={attachment || undefined}
            removeAttachment={removeAttachment}
            pickAttachment={pickAttachment}
            isExtractingText={isExtractingText}
          />
        </View>
      </KeyboardStickyView>
    </View>
  );
}
