"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CreateBookingSchema = z.object({
  roomId: z.string().uuid(),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export async function createBooking(input: z.infer<typeof CreateBookingSchema>) {
  const parsed = CreateBookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Invalid booking input" };

  const supabase = await createSupabaseServerClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) return { ok: false as const, message: "Not signed in" };

  const { roomId, start, end } = parsed.data;

  const { error } = await supabase.from("bookings").insert({
    room_id: roomId,
    created_by: userRes.user.id,
    start_time: start,
    end_time: end,
    status: "pending",
  });

  // If overlap constraint hits, Supabase returns a Postgres error string.
  if (error) return { ok: false as const, message: error.message };

  revalidatePath("/app");
  return { ok: true as const };
}

