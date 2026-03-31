"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Star, Edit2, Trash2 } from "lucide-react";

interface KebabMenuProps {
  onStar: () => void;
  onRename: () => void;
  onDelete: () => void;
  isStarred: boolean;
}

export default function KebabMenu({
  onStar,
  onRename,
  onDelete,
  isStarred,
}: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      if (spaceBelow < menuRect.height && spaceAbove > menuRect.height) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [open]);

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-1 rounded-md hover:bg-gray-200 transition"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div
          className={`absolute right-0 ${position === "top" ? "bottom-full mb-1" : "top-full mt-1"} bg-white border border-gray-200 rounded-md shadow-lg z-50 w-36`}
        >
          <button
            onClick={() => handleAction(onStar)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            <Star
              size={14}
              className={isStarred ? "fill-yellow-400 text-yellow-400" : ""}
            />
            <span>{isStarred ? "Unstar" : "Star"}</span>
          </button>
          <button
            onClick={() => handleAction(onRename)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            <Edit2 size={14} />
            <span>Rename</span>
          </button>
          <button
            onClick={() => handleAction(onDelete)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
