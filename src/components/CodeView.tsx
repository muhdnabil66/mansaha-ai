"use client";

import { useChat } from "@/context/ChatContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import CodeSidebar from "./CodeSidebar";

interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
}

export default function CodeView() {
  const { setCurrentView } = useChat();
  const { user, isSignedIn } = useUser();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(
    null,
  );

  useEffect(() => {
    const loadSnippets = async () => {
      if (!isSignedIn) {
        // For demo, show empty state
        setSnippets([]);
        setLoading(false);
        return;
      }
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user?.id)
        .single();
      if (!userData) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("artifacts")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });
      if (data) setSnippets(data);
      setLoading(false);
    };
    loadSnippets();
  }, [user, isSignedIn]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button
        onClick={() => setCurrentView("chat")}
        className="mb-4 text-sm text-gray-500 hover:text-black transition flex items-center gap-1"
      >
        ← Back to chat
      </button>
      <h1 className="text-2xl font-semibold mb-6">Code Snippets</h1>
      {snippets.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No code snippets yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {snippets.map((s) => (
            <div
              key={s.id}
              className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedSnippet(s)}
            >
              <h3 className="font-medium">{s.title}</h3>
              <div className="text-xs text-gray-400 mt-1">{s.language}</div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(s.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedSnippet && (
        <CodeSidebar
          code={selectedSnippet.code}
          language={selectedSnippet.language}
          onClose={() => setSelectedSnippet(null)}
        />
      )}
    </div>
  );
}
