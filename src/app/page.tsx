// app/page.tsx
"use client";

import { ChatProvider } from "@/context/ChatContext";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export default function Home() {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-[#fdfdfd]">
        <Sidebar />
        <ChatArea />
      </div>
    </ChatProvider>
  );
}
