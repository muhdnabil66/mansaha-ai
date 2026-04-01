"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  planName = "Student",
}: PaymentSuccessModalProps) {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isOpen && countdown === 0) {
      onClose();
      router.push("/");
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-green-600 flex items-center gap-2">
            <CheckCircle size={20} />
            Payment Successful!
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600">
            Your <strong>{planName}</strong> plan has been activated. You now
            have full access to all features.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Redirecting to home in {countdown} seconds...
          </p>
        </div>
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={() => {
              onClose();
              router.push("/");
            }}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
