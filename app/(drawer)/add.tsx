import ExtractedResult from "@/src/components/finance/ExtractedResult";
import { Icon } from "@/src/components/Icon";
import { useColorScheme } from "@/src/components/useColorScheme";
import m3 from "@/src/constants/m3";
import { parseStatement } from "@/src/constants/statementParser";
import { useAttachment } from "@/src/hooks/useAttachment";
import { financeStore } from "@/src/store/financeStore";
import * as PdfTextExtract from "expo-pdf-text-extract";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const BANKS = ["SBI", "HDFC", "ICICI", "YES BANK"];

export default function AddScreen({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState("SBI");
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);

  const { pickAttachment } = useAttachment();

  const colorScheme = useColorScheme();
  const theme = m3[colorScheme];

  const handleUploadPdf = async () => {
    try {
      const pickedDoc = await pickAttachment();

      if (pickedDoc?.status === "ready" && pickedDoc.uri) {
        setIsExtractingText(true);

        // 1. Extract text from PDF deterministically
        const rawText = await PdfTextExtract.extractText(pickedDoc.uri);

        // 2. Parse the text using Regex (super fast)
        const parsed = parseStatement(rawText);

        // 3. Bulk insert directly into SQLite
        await financeStore.bulkInsertFromStatement(parsed.transactions, {
          bank: parsed.bank !== "UNKNOWN" ? parsed.bank : bank,
          card_last4: parsed.cardLast4,
          billing_period: parsed.billingPeriod || "",
          due_date: parsed.dueDate || "",
          total_due: parsed.totalDue || 0,
        });

        Toast.show({
          type: "success",
          text1: `Successfully logged ${parsed.transactions.length} transactions!`,
        });

        // 4. Update state to show the result UI
        setParseResult({
          totalTransactions: parsed.transactions.length,
          bank: parsed.bank !== "UNKNOWN" ? parsed.bank : bank,
          cardLast4: parsed.cardLast4,
          billingPeriod: parsed.billingPeriod || "",
          dueDate: parsed.dueDate || "",
          totalDue: parsed.totalDue || 0,
        });
      }
    } catch (error) {
      console.error("[AddScreen] Failed to parse PDF:", error);
      Toast.show({ type: "error", text1: "Failed to parse PDF statement." });
    } finally {
      setIsExtractingText(false);
    }
  };

  if (isExtractingText) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8 bg-background-surface">
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="text-sm text-white/50">
          Extracting and parsing text…
        </Text>
      </View>
    );
  }

  if (parseResult) {
    return (
      <View className="w-full px-6 pb-8 pt-2">
        <ExtractedResult
          parseResult={parseResult}
          onClose={() => {
            setParseResult(null);
            onClose();
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex w-full px-6 pb-8 pt-2 items-center gap-2">
      <View className="bg-primary-container p-2 rounded-sm">
        <Icon
          name="attachment"
          size={24}
          color={m3[colorScheme].onPrimaryContainer}
        />
      </View>

      <Text
        className="text-title-md font-semibold mb-6 text-center"
        style={{ color: theme.onSurface }}
      >
        Add Statements
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
        onPress={handleUploadPdf}
        className="py-4 rounded-2xl w-full justify-center flex-row active:opacity-80"
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
