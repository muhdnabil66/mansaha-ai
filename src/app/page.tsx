"use client";

import { ChatProvider } from "@/context/ChatContext";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import PaymentSuccessModal from "@/components/PaymentSuccessModal";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (success === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSuccessModal(true);
      // Remove query param from URL without reload
      window.history.replaceState({}, "", "/");
    }
  }, [success]);

  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-[#fdfdfd]">
        <Sidebar />
        <ChatArea />
      </div>
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        planName="Student"
      />
    </ChatProvider>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
