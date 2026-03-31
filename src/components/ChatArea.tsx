"use client";

import { useChat } from "@/context/ChatContext";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

export default function ChatArea() {
  const { messages, loading, error, setError, isSidebarOpen } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex-1 flex flex-col h-screen overflow-hidden bg-[#fdfdfd] transition-all duration-300 ${
        isSidebarOpen ? "lg:ml-[20rem]" : "lg:ml-0"
      }`}
    >
      {/* Scrollable messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 chat-area"
        ref={containerRef}
      >
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {messages.length === 0 ? (
            // Empty state: centered greeting and input
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-xs text-gray-500 flex gap-2">
                <span>Free plan</span>
                <span>·</span>
                <button className="hover:underline">Upgrade</button>
              </div>
              <div className="flex items-center gap-3 mb-10">
                <Image
                  src="/mansaha.png"
                  alt="Mansaha"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <p className="text-4xl font-light">Hello, Saha</p>
              </div>
              <div className="w-full">
                <InputArea />
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} loading={loading} />
              <div ref={chatEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Bottom input area – only shown when there are messages */}
      {messages.length > 0 && (
        <div className="p-4">
          <div className="max-w-3xl mx-auto">
            <InputArea />
            <p className="text-xs text-center text-gray-400 mt-3">
              Mansaha AI may make mistakes. Please double-check responses.
            </p>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-4">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
