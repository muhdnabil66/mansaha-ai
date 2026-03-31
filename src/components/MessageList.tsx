// components/MessageList.tsx
"use client";

import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useChat } from "@/context/ChatContext";

export default function MessageList({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  const { handleLike, handleDislike, copyToClipboard } = useChat();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <img
          src="/mansaha.png"
          alt="Mansaha"
          className="w-16 h-16 mb-4 opacity-80"
        />
        <p className="text-lg font-light">How can i help you?</p>
        <p className="text-sm text-gray-400 mt-2">Ask Mansaha</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="relative group max-w-[85%] md:max-w-[75%]">
            {/* Hover actions - positioned top right */}
            <div
              className={`
                absolute -top-6 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
                ${msg.role === "user" ? "right-0" : "left-auto right-0"}
              `}
            >
              <button
                onClick={() => copyToClipboard(msg.content)}
                className="p-1 rounded-full bg-white shadow-sm hover:bg-gray-100"
                title="Salin"
              >
                <Copy size={12} />
              </button>
              {msg.role === "assistant" && (
                <>
                  <button
                    onClick={() => handleLike(idx)}
                    className={`p-1 rounded-full bg-white shadow-sm ${msg.liked ? "text-green-500" : ""}`}
                    title="Suka"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button
                    onClick={() => handleDislike(idx)}
                    className={`p-1 rounded-full bg-white shadow-sm ${msg.disliked ? "text-red-500" : ""}`}
                    title="Tidak suka"
                  >
                    <ThumbsDown size={12} />
                  </button>
                </>
              )}
            </div>

            {/* Bubble */}
            <div
              className={`
                rounded-2xl px-4 py-3 text-sm
                ${msg.role === "user" ? "bg-gray-100" : "bg-gray-50 border border-gray-100"}
              `}
            >
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

              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
