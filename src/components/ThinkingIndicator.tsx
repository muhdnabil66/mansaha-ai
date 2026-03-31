"use client";

import Image from "next/image";

export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 text-gray-500 animate-pulse">
      <div className="relative w-5 h-5 animate-spin">
        <Image
          src="/mansaha.png"
          alt="Thinking"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-sm">Thinking...</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
}
