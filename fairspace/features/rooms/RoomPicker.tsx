"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Room } from "@/types/db";
import { BookingCalendar } from "@/features/calendar/BookingCalendar";

export function RoomPicker({ rooms, defaultRoomId }: { rooms: Room[]; defaultRoomId: string }) {
  const [roomId, setRoomId] = React.useState(defaultRoomId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium">Room</div>
        <div className="w-full sm:w-[320px]">
          <Select
            value={roomId}
            onValueChange={(value) => {
              if (value) setRoomId(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <BookingCalendar roomId={roomId} />
    </div>
  );
}

