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
  LogOut,
  HelpCircle,
  Gift,
  X,
  MoreVertical,
  Star,
  Edit2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import { useUser, SignOutButton } from "@clerk/nextjs";
import PlanSelector from "./PlanSelector";
import { useRouter } from "next/navigation";

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
    setCurrentView,
    userPlan,
    chatCount,
    chatLimitMessage,
    requestUpgrade,
    username,
    updateUsername,
  } = useChat();

  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const showSearchModal = searchQuery.trim().length > 0;
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

  useEffect(() => {
    const handleOpenPlan = () => setShowPlans(true);
    window.addEventListener("openPlanSelector", handleOpenPlan);
    return () => window.removeEventListener("openPlanSelector", handleOpenPlan);
  }, []);

  // Handle menu positioning
  const handleOpenMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 4, left: rect.right - 128 });
    setOpenMenuFor(id);
  };

  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, []);

  const handleRename = (id: string, currentTitle: string) => {
    setRenameId(id);
    setRenameValue(currentTitle);
    setOpenMenuFor(null);
  };

  const submitRename = () => {
    if (renameId && renameValue.trim()) {
      renameConversation(renameId, renameValue);
    }
    setRenameId(null);
    setRenameValue("");
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
    setOpenMenuFor(null);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteConversation(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleStar = (id: string) => {
    toggleStarConversation(id);
    setOpenMenuFor(null);
  };

  const handleViewChange = (
    view: "chat" | "projects" | "artifacts" | "code",
  ) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) closeSidebar();
  };

  const openSettings = () => {
    setNewUsername(username);
    setShowSettings(true);
    setUserMenuOpen(false);
  };

  const saveUsername = async () => {
    await updateUsername(newUsername);
    setShowSettings(false);
  };

  return (
    <>
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition"
          title="Open sidebar"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/mansaha.png"
              alt="Mansaha"
              width={24}
              height={24}
              className="object-contain"
            />
            <h1 className="font-semibold text-lg">Mansaha</h1>
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
            onClick={() => {
              createNewChat();
              setCurrentView("chat");
            }}
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
          <button
            onClick={() => handleViewChange("chat")}
            className="flex-1 px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium"
          >
            Chat
          </button>
          <button
            onClick={() => handleViewChange("projects")}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
          >
            Projects
          </button>
          <button
            onClick={() => handleViewChange("artifacts")}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
          >
            Artifacts
          </button>
          <button
            onClick={() => handleViewChange("code")}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
          >
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
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                  currentConversationId === conv.id
                    ? "bg-gray-100 font-medium"
                    : "hover:bg-gray-50"
                }`}
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
                <button
                  onClick={(e) => handleOpenMenu(e, conv.id)}
                  className="p-1 rounded-md hover:bg-gray-200 transition"
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Guest limit message */}
        {chatLimitMessage && (
          <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
            {chatLimitMessage}
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">
                  {isSignedIn
                    ? username || user?.emailAddresses[0]?.emailAddress
                    : "Guest"}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {userPlan}
                </div>
              </div>
            </button>
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {!isSignedIn && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      router.push("/sign-in");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <User size={14} />
                    <span>Sign in</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    openSettings();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShowPlans(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Crown size={14} />
                  <span>Upgrade plan</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                  <HelpCircle size={14} />
                  <span>Get help</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                  <Gift size={14} />
                  <span>Gift Mansaha</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
                  <X size={14} />
                  <span>Learn more</span>
                </button>
                {isSignedIn && (
                  <div className="border-t border-gray-200">
                    <SignOutButton>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={14} />
                        <span>Log out</span>
                      </button>
                    </SignOutButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Kebab menu floating */}
      {openMenuFor && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-[100] w-36"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button
            onClick={() => {
              const conv = conversations.find((c) => c.id === openMenuFor);
              if (conv) handleStar(conv.id);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            <Star
              size={14}
              className={
                conversations.find((c) => c.id === openMenuFor)?.starred
                  ? "fill-yellow-400 text-yellow-400"
                  : ""
              }
            />
            <span>
              {conversations.find((c) => c.id === openMenuFor)?.starred
                ? "Unstar"
                : "Star"}
            </span>
          </button>
          <button
            onClick={() => {
              const conv = conversations.find((c) => c.id === openMenuFor);
              if (conv) handleRename(conv.id, conv.title);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition"
          >
            <Edit2 size={14} />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              const conv = conversations.find((c) => c.id === openMenuFor);
              if (conv) handleDelete(conv.id, conv.title);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-medium">Search conversations</h3>
              <button
                onClick={() => setSearchQuery("")}
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

      {/* Rename Modal */}
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

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete conversation"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <PlanSelector onClose={() => setShowPlans(false)} open={showPlans} />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium">Settings</h3>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
                placeholder="Enter username"
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={saveUsername}
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
