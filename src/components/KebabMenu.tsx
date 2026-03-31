/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    direction: "bottom",
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight || 150;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldShowAbove =
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    const top = shouldShowAbove
      ? rect.top - dropdownHeight - 4
      : rect.bottom + 4;
    const left = rect.right - 144; // assuming width 144px
    setPosition({
      top,
      left,
      direction: shouldShowAbove ? "top" : "bottom",
    });
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Update position when open changes or scroll/resize
  useLayoutEffect(() => {
    if (open) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, true);
      };
    }
  }, [open]);

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-1 rounded-md hover:bg-gray-200 transition"
      >
        <MoreVertical size={14} />
      </button>
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-[100] w-36"
            style={{ top: position.top, left: position.left }}
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
          </div>,
          document.body,
        )}
    </div>
  );
}
