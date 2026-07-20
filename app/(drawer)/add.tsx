import AddTransaction from "@/src/components/finance/AddTransaction";
import AttachmentType from "@/src/components/finance/AttachmentType";
import ExtractedResult from "@/src/components/finance/ExtractedResult";
import Spacer from "@/src/components/home/Spacer";
import { useColorScheme } from "@/src/components/useColorScheme";
import m3 from "@/src/constants/m3";
import { parseStatement } from "@/src/constants/statementParser";
import { useAttachment } from "@/src/hooks/useAttachment";
import { financeStore } from "@/src/store/financeStore";
import * as PdfTextExtract from "expo-pdf-text-extract";
import { useState } from "react";
import { ActivityIndicator, Text, View, DeviceEventEmitter, TextInput, Pressable } from "react-native";
import Toast from "react-native-toast-message";

const BANKS = ["SBI", "HDFC", "ICICI", "YES BANK"];

export default function AddScreen({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState("SBI");
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<"menu" | "transaction">("menu");
  const [passwordResolver, setPasswordResolver] = useState<{
    resolve: (pwd: string | null) => void;
  } | null>(null);
  const [pdfPassword, setPdfPassword] = useState("");

  const { pickAttachment } = useAttachment();

  const colorScheme = useColorScheme();
  const theme = m3[colorScheme];

  const promptUserForPassword = (): Promise<string | null> => {
    setVisible(true);
    return new Promise((resolve) => {
      setPasswordResolver({ resolve });
    });
  };

  const handleUploadPdf = async () => {
    try {
      const pickedDoc = await pickAttachment();

      if (pickedDoc?.status === "ready" && pickedDoc.uri) {
        let passwordToUse: string | undefined = undefined;

        if (await PdfTextExtract.isPasswordProtected(pickedDoc.uri)) {
          const pdfPassword = await promptUserForPassword();
          if (!pdfPassword) {
            Toast.show({
              type: "custom",
              text1: "Extraction cancelled.",
              props: { type: "info" },
            });
            return;
          }
          passwordToUse = pdfPassword;
        }

        setIsExtractingText(true);

        // 1. Extract text from PDF deterministically
        const rawText = await PdfTextExtract.extractText(
          pickedDoc.uri,
          passwordToUse,
        );

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

        if (parsed.emis && parsed.emis.length > 0) {
          for (const emi of parsed.emis) {
            await financeStore.addRecurringObligation(emi);
          }
        }

        DeviceEventEmitter.emit("finance_data_updated");

        Toast.show({
          type: "custom",
          text1: `Logged ${parsed.transactions.length} transactions${parsed.emis?.length ? ` and ${parsed.emis.length} EMIs` : ""}!`,
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
      Toast.show({
        type: "custom",
        text1: "Failed to parse PDF statement.",
        props: { type: "error" },
      });
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
    <>
      {visible ? (
        <View className="flex p-6 gap-4">
          <Text className="text-title-md font-bold text-center" style={{ color: theme.onSurface }}>
            Password Required
          </Text>
          <Text className="text-center text-on-surface-variant mb-2">
            This bank statement is encrypted.
          </Text>
          <TextInput
            value={pdfPassword}
            onChangeText={setPdfPassword}
            placeholder="Enter PDF password"
            secureTextEntry
            autoFocus
            className="border rounded-xs w-full h-14 text-body-lg px-4 border-outline"
          />
          <View className="flex-row gap-4 mt-2">
            <Pressable
              className="flex-1 bg-surface-variant border border-outline-variant p-4 rounded-full items-center"
              onPress={() => {
                setVisible(false);
                setPdfPassword("");
                if (passwordResolver) passwordResolver.resolve(null);
              }}
            >
              <Text className="text-on-surface-variant font-bold text-title-md">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-primary p-4 rounded-full items-center"
              onPress={() => {
                setVisible(false);
                const pwd = pdfPassword;
                setPdfPassword("");
                if (passwordResolver) passwordResolver.resolve(pwd);
              }}
            >
              <Text className="text-on-primary font-bold text-title-md">Unlock</Text>
            </Pressable>
          </View>
        </View>
      ) : view === "menu" ? (
        <View className="flex p-6">
          <AttachmentType
            iconName="attachment"
            title="Document"
            onPress={handleUploadPdf}
          />

          <Spacer />
          <AttachmentType
            iconName="new-chat"
            title="Add Transaction"
            onPress={() => setView("transaction")}
          />
        </View>
      ) : (
        <AddTransaction onClose={onClose} />
      )}
    </>
  );
}
