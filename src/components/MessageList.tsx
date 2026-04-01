"use client";

import { Message } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Edit2,
  Repeat,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import CodeSidebar from "./CodeSidebar";

export default function MessageList({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  const {
    handleLike,
    handleDislike,
    copyToClipboard,
    editMessage,
    redoMessage,
    deleteMessage,
    isStreaming,
  } = useChat();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{
    index: number;
    content: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    index: number;
    content: string;
  } | null>(null);
  const [selectedCode, setSelectedCode] = useState<{
    code: string;
    language: string;
  } | null>(null);

  useEffect(() => {
    if (copiedIndex !== null) {
      const timer = setTimeout(() => setCopiedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedIndex]);

  const handleCopyWithFeedback = (text: string, index: number) => {
    copyToClipboard(text);
    setCopiedIndex(index);
  };

  const openEditModal = (index: number, content: string) => {
    setEditingMessage({ index, content });
    setEditValue(content);
    setEditModalOpen(true);
  };

  const submitEdit = () => {
    if (editingMessage && editValue.trim()) {
      editMessage(editingMessage.index, editValue);
    }
    setEditModalOpen(false);
    setEditingMessage(null);
    setEditValue("");
  };

  const handleDelete = (index: number) => {
    setDeleteConfirm({ index, content: messages[index].content });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMessage(deleteConfirm.index);
      setDeleteConfirm(null);
    }
  };

  const CodeBlock = ({
    language,
    value,
  }: {
    language: string;
    value: string;
  }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const handleView = () => {
      setSelectedCode({ code: value, language });
      setShowSidebar(true);
    };
    const handleDownload = () => {
      const blob = new Blob([value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code.${language}`;
      a.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className="border border-gray-200 rounded-lg my-2 overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 px-3 py-1 border-b border-gray-200">
          <span className="text-xs font-mono">{language || "code"}</span>
          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="text-gray-500 hover:text-black"
              title="View"
            >
              <ExternalLink size={14} />
            </button>
            <button
              onClick={handleDownload}
              className="text-gray-500 hover:text-black"
              title="Download"
            >
              <Download size={14} />
            </button>
          </div>
        </div>
        <pre className="text-sm font-mono p-3 overflow-x-auto">
          <code>{value}</code>
        </pre>
        {showSidebar && (
          <CodeSidebar
            code={value}
            language={language}
            onClose={() => setShowSidebar(false)}
          />
        )}
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Image
          src="/mansaha.png"
          alt="Mansaha"
          width={64}
          height={64}
          className="mb-4 opacity-80"
        />
        <p className="text-lg font-light">What can I help you with?</p>
        <p className="text-sm text-gray-400 mt-2">
          Ask anything, get instant answers
        </p>
      </div>
    );
  }

  // Filter out placeholder messages that are still loading and have empty content
  const visibleMessages = messages.filter((msg, idx) => {
    if (
      isStreaming &&
      msg.role === "assistant" &&
      msg.content === "" &&
      idx === messages.length - 1
    ) {
      return false;
    }
    return true;
  });

  const showSpinThinking = loading && !isStreaming;
  const showThreeDots =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "assistant" &&
    messages[messages.length - 1]?.content === "";

  return (
    <>
      <div className="space-y-6">
        {visibleMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`group flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%] md:max-w-[75%]">
              <div className="px-4 py-3 text-base">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium opacity-70">
                    {msg.role === "user" ? "You" : "Mansaha"}
                  </span>
                  <span className="text-[10px] opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !match;
                          if (!isInline && match) {
                            return (
                              <CodeBlock
                                language={match[1]}
                                value={String(children).replace(/\n$/, "")}
                              />
                            );
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 justify-end opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleCopyWithFeedback(msg.content, idx)}
                  className="p-1 rounded-md hover:bg-gray-100 transition"
                  title="Copy"
                >
                  {copiedIndex === idx ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                {msg.role === "user" && (
                  <button
                    onClick={() => openEditModal(idx, msg.content)}
                    className="p-1 rounded-md hover:bg-gray-100 transition"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => redoMessage(idx)}
                    className="p-1 rounded-md hover:bg-gray-100 transition"
                    title="Regenerate"
                  >
                    <Repeat size={14} />
                  </button>
                )}
                {msg.role === "assistant" && (
                  <>
                    <button
                      onClick={() => handleLike(idx)}
                      className={`p-1 rounded-md transition ${msg.liked ? "text-green-500" : "hover:bg-gray-100"}`}
                      title="Like"
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <button
                      onClick={() => handleDislike(idx)}
                      className={`p-1 rounded-md transition ${msg.disliked ? "text-red-500" : "hover:bg-gray-100"}`}
                      title="Dislike"
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1 rounded-md hover:bg-gray-100 transition text-red-500"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {showSpinThinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="relative w-5 h-5 animate-spin">
                <Image
                  src="/mansaha.png"
                  alt="Thinking"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}

        {showThreeDots && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Edit message</h3>
            </div>
            <div className="p-4">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Save & Resend
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {selectedCode && (
        <CodeSidebar
          code={selectedCode.code}
          language={selectedCode.language}
          onClose={() => setSelectedCode(null)}
        />
      )}
    </>
  );
}
