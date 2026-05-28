import { NextResponse } from "next/server"

type Room = {
  id: string
  name: string
  capacity: number
  status: "available" | "maintenance"
  amenities?: string[]
}

type Booking = {
  roomId: string
  date: string
  start: string
  end: string
  status: "confirmed" | "checked-in" | "pending" | "cancelled"
}

type RequestBody = {
  message?: string
  context?: {
    rooms?: Room[]
    bookings?: Booking[]
    selectedDate?: string
    defaultOrganizer?: string
  }
}

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

function addMinutes(time: string, amount: number) {
  const total = minutes(time) + amount
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function overlaps(a: Booking, b: Pick<Booking, "roomId" | "date" | "start" | "end">) {
  if (a.status === "cancelled") return false
  if (a.roomId !== b.roomId || a.date !== b.date) return false
  return minutes(b.start) < minutes(a.end) && minutes(b.end) > minutes(a.start)
}

function dateFromMessage(message: string, selectedDate: string) {
  const lower = message.toLowerCase()
  if (lower.includes("june 4") || lower.includes("jun 4") || lower.includes("tomorrow")) return "2026-06-04"
  if (lower.includes("june 5") || lower.includes("jun 5")) return "2026-06-05"
  if (lower.includes("june 3") || lower.includes("jun 3") || lower.includes("today")) return "2026-06-03"
  return selectedDate || "2026-06-03"
}

function timeFromMessage(message: string) {
  const lower = message.toLowerCase()
  const simple = lower.match(/\b(9|10|11|1|2|3|4)(?::(00|30))?\s*(am|pm)\b/)
  if (simple) {
    let hour = Number(simple[1])
    const minute = simple[2] ?? "00"
    const period = simple[3]
    if (period === "pm" && hour !== 12) hour += 12
    if (period === "am" && hour === 12) hour = 0
    return `${String(hour).padStart(2, "0")}:${minute}`
  }
  if (lower.includes("morning")) return "09:30"
  if (lower.includes("afternoon")) return "14:00"
  return "10:00"
}

function durationFromMessage(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes("2 hour") || lower.includes("two hour")) return 120
  if (lower.includes("90") || lower.includes("1.5")) return 90
  if (lower.includes("30")) return 30
  return 60
}

function attendeesFromMessage(message: string) {
  const people = message.toLowerCase().match(/\b(\d+)\s*(people|pax|persons|attendees|person)\b/)
  return people ? Math.max(1, Number(people[1])) : 3
}

function isBookingRelated(message: string) {
  const lower = message.toLowerCase()
  return [
    "book",
    "booking",
    "room",
    "slot",
    "available",
    "availability",
    "schedule",
    "cancel",
    "check in",
    "meeting",
    "attendees",
    "people",
    "pax",
  ].some((word) => lower.includes(word))
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody
  const message = body.message?.trim() ?? ""
  const rooms = body.context?.rooms ?? []
  const bookings = body.context?.bookings ?? []
  const selectedDate = body.context?.selectedDate ?? "2026-06-03"
  const defaultOrganizer = body.context?.defaultOrganizer ?? "Demo User"

  if (!message) {
    return NextResponse.json({ reply: "Tell me what kind of room slot you need." })
  }

  if (!isBookingRelated(message)) {
    return NextResponse.json({
      reply:
        "I can only help with room booking slots, availability, room capacity, check-ins, and schedule changes. Ask me something like: 'Find a room for 4 people tomorrow afternoon.'",
    })
  }

  const date = dateFromMessage(message, selectedDate)
  const start = timeFromMessage(message)
  const duration = durationFromMessage(message)
  const end = addMinutes(start, duration)
  const attendees = attendeesFromMessage(message)
  const lower = message.toLowerCase()

  const requestedRoom =
    rooms.find((room) => lower.includes(room.name.toLowerCase())) ??
    rooms.find((room) => room.status === "available" && room.capacity >= attendees)

  const availableRooms = rooms
    .filter((room) => room.status === "available" && room.capacity >= attendees)
    .filter((room) => !bookings.some((booking) => overlaps(booking, { roomId: room.id, date, start, end })))
    .sort((a, b) => a.capacity - b.capacity)

  const wantsToBook = lower.includes("book") || lower.includes("reserve") || lower.includes("create")

  if (wantsToBook) {
    if (duration > 120) {
      return NextResponse.json({
        reply:
          "Standard bookings are limited to 2 hours. For 3-hour sessions, the student must request admin approval first. That approval flow is not enabled yet.",
      })
    }

    const room = requestedRoom && availableRooms.some((item) => item.id === requestedRoom.id) ? requestedRoom : availableRooms[0]

    if (!room) {
      return NextResponse.json({
        reply: `I could not find an available room for ${attendees} people on ${date} from ${start} to ${end}. Try fewer attendees, another time, or a larger room.`,
      })
    }

    return NextResponse.json({
      reply: `I found ${room.name} for ${attendees} people on ${date}, ${start}-${end}. I will create the booking now.`,
      action: {
        type: "CREATE_BOOKING",
        payload: {
          roomId: room.id,
          date,
          start,
          end,
          title: "AI-created room booking",
          organizer: defaultOrganizer,
          attendees,
        },
      },
    })
  }

  if (availableRooms.length === 0) {
    return NextResponse.json({
      reply: `No available rooms match ${attendees} people on ${date}, ${start}-${end}. You can ask me to try another time or reduce the attendee count.`,
    })
  }

  const topRooms = availableRooms.slice(0, 3).map((room) => `${room.name} (${room.capacity} pax)`)
  return NextResponse.json({
    reply: `Best available options for ${attendees} people on ${date}, ${start}-${end}: ${topRooms.join(", ")}. Say 'book it' with a room name if you want me to create the slot.`,
  })
}
