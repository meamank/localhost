import { useEffect } from "react";
import { useLLM } from "react-native-executorch";
import { useModel } from "../context/ModelContext";
import { Message } from "../types";

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

  useEffect(() => {
    if (isReady && activeModelId) {
      const config = activeModelConfig || {};

      const chatConfig: any = {};
      if (config.systemPrompt) {
        chatConfig.systemPrompt = config.systemPrompt;
      }

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

      const hasChatConfig = Object.keys(chatConfig).length > 0;
      const hasGenConfig = Object.keys(generationConfig).length > 0;

      if (hasChatConfig || hasGenConfig) {
        const configToApply = {
          ...(hasChatConfig && { chatConfig }),
          ...(hasGenConfig && { generationConfig }),
        };

        try {
          configure(configToApply);
        } catch (e) {
          console.log(
            "Skipping configuration, model is likely unloading or not fully loaded:",
            e,
          );
        }
      } else {
        console.log(
          "No custom configuration to apply. Relying on ExecuTorch defaults.",
        );
      }
    }
  }, [isReady, activeModelId, activeModelConfig, configure]);

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
  const messages: Message[] = messageHistory.map((msg, idx) => ({
    id: `msg_${idx}`,
    role: msg.role,
    content: msg.content,
    timestamp: Date.now(),
  }));

  if (isGenerating && response) {
    messages.push({
      id: "streaming_response",
      role: "assistant",
      content: response,
      timestamp: Date.now(),
      isStreaming: true,
    });
  }

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
