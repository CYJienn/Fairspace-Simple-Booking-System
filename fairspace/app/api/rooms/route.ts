import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name,capacity,location,description,is_active,created_at")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rooms: data ?? [] });
}

