import ChatInput from "@/src/components/chat/ChatInput";
import MessageList from "@/src/components/chat/MessageList";
import { Icon } from "@/src/components/Icon";
import { useColorScheme } from "@/src/components/useColorScheme";
import iconColors from "@/src/constants/IconColors";

import { useAttachment } from "@/src/hooks/useAttachment";
import { useChat } from "@/src/hooks/useChat";
import { useLlamaStore } from "@/src/store/llamaStore";
import { useModelStore } from "@/src/store/modelStore";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

export default function ChatScreen() {
  const { pickAttachment, attachment, removeAttachment } = useAttachment();

  const isInitializing = useModelStore((state) => state.isInitializing);
  const activeModelId = useModelStore((state) => state.activeModelId);
  const localModels = useModelStore((state) => state.localModels);

  const colorScheme = useColorScheme();

  const activeModel = localModels.find((model) => model.id === activeModelId);
  const activeModelName = activeModel?.name || "Nirvah";

  const { context } = useLocalSearchParams<{ context: string }>();

  const {
    messages,
    isGenerating,
    isReady,
    sendMessage,
    clearChat,
    stopGeneration,
    isExtractingText,
  } = useChat({ context });

  const [tokensPerSecond, setTokensPerSecond] = useState(0);

  const isModelLoading = useLlamaStore((state) => state.isModelLoading);

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

  if (isInitializing || isModelLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8 bg-background-primary">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-sm text-white/50">
          Loading model into memory…
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 bg-background-primary">
        <Stack.Screen options={stackOptions} />
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Icon
            name="models-tab"
            size={48}
            color={iconColors[colorScheme].primary}
          />
          <Text className="text-lg font-bold text-foreground-primary">
            No Model Active
          </Text>
          <Text className="text-sm text-center text-foreground-secondary">
            Go to the Models tab to select and initialize a model.
          </Text>
        </View>
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
          closed: -30,
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
