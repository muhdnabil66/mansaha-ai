"use client";

import { useChat } from "@/context/ChatContext";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function ChatArea() {
  const { messages, loading, error, setError, isSidebarOpen } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Margin left hanya untuk desktop (min-width 1024px)
  const marginLeft = isSidebarOpen ? "20rem" : "0";

  return (
    <div
      className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fdfdfd] transition-all duration-300"
      style={{ marginLeft: window.innerWidth >= 1024 ? marginLeft : "0" }}
    >
      <div
        className="flex-1 overflow-y-auto px-4 py-6 chat-area"
        ref={containerRef}
      >
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-xs text-gray-500 flex gap-2">
                <span>Free plan</span>
                <span>·</span>
                <button className="hover:underline">Upgrade</button>
              </div>
              <div className="flex items-center gap-3 mb-10">
                <img
                  src="/mansaha.png"
                  alt="Mansaha"
                  className="w-12 h-12 object-contain"
                />
                <p className="text-4xl font-light">Hello, Saha</p>
              </div>
              <div className="w-full">
                <InputArea />
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <MessageList messages={messages} loading={loading} />
              </div>
              <div ref={chatEndRef} />
              <div className="mt-4">
                <InputArea />
              </div>
            </>
          )}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-2 text-center text-xs text-gray-400">
          Mansaha AI may make mistakes. Please double-check responses.
        </div>
      )}
    </div>
  );
}
