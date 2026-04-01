"use client";

import { useChat } from "@/context/ChatContext";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import CodeSidebar from "./CodeSidebar";
import { FileCode, Calendar } from "lucide-react";

interface Artifact {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
}

export default function ArtifactsView() {
  const { setCurrentView } = useChat();
  const { user } = useUser();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null,
  );

  const loadArtifacts = useCallback(async () => {
    if (!user) return;
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();
      if (!userData) return;

      const { data, error } = await supabase
        .from("artifacts")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setArtifacts(data);
    } catch (err) {
      console.error("Error loading artifacts:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadArtifacts();
  }, [loadArtifacts]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full text-gray-400">
        Loading artifacts...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button
        onClick={() => setCurrentView("chat")}
        className="mb-6 text-sm text-gray-500 hover:text-black"
      >
        ← Back to chat
      </button>
      <h1 className="text-2xl font-bold mb-6">Artifacts</h1>
      <div className="grid gap-4">
        {artifacts.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No artifacts found.</p>
        ) : (
          artifacts.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArtifact(art)}
              className="border rounded-xl p-4 hover:border-gray-400 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <FileCode size={20} className="text-gray-400" />
                <div>
                  <h3 className="font-medium">{art.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {art.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(art.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedArtifact && (
        <CodeSidebar
          code={selectedArtifact.code}
          language={selectedArtifact.language}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </div>
  );
}
