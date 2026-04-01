import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const fileName = `${userId}/${uuidv4()}-${file.name}`;
  const { error } = await supabase.storage
    .from("attachments")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from("attachments")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl.publicUrl });
}
