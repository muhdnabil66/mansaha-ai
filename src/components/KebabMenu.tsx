/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { MoreVertical, Star, Edit2, Trash2 } from "lucide-react";
import Portal from "./Portal";

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
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !menuRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    let top: number;
    if (spaceBelow < menuRect.height && spaceAbove > menuRect.height) {
      top = buttonRect.top - menuRect.height - 4;
    } else {
      top = buttonRect.bottom + 4;
    }
    let left = buttonRect.right - menuRect.width;
    if (left < 8) left = 8;
    if (left + menuRect.width > window.innerWidth - 8)
      left = window.innerWidth - menuRect.width - 8;
    setPosition({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
          window.removeEventListener("scroll", updatePosition, true);
          window.removeEventListener("resize", updatePosition);
        };
      });
    } else {
      setPosition(null);
    }
  }, [open, updatePosition]);

  useLayoutEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="p-1 rounded-md hover:bg-gray-200 transition"
      >
        <MoreVertical size={14} />
      </button>
      {open && position && (
        <Portal>
          <div
            ref={menuRef}
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
          </div>
        </Portal>
      )}
    </>
  );
}
