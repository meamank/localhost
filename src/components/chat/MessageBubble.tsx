import iconColors from "@/src/constants/IconColors";
import React, { useState } from "react";
import { Alert, Image, Linking, Pressable, Text, View } from "react-native";
import type { MarkdownStyle } from "react-native-enriched-markdown";
import { StreamdownText } from "react-native-streamdown";
import { Message } from "../../types";
import { Icon } from "../Icon";

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
  tokensPerSecond?: number;
  isExtractingText?: boolean;
}

const MessageBubble = React.memo(function MessageBubble({
  message,
  isStreaming,
  tokensPerSecond,
  isExtractingText,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);

  const colorScheme = "light";

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

  console.log(message);

  return (
    <View
      className={`flex-row ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <View
        className={`${isUser ? "max-w-[280]" : "bg-background-primary max-w-full"}`}
      >
        {isUser ? (
          <View className="flex-col gap-2 items-end">
            {message.media?.type === "image" && (
              <Image
                source={{ uri: message.media.uri }}
                className="w-20 h-24 rounded-lg"
                resizeMode="cover"
              />
            )}
            {message.media?.type === "document" && (
              <View className="w-20 h-24 bg-background-tertiary rounded-lg justify-center items-center">
                <Text className="text-base text-foreground-secondary font-bold">
                  PDF
                </Text>
              </View>
            )}
            {!!message.content && (
              <View className="bg-background-tertiary px-4 py-3.5 rounded-2xl">
                <Text className="text-foreground-primary text-base">
                  {message.content}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {isExtractingText && (
              <Text className="mt-2 text-xs font-medium text-foreground-primary">
                ● Reading document..
              </Text>
            )}
            {(() => {
              let displayContent = message.content;
              if (typeof displayContent !== "string") {
                displayContent = JSON.stringify(displayContent, null, 2);
              }

              let thoughtContent = null;
              let mainContent = displayContent;

              // 1. Extract and hide <tool_call>...</tool_call> and <|tool_call|>... blocks using regex
              mainContent = mainContent.replace(
                /<\|?tool_call\|?>[\s\S]*?(<\|?\/tool_call\|?>|$)/gi,
                "",
              );

              // Also strip raw JSON block if wrapped in ```json
              mainContent = mainContent.replace(/```json[\s\S]*?```/gi, "");

              // Also strip raw {"name": "query_expenses"...} if it leaked
              const jsonToolStart = mainContent.indexOf('{"name"');
              if (jsonToolStart !== -1 && mainContent.includes("}")) {
                const jsonToolEnd = mainContent.lastIndexOf("}");
                if (jsonToolEnd > jsonToolStart) {
                  mainContent =
                    mainContent.substring(0, jsonToolStart) +
                    mainContent.substring(jsonToolEnd + 1);
                }
              }

              // 2. Extract <think> blocks (Aggressively route everything to thought box until </think> is seen)
              const lowerMain = mainContent.toLowerCase();
              const closingThinkIndex = lowerMain.indexOf("</think>");

              if (closingThinkIndex !== -1) {
                // Found </think>! Everything before is thought, everything after is main response.
                let rawThought = mainContent.substring(0, closingThinkIndex);
                const openingThinkIndex = rawThought
                  .toLowerCase()
                  .indexOf("<think>");
                if (openingThinkIndex !== -1) {
                  rawThought = rawThought.substring(openingThinkIndex + 7);
                }
                thoughtContent = rawThought.trim();
                mainContent = mainContent
                  .substring(closingThinkIndex + 8)
                  .trim();
              } else if (isStreaming) {
                // Streaming but haven't seen </think> yet -> Put EVERYTHING in thought box!
                let rawThought = mainContent;
                const openingThinkIndex = rawThought
                  .toLowerCase()
                  .indexOf("<think>");
                if (openingThinkIndex !== -1) {
                  rawThought = rawThought.substring(openingThinkIndex + 7);
                }
                thoughtContent = rawThought.trim();
                mainContent = ""; // Hide from main chat until </think> appears
              } else {
                // Finished streaming and NEVER saw </think>.
                // Check if there's an opening <think> tag at least.
                const openingThinkIndex = lowerMain.indexOf("<think>");
                if (openingThinkIndex !== -1) {
                  thoughtContent = mainContent
                    .substring(openingThinkIndex + 7)
                    .trim();
                  mainContent = mainContent
                    .substring(0, openingThinkIndex)
                    .trim();
                } else if (mainContent.includes("**Result from")) {
                  // Special fallback: It forgot BOTH tags, but output a tool result.
                  // Everything before the tool result is the thought process!
                  const resultIndex = mainContent.indexOf("**Result from");
                  thoughtContent = mainContent.substring(0, resultIndex).trim();
                  mainContent = mainContent.substring(resultIndex).trim();
                }
              }

              let trimmedMain = mainContent.trim();
              const isThinkingActive =
                isStreaming &&
                thoughtContent !== null &&
                !displayContent.toLowerCase().includes("</think>");

              // Prevent catastrophic regex backtracking in streamdown by wrapping raw JSON in code blocks
              if (
                (trimmedMain.startsWith("{") || trimmedMain.startsWith("[")) &&
                !trimmedMain.includes("```")
              ) {
                trimmedMain = "```json\n" + trimmedMain + "\n```";
              }

              return (
                <>
                  {thoughtContent !== null && (
                    <View className="mb-2 bg-background-tertiary rounded-lg border border-border overflow-hidden min-w-50">
                      <Pressable
                        className="flex-row items-center justify-between p-3"
                        onPress={() => setIsThoughtExpanded(!isThoughtExpanded)}
                      >
                        <Text className="text-foreground-secondary font-medium text-sm">
                          {isThinkingActive
                            ? "● Thinking..."
                            : "Thought Process"}
                        </Text>
                        <Icon
                          name={isThoughtExpanded ? "debit" : "credit"}
                          size={20}
                          color={c.secondary}
                        />
                      </Pressable>
                      {isThoughtExpanded && (
                        <View className="p-3 pt-0 border-t border-border mt-2">
                          <Text className="text-foreground-secondary text-sm leading-5">
                            {thoughtContent}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {trimmedMain ? (
                    <>
                      {isStreaming && !isThinkingActive && (
                        <Text className="mt-2 text-xs font-medium text-foreground-primary">
                          ● Streaming...
                        </Text>
                      )}
                      <StreamdownText
                        flavor="github"
                        markdown={trimmedMain}
                        onLinkPress={({ url }) => handleLinkPress(url)}
                        markdownStyle={
                          colorScheme === "light"
                            ? darkMarkdownStyle
                            : lightMarkdownStyle
                        }
                      />
                    </>
                  ) : null}
                </>
              );
            })()}
            {!isStreaming &&
              tokensPerSecond !== undefined &&
              tokensPerSecond > 0 && (
                <View className="flex-row border-t border-border mt-2 justify-end">
                  <Text className="text-foreground-primary text-sm mt-2">
                    {tokensPerSecond} tokens/s
                  </Text>
                </View>
              )}
          </>
        )}
      </View>
    </View>
  );
});

export default MessageBubble;
