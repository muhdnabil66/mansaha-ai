"use client";

import { useChat } from "@/context/ChatContext";
import { useState, useRef, useEffect } from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Crown,
  User,
  X,
} from "lucide-react";
import KebabMenu from "./KebabMenu";

export default function Sidebar() {
  const {
    conversations,
    currentConversationId,
    switchConversation,
    createNewChat,
    renameConversation,
    deleteConversation,
    toggleStarConversation,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Mobile: close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        window.innerWidth < 1024 &&
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen, closeSidebar]);

  // Open search modal when typing
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setShowSearchModal(true);
    } else {
      setShowSearchModal(false);
    }
  }, [searchQuery]);

  const handleRename = (id: string, currentTitle: string) => {
    setRenameId(id);
    setRenameValue(currentTitle);
  };

  const submitRename = () => {
    if (renameId && renameValue.trim()) {
      renameConversation(renameId, renameValue);
    }
    setRenameId(null);
    setRenameValue("");
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This action cannot be undone.`)) {
      deleteConversation(id);
    }
  };

  const handleStar = (id: string) => {
    toggleStarConversation(id);
  };

  return (
    <>
      {/* Toggle button when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition"
          title="Open sidebar"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          w-80 flex flex-col shadow-lg
        `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/mansaha.png"
              alt="Mansaha"
              className="w-6 h-6 object-contain"
            />
            <h1 className="font-semibold text-lg">Claude</h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
            title="Close sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 space-y-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium"
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>

          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
            <Settings size={16} />
            <span>Customize</span>
          </button>
        </div>

        <div className="flex gap-2 p-2 border-b border-gray-200">
          <button className="flex-1 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium">
            Chat
          </button>
          <button className="flex-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
            Projects
          </button>
          <button className="flex-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
            Artifacts
          </button>
          <button className="flex-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
            Code
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-2 px-2 text-xs font-medium text-gray-500">
            Recents
          </div>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`
                  group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition
                  ${currentConversationId === conv.id ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}
                `}
              >
                <button
                  onClick={() => {
                    switchConversation(conv.id);
                    if (window.innerWidth < 1024) closeSidebar();
                  }}
                  className="flex-1 text-left truncate"
                >
                  {conv.title}
                </button>
                <div
                  className={`
                    ${window.innerWidth >= 1024 ? "opacity-0 group-hover:opacity-100" : "opacity-100"}
                    transition-opacity
                  `}
                >
                  <KebabMenu
                    onStar={() => handleStar(conv.id)}
                    onRename={() => handleRename(conv.id, conv.title)}
                    onDelete={() => handleDelete(conv.id, conv.title)}
                    isStarred={!!conv.starred}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Free plan</span>
            <button className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200">
              Upgrade
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Crown size={14} />
            <span>Upgrade for more</span>
          </div>
        </div>
      </aside>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-medium">Search conversations</h3>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchModal(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No results found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        switchConversation(conv.id);
                        setSearchQuery("");
                        setShowSearchModal(false);
                        if (window.innerWidth < 1024) closeSidebar();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      {conv.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename modal */}
      {renameId && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Rename conversation</h3>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename();
                }}
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setRenameId(null)}
                className="px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={submitRename}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
