import ChatInput from "@/src/components/chat/ChatInput";
import MessageList from "@/src/components/chat/MessageList";
import { Icon } from "@/src/components/Icon";
import { useColorScheme } from "@/src/components/useColorScheme";
import iconColors from "@/src/constants/IconColors";
import { useModel } from "@/src/context/ModelContext";
import { useChat } from "@/src/hooks/useChat";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
export default function Index() {
  const {
    messages,
    isGenerating,
    isReady,
    sendMessage,
    clearChat,
    stopGeneration,
    generatedTokensCount,
    promptTokenCount,
    totalTokenCount,
  } = useChat();

  const { isInitializing, activeModelId, localModels, setIsModelReady } =
    useModel();

  const colorScheme = useColorScheme();

  const [tokensPerSecond, setTokensPerSecond] = useState(0);

  const activeModel = localModels.find((model) => model.id === activeModelId);
  const activeModelName = activeModel?.name || "Nirvah";

  useEffect(() => {
    setIsModelReady(isReady);
  }, [isReady, setIsModelReady]);

  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isGenerating) {
      if (!startTimeRef.current) startTimeRef.current = performance.now();
    } else {
      if (
        startTimeRef.current &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "assistant"
      ) {
        // Calculate Tokens/Second
        const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
        const generated = generatedTokensCount() || 0;
        const tps =
          elapsedSec > 0 ? parseFloat((generated / elapsedSec).toFixed(2)) : 0;

        setTokensPerSecond(tps);
      }
      startTimeRef.current = null;
    }
  }, [isGenerating]);

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
      <Stack.Screen
        options={{
          title: activeModelName,
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/(drawer)/${activeModelId}`)}
              style={{ paddingRight: 16 }}
            >
              <Icon
                name="settings"
                size={28}
                color={iconColors[colorScheme].primary}
              />
            </Pressable>
          ),
        }}
      />

      <MessageList
        messages={messages}
        activeModelId={activeModelId}
        tokensPerSecond={tokensPerSecond}
      />

      <KeyboardStickyView
        offset={{
          closed: -20,
          opened: 0,
        }}
      >
        <ChatInput
          isGenerating={isGenerating}
          isReady={isReady}
          onSend={sendMessage}
          onStop={stopGeneration}
        />
      </KeyboardStickyView>
    </View>
  );
}
