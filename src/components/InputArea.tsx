"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import ModelSelector from "./ModelSelector";
import { Plus, Upload, Camera, Search, FolderPlus } from "lucide-react";

export default function InputArea() {
  const [input, setInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const { sendMessage, loading } = useChat();
  const plusRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim() && !loading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusRef.current && !plusRef.current.contains(event.target as Node)) {
        setPlusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const plusItems = [
    { icon: Upload, label: "Files" },
    { icon: Camera, label: "Take photo" },
    { icon: Search, label: "Web search" },
    { icon: FolderPlus, label: "New project" },
  ];

  return (
    <div className="relative w-full">
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 hover:border-gray-300 transition shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Mansaha"
          rows={2}
          className="w-full bg-transparent text-sm focus:outline-none resize-none py-1 min-h-[50px]"
        />

        <div className="flex items-center justify-between mt-1 pt-0">
          {/* Plus button with dropdown */}
          <div ref={plusRef} className="relative">
            <button
              onClick={() => setPlusOpen(!plusOpen)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
              title="Add"
            >
              <Plus size={16} />
            </button>
            {plusOpen && (
              <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-52 z-50">
                {plusItems.map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
                    onClick={() => {
                      console.log(`Clicked ${item.label}`);
                      setPlusOpen(false);
                    }}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-7 h-7 rounded-full bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
