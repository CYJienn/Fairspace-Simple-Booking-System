"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventInput } from "@fullcalendar/core";
import { toast } from "sonner";
import { createBooking } from "@/app/(app)/actions/bookings";

function toIso(d: Date) {
  return d.toISOString();
}

export function BookingCalendar({ roomId }: { roomId: string }) {
  const [events, setEvents] = React.useState<EventInput[]>([]);

  const fetchEvents = React.useCallback(
    async (start: Date, end: Date) => {
      const res = await fetch(
        `/api/bookings?roomId=${encodeURIComponent(roomId)}&start=${encodeURIComponent(
          toIso(start),
        )}&end=${encodeURIComponent(toIso(end))}`,
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error ?? "Failed to load bookings");
        return;
      }
      const body = (await res.json()) as {
        bookings: { id: string; start_time: string; end_time: string; status: string }[];
      };

      setEvents(
        body.bookings.map((b) => ({
          id: b.id,
          start: b.start_time,
          end: b.end_time,
          title: b.status === "confirmed" ? "Booked" : "Pending",
          backgroundColor: b.status === "confirmed" ? "#4f46e5" : "#a1a1aa",
          borderColor: b.status === "confirmed" ? "#4f46e5" : "#a1a1aa",
        })),
      );
    },
    [roomId],
  );

  const onSelect = React.useCallback(
    async (arg: DateSelectArg) => {
      arg.view.calendar.unselect();

      const start = arg.start;
      const end = arg.end;

      const durationMin = (end.getTime() - start.getTime()) / 60000;
      if (durationMin < 30) {
        toast.error("Minimum booking is 30 minutes.");
        return;
      }
      if (durationMin > 120) {
        toast.error("Maximum booking is 2 hours.");
        return;
      }

      const res = await createBooking({ roomId, start: toIso(start), end: toIso(end) });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Booking created (pending).");

      // Optimistic refresh for current visible range.
      const api = arg.view.calendar;
      fetchEvents(api.view.activeStart, api.view.activeEnd);
    },
    [fetchEvents, roomId],
  );

  return (
    <div className="rounded-lg border bg-card">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height="auto"
        nowIndicator
        slotDuration="00:30:00"
        selectable
        selectMirror
        select={onSelect}
        events={events}
        datesSet={(arg) => {
          fetchEvents(arg.start, arg.end);
        }}
      />
    </div>
  );
}

