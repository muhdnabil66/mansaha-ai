"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  Sparkles,
  Zap,
  Rocket,
  MoreHorizontal,
  Code,
  Bot,
} from "lucide-react";
import Portal from "./Portal";
import { useRouter } from "next/navigation";

const allModels = [
  {
    name: "Claude Opus 4.6",
    id: "anthropic/claude-opus-4.6",
    requires: "student",
    icon: Sparkles,
    description: "Most capable",
  },
  {
    name: "GPT-5.3 Codex",
    id: "openai/gpt-5.3-codex",
    requires: "pro",
    icon: Code,
    description: "Advanced coding assistant",
  },
  {
    name: "Grok 4.20 Multi-agent",
    id: "x-ai/grok-4.20-multi-agent",
    requires: "pro",
    icon: Bot,
    description: "Multi-agent beta",
  },
  {
    name: "DeepSeek V3.2 Speciale",
    id: "deepseek/deepseek-v3.2-speciale",
    requires: "pro",
    icon: Rocket,
    description: "High performance",
  },
  {
    name: "Qwen 3.6 Plus",
    id: "qwen/qwen3.6-plus-preview:free",
    requires: "guest",
    icon: Sparkles,
    description: "Fast & free model",
  },
  {
    name: "Claude 3.5 Haiku",
    id: "anthropic/claude-3.5-haiku",
    requires: "guest",
    icon: Zap,
    description: "Fastest for quick answers",
  },
  {
    name: "Claude Sonnet 4.6",
    id: "anthropic/claude-sonnet-4.6",
    requires: "student",
    icon: Zap,
    description: "Efficient for everyday tasks",
  },
  {
    name: "Claude Opus 4.5",
    id: "anthropic/claude-opus-4.5",
    requires: "student",
    icon: Sparkles,
    description: "Powerful reasoning",
  },
];

const mainModels = allModels.filter((m) =>
  [
    "Claude Opus 4.6",
    "GPT-5.3 Codex",
    "Grok 4.20 Multi-agent",
    "DeepSeek V3.2 Speciale",
  ].includes(m.name),
);
const otherModels = allModels.filter((m) => !mainModels.includes(m));

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, userPlan } = useChat();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingModel, setPendingModel] = useState<
    (typeof allModels)[0] | null
  >(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [subMenuPosition, setSubMenuPosition] = useState({ top: 0, left: 0 });
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const subMenuRef = useRef<HTMLDivElement>(null);

  const canAccess = (model: (typeof allModels)[0]) => {
    if (model.requires === "guest") return true;
    if (
      model.requires === "student" &&
      (userPlan === "student" || userPlan === "pro" || userPlan === "admin")
    )
      return true;
    if (
      model.requires === "pro" &&
      (userPlan === "pro" || userPlan === "admin")
    )
      return true;
    if (userPlan === "admin") return true;
    return false;
  };

  const handleSelect = (model: (typeof allModels)[0]) => {
    if (canAccess(model)) {
      setSelectedModel(model.id);
      setOpen(false);
      setSubMenuOpen(false);
    } else {
      setPendingModel(model);
      setOpen(false);
      setSubMenuOpen(false);
      setShowUpgradeModal(true);
    }
  };

  const handleUpgradeConfirm = () => {
    setShowUpgradeModal(false);
    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      window.dispatchEvent(new CustomEvent("openPlanSelector"));
    }
  };

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = menuRef.current?.offsetHeight || 400;
    let top = rect.bottom + 4;
    if (spaceBelow < menuHeight) {
      top = rect.top - menuHeight - 4;
    }
    // Align right edge of menu with right edge of button
    let left = rect.right - 256;
    // Ensure it doesn't go off-screen
    if (left < 8) left = 8;
    if (left + 256 > window.innerWidth - 8) left = window.innerWidth - 256 - 8;
    setMenuPosition({ top, left });
  };

  const updateSubMenuPosition = () => {
    if (!moreButtonRef.current) return;
    const rect = moreButtonRef.current.getBoundingClientRect();
    const subWidth = 256;
    let left = rect.right + 4;
    if (left + subWidth > window.innerWidth - 8) {
      left = rect.left - subWidth - 4;
    }
    let top = rect.top;
    const subHeight = subMenuRef.current?.offsetHeight || 400;
    if (top + subHeight > window.innerHeight - 8) {
      top = window.innerHeight - subHeight - 8;
    }
    if (top < 8) top = 8;
    setSubMenuPosition({ top, left });
  };

  useEffect(() => {
    if (open) {
      updateMenuPosition();
      window.addEventListener("resize", updateMenuPosition);
      window.addEventListener("scroll", updateMenuPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (subMenuOpen) {
      updateSubMenuPosition();
      window.addEventListener("resize", updateSubMenuPosition);
      window.addEventListener("scroll", updateSubMenuPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updateSubMenuPosition);
      window.removeEventListener("scroll", updateSubMenuPosition, true);
    };
  }, [subMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSubMenuOpen(false);
      }
      if (
        subMenuRef.current &&
        !subMenuRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setSubMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModel = allModels.find((m) => m.id === selectedModel);
  const currentDisplay = currentModel?.name || "Select model";

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1.5 text-xs font-medium transition"
        >
          <span>{currentDisplay}</span>
          <ChevronDown size={12} />
        </button>

        {open && (
          <Portal>
            <div
              ref={menuRef}
              className="fixed bg-white border border-gray-200 rounded-lg shadow-lg w-64 z-[100]"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              {mainModels.map((model, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center justify-between"
                  onClick={() => handleSelect(model)}
                >
                  <div className="flex items-start gap-2">
                    <model.icon size={14} className="mt-0.5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">
                        {model.description}
                      </div>
                    </div>
                  </div>
                  {!canAccess(model) && (
                    <span className="text-xs text-yellow-600 font-medium">
                      Upgrade
                    </span>
                  )}
                </button>
              ))}
              <div className="border-t border-gray-200 my-1" />
              <div className="relative">
                <button
                  ref={moreButtonRef}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSubMenuOpen(!subMenuOpen);
                  }}
                >
                  <MoreHorizontal size={14} />
                  <span className="text-sm">More models</span>
                  <ChevronDown size={12} className="ml-auto" />
                </button>
                {subMenuOpen && (
                  <Portal>
                    <div
                      ref={subMenuRef}
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg w-64 z-[101]"
                      style={{
                        top: subMenuPosition.top,
                        left: subMenuPosition.left,
                      }}
                    >
                      {otherModels.map((model, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition flex items-center justify-between"
                          onClick={() => handleSelect(model)}
                        >
                          <div className="flex items-start gap-2">
                            <model.icon
                              size={14}
                              className="mt-0.5 text-gray-500"
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {model.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {model.description}
                              </div>
                            </div>
                          </div>
                          {!canAccess(model) && (
                            <span className="text-xs text-yellow-600 font-medium">
                              Upgrade
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </Portal>
                )}
              </div>
            </div>
          </Portal>
        )}
      </div>

      {/* Modal confirm upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Model Access Required</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                {!isSignedIn
                  ? `Sign in to access ${pendingModel?.name}.`
                  : `Upgrade your plan to access ${pendingModel?.name}.`}
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradeConfirm}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                {!isSignedIn ? "Sign in" : "Upgrade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
