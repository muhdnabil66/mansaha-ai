import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const { messages, model, stream } = await req.json();

  // Determine user plan
  let userPlan = "guest";
  if (userId) {
    const { data: userData } = await supabase
      .from("users")
      .select("plan")
      .eq("clerk_id", userId)
      .single();
    userPlan = userData?.plan || "free";
  }

  // Allowed models per plan
  const allowedForGuest = [
    "qwen/qwen3.6-plus-preview:free",
    "anthropic/claude-3.5-haiku",
  ];
  const allowedForFree = [
    "qwen/qwen3.6-plus-preview:free",
    "anthropic/claude-3.5-haiku",
  ];
  const allowedForStudent = [
    "qwen/qwen3.6-plus-preview:free",
    "anthropic/claude-3.5-haiku",
    "anthropic/claude-sonnet-4.6",
    "anthropic/claude-opus-4.6",
    "anthropic/claude-opus-4.5",
  ];
  const allowedForPro = ["*"]; // all models
  const allowedForAdmin = ["*"];

  let isAllowed = false;
  if (userPlan === "admin" || userPlan === "pro") isAllowed = true;
  else if (userPlan === "student")
    isAllowed =
      allowedForStudent.includes(model) ||
      model === "qwen/qwen3.6-plus-preview:free" ||
      model === "anthropic/claude-3.5-haiku";
  else if (userPlan === "free") isAllowed = allowedForFree.includes(model);
  else if (userPlan === "guest") isAllowed = allowedForGuest.includes(model);

  if (!isAllowed) {
    return new Response(
      JSON.stringify({ error: "Upgrade to access this model" }),
      { status: 403 },
    );
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: stream === true,
        temperature: 0.7,
      }),
    },
  );

  if (!stream) {
    const data = await response.json();
    return Response.json({ reply: data.choices[0]?.message?.content || "" });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
