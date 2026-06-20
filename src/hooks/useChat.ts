import { extractText, isAvailable } from "expo-pdf-text-extract";
import React, { useEffect, useRef, useState } from "react";
import { models, useLLM, useOCR } from "react-native-executorch";
import Toast from "react-native-toast-message";
import {
  FINANCE_TOOLS,
  createFinanceToolHandler,
} from "../constants/FinanceTools";
import { parseStatement } from "../constants/statementParser";
import { useActiveModel, useModelStore } from "../store/modelStore";
import { Message } from "../types";
import { Attachment } from "./useAttachment";
import { useFinance } from "./useFinance";

export function useChat() {
  const activeModelId = useModelStore((state) => state.activeModelId);

  const activeModel = useActiveModel();

  const attachmentMapRef = useRef<Map<number, Attachment>>(new Map());

  const [isExtractingText, setIsExtractingText] = useState(false);

  //OCR

  const ocr = useOCR({
    model: models.ocr.craft({ language: "en" }),
  });

  //LLM
  const {
    messageHistory,
    response,
    isGenerating,
    isReady,
    sendMessage,
    getGeneratedTokenCount,
    getPromptTokenCount,
    getTotalTokenCount,
    interrupt,
    deleteMessage,
    configure,
  } = useLLM({
    preventLoad: !activeModel,
    model: {
      modelName: (activeModel?.id || "") as any,
      modelSource: activeModel?.filePath
        ? `file://${activeModel.filePath}`
        : "",
      tokenizerSource: activeModel?.tokenizerPath
        ? `file://${activeModel.tokenizerPath}`
        : "",
      tokenizerConfigSource: activeModel?.tokenizerConfigPath
        ? `file://${activeModel.tokenizerConfigPath}`
        : "",
    },
  });

  const [syntheticMessages, setSyntheticMessages] = useState<
    { id: string; role: "assistant"; content: string; timestamp: number }[]
  >([]);

  const {
    addExpense,
    queryExpenses,
    getSpendingSummary,
    bulkInsertFromStatement,
  } = useFinance();

  useEffect(() => {
    if (isReady && activeModelId) {
      const systemPrompt = `You are Nirvah, a helpful personal finance assistant. Current date: ${new Date().toISOString().split("T")[0]}. When the user mentions a single expense, use the log_expense tool to record it. When asked about past spending or specific categories, you MUST use the query_expenses or get_spending_summary tools to fetch real data from the database. NEVER guess, and NEVER tell the user you need to look it up—just use the tools immediately. When listing transactions, format them strictly as a
  Markdown table. /no_think`;

      const financeToolHandler = createFinanceToolHandler({
        addExpense,
        queryExpenses,
        getSpendingSummary,
      });

      const configToApply: any = {
        chatConfig: {
          systemPrompt,
        },
        toolsConfig: {
          tools: FINANCE_TOOLS,
          executeToolCallback: financeToolHandler,
          displayToolCalls: false,
        },
      };

      try {
        configure(configToApply);
        console.log("[useChat] Configured with finance tools");
      } catch (e) {
        console.log(
          "Skipping configuration, model is likely unloading or not fully loaded:",
          e,
        );
      }
    }
  }, [
    isReady,
    activeModelId,
    configure,
    addExpense,
    queryExpenses,
    getSpendingSummary,
  ]);

  // sends reply
  const sendUserMessage = async (content: string, media?: Attachment) => {
    if (!isReady || isGenerating) return;

    if (media) {
      const nextIndex = messageHistory.length;
      attachmentMapRef.current.set(nextIndex, media);

      if (media.type === "image") {
        try {
          setIsExtractingText(true);
          console.log("Starting OCR Text extraction");

          const detections = await ocr.forward(media.uri);
          const extractedText = detections
            .sort((a, b) => a.bbox.y1 - b.bbox.y1)
            .map((d) => d.text)
            .join(" ");

          console.log("OCR Result: ", extractedText);
          const augmentedPrompt = `[Extracted Document Text]:\n${extractedText}\n\n[User Request]:\n${content || "Log this receipt."}`;

          await sendMessage(augmentedPrompt);
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "[useChat] OCR Extraction failed",
          });
        } finally {
          setIsExtractingText(false);
        }
      } else if (media.type === "document") {
        try {
          setIsExtractingText(true);
          console.log("[useChat] Starting native PDF extraction...");

          if (!isAvailable()) {
            Toast.show({ type: "error", text1: "Platform Not supported" });
            setIsExtractingText(false);
            return;
          }

          const rawText = await extractText(media.uri);
          console.log(
            "[useChat] PDF Result:",
            rawText.substring(0, 100) + "...",
          );

          const parseResult = parseStatement(rawText);

          if (parseResult.transactions.length === 0) {
            Toast.show({
              type: "error",
              text1: "No transactions found in this document.",
            });
            setIsExtractingText(false);
            return;
          }

          const { inserted, duplicates } = await bulkInsertFromStatement(
            parseResult.transactions,
          );

          const summary =
            `✅ Added ${inserted} transactions from ${parseResult.bank} card ending in ${parseResult.cardLast4}.` +
            (duplicates > 0 ? ` (${duplicates} duplicates skipped)` : "");

          Toast.show({
            type: "success",
            text1: "Import Complete",
            text2: `${inserted} imported, ${duplicates} skipped`,
          });

          setSyntheticMessages((prev) => [
            ...prev,
            {
              id: `synth_${Date.now()}`,
              role: "assistant",
              content: summary,
              timestamp: Date.now(),
            },
          ]);
        } catch (error) {
          console.error("[useChat] PDF Parsing Crash:", error);
          Toast.show({
            type: "error",
            text1: "Failed to process the bank statement.",
          });
        } finally {
          setIsExtractingText(false);
        }
      } else {
        try {
          await (
            sendMessage as (
              msg: string,
              media?: { imagePath?: string },
            ) => Promise<string>
          )(content, { imagePath: media.uri });
        } catch (error) {
          Toast.show({ type: "error", text1: "Failed to send media to model" });
        }
      }
    } else {
      await sendMessage(content);
    }
  };

  // stop generating reply
  const stopGeneration = () => {
    if (isGenerating) {
      interrupt();
    }
  };

  // clear chat
  function clearChat() {
    if (isGenerating) {
      stopGeneration();
    }
    deleteMessage(0); // Deletes all messages starting from index 0
  }

  // Returns the number of tokens generated so far in the current generation.

  const generatedTokensCount = () => {
    return getGeneratedTokenCount();
  };

  //Returns the number of prompt tokens in the last message.
  const promptTokenCount = () => {
    return getPromptTokenCount();
  };

  // Returns the number of total tokens from the previous generation.
  // This is a sum of prompt tokens and generated tokens.

  const totalTokenCount = () => {
    return getTotalTokenCount();
  };

  // Message History and append streaming response
  const baseMessages: Message[] = React.useMemo(() => {
    const historyMsgs = messageHistory.map((msg, idx) => ({
      id: `msg_${idx}`,
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
      timestamp: Date.now(),
      ...(attachmentMapRef.current.has(idx)
        ? { media: attachmentMapRef.current.get(idx) }
        : {}),
    }));

    // Merge synthetic messages into history by timestamp logic if needed,
    // or just append them. We'll append them for now and sort by timestamp
    const allMsgs = [...historyMsgs, ...syntheticMessages];
    allMsgs.sort((a, b) => a.timestamp - b.timestamp);

    return allMsgs;
  }, [messageHistory, syntheticMessages]);

  const messages: Message[] = React.useMemo(() => {
    const list = [...baseMessages];
    if (isGenerating && response) {
      list.push({
        id: "streaming_response",
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        isStreaming: true,
      });
    }
    return list;
  }, [baseMessages, isGenerating, response]);

  useEffect(() => {
    if (!isGenerating && response) {
      console.log(
        "[useChat] Final model response (after generation):",
        JSON.stringify(response),
      );
    }
  }, [isGenerating]);

  return {
    messages,
    isGenerating,
    isExtractingText,
    sendMessage: sendUserMessage,
    stopGeneration,
    clearChat,
    isReady,
    response,
    generatedTokensCount,
    promptTokenCount,
    totalTokenCount,
  };
}
