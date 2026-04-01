"use client";

import { useChat } from "@/context/ChatContext";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { FolderKanban, Plus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function ProjectsView() {
  const { setCurrentView } = useChat();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();
      if (!userData) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        Loading projects...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentView("chat")}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to chat
        </button>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm">
          <Plus size={16} />
          New Project
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <div className="border-2 border-dashed rounded-2xl py-20 text-center">
            <FolderKanban size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-400">No projects yet.</p>
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="border rounded-xl p-5 hover:shadow-sm transition cursor-pointer"
            >
              <h3 className="font-bold text-lg">{proj.name}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {proj.description || "No description."}
              </p>
              <div className="text-[10px] text-gray-400 mt-4 uppercase tracking-wider">
                Created: {new Date(proj.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
