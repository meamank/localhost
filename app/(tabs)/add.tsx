import {
  View,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@expo/ui/community/picker";
import { useState } from "react";
import { useColorScheme } from "@/src/components/useColorScheme";
import m3 from "@/src/constants/m3";
import { Icon } from "@/src/components/Icon";
import { useAttachment } from "@/src/hooks/useAttachment";
import { useChat } from "@/src/hooks/useChat";
import ExtractedResult from "@/src/components/finance/ExtractedResult";

export const BANKS = ["SBI", "HDFC", "ICICI", "YES BANK"];

export default function AddScreen({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState("SBI");
  const [isLoading, setIsLoading] = useState(false);
  const { pickAttachment, removeAttachment, attachment } = useAttachment();
  const { sendMessage, isExtractingText, syntheticMessages } = useChat();

  const colorScheme = useColorScheme();
  const theme = m3[colorScheme];

  const handleUploadPdf = async () => {
    try {
      const pickedDoc = await pickAttachment();

      if (pickedDoc?.status === "ready") {
        await sendMessage("", pickedDoc);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (isExtractingText) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8 bg-background-surface">
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="text-sm text-white/50">Extracting text…</Text>
      </View>
    );
  }

  if (syntheticMessages?.length) {
    console.log(syntheticMessages[0].content);
    return (
      <View className="w-full px-6 pb-8 pt-2">
        <ExtractedResult
          syntheticMessages={syntheticMessages}
          onClose={onClose}
        />
      </View>
    );
  }

  return (
    <View className="w-full px-6 pb-8 pt-2">
      <Text
        className="text-title-lg font-semibold mb-6 text-center"
        style={{ color: theme.onSurface }}
      >
        Upload Statements
      </Text>

      <View className="mb-8">
        <View className="flex-row flex-wrap justify-center gap-3">
          {BANKS.map((b) => {
            const isSelected = bank === b;
            return (
              <Pressable
                key={b}
                onPress={() => setBank(b)}
                className="px-4 py-2 rounded-full border border-outline-variant"
                style={{
                  backgroundColor: isSelected ? theme.primary : "transparent",
                  borderColor: isSelected
                    ? theme.primary
                    : theme.outlineVariant,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: isSelected ? theme.onPrimary : theme.onSurface,
                  }}
                >
                  {b}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() => handleUploadPdf()}
        className="py-4 rounded-2xl items-center justify-center flex-row active:opacity-80"
        style={{ backgroundColor: theme.primary }}
      >
        <Icon name="pdf" size={20} color={theme.onPrimary} />
        <Text
          className="text-label-lg font-bold ml-2"
          style={{ color: theme.onPrimary }}
        >
          Select PDF
        </Text>
      </Pressable>
    </View>
  );
}
