"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { fetchStreamingResponse } from "@/lib/openrouter";
import { Message, Conversation, Attachment } from "@/types";
import { v4 as uuidv4 } from "uuid";

type View = "chat" | "projects" | "artifacts" | "code";

interface ChatContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  loading: boolean;
  isStreaming: boolean;
  error: string | null;
  selectedModel: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  attachments: Attachment[];
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  retryLastMessage: () => Promise<void>;
  createNewChat: () => Promise<void>;
  switchConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  toggleStarConversation: (id: string) => Promise<void>;
  editMessage: (index: number, newContent: string) => Promise<void>;
  redoMessage: (index: number) => Promise<void>;
  deleteMessage: (index: number) => Promise<void>;
  handleLike: (index: number) => Promise<void>;
  handleDislike: (index: number) => Promise<void>;
  copyToClipboard: (text: string) => void;
  setSelectedModel: (modelId: string) => void;
  setError: (err: string | null) => void;
  userPlan: string | null;
  chatCount: number;
  chatLimitMessage: string | null;
  requestUpgrade: () => void;
  username: string;
  updateUsername: (newUsername: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const models = [
  {
    name: "Qwen 3.6 Plus",
    display: "Qwen 3.6 Plus",
    id: "qwen/qwen3.6-plus-preview:free",
    requires: "guest",
    icon: "Sparkles",
    description: "Fast & free model",
  },
  {
    name: "Claude 3.5 Haiku",
    display: "Claude 3.5 Haiku",
    id: "anthropic/claude-3.5-haiku",
    requires: "guest",
    icon: "Zap",
    description: "Fastest for quick answers",
  },
  {
    name: "Claude Sonnet 4.6",
    display: "Claude Sonnet 4.6",
    id: "anthropic/claude-sonnet-4.6",
    requires: "student",
    icon: "Zap",
    description: "Efficient for everyday tasks",
  },
  {
    name: "Claude Opus 4.6",
    display: "Claude Opus 4.6",
    id: "anthropic/claude-opus-4.6",
    requires: "student",
    icon: "Sparkles",
    description: "Most capable",
  },
  {
    name: "Claude Opus 4.5",
    display: "Claude Opus 4.5",
    id: "anthropic/claude-opus-4.5",
    requires: "student",
    icon: "Sparkles",
    description: "Powerful reasoning",
  },
  {
    name: "GPT-5.3 Codex",
    display: "GPT-5.3 Codex",
    id: "openai/gpt-5.3-codex",
    requires: "pro",
    icon: "Code",
    description: "Advanced coding assistant",
  },
  {
    name: "Grok 4.20 Multi-agent",
    display: "Grok 4.20 Multi-agent",
    id: "x-ai/grok-4.20-multi-agent",
    requires: "pro",
    icon: "Bot",
    description: "Multi-agent beta",
  },
  {
    name: "DeepSeek V3.2 Speciale",
    display: "DeepSeek V3.2 Speciale",
    id: "deepseek/deepseek-v3.2-speciale",
    requires: "pro",
    icon: "Rocket",
    description: "High performance",
  },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [currentView, setCurrentView] = useState<View>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(
    "qwen/qwen3.6-plus-preview:free",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [userPlanState, setUserPlanState] = useState<string>("guest");
  const [chatCount, setChatCount] = useState<number>(0);
  const [chatLimitMessage, setChatLimitMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Helper to get user_id from Supabase
  const getUserId = useCallback(async (): Promise<string | null> => {
    if (!isSignedIn) {
      const guestId = localStorage.getItem("guestId") || uuidv4();
      localStorage.setItem("guestId", guestId);
      return guestId;
    }
    if (!user) return null;
    const { data: existing, error: fetchError } = await supabase
      .from("users")
      .select("id, plan, username")
      .eq("clerk_id", user.id)
      .maybeSingle();
    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      return null;
    }
    if (existing) {
      setUserPlanState(existing.plan || "free");
      setUsername(
        existing.username ||
          user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
          "User",
      );
      return existing.id;
    }

    const email = user.emailAddresses[0]?.emailAddress;
    const defaultUsername = email?.split("@")[0] || "User";
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        clerk_id: user.id,
        email: email,
        plan: "free",
        username: defaultUsername,
      })
      .select()
      .single();
    if (insertError) {
      console.error("Error creating user:", insertError);
      return null;
    }
    setUserPlanState("free");
    setUsername(newUser.username);
    return newUser.id;
  }, [user, isSignedIn]);

  // Load conversations
  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      if (isSignedIn) {
        const userId = await getUserId();
        if (!userId) return;
        const { data: convs, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Error loading conversations:", error);
          return;
        }
        const formattedConvs: Conversation[] = convs.map((c) => ({
          id: c.id,
          title: c.title,
          messages: [],
          createdAt: new Date(c.created_at),
          starred: c.starred,
        }));
        setConversations(formattedConvs);
        if (formattedConvs.length > 0 && !currentConversationId) {
          setCurrentConversationId(formattedConvs[0].id);
        } else if (formattedConvs.length === 0) {
          setCurrentConversationId(null);
        }
      } else {
        const saved = localStorage.getItem("guest_conversations");
        if (saved) {
          const parsed = JSON.parse(saved);
          const convs = parsed.map(
            (c: {
              id: string;
              title: string;
              createdAt: string;
              starred: boolean;
            }) => ({
              ...c,
              createdAt: new Date(c.createdAt),
              messages: [],
            }),
          );
          setConversations(convs);
          if (convs.length > 0 && !currentConversationId) {
            setCurrentConversationId(convs[0].id);
          }
        } else {
          setConversations([]);
          setCurrentConversationId(null);
        }
      }
    };
    load();
  }, [isLoaded, isSignedIn, getUserId, currentConversationId]);

  // Load messages
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }
    const loadMessages = async () => {
      if (isSignedIn) {
        const { data: msgs, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", currentConversationId)
          .order("timestamp", { ascending: true });
        if (error) {
          console.error("Error loading messages:", error);
          return;
        }
        const formattedMsgs: Message[] = msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
          liked: m.liked,
          disliked: m.disliked,
          attachments: m.attachments || [],
        }));
        setMessages(formattedMsgs);
      } else {
        const saved = localStorage.getItem(
          `guest_messages_${currentConversationId}`,
        );
        if (saved) {
          const parsed = JSON.parse(saved);
          const formatted = parsed.map(
            (m: {
              id: string;
              role: string;
              content: string;
              timestamp: string;
              liked?: boolean;
              disliked?: boolean;
              attachments?: string[];
            }) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }),
          );
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      }
    };
    loadMessages();
  }, [currentConversationId, isSignedIn]);

  // Save guest conversations
  useEffect(() => {
    if (!isSignedIn && conversations.length) {
      localStorage.setItem(
        "guest_conversations",
        JSON.stringify(conversations),
      );
    }
  }, [conversations, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn && currentConversationId && messages.length) {
      localStorage.setItem(
        `guest_messages_${currentConversationId}`,
        JSON.stringify(messages),
      );
    }
  }, [messages, currentConversationId, isSignedIn]);

  const updateUsername = async (newUsername: string) => {
    if (!isSignedIn) {
      localStorage.setItem("guest_username", newUsername);
      setUsername(newUsername);
      return;
    }
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase
      .from("users")
      .update({ username: newUsername })
      .eq("id", userId);
    if (!error) setUsername(newUsername);
    else console.error("Error updating username", error);
  };

  const addAttachment = (file: File) => {
    const preview = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined;
    setAttachments((prev) => [
      ...prev,
      {
        id: uuidv4(),
        file,
        preview,
        type: file.type.startsWith("image/") ? "image" : "file",
      },
    ]);
  };
  const removeAttachment = (index: number) => {
    const removed = attachments[index];
    if (removed.preview) URL.revokeObjectURL(removed.preview);
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  const clearAttachments = () => {
    attachments.forEach((a) => a.preview && URL.revokeObjectURL(a.preview));
    setAttachments([]);
  };

  const checkChatLimit = async (): Promise<{
    allowed: boolean;
    message?: string;
  }> => {
    // Admin has unlimited access
    if (userPlanState === "admin") {
      return { allowed: true };
    }
    if (userPlanState === "student" || userPlanState === "pro") {
      return { allowed: true };
    }
    if (!isSignedIn) {
      const today = new Date().toDateString();
      const stored = localStorage.getItem("guest_chat_data");
      let data = { date: today, count: 0 };
      if (stored) data = JSON.parse(stored);
      if (data.date !== today) {
        data = { date: today, count: 0 };
      }
      if (data.count >= 5) {
        return {
          allowed: false,
          message:
            "You've reached the daily limit for guests. Sign in to continue.",
        };
      }
      return { allowed: true };
    } else {
      const userId = await getUserId();
      if (!userId) return { allowed: false, message: "User not found" };
      const { data: userData, error } = await supabase
        .from("users")
        .select("free_chat_count, free_chat_reset_at")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching user limits", error);
        return { allowed: true };
      }
      const now = new Date();
      let resetAt = userData.free_chat_reset_at
        ? new Date(userData.free_chat_reset_at)
        : null;
      let count = userData.free_chat_count || 0;
      if (!resetAt || now >= resetAt) {
        count = 0;
        resetAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        await supabase
          .from("users")
          .update({
            free_chat_count: 0,
            free_chat_reset_at: resetAt.toISOString(),
          })
          .eq("id", userId);
      }
      if (count >= 10) {
        const resetTime = resetAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return {
          allowed: false,
          message: `You are out of free messages until ${resetTime}. Upgrade`,
        };
      }
      return { allowed: true };
    }
  };

  const incrementChatCount = async () => {
    if (
      userPlanState === "admin" ||
      userPlanState === "student" ||
      userPlanState === "pro"
    )
      return;
    if (!isSignedIn) {
      const today = new Date().toDateString();
      const stored = localStorage.getItem("guest_chat_data");
      let data = { date: today, count: 0 };
      if (stored) data = JSON.parse(stored);
      if (data.date !== today) data = { date: today, count: 0 };
      data.count += 1;
      localStorage.setItem("guest_chat_data", JSON.stringify(data));
      setChatCount(data.count);
    } else {
      const userId = await getUserId();
      if (!userId) return;
      const { data: userData } = await supabase
        .from("users")
        .select("free_chat_count")
        .eq("id", userId)
        .single();
      const newCount = (userData?.free_chat_count || 0) + 1;
      await supabase
        .from("users")
        .update({ free_chat_count: newCount })
        .eq("id", userId);
    }
  };

  const generateTitle = async (conversationId: string, userMessage: string) => {
    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }),
      });
      const data = await response.json();
      const title = data.title || "New Chat";
      if (isSignedIn) {
        await supabase
          .from("conversations")
          .update({ title })
          .eq("id", conversationId);
      } else {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title } : c)),
        );
      }
    } catch (err) {
      console.error("Title generation failed", err);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const retryLastMessage = async () => {
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current);
    }
  };

  const sendMessage = async (content: string) => {
    if ((!content.trim() && attachments.length === 0) || loading) return;

    const limit = await checkChatLimit();
    if (!limit.allowed) {
      setChatLimitMessage(limit.message!);
      // Mesej limit tidak akan hilang secara automatik, ia akan kekal sehingga user cuba hantar mesej baru
      return;
    }

    lastUserMessageRef.current = content;

    setLoading(true);
    setIsStreaming(true);
    setError(null);
    setChatLimitMessage(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let convId = currentConversationId;
      if (!convId) {
        if (isSignedIn) {
          const userId = await getUserId();
          if (!userId) throw new Error("User not found");
          const { data: newConv, error: convError } = await supabase
            .from("conversations")
            .insert({ user_id: userId, title: "New Chat" })
            .select()
            .single();
          if (convError) throw convError;
          convId = newConv.id;
          setCurrentConversationId(convId);
          const newConvObj: Conversation = {
            id: newConv.id,
            title: newConv.title,
            messages: [],
            createdAt: new Date(newConv.created_at),
            starred: newConv.starred,
          };
          setConversations((prev) => [newConvObj, ...prev]);
        } else {
          convId = uuidv4();
          setCurrentConversationId(convId);
          const newConvObj: Conversation = {
            id: convId,
            title: "New Chat",
            messages: [],
            createdAt: new Date(),
            starred: false,
          };
          setConversations((prev) => [newConvObj, ...prev]);
        }
      }

      const uploadAttachments = async (): Promise<string[]> => {
        const urls: string[] = [];
        for (const att of attachments) {
          const formData = new FormData();
          formData.append("file", att.file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const { url } = await res.json();
            urls.push(url);
          } else {
            console.error("Upload failed");
          }
        }
        return urls;
      };
      const attachmentUrls = await uploadAttachments();
      clearAttachments();

      const userMessageObj: Omit<Message, "id"> = {
        role: "user",
        content,
        timestamp: new Date(),
        attachments: attachmentUrls,
      };
      let savedUserMsg: { id: string };
      if (isSignedIn) {
        const { data, error: insertError } = await supabase
          .from("messages")
          .insert({
            conversation_id: convId,
            role: "user",
            content,
            timestamp: userMessageObj.timestamp.toISOString(),
            attachments: attachmentUrls,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        savedUserMsg = data;
      } else {
        savedUserMsg = { id: uuidv4() };
      }
      const userMessageWithId: Message = {
        ...userMessageObj,
        id: savedUserMsg.id,
      };
      const newMessages = [...messages, userMessageWithId];
      setMessages(newMessages);

      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const stream = await fetchStreamingResponse(apiMessages, selectedModel);
      let fullResponse = "";
      const assistantPlaceholderId = uuidv4();
      const placeholderMsg: Message = {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        liked: false,
        disliked: false,
      };
      setMessages((prev) => [...prev, placeholderMsg]);

      for await (const chunk of stream) {
        if (abortController.signal.aborted) {
          break;
        }
        fullResponse += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.id === assistantPlaceholderId) {
            return [...prev.slice(0, -1), { ...last, content: fullResponse }];
          }
          return prev;
        });
      }

      if (abortController.signal.aborted) {
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantPlaceholderId),
        );
        setLoading(false);
        setIsStreaming(false);
        return;
      }

      if (isSignedIn) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: fullResponse,
          timestamp: new Date().toISOString(),
        });
        const { data: finalMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("timestamp", { ascending: true });
        if (finalMessages) {
          const formatted = finalMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
            liked: m.liked,
            disliked: m.disliked,
            attachments: m.attachments || [],
          }));
          setMessages(formatted);
        }
      } else {
        const finalMsgs = [
          ...newMessages,
          { ...placeholderMsg, content: fullResponse, id: uuidv4() },
        ];
        setMessages(finalMsgs);
        localStorage.setItem(
          `guest_messages_${convId}`,
          JSON.stringify(finalMsgs),
        );
      }

      await incrementChatCount();

      const currentConv = conversations.find((c) => c.id === convId);
      if (
        currentConv &&
        currentConv.title === "New Chat" &&
        fullResponse &&
        convId
      ) {
        await generateTitle(convId, content);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // User cancelled
      } else {
        console.error(err);
        setError("Failed to send message");
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const createNewChat = async () => {
    if (isSignedIn) {
      const userId = await getUserId();
      if (!userId) return;
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title: "New Chat" })
        .select()
        .single();
      if (error) {
        console.error(error);
        return;
      }
      const convObj: Conversation = {
        id: newConv.id,
        title: newConv.title,
        messages: [],
        createdAt: new Date(newConv.created_at),
        starred: newConv.starred,
      };
      setConversations((prev) => [convObj, ...prev]);
      setCurrentConversationId(convObj.id);
      setMessages([]);
    } else {
      const newId = uuidv4();
      const convObj: Conversation = {
        id: newId,
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        starred: false,
      };
      setConversations((prev) => [convObj, ...prev]);
      setCurrentConversationId(newId);
      setMessages([]);
    }
  };

  const switchConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (isSignedIn) {
      await supabase
        .from("conversations")
        .update({ title: newTitle })
        .eq("id", id);
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  };

  const deleteConversation = async (id: string) => {
    if (isSignedIn) {
      await supabase.from("conversations").delete().eq("id", id);
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      const next = conversations.find((c) => c.id !== id);
      setCurrentConversationId(next ? next.id : null);
    }
  };

  const toggleStarConversation = async (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      if (isSignedIn) {
        await supabase
          .from("conversations")
          .update({ starred: !conv.starred })
          .eq("id", id);
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c)),
      );
    }
  };

  const editMessage = async (index: number, newContent: string) => {
    const msg = messages[index];
    if (msg.role !== "user") return;
    const convId = currentConversationId;
    if (!convId) return;

    if (isSignedIn) {
      const timestamp = msg.timestamp.toISOString();
      await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", convId)
        .gte("timestamp", timestamp);
      await supabase
        .from("messages")
        .update({ content: newContent, timestamp: new Date().toISOString() })
        .eq("id", msg.id);

      const truncated = messages.slice(0, index);
      const updatedUserMsg = {
        ...msg,
        content: newContent,
        timestamp: new Date(),
      };
      const newMessages = [...truncated, updatedUserMsg];
      setMessages(newMessages);

      setLoading(true);
      setIsStreaming(true);
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const stream = await fetchStreamingResponse(apiMessages, selectedModel);
      let fullResponse = "";
      const assistantPlaceholderId = uuidv4();
      const placeholderMsg: Message = {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        liked: false,
        disliked: false,
      };
      setMessages((prev) => [...prev, placeholderMsg]);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.id === assistantPlaceholderId) {
            return [...prev.slice(0, -1), { ...last, content: fullResponse }];
          }
          return prev;
        });
      }
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "assistant",
        content: fullResponse,
        timestamp: new Date().toISOString(),
      });
      setLoading(false);
      setIsStreaming(false);
    } else {
      setError("Editing messages is limited to signed-in users");
    }
  };

  const redoMessage = async (assistantIndex: number) => {
    if (!isSignedIn) {
      setError("Regenerate is limited to signed-in users");
      return;
    }
    const assistantMsg = messages[assistantIndex];
    if (assistantMsg.role !== "assistant") return;
    let userIndex = assistantIndex - 1;
    while (userIndex >= 0 && messages[userIndex].role !== "user") userIndex--;
    if (userIndex < 0) return;
    const convId = currentConversationId;
    if (!convId) return;
    const userMsg = messages[userIndex];
    const timestamp = userMsg.timestamp.toISOString();
    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", convId)
      .gte("timestamp", timestamp);
    const truncated = messages.slice(0, userIndex + 1);
    setMessages(truncated);
    setLoading(true);
    setIsStreaming(true);
    const apiMessages = truncated.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const stream = await fetchStreamingResponse(apiMessages, selectedModel);
    let fullResponse = "";
    const assistantPlaceholderId = uuidv4();
    const placeholderMsg: Message = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      liked: false,
      disliked: false,
    };
    setMessages((prev) => [...prev, placeholderMsg]);
    for await (const chunk of stream) {
      fullResponse += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.id === assistantPlaceholderId) {
          return [...prev.slice(0, -1), { ...last, content: fullResponse }];
        }
        return prev;
      });
    }
    await supabase.from("messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: fullResponse,
      timestamp: new Date().toISOString(),
    });
    setLoading(false);
    setIsStreaming(false);
  };

  const deleteMessage = async (index: number) => {
    const msg = messages[index];
    const convId = currentConversationId;
    if (!convId) return;
    if (isSignedIn && msg.id) {
      await supabase.from("messages").delete().eq("id", msg.id);
    }
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
  };

  const handleLike = async (index: number) => {
    const updated = [...messages];
    const msg = updated[index];
    if (msg.role !== "assistant") return;
    msg.liked = !msg.liked;
    if (msg.liked) msg.disliked = false;
    if (isSignedIn && msg.id) {
      await supabase
        .from("messages")
        .update({ liked: msg.liked, disliked: msg.disliked })
        .eq("id", msg.id);
    }
    setMessages(updated);
  };

  const handleDislike = async (index: number) => {
    const updated = [...messages];
    const msg = updated[index];
    if (msg.role !== "assistant") return;
    msg.disliked = !msg.disliked;
    if (msg.disliked) msg.liked = false;
    if (isSignedIn && msg.id) {
      await supabase
        .from("messages")
        .update({ liked: msg.liked, disliked: msg.disliked })
        .eq("id", msg.id);
    }
    setMessages(updated);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const requestUpgrade = () => {
    window.dispatchEvent(new CustomEvent("openPlanSelector"));
  };

  return (
    <ChatContext.Provider
      value={{
        currentView,
        setCurrentView,
        conversations,
        currentConversationId,
        messages,
        loading,
        isStreaming,
        error,
        selectedModel,
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        attachments,
        addAttachment,
        removeAttachment,
        clearAttachments,
        sendMessage,
        stopGeneration,
        retryLastMessage,
        createNewChat,
        switchConversation,
        renameConversation,
        deleteConversation,
        toggleStarConversation,
        editMessage,
        redoMessage,
        deleteMessage,
        handleLike,
        handleDislike,
        copyToClipboard,
        setSelectedModel,
        setError,
        userPlan: userPlanState,
        chatCount,
        chatLimitMessage,
        requestUpgrade,
        username,
        updateUsername,
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
