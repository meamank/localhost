import ChatInput from "@/src/components/chat/ChatInput";
import MessageList from "@/src/components/chat/MessageList";
import { useColorScheme } from "@/src/components/useColorScheme";
import { useModel } from "@/src/context/ModelContext";
import { useChat } from "@/src/hooks/useChat";
import { Stack } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
export default function Index() {
  // ── All hooks at the top ──────────────────────────────────────────────────
  const { messages, isGenerating, sendMessage, clearChat, stopGeneration } =
    useChat();

  const { isInitializing, activeModelId, localModels } = useModel();

  const colorScheme = useColorScheme();

  const activeModel = localModels.find((model) => model.id === activeModelId);
  const activeModelName = activeModel?.name || "Nirvah";

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
            <Pressable onPress={clearChat} style={{ paddingRight: 16 }}>
              <Text className="bg-background-secondary text-foreground-primary px-2 py-1 rounded-sm text-base">
                Clear
              </Text>
            </Pressable>
          ),
        }}
      />

      <MessageList messages={messages} activeModelId={activeModelId} />

      <KeyboardStickyView
        offset={{
          closed: 0,
          opened: 60,
        }}
      >
        <ChatInput
          isGenerating={isGenerating}
          onSend={sendMessage}
          onStop={stopGeneration}
        />
      </KeyboardStickyView>
    </View>
  );
}
