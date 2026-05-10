import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RoomPicker } from "@/features/rooms/RoomPicker";

export default function AppHomePage() {
  // This page is wrapped by a layout that already requires auth.
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Pick a room, then drag-select a time range to create a booking.
        </p>
      </div>

      <CalendarShell />
    </div>
  );
}

async function CalendarShell() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name,capacity,location,description,is_active,created_at")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(50);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rooms unavailable</CardTitle>
          <CardDescription>Couldn’t load rooms from Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{error.message}</CardContent>
      </Card>
    );
  }

  const rooms = data ?? [];
  const defaultRoomId = rooms[0]?.id;

  if (!defaultRoomId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No rooms yet</CardTitle>
          <CardDescription>
            Add at least one room in Supabase (table `rooms`) to start booking.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <RoomPicker rooms={rooms} defaultRoomId={defaultRoomId} />;
}

