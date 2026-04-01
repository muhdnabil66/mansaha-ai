"use client";

import { X, Download, Copy } from "lucide-react";
import { useState } from "react";
import { useChat } from "@/context/ChatContext";

interface CodeSidebarProps {
  code: string;
  language: string;
  onClose: () => void;
}

export default function CodeSidebar({
  code,
  language,
  onClose,
}: CodeSidebarProps) {
  const [copied, setCopied] = useState(false);
  const { isSidebarOpen } = useChat();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Adjust width based on sidebar state
  const sidebarWidth = isSidebarOpen ? 320 : 0; // 20rem = 320px
  const rightOffset = sidebarWidth;

  return (
    <div
      className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
      style={{
        width: "50%",
        right: rightOffset,
        maxWidth: "calc(100% - 20rem)",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-medium">Code Preview</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <pre className="text-sm font-mono whitespace-pre-wrap">{code}</pre>
      </div>
      <div className="flex gap-2 p-4 border-t border-gray-200">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <Copy size={14} />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-black text-white hover:bg-gray-800 rounded-lg transition"
        >
          <Download size={14} />
          Download
        </button>
      </div>
    </div>
  );
}
