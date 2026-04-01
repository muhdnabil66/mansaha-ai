"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, Shield, Zap, CreditCard } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Plan {
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  buttonText: string;
  popular?: boolean;
  note?: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: 0,
    features: [
      "10 chats / 3 hours (if signed in)",
      "Basic models (Qwen, Claude 3.5 Haiku)",
      "Limited web search",
      "Basic code support",
    ],
    buttonText: "Current plan",
  },
  {
    name: "Student",
    price: 8.99,
    originalPrice: 19.99,
    features: [
      "Claude Sonnet 4.6",
      "Claude Opus 4.6",
      "Claude 3.5 Haiku",
      "DeepSeek R1",
      "Unlimited chats",
      "Web search",
      "Code basic",
    ],
    buttonText: "Upgrade",
    popular: true,
    note: "Requires @student.uitm.edu.my email",
  },
  {
    name: "Pro",
    price: 79.99,
    features: [
      "Everything in Student",
      "GPT-5.3 Codex",
      "DeepSeek V3.2 Speciale",
      "Grok 4.20 Multi-agent Beta",
      "Claude Opus 4.6",
      "Priority support",
    ],
    buttonText: "Upgrade",
  },
];

interface PlanSelectorProps {
  onClose: () => void;
  open: boolean;
}

export default function PlanSelector({ onClose, open }: PlanSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => {};
    window.addEventListener("openPlanSelector", handleOpen);
    return () => window.removeEventListener("openPlanSelector", handleOpen);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const handleCheckout = async (planName: string) => {
    if (planName === "Student") {
      if (!isSignedIn) {
        window.location.href = "/sign-in";
        return;
      }
      const email = user?.emailAddresses[0]?.emailAddress;
      if (!email || !email.endsWith("@student.uitm.edu.my")) {
        setShowEligibilityModal(true);
        return;
      }
    }
    setLoading(planName);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-8"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-semibold">Choose your plan</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-xl p-6 flex flex-col ${
                  plan.popular
                    ? "border-black shadow-lg relative"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2">
                  {plan.originalPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">RM{plan.price}</span>
                      <span className="text-sm text-gray-400 line-through">
                        RM{plan.originalPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">
                      {plan.price === 0 ? "Free" : `RM${plan.price}`}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">/month</span>
                </div>
                {plan.note && (
                  <p className="text-xs text-gray-500 mt-1">{plan.note}</p>
                )}
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        size={16}
                        className="text-green-500 mt-0.5 flex-shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan.name)}
                  disabled={
                    loading === plan.name ||
                    (plan.name === "Free" && isSignedIn)
                  }
                  className={`mt-6 w-full py-2 rounded-lg font-medium transition ${
                    plan.name === "Free"
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {loading === plan.name ? "Processing..." : plan.buttonText}
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 p-4 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield size={14} />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={14} />
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard size={14} />
              <span>No Subscription</span>
            </div>
          </div>
        </div>
      </div>

      {showEligibilityModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Student Plan Eligibility</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                Student plan is only available for users with a{" "}
                <strong>@student.uitm.edu.my</strong> email address.
                {!isSignedIn &&
                  " Please sign in with your student email to continue."}
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
              >
                OK
              </button>
              {!isSignedIn && (
                <button
                  onClick={() => {
                    window.location.href = "/sign-in";
                  }}
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
