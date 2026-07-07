import { useState } from "react";
import {
  createFinanceToolHandler,
  FINANCE_TOOLS,
} from "../constants/FinanceTools";
import { financeStore } from "../store/financeStore";
import { useLlamaStore } from "../store/llamaStore";
import { Message } from "../types";

const STOP_WORDS = [
  "</s>",
  "<|end|>",
  "<|eot_id|>",
  "<|end_of_text|>",
  "<|im_end|>",
  "<|EOT|>",
  "<|END_OF_TURN_TOKEN|>",
  "<|end_of_turn|>",
  "<|endoftext|>",
];

const SYSTEM_PROMPT = `You are a finance assistant. You can help the user query their logged expenses and spending summary.
Always output your reasoning process in a <think>...</think> block before calling tools or answering the user.`;

export function useChat() {
  const llamaContext = useLlamaStore((state) => state.llamaContext);
  const isReady = useLlamaStore((state) => state.isModelReady);

  const isExtractingText = false;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toolHandler = createFinanceToolHandler({
    queryExpenses: financeStore.queryExpenses,
    getSpendingSummary: financeStore.getSpendingSummary,
  });

  async function sendMessage(content: string) {
    if (!llamaContext) return;
    if (isGenerating) return;
    if (!content.trim()) return;

    setIsGenerating(true);

    const userMsg: Message = {
      id: `User_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Build the raw conversation history for the model
    const currentConversation = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Inject system prompt if it's a new conversation
    if (messages.length === 0) {
      currentConversation.unshift({ role: "system", content: SYSTEM_PROMPT });
    }

    currentConversation.push({ role: "user", content: userMsg.content });

    try {
      const assistantMsgId = `assistant_${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      let generatedText = "";

      const result = await llamaContext.completion(
        {
          messages: currentConversation as any,
          n_predict: 1024,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          stop: STOP_WORDS,
          tool_choice: "auto",
          tools: FINANCE_TOOLS,
        },
        (data: { token: string }) => {
          if (!data.token) return;
          generatedText += data.token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: generatedText }
                : msg,
            ),
          );
        },
      );

      let finalContent = generatedText;

      // Handle native tool calls
      if (result?.tool_calls && result.tool_calls.length > 0) {
        console.log("[useChat] Detected native tool calls:", result.tool_calls);

        for (const toolCall of result.tool_calls) {
          try {
            const res = await toolHandler({
              toolName: toolCall.function.name,
              arguments:
                typeof toolCall.function.arguments === "string"
                  ? JSON.parse(toolCall.function.arguments)
                  : toolCall.function.arguments,
            });
            const resultStr = res || "Tool returned nothing.";
            finalContent += `\n\n**Result from query:**\n${resultStr}`;
          } catch (e) {
            console.error("[useChat] Tool execution error:", e);
            finalContent += `\n\n**Error executing ${toolCall.function.name}:**\n${e}`;
          }
        }
      }

      // Finalize the message with stats and tool results
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: finalContent,
                isStreaming: false,
                tokensPerSecond: result?.timings.predicted_per_second,
                input_per_second: result?.timings.prompt_per_second,
                tokens_evaluated: result?.tokens_evaluated,
                prompt_ms: result?.timings.prompt_ms,
                tokens_predicted: result?.tokens_predicted,
                predicted_ms: result?.timings.predicted_ms,
              }
            : msg,
        ),
      );

      currentConversation.push({ role: "assistant", content: finalContent });
    } catch (error) {
      console.error("Chat Error", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "*(Error generating response)*",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  function stopGeneration() {
    llamaContext?.stopCompletion();
    setIsGenerating(false);
  }

  function clearChat() {
    if (isGenerating) {
      stopGeneration();
    }
    setMessages([]);
  }

  return {
    messages,
    isGenerating,
    isReady,
    isExtractingText,
    sendMessage,
    stopGeneration,
    clearChat,
  };
}
