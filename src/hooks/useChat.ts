import { useRef, useState } from "react";
import { useModel } from "../context/ModelContext";
import { Message } from "../types";

const GEMMA_STOP_TOKENS = ["<end_of_turn>", "<eos>", "<|end|>"];

export function useChat() {
  const { llamaContextRef } = useModel();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesRef = useRef<Message[]>([]);

  messagesRef.current = messages;

  // sends reply

  async function sendMessage(content: string) {
    if (!llamaContextRef.current) {
      console.warn("Model not ready!");
      return;
    }
    if (isGenerating) return;
    if (!content.trim()) return;

    const userMsg: Message = {
      id: `User_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    const assistantMsg: Message = {
      id: `assistant_${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Build completion messages BEFORE updating state
    // messagesRef.current has the pre-send history (no userMsg yet)
    const completionMessages = [...messagesRef.current, userMsg].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsGenerating(true);

    try {
      const result = await llamaContextRef.current?.completion(
        {
          messages: completionMessages,
          n_predict: 1024,
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          stop: GEMMA_STOP_TOKENS,
        },
        (data: { token: string }) => {
          if (!data.token) return;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsg.id
                ? { ...msg, content: msg.content + data.token }
                : msg,
            ),
          );
        },
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsg.id
            ? {
                ...msg,
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
    } catch (error) {
      console.error("Chat Error", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsg.id
            ? {
                ...msg,
                content: msg.content + "\n\n*(Error generating response)*",
                isStreaming: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  // stop generating reply

  function stopGeneration() {
    llamaContextRef.current?.stopCompletion();
    setIsGenerating(false);
  }

  // clear chat

  function clearChat() {
    if (isGenerating) {
      stopGeneration();
    }
    setMessages([]);
  }

  return {
    messages,
    isGenerating,
    sendMessage,
    stopGeneration,
    clearChat,
  };
}
