// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("Menggunakan model: openrouter/free");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mansaha.atlasflux.my", // Ganti dengan domain production nanti
          "X-Title": "Mansaha AI",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-plus-preview:free", // Router auto pilih model free
          messages: messages,
          temperature: 0.7,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Unknown API error" },
        { status: response.status },
      );
    }

    const reply = data.choices?.[0]?.message?.content || "No response";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
