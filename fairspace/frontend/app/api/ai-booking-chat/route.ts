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
  organizerId?: string
  date: string
  start: string
  end: string
  status: "confirmed" | "checked-in" | "pending" | "cancelled"
  title?: string
  organizer?: string
  attendees?: number
}

type ChatAction = {
  type: "CREATE_BOOKING"
  payload: {
    roomId: string
    date: string
    start: string
    end: string
    title: string
    organizer: string
    attendees: number
    requestMessage?: string
  }
}

type RequestBody = {
  message?: string
  history?: Array<{ role: "user" | "assistant"; content: string }>
  context?: {
    rooms?: Room[]
    bookings?: Booking[]
    selectedDate?: string
    defaultOrganizer?: string
    currentProfileId?: string
    role?: "student" | "admin"
  }
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const DAY_START = 9 * 60
const DAY_END = 18 * 60 + 30
const SLOT_STEP = 30
const MAX_STANDARD_MINUTES = 120

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

function timeFromMinutes(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`
}

function overlaps(a: Booking, b: Pick<Booking, "roomId" | "date" | "start" | "end">) {
  if (a.status === "cancelled") return false
  if (a.roomId !== b.roomId || a.date !== b.date) return false
  return minutes(b.start) < minutes(a.end) && minutes(b.end) > minutes(a.start)
}

function durationMinutes(booking: Pick<Booking, "start" | "end">) {
  return Math.max(0, minutes(booking.end) - minutes(booking.start))
}

function userTimeConflict(bookings: Booking[], currentProfileId: string | undefined, date: string, start: string, end: string) {
  if (!currentProfileId) return undefined
  return bookings.find(
    (booking) =>
      booking.organizerId === currentProfileId &&
      booking.date === date &&
      booking.status !== "cancelled" &&
      minutes(start) < minutes(booking.end) &&
      minutes(end) > minutes(booking.start),
  )
}

function userBookedMinutesForDate(bookings: Booking[], currentProfileId: string | undefined, date: string) {
  if (!currentProfileId) return 0
  return bookings
    .filter((booking) => booking.organizerId === currentProfileId && booking.date === date && booking.status !== "cancelled")
    .reduce((sum, booking) => sum + durationMinutes(booking), 0)
}

function dateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function localIsoDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function parseDate(message: string, selectedDate: string) {
  const lower = message.toLowerCase()
  const base = new Date(`${selectedDate}T00:00:00`)

  if (lower.includes("tomorrow")) {
    base.setDate(base.getDate() + 1)
    return base.toISOString().slice(0, 10)
  }

  if (lower.includes("today")) return selectedDate

  const monthNames: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  }

  const monthDay = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/)
  if (monthDay) {
    const year = Number(monthDay[3] ?? base.getFullYear())
    return localIsoDate(year, monthNames[monthDay[1]], Number(monthDay[2]))
  }

  const dayMonth = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)(?:,?\s*(\d{4}))?\b/)
  if (dayMonth) {
    const year = Number(dayMonth[4] ?? base.getFullYear())
    return localIsoDate(year, monthNames[dayMonth[3]], Number(dayMonth[1]))
  }

  return selectedDate
}

function hasDateReference(message: string) {
  return /\b(today|tomorrow|\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)|(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2})\b/i.test(
    message,
  )
}

function parseSingleTime(raw: string) {
  const match = raw.toLowerCase().match(/\b(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?\b/)
  if (!match) return undefined
  let hour = Number(match[1])
  const minute = Number(match[2] ?? 0)
  const period = match[3]

  if (period === "pm" && hour !== 12) hour += 12
  if (period === "am" && hour === 12) hour = 0
  if (!period && hour < 8) hour += 12
  if (hour > 23 || minute > 59) return undefined

  return timeFromMinutes(hour * 60 + minute)
}

function parseTimeRange(message: string) {
  const lower = message.toLowerCase()
  const range = lower.match(/\b(?:from\s+)?(\d{1,2}(?::?\d{2})?\s*(?:am|pm)?)\s*(?:to|-|until)\s*(\d{1,2}(?::?\d{2})?\s*(?:am|pm)?)\b/)
  if (range) {
    const start = parseSingleTime(range[1])
    const end = parseSingleTime(range[2])
    if (start && end && minutes(end) > minutes(start)) return { start, end }
  }

  const single = lower.match(/\b(?:at\s*)?(\d{1,2}(?::?\d{2})?\s*(?:am|pm))\b/)
  const start = single ? parseSingleTime(single[1]) : undefined
  if (start) return { start, end: timeFromMinutes(minutes(start) + parseDuration(message)) }

  return undefined
}

function parseDuration(message: string) {
  const lower = message.toLowerCase()
  const hours = lower.match(/\b(\d+(?:\.\d+)?)\s*(hours?|hrs?)\b/)
  if (hours) return Math.round(Number(hours[1]) * 60)
  const minutesMatch = lower.match(/\b(\d+)\s*(minutes?|mins?)\b/)
  if (minutesMatch) return Number(minutesMatch[1])
  if (lower.includes("half hour")) return 30
  return 60
}

function parseAttendees(message: string) {
  const matches = [...message.toLowerCase().matchAll(/\b(\d+)\s*(people|pax|attendees|persons?|students?)\b/g)]
  const value = matches.at(-1)?.[1]
  return Math.max(1, Number(value ?? 3))
}

function matchingRoom(message: string, rooms: Room[]) {
  const lower = message.toLowerCase()
  const exact = rooms.find((room) => lower.includes(room.name.toLowerCase()))
  if (exact) return exact

  const discussionNumber = lower.match(/\b(?:discussion\s*)?room\s*(\d+)\b/)
  if (discussionNumber) {
    return rooms.find((room) => room.name.toLowerCase().includes(`room ${discussionNumber[1]}`))
  }

  return undefined
}

function needsScreen(message: string) {
  return /\b(big screen|screen|display|monitor|projector|presentation)\b/i.test(message)
}

function roomMatchesRequirements(room: Room, message: string) {
  if (!needsScreen(message)) return true
  const roomText = `${room.name} ${room.amenities?.join(" ") ?? ""}`.toLowerCase()
  return /\b(display screen|projector|screen|monitor)\b/.test(roomText)
}

function roomRequirementLabel(message: string) {
  if (needsScreen(message)) return " with a screen/projector"
  return ""
}

function availableRooms(
  rooms: Room[],
  bookings: Booking[],
  date: string,
  start: string,
  end: string,
  attendees: number,
  requirementText = "",
  currentProfileId?: string,
  allowExceedDailyLimit = false,
) {
  if (userTimeConflict(bookings, currentProfileId, date, start, end)) return []
  const bookedMinutes = userBookedMinutesForDate(bookings, currentProfileId, date)
  if (!allowExceedDailyLimit && bookedMinutes + (minutes(end) - minutes(start)) > MAX_STANDARD_MINUTES) return []

  const baseRooms = rooms
    .filter((room) => room.status === "available" && room.capacity >= attendees)
    .filter((room) => !bookings.some((booking) => overlaps(booking, { roomId: room.id, date, start, end })))

  const matchingRequirementRooms = baseRooms.filter((room) => roomMatchesRequirements(room, requirementText))
  const candidates = matchingRequirementRooms.length > 0 ? matchingRequirementRooms : baseRooms

  return candidates
    .sort((a, b) => a.capacity - b.capacity || a.name.localeCompare(b.name))
}

function bestSlot(rooms: Room[], bookings: Booking[], date: string, attendees: number, duration: number, message: string, currentProfileId?: string) {
  const lower = message.toLowerCase()
  const candidates: Array<{ start: string; end: string; rooms: Room[]; score: number }> = []

  for (let startMinute = DAY_START; startMinute + duration <= DAY_END; startMinute += SLOT_STEP) {
    if (lower.includes("morning") && startMinute >= 12 * 60) continue
    if (lower.includes("afternoon") && startMinute < 12 * 60) continue

    const start = timeFromMinutes(startMinute)
    const end = timeFromMinutes(startMinute + duration)
    const options = availableRooms(rooms, bookings, date, start, end, attendees, message, currentProfileId)
    if (options.length === 0) continue

    const middleOfDay = 13 * 60
    const score = options.length * 100 - Math.abs(startMinute - middleOfDay) + options[0].capacity
    candidates.push({ start, end, rooms: options, score })
  }

  return candidates.sort((a, b) => b.score - a.score)[0]
}

function asksForPrivateStudentInfo(message: string) {
  const lower = message.toLowerCase()
  if (/\b(who are you|what are you|your function|what can you do|how are you)\b/.test(lower)) return false
  return /\b(email|contact|details|profile|photo|picture|identity|always use|frequent users?|booking history|which student|who booked|who is using|who uses)\b/.test(lower)
}

function wantsBookingHelp(message: string) {
  const lower = message.toLowerCase()
  return /\b(book|booking|reserve|slot|room|available|availability|free|recommend|suggest|suggestion|best time|best slot|booking time|check|schedule|study|hours?|hrs?|from\s+\d|to\s+\d)\b/.test(lower)
}

function hasBookingContext(history: RequestBody["history"] = []) {
  return history
    .filter((item) => item.role === "user")
    .slice(-4)
    .some((item) => wantsBookingHelp(item.content) || parseTimeRange(item.content) || /\b(today|tomorrow|\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan|feb|mar|apr|may|jun|june|jul|aug|sep|oct|nov|dec)|(?:jan|feb|mar|apr|may|jun|june|jul|aug|sep|oct|nov|dec)\s+\d{1,2})\b/i.test(item.content))
}

function isBookingFollowUp(message: string, history: RequestBody["history"] = []) {
  const lower = message.toLowerCase().trim()
  if (!hasBookingContext(history)) return false
  return (
    parseTimeRange(message) !== undefined ||
    /\b(yes|yeah|yep|ok|okay|please|can\?|can ah|can or not|that one|this one|best one|best option|recommended one|same one|go with|use that|choose that|2 hours?|two hours?|1 hour|one hour|from\s+\d|to\s+\d)\b/.test(lower)
  )
}

function wantsToCreate(message: string, history: RequestBody["history"] = []) {
  const lower = message.toLowerCase().trim()
  if (/\b(don't|dont|do not|no need to|not yet|suggestions? first|suggest only|just suggest)\b/.test(lower)) return false
  return (
    /^(book|reserve|create)\b/.test(lower) ||
    /\b(book me|book for me|allow me to book|want to book|i want to book|click button)\b/.test(lower) ||
    (hasBookingContext(history) && /\b(yes|yes please|yep|yeah|ok|okay|please confirm|confirm it|go ahead|go with|best option|best one|recommended one|use that|choose that)\b/.test(lower)) ||
    /\b(please|help me|can you)\s+(book|reserve|create)\s+(discussion\s+)?room\s+\d+\b/.test(lower) ||
    /\b(book|reserve|create)\s+(discussion\s+)?room\s+\d+\b/.test(lower)
  )
}

function fallbackSmallTalk(message: string, historyLength: number) {
  const lower = message.toLowerCase()
  if (/\b(how are you|how you doing)\b/.test(lower)) {
    return "I'm good, thanks for asking. My main job is to analyse the available discussion-room slots, suggest the best time for your group, and prepare a booking button when you want to confirm."
  }

  if (/\b(who are you|what are you|your function|what can you do)\b/.test(lower)) {
    return "I am FairSpace AI, your student room-booking assistant. I can check free rooms, compare time slots, recommend the best room for your group size, and help prepare a booking button for you to confirm."
  }

  if (/\b(hi|hello|hey|working|test|testing)\b/.test(lower)) {
    return "Yep, I am here. I can analyse booking slots, suggest a good room and time, and help you book once you choose or ask me to prepare the best option."
  }

  const replies = [
    "I am listening. For this app, the most useful thing I can do is check room availability or suggest a good study slot.",
    "I did not get a booking detail from that yet. Try telling me a date, time, room, or number of people.",
    "I can help with room booking tasks here. Ask me something like, 'What is the best time on June 4 for 4 people?'",
  ]
  return replies[historyLength % replies.length]
}

function plannerReply(message: string, context: Required<RequestBody>["context"], history: RequestBody["history"] = []) {
  if (context.role === "admin") {
    return {
      reply: "The AI assistant is currently only enabled for students. Admins can manage bookings through Calendar, Schedule, Rooms, Admin Queue, Admin Report, and Ban User.",
    }
  }

  if (asksForPrivateStudentInfo(message)) {
    return {
      reply: "I cannot disclose other students' details or booking history. I can still help you find a free room, choose a better time, or prepare your own booking.",
    }
  }

  const rooms = context.rooms ?? []
  const bookings = context.bookings ?? []
  const historyText = history
    .filter((item) => item.role === "user")
    .slice(-4)
    .map((item) => item.content)
    .join(" ")
  const intentText = `${historyText} ${message}`
  const selectedDate = context.selectedDate ?? "2026-06-03"
  const date = hasDateReference(message) ? parseDate(message, selectedDate) : parseDate(intentText, selectedDate)
  const attendees = parseAttendees(intentText)
  const range = parseTimeRange(message) ?? parseTimeRange(historyText)
  const duration = range ? minutes(range.end) - minutes(range.start) : parseDuration(intentText)
  const requestedRoom = matchingRoom(message, rooms) ?? matchingRoom(intentText, rooms)
  const currentProfileId = context.currentProfileId

  if (range) {
    const longRequest = duration > MAX_STANDARD_MINUTES
    const ownConflict = userTimeConflict(bookings, currentProfileId, date, range.start, range.end)
    if (ownConflict) {
      return {
        reply: `You already have a booking from ${ownConflict.start} to ${ownConflict.end} on ${dateLabel(date)}, so I cannot prepare another slot that overlaps with it.`,
      }
    }

    if (!longRequest && userBookedMinutesForDate(bookings, currentProfileId, date) + duration > MAX_STANDARD_MINUTES) {
      return {
        reply: `You already reached the 2-hour booking limit on ${dateLabel(date)}. I cannot create another normal booking for that day. If you really need more time, request admin approval from the booking form.`,
      }
    }

    const options = availableRooms(rooms, bookings, date, range.start, range.end, attendees, intentText, currentProfileId, longRequest)
    const room = requestedRoom && options.some((option) => option.id === requestedRoom.id) ? requestedRoom : options[0]

    if (!room) {
      const alternative = bestSlot(rooms, bookings, date, attendees, Math.min(duration, 120), message, currentProfileId)
      return {
        reply: alternative
          ? `${dateLabel(date)} ${range.start}-${range.end} is not available for ${attendees} people. The best nearby option I found is ${alternative.start}-${alternative.end} in ${alternative.rooms[0].name}.`
          : `I could not find an available room on ${dateLabel(date)} for ${attendees} people. Try another day or fewer attendees.`,
      }
    }

    const shouldCreate = wantsToCreate(message, history)
    const reply = shouldCreate
      ? longRequest
        ? `${room.name} is free on ${dateLabel(date)} from ${range.start} to ${range.end}, but it is longer than 2 hours, so I prepared it as an admin approval request.`
        : `${room.name} is free on ${dateLabel(date)} from ${range.start} to ${range.end}. I prepared a booking button for you.`
      : `${room.name} is free on ${dateLabel(date)} from ${range.start} to ${range.end}${roomRequirementLabel(intentText)}. If you want this 2-hour slot, say "yes please" or "book it" and I will prepare the booking button.`

    return {
      reply,
      action: shouldCreate
        ? {
            type: "CREATE_BOOKING" as const,
            payload: {
              roomId: room.id,
              date,
              start: range.start,
              end: range.end,
              title: "Study room booking",
              organizer: context.defaultOrganizer ?? "Student",
              attendees,
              requestMessage: longRequest ? "Requested through the AI booking assistant." : undefined,
            },
          }
        : undefined,
    }
  }

  if (wantsBookingHelp(message) || isBookingFollowUp(message, history)) {
    if (userBookedMinutesForDate(bookings, context.currentProfileId, date) >= MAX_STANDARD_MINUTES) {
      return {
        reply: `You already have 2 hours booked on ${dateLabel(date)}, so I cannot suggest another normal slot for that day. You can choose another date or request admin approval for extra time.`,
      }
    }

    const recommended = bestSlot(rooms, bookings, date, attendees, Math.min(duration, 120), message, context.currentProfileId)
    if (!recommended) {
      return { reply: `I could not find a free slot on ${dateLabel(date)} for ${attendees} people. Try a different date or fewer attendees.` }
    }

    const roomList = recommended.rooms.slice(0, 3).map((room) => `${room.name} (${room.capacity} pax)`).join(", ")
    const shouldCreate = wantsToCreate(message, history)
    return {
      reply: shouldCreate
        ? `For ${dateLabel(date)}, I would book ${recommended.rooms[0].name}${roomRequirementLabel(intentText)} from ${recommended.start} to ${recommended.end} for ${attendees} people. Other good options at that time are ${roomList}. I prepared the booking button below, so you can confirm before anything is created.`
        : `For ${dateLabel(date)}, I found a few good choices first${roomRequirementLabel(intentText)}. Best option: ${recommended.start}-${recommended.end}. Available rooms: ${roomList}. I would pick ${recommended.rooms[0].name} because it fits your group with the least wasted capacity. If you like one of these, tell me the room and time, then I will prepare the booking button.`,
      action: shouldCreate
        ? {
            type: "CREATE_BOOKING" as const,
            payload: {
              roomId: recommended.rooms[0].id,
              date,
              start: recommended.start,
              end: recommended.end,
              title: "Study room booking",
              organizer: context.defaultOrganizer ?? "Student",
              attendees,
            },
          }
        : undefined,
    }
  }

  return { reply: fallbackSmallTalk(message, 0) }
}

function normalizeAction(action?: ChatAction) {
  if (!action || action.type !== "CREATE_BOOKING") return undefined
  const payload = action.payload
  return {
    type: "CREATE_BOOKING" as const,
    payload: {
      roomId: payload.roomId,
      date: payload.date,
      start: payload.start,
      end: payload.end,
      title: payload.title ?? "Study room booking",
      organizer: payload.organizer,
      attendees: Number(payload.attendees ?? 1),
      requestMessage: payload.requestMessage,
    },
  }
}

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)
  const raw = fenced?.[1] ?? text.match(/\{[\s\S]*\}/)?.[0] ?? text
  return JSON.parse(raw) as { reply?: string; action?: ChatAction }
}

async function askGemini(message: string, history: RequestBody["history"], context: Required<RequestBody>["context"]) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return undefined

  const prompt = `
You are FairSpace AI, a friendly student-only university discussion-room booking assistant.
Talk naturally, like a helpful chatbot, but stay inside room booking help.

Privacy rules:
- The user is a student.
- Never disclose other students' details, identity, email, photo, or booking history.
- If asked for other users, refuse briefly and redirect to finding or booking a room.

Booking rules:
- Standard bookings are up to 120 minutes.
- Longer bookings can be prepared as pending admin requests.
- If the user wants to book, return JSON with a CREATE_BOOKING action using a real roomId from context.
- If the user asks for best/free time, use the context data and recommend a concrete slot.
- Return strict JSON only: {"reply":"...","action":optionalAction}

Context:
selectedDate=${context.selectedDate}
defaultOrganizer=${context.defaultOrganizer}
currentProfileId=${context.currentProfileId}
rooms=${JSON.stringify(context.rooms)}
bookings=${JSON.stringify(context.bookings)}
history=${JSON.stringify(history ?? [])}

User message: ${message}
`

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        responseMimeType: "application/json",
      },
    }),
  })

  if (!response.ok) {
    console.warn(`Gemini request failed with HTTP ${response.status}. Using booking planner fallback.`)
    return undefined
  }

  const data = (await response.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? ""
  const parsed = extractJson(text)
  return {
    reply: parsed.reply ?? "I can help you find and book university discussion rooms.",
    action: normalizeAction(parsed.action),
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody
  const message = body.message?.trim() ?? ""
  const history = body.history?.slice(-8) ?? []
  const context = {
    rooms: body.context?.rooms ?? [],
    bookings: body.context?.bookings ?? [],
    selectedDate: body.context?.selectedDate ?? "2026-06-03",
    defaultOrganizer: body.context?.defaultOrganizer ?? "Student",
    currentProfileId: body.context?.currentProfileId,
    role: body.context?.role ?? "student",
  }

  if (!message) {
    return NextResponse.json({ reply: "Tell me the date, time, room, or number of people you want to book for.", source: "guardrail" })
  }

  if (context.role === "admin") {
    return NextResponse.json({
      reply: "The AI assistant is currently only enabled for student room booking help.",
      source: "guardrail",
    })
  }

  if (asksForPrivateStudentInfo(message) || wantsBookingHelp(message) || isBookingFollowUp(message, history)) {
    return NextResponse.json({ ...plannerReply(message, context, history), source: "planner" })
  }

  try {
    const gemini = await askGemini(message, history, context)
    if (gemini) return NextResponse.json({ ...gemini, source: "gemini" })
  } catch (error) {
    console.warn("Gemini response could not be used. Falling back to local booking planner.", error)
  }

  return NextResponse.json({
    reply: fallbackSmallTalk(message, history.length),
    source: "fallback",
  })
}
