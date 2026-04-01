export const modelMap: Record<string, string> = {
  "Qwen 3.6": "qwen/qwen3.6-plus-preview:free",
  "Claude 3.5 Haiku": "anthropic/claude-3.5-haiku",
  "Claude Sonnet 4.6": "anthropic/claude-sonnet-4.6",
  "Claude Opus 4.6": "anthropic/claude-opus-4.6",
  "Claude Opus 4.5": "anthropic/claude-opus-4.5",
  "DeepSeek v3.2": "deepseek/deepseek-v3.2-speciale",
  "GPT-5.3 Codex": "openai/gpt-5.3-codex",
  "Grok 4.20": "x-ai/grok-4.20-multi-agent",
};

export async function fetchStreamingResponse(
  messages: { role: string; content: string }[],
  modelName: string,
) {
  const modelId = modelMap[modelName] || "qwen/qwen3.6-plus-preview:free";
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: modelId, stream: true }),
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) yield content;
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    },
  };
}
