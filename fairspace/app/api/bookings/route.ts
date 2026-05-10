import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const QuerySchema = z.object({
  roomId: z.string().uuid(),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    roomId: url.searchParams.get("roomId"),
    start: url.searchParams.get("start"),
    end: url.searchParams.get("end"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  // Uses service role to show availability without leaking user IDs.
  const supabase = createSupabaseAdminClient();
  const { roomId, start, end } = parsed.data;

  const { data, error } = await supabase
    .from("bookings")
    .select("id,room_id,start_time,end_time,status")
    .eq("room_id", roomId)
    .in("status", ["pending", "confirmed"])
    .gte("end_time", start)
    .lte("start_time", end)
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ bookings: data ?? [] });
}

