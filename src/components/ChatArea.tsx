"use client";

import { useChat } from "@/context/ChatContext";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import ProjectsView from "./ProjectsView";
import ArtifactsView from "./ArtifactsView";
import CodeView from "./CodeView";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

export default function ChatArea() {
  const {
    currentView,
    messages,
    loading,
    error,
    setError,
    isSidebarOpen,
    username,
    userPlan,
  } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentView === "chat" && messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentView]);

  const renderContent = () => {
    switch (currentView) {
      case "chat":
        return (
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-4 text-xs text-gray-500 flex gap-2">
                  <span>{userPlan === "guest" ? "Guest" : userPlan} plan</span>
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
                  <p className="text-4xl font-light">
                    Hello,{" "}
                    {username || (userPlan === "guest" ? "Guest" : "User")}
                  </p>
                </div>
                <div className="w-full">
                  <InputArea />
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <MessageList messages={messages} loading={loading} />
                  <div ref={chatEndRef} />
                </div>
                <div className="mt-4">
                  <InputArea />
                </div>
              </>
            )}
          </div>
        );
      case "projects":
        return <ProjectsView />;
      case "artifacts":
        return <ArtifactsView />;
      case "code":
        return <CodeView />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col h-screen overflow-hidden bg-[#fdfdfd] transition-all duration-300 ${
        isSidebarOpen ? "lg:ml-[20rem]" : "lg:ml-0"
      }`}
    >
      <div className="flex-1 overflow-y-auto px-4 py-6">{renderContent()}</div>

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
