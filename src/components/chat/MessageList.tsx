import { Message } from "@/src/types";
import { router } from "expo-router";
import { useRef } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { KeyboardChatScrollView } from "react-native-keyboard-controller";

import { Icon } from "../Icon";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  activeModelId: string | null;
  tokensPerSecond: number;
}

export default function MessageList({
  messages,
  activeModelId,
  tokensPerSecond,
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  const EmptyChat = () => {
    if (activeModelId) {
      // Model is loaded, ready to chat
      return (
        <View className="flex-1 justify-center items-center gap-4">
          <Icon name="chat-ready" size={72} color={["#8f8f8f", "#fff"]} />
          <Text className="text-foreground-primary text-2xl font-medium text-center">
            Model Ready!
          </Text>
          <Text className="text-foreground-tertiary text-base text-center">
            Type a message below to start chatting.
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center gap-6">
        <Icon name="chat-empty" size={72} color="#8f8f8f" />
        <Text className="text-foreground-primary text-3xl font-medium text-center">
          No chats yet...
        </Text>
        <Text className="text-foreground-tertiary text-base text-center">
          Explore wide range of Local On-device AI Models and pick your favorite
          to start your chat.
        </Text>
        <Pressable
          className="bg-primary px-4 py-3 rounded-full"
          onPress={() => router.push("/(tabs)/Models")}
        >
          <Text className="text-foreground-primary text-sm">
            Choose Your Model
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      className="flex-1"
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <MessageBubble
          key={index}
          message={item}
          isStreaming={item.isStreaming}
          tokensPerSecond={index === messages.length - 1 ? tokensPerSecond : undefined}
        />
      )}
      ListEmptyComponent={EmptyChat}
      onContentSizeChange={() => {
        if (messages.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }}
      onLayout={() => {
        if (messages.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }}
      renderScrollComponent={(props) => (
        <KeyboardChatScrollView keyboardLiftBehavior="whenAtEnd" {...props} />
      )}
    />
  );
}
