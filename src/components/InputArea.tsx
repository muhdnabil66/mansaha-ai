"use client";

import { useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import ModelSelector from "./ModelSelector";
import {
  Plus,
  Upload,
  Camera,
  Search,
  FolderPlus,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

export default function InputArea() {
  const [input, setInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    sendMessage,
    loading,
    attachments,
    addAttachment,
    removeAttachment,
    chatLimitMessage,
  } = useChat();

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !loading) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(addAttachment);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative w-full">
      {chatLimitMessage && (
        <div className="mb-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {chatLimitMessage}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 hover:border-gray-300 transition shadow-sm">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 pb-1 border-b border-gray-200">
            {attachments.map((att, idx) => (
              <div key={att.id} className="relative group">
                {att.type === "image" ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={att.preview!}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border text-xs">
                    <ImageIcon size={12} />
                    <span className="max-w-[100px] truncate">
                      {att.file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm hover:bg-gray-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Mansaha"
          rows={2}
          className="w-full bg-transparent text-sm focus:outline-none resize-none py-1 min-h-[50px]"
        />

        <div className="flex items-center justify-between mt-1 pt-0">
          <div className="relative">
            <button
              onClick={() => setPlusOpen(!plusOpen)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
            >
              <Plus size={16} />
            </button>
            {plusOpen && (
              <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-52 z-50">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setPlusOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
                >
                  <Upload size={14} />
                  <span>Files</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setPlusOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
                >
                  <Camera size={14} />
                  <span>Take photo</span>
                </button>
                <button
                  onClick={() => {
                    console.log("Web search");
                    setPlusOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
                >
                  <Search size={14} />
                  <span>Web search</span>
                </button>
                <button
                  onClick={() => {
                    console.log("New project");
                    setPlusOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
                >
                  <FolderPlus size={14} />
                  <span>New project</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector />
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && attachments.length === 0)}
              className="w-7 h-7 rounded-full bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
