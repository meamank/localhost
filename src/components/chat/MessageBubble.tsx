import iconColors from "@/src/constants/IconColors";
import { Alert, Linking, Text, View } from "react-native";
import type { MarkdownStyle } from "react-native-enriched-markdown";
import { StreamdownText } from "react-native-streamdown";
import { Message } from "../../types";
import { useColorScheme } from "../useColorScheme";

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
  tokensPerSecond?: number;
  input_per_second?: number;
}

export default function MessageBubble({
  message,
  isStreaming,
  tokensPerSecond,
  input_per_second,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";

  const c = iconColors[colorScheme];

  const lightMarkdownStyle: MarkdownStyle = {
    blockquote: {
      backgroundColor: c.backgroundTertiary,
      borderColor: c.border,
    },
    code: { color: c.danger, backgroundColor: c.backgroundTertiary },
    table: {
      headerBackgroundColor: c.backgroundTertiary,
      rowEvenBackgroundColor: c.background,
      rowOddBackgroundColor: c.backgroundTertiary,
      borderColor: c.border,
    },
    list: {
      fontSize: 16,
      bulletColor: c.primary,
      bulletSize: 6,
      markerColor: c.primary,
      gapWidth: 8,
      marginLeft: 20,
      color: c.primary,
    },
  };

  const darkMarkdownStyle: MarkdownStyle = {
    paragraph: { color: c.secondary },
    blockquote: { backgroundColor: c.card, borderColor: c.border },
    code: { color: c.danger, backgroundColor: c.card },
    table: {
      headerBackgroundColor: c.card,
      rowEvenBackgroundColor: c.background,
      rowOddBackgroundColor: c.backgroundSecondary,
      borderColor: c.border,
    },
    list: {
      fontSize: 16,
      bulletColor: c.primary,
      bulletSize: 6,
      markerColor: c.primary,
      gapWidth: 8,
      marginLeft: 20,
      color: c.secondary,
    },
  };

  const handleLinkPress = (url: string) => {
    Alert.alert("Open Link?", url, [
      { text: "Open", onPress: () => Linking.openURL(url) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View
      className={`flex-row ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <View
        className={`${isUser ? "bg-background-tertiary max-w-[280] rounded-2xl px-4 py-3.5" : "bg-background-primary"}`}
      >
        {isUser ? (
          <Text className="text-foreground-primary text-base">
            {message.content}
          </Text>
        ) : (
          <>
            {isStreaming && (
              <Text className="mt-2 text-xs font-medium text-foreground-primary">
                ● Streaming...
              </Text>
            )}
            <StreamdownText
              flavor="github"
              markdown={message.content}
              onLinkPress={({ url }) => handleLinkPress(url)}
              markdownStyle={
                colorScheme === "dark" ? darkMarkdownStyle : lightMarkdownStyle
              }
            />
            {tokensPerSecond !== undefined && tokensPerSecond > 0 && (
              <View className="flex-row border-t border-border mt-2 justify-end">
                <Text className="text-foreground-primary text-sm mt-2">
                  {Math.round(tokensPerSecond)} tokens/s
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}
