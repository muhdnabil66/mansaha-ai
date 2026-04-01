import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userMessage } = await req.json();
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-plus-preview:free",
          messages: [
            {
              role: "system",
              content:
                "Generate a short, conversational title (max 5 words) in Malay based on the user's message. The title should capture the essence of the topic. Return only the title, no quotes, no explanation.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      console.error("Title generation API error:", response.status);
      return NextResponse.json({ title: "New Chat" });
    }

    const data = await response.json();
    let title = data.choices[0]?.message?.content?.trim() || "New Chat";
    title = title.replace(/^["']|["']$/g, "");
    if (title.length > 50) title = title.slice(0, 50);
    return NextResponse.json({ title });
  } catch (err) {
    console.error("Title generation failed", err);
    return NextResponse.json({ title: "New Chat" });
  }
}
