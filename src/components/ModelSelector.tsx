"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import {
  ChevronDown,
  Sparkles,
  Zap,
  Rocket,
  MoreHorizontal,
} from "lucide-react";

const modelGroups = [
  {
    name: "Opus 4.6",
    description: "Most capable for ambitious work",
    icon: Sparkles,
  },
  {
    name: "Sonnet 4.6",
    description: "Most efficient for everyday tasks",
    icon: Zap,
  },
  {
    name: "Haiku 4.5",
    description: "Fastest for quick answers",
    icon: Rocket,
  },
  {
    name: "Extended thinking",
    description: "Think longer for complex tasks",
    icon: MoreHorizontal,
  },
  {
    name: "More models",
    description: "",
    icon: MoreHorizontal,
    divider: true,
  },
];

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChat();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (model: string) => {
    setSelectedModel(model);
    setOpen(false);
  };

  // Click outside untuk tutup dropdown model
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1.5 text-xs font-medium transition"
      >
        <span>{selectedModel}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-64 z-50">
          {modelGroups.map((model, idx) => (
            <div key={idx}>
              {model.divider && (
                <div className="border-t border-gray-200 my-1" />
              )}
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition"
                onClick={() => handleSelect(model.name)}
              >
                <div className="flex items-start gap-2">
                  <model.icon size={14} className="mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">{model.name}</div>
                    {model.description && (
                      <div className="text-xs text-gray-500">
                        {model.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
