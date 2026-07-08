import { useState, useEffect } from "react";
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

const GENERAL_SYSTEM_PROMPT = `You are a helpful general assistant. You can chat with the user, answer questions, and assist with any tasks.
Always output your reasoning process in a <think>...</think> block before answering.`;

const FINANCE_SYSTEM_PROMPT = `You are a finance assistant. You can help the user query their logged expenses and spending summary.
Always output your reasoning process in a <think>...</think> block before calling tools or answering the user.`;

const SUMMARY_SYSTEM_PROMPT = `You are a summarization assistant. Your job is to concisely summarize the notes, text, or documents provided by the user.
Always output your reasoning process in a <think>...</think> block before answering.`;

export interface UseChatOptions {
  context?: string | string[];
}

export function useChat(options?: UseChatOptions) {
  const llamaContext = useLlamaStore((state) => state.llamaContext);
  const isReady = useLlamaStore((state) => state.isModelReady);

  const ctx = Array.isArray(options?.context)
    ? options?.context[0]
    : options?.context || "general";

  let currentSystemPrompt = GENERAL_SYSTEM_PROMPT;
  let currentTools: any[] | undefined = undefined;
  let currentToolHandler: ((call: any) => Promise<any>) | undefined = undefined;

  if (ctx === "finance") {
    currentSystemPrompt = FINANCE_SYSTEM_PROMPT;
    currentTools = FINANCE_TOOLS;
    currentToolHandler = createFinanceToolHandler({
      queryExpenses: financeStore.queryExpenses,
      getSpendingSummary: financeStore.getSpendingSummary,
    });
  } else if (ctx === "summary") {
    currentSystemPrompt = SUMMARY_SYSTEM_PROMPT;
  }

  const isExtractingText = false;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Clear chat when the context changes so the new system prompt gets injected
    setMessages([]);
    setIsGenerating(false);
  }, [ctx]);

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
      currentConversation.unshift({ role: "system", content: currentSystemPrompt });
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

      const completionOptions: any = {
        messages: currentConversation as any,
        n_predict: 1024,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        stop: STOP_WORDS,
      };

      if (currentTools && currentTools.length > 0) {
        completionOptions.tool_choice = "auto";
        completionOptions.tools = currentTools;
      }

      const result = await llamaContext.completion(
        completionOptions,
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
      if (result?.tool_calls && result.tool_calls.length > 0 && currentToolHandler) {
        console.log("[useChat] Detected native tool calls:", result.tool_calls);

        for (const toolCall of result.tool_calls) {
          try {
            const res = await currentToolHandler({
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
