import React, { useEffect } from "react";
import { useLLM } from "react-native-executorch";
import {
  FINANCE_TOOLS,
  createFinanceToolHandler,
} from "../constants/FinanceTools";
import { useModel } from "../context/ModelContext";
import { Message } from "../types";
import { useFinance } from "./useFinance";

export function useChat() {
  const { localModels, activeModelId, activeModelConfig } = useModel();

  const activeModel = localModels.find((model) => model.id === activeModelId);

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

  const { addExpense, queryExpenses } = useFinance();

  useEffect(() => {
    if (isReady && activeModelId) {
      const config = activeModelConfig || {};

      const systemPrompt =
        config.systemPrompt ||
        `You are Nirvah, a helpful personal finance assistant. Current date: ${new Date().toISOString().split("T")[0]}. When the user mentions spending money, use the log_expense tool to record it. When asked about past spending, use query_expenses. /no_think`;

      const generationConfig: any = {};
      if (config.temperature !== undefined) {
        generationConfig.temperature = config.temperature;
      }
      if (config.topP !== undefined) {
        generationConfig.topP = config.topP;
      }
      if (config.repetitionPenalty !== undefined) {
        generationConfig.repetitionPenalty = config.repetitionPenalty;
      }

      const hasGenConfig = Object.keys(generationConfig).length > 0;

      const financeToolHandler = createFinanceToolHandler({
        addExpense,
        queryExpenses,
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
        ...(hasGenConfig && { generationConfig }),
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
    activeModelConfig,
    configure,
    addExpense,
    queryExpenses,
  ]);

  // sends reply
  const sendUserMessage = async (content: string) => {
    if (!isReady || isGenerating) return;

    await sendMessage(content);
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
    return messageHistory.map((msg, idx) => ({
      id: `msg_${idx}`,
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
      timestamp: 0,
    }));
  }, [messageHistory]);

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
