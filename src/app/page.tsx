"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, ThumbsUp, ThumbsDown, X } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Salin teks ke clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Like/dislike handler
  const handleLike = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, liked: !msg.liked, disliked: false } : msg,
      ),
    );
  };

  const handleDislike = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, disliked: !msg.disliked, liked: false } : msg,
      ),
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, timestamp: new Date() },
        ]);
      } else {
        setError(data.error || "请重试");
      }
    } catch {
      setError("网络问题请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#fdfdfd] text-[#0d0d0d]">
      {/* Header dengan logo */}
      <header className="border-b border-[#e5e5e5] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/mansaha.png"
            alt="Mansaha"
            className="w-8 h-8 object-contain"
          />
          <h1 className="font-medium tracking-tight">Mansaha AI</h1>
          <span className="text-xs text-[#9a9a9a] ml-2">v1.0.2.0.1</span>
        </div>
      </header>

      {/* Error Popup (custom) */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="error-popup bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-4">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Chat area - hanya ini yang scroll */}
      <main className="flex-1 overflow-y-auto px-4 py-6 chat-area">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <img
                src="/mansaha.png"
                alt="Mansaha"
                className="w-16 h-16 mb-4 opacity-80"
              />
              <p className="text-lg font-light">How can I help you today?</p>
              <p className="text-sm text-[#9a9a9a] mt-2">
                Ask anything, get instant answers
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[80%] bg-[#f8f8f8] rounded-2xl px-4 py-3 text-[#0d0d0d]">
                  {/* Header message */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-70">
                      {msg.role === "user" ? "You" : "Mansaha"}
                    </span>
                    <span className="text-[10px] opacity-50">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  {msg.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Butang aksi untuk semua mesej */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#e5e5e5]">
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="p-1 rounded hover:bg-black/10 transition"
                      title="Salin"
                    >
                      <Copy size={14} />
                    </button>
                    {msg.role === "assistant" && (
                      <>
                        <button
                          onClick={() => handleLike(idx)}
                          className={`p-1 rounded hover:bg-black/10 transition ${
                            msg.liked ? "text-green-500" : ""
                          }`}
                          title="Suka"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          onClick={() => handleDislike(idx)}
                          className={`p-1 rounded hover:bg-black/10 transition ${
                            msg.disliked ? "text-red-500" : ""
                          }`}
                          title="Tidak suka"
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#f8f8f8] rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#9a9a9a] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#9a9a9a] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-[#9a9a9a] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input area tetap di bawah dengan footer disclaimer */}
      <div className="border-t border-[#e5e5e5] bg-[#fdfdfd] p-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Textarea input - tinggi disamakan dengan butang */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Mansaha"
              rows={1}
              className="flex-1 bg-[#f8f8f8] border border-[#e5e5e5] rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#9a9a9a] resize-none transition-all h-10 leading-tight"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            {/* Butang hantar dengan saiz sama */}
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#0d0d0d] text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
            >
              ↑
            </button>
          </div>

          {/* Footer disclaimer */}
          <p className="text-xs text-center text-[#9a9a9a] mt-3">
            Mansaha AI 可能会犯错误。请仔细检查回复。
          </p>
        </div>
      </div>
    </div>
  );
}
