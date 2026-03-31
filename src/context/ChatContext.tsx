"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Message, Conversation } from "@/types/chat";

type ChatContextType = {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  selectedModel: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  sendMessage: (content: string) => Promise<void>;
  createNewChat: () => void;
  switchConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  toggleStarConversation: (id: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleLike: (index: number) => void;
  handleDislike: (index: number) => void;
  copyToClipboard: (text: string) => void;
  setSelectedModel: (model: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

const dummyConversations: Conversation[] = [
  {
    id: "1",
    title: "Homepage AI website improvement",
    messages: [],
    createdAt: new Date(),
    starred: false,
  },
  {
    id: "2",
    title: "Chat history dengan dropdown",
    messages: [],
    createdAt: new Date(),
    starred: false,
  },
  {
    id: "3",
    title: "Fix page.js layout dan animation",
    messages: [],
    createdAt: new Date(),
    starred: false,
  },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] =
    useState<Conversation[]>(dummyConversations);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("Sonnet 4.6");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mansaha_conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const converted = parsed.map((conv: any) => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          createdAt: new Date(conv.createdAt),
        }));
        setConversations(converted);
        if (converted.length > 0) setCurrentConversationId(converted[0].id);
      } catch (e) {
        setConversations(dummyConversations);
        if (dummyConversations.length)
          setCurrentConversationId(dummyConversations[0].id);
      }
    } else {
      setConversations(dummyConversations);
      if (dummyConversations.length)
        setCurrentConversationId(dummyConversations[0].id);
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length) {
      localStorage.setItem(
        "mansaha_conversations",
        JSON.stringify(conversations),
      );
    }
  }, [conversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      const conv = conversations.find((c) => c.id === currentConversationId);
      setMessages(conv?.messages || []);
    } else {
      setMessages([]);
    }
  }, [currentConversationId, conversations]);

  const createNewChat = () => {
    const newId = generateId();
    const newConv: Conversation = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      starred: false,
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newId);
  };

  const switchConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? { ...conv, title: newTitle.trim() || "Untitled" }
          : conv,
      ),
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (currentConversationId === id) {
      // switch to first remaining or null
      const remaining = conversations.filter((conv) => conv.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const toggleStarConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, starred: !conv.starred } : conv,
      ),
    );
  };

  const updateConversationMessages = (newMessages: Message[]) => {
    if (!currentConversationId) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: newMessages,
              title: getTitleFromMessages(newMessages),
            }
          : conv,
      ),
    );
    setMessages(newMessages);
  };

  const getTitleFromMessages = (msgs: Message[]): string => {
    if (msgs.length === 0) return "New Chat";
    const firstUser = msgs.find((m) => m.role === "user");
    if (firstUser && firstUser.content.length > 30) {
      return firstUser.content.substring(0, 30) + "...";
    }
    return firstUser?.content || "New Chat";
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    updateConversationMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };
        const finalMessages = [...newMessages, assistantMessage];
        updateConversationMessages(finalMessages);
      } else {
        setError(data.error || "Please try again");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (index: number) => {
    const updated = [...messages];
    const msg = updated[index];
    if (msg.role === "assistant") {
      msg.liked = !msg.liked;
      if (msg.liked) msg.disliked = false;
      updateConversationMessages(updated);
    }
  };

  const handleDislike = (index: number) => {
    const updated = [...messages];
    const msg = updated[index];
    if (msg.role === "assistant") {
      msg.disliked = !msg.disliked;
      if (msg.disliked) msg.liked = false;
      updateConversationMessages(updated);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        messages,
        loading,
        error,
        selectedModel,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        sendMessage,
        createNewChat,
        switchConversation,
        renameConversation,
        deleteConversation,
        toggleStarConversation,
        setMessages,
        setLoading,
        setError,
        handleLike,
        handleDislike,
        copyToClipboard,
        setSelectedModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
