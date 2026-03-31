"use client";

import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Check,
  Edit2,
  Repeat,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";

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
  } = useChat();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{
    index: number;
    content: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loadingPhase, setLoadingPhase] = useState<"thinking" | "wave">(
    "thinking",
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    index: number;
    content: string;
  } | null>(null);

  useEffect(() => {
    if (loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingPhase("thinking");
      const timer = setTimeout(() => setLoadingPhase("wave"), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

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

  const handleRedo = (index: number) => {
    redoMessage(index);
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

  return (
    <>
      <div className="space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%] md:max-w-[75%]">
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-gray-100"
                    : "bg-gray-50 border border-gray-100"
                }`}
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

              <div className="flex items-center gap-1 mt-1 justify-end">
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
                    onClick={() => handleRedo(idx)}
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

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-2xl px-4 py-3">
              {loadingPhase === "thinking" ? (
                <div className="flex items-center gap-3">
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
              ) : (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
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

      {/* Delete Confirmation Modal for messages */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
