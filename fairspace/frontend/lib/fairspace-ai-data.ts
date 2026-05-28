"use client"

export type BookingStatus = "confirmed" | "checked-in" | "pending" | "cancelled"
export type InterviewType = "technical" | "portfolio" | "culture" | "assessment"

export type Candidate = {
  id: string
  name: string
  role: string
  school: string
  skills: string[]
  priority: "high" | "medium" | "normal"
  availability: string[]
  notes: string
}

export type Room = {
  id: string
  name: string
  zone: string
  capacity: number
  equipment: string[]
  focus: string
  status: "ready" | "maintenance"
}

export type Booking = {
  id: string
  title: string
  roomId: string
  candidateIds: string[]
  date: string
  start: string
  end: string
  type: InterviewType
  status: BookingStatus
  owner: string
}

export type AiSlot = {
  roomId: string
  date: string
  start: string
  end: string
  score: number
  reason: string
  risks: string[]
}

export const demoDates = ["2026-06-03", "2026-06-04", "2026-06-05"]

export const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

export const candidates: Candidate[] = [
  {
    id: "cand-aiman",
    name: "Aiman Rahman",
    role: "Frontend Intern",
    school: "Asia Pacific University",
    skills: ["React", "UI polish", "TypeScript"],
    priority: "high",
    availability: ["2026-06-03", "2026-06-04"],
    notes: "Strong portfolio, needs a visual product walkthrough.",
  },
  {
    id: "cand-nur",
    name: "Nur Izzati",
    role: "Product Intern",
    school: "Taylor's University",
    skills: ["Research", "Figma", "Pitching"],
    priority: "medium",
    availability: ["2026-06-04", "2026-06-05"],
    notes: "Good storyteller, best with panel interview format.",
  },
  {
    id: "cand-jun",
    name: "Lee Jun",
    role: "Backend Intern",
    school: "Sunway University",
    skills: ["Node.js", "Postgres", "APIs"],
    priority: "high",
    availability: ["2026-06-03", "2026-06-05"],
    notes: "Needs technical Q&A and architecture discussion.",
  },
  {
    id: "cand-maya",
    name: "Maya Lim",
    role: "AI Intern",
    school: "University of Malaya",
    skills: ["Python", "LLMs", "Evaluation"],
    priority: "normal",
    availability: ["2026-06-05"],
    notes: "Ask about trade-offs, evaluation, and responsible AI use.",
  },
]

export const rooms: Room[] = [
  {
    id: "room-panel",
    name: "Panel Room",
    zone: "Bangsar Office - Level 8",
    capacity: 6,
    equipment: ["TV", "whiteboard", "camera"],
    focus: "Final panel and presentation interviews",
    status: "ready",
  },
  {
    id: "room-focus",
    name: "Focus Booth",
    zone: "Bangsar Office - Quiet Wing",
    capacity: 3,
    equipment: ["camera", "mic", "charging"],
    focus: "1:1 technical calls",
    status: "ready",
  },
  {
    id: "room-lab",
    name: "Build Lab",
    zone: "Bangsar Office - Workshop Zone",
    capacity: 10,
    equipment: ["projector", "whiteboard", "power strips"],
    focus: "Coding assessment and group review",
    status: "ready",
  },
  {
    id: "room-studio",
    name: "Pitch Studio",
    zone: "Bangsar Office - Studio",
    capacity: 5,
    equipment: ["TV", "camera", "lights"],
    focus: "Elevator pitch practice and demo recording",
    status: "maintenance",
  },
]

export const initialBookings: Booking[] = [
  {
    id: "BK-1042",
    title: "Frontend portfolio walkthrough",
    roomId: "room-panel",
    candidateIds: ["cand-aiman"],
    date: "2026-06-03",
    start: "10:00",
    end: "11:00",
    type: "portfolio",
    status: "confirmed",
    owner: "Sarah Chen",
  },
  {
    id: "BK-1043",
    title: "Backend architecture Q&A",
    roomId: "room-focus",
    candidateIds: ["cand-jun"],
    date: "2026-06-03",
    start: "14:00",
    end: "15:00",
    type: "technical",
    status: "pending",
    owner: "Sarah Chen",
  },
  {
    id: "BK-1044",
    title: "Group coding assessment",
    roomId: "room-lab",
    candidateIds: ["cand-aiman", "cand-jun"],
    date: "2026-06-04",
    start: "13:30",
    end: "15:30",
    type: "assessment",
    status: "confirmed",
    owner: "Hiring Team",
  },
]

export function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

export function addMinutes(time: string, amount: number) {
  const total = minutes(time) + amount
  const hour = Math.floor(total / 60)
  const minute = total % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function formatDisplayDate(date: string) {
  const formatter = new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  return formatter.format(new Date(`${date}T00:00:00`))
}

export function formatLongDate(date: string) {
  const formatter = new Intl.DateTimeFormat("en-MY", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  return formatter.format(new Date(`${date}T00:00:00`))
}

export function getRoomName(roomId: string) {
  return rooms.find((room) => room.id === roomId)?.name ?? "Unknown room"
}

export function getCandidateNames(candidateIds: string[]) {
  return candidateIds
    .map((id) => candidates.find((candidate) => candidate.id === id)?.name)
    .filter(Boolean)
    .join(", ")
}

export function overlaps(
  a: Pick<Booking, "date" | "roomId" | "start" | "end" | "status">,
  b: Pick<Booking, "date" | "roomId" | "start" | "end">,
) {
  if (a.status === "cancelled") return false
  if (a.date !== b.date || a.roomId !== b.roomId) return false
  return minutes(b.start) < minutes(a.end) && minutes(b.end) > minutes(a.start)
}

export function hasConflict(bookings: Booking[], booking: Pick<Booking, "date" | "roomId" | "start" | "end">) {
  return bookings.some((item) => overlaps(item, booking))
}

export function getUtilization(bookings: Booking[], roomId: string) {
  const totalMinutes = demoDates.length * 8 * 60
  const used = bookings
    .filter((booking) => booking.roomId === roomId && booking.status !== "cancelled")
    .reduce((sum, booking) => sum + minutes(booking.end) - minutes(booking.start), 0)
  return Math.round((used / totalMinutes) * 100)
}

export function recommendSlots({
  bookings,
  candidateId,
  interviewType,
  duration,
}: {
  bookings: Booking[]
  candidateId: string
  interviewType: InterviewType
  duration: number
}) {
  const candidate = candidates.find((item) => item.id === candidateId) ?? candidates[0]
  const recommended: AiSlot[] = []

  for (const date of demoDates) {
    if (!candidate.availability.includes(date)) continue

    for (const room of rooms) {
      if (room.status !== "ready") continue

      for (const start of timeSlots) {
        const end = addMinutes(start, duration)
        if (minutes(end) > minutes("17:30")) continue

        const candidateBooking = { date, roomId: room.id, start, end }
        if (hasConflict(bookings, candidateBooking)) continue

        let score = 70
        const risks: string[] = []

        if (candidate.priority === "high") score += 9
        if (interviewType === "technical" && room.equipment.includes("whiteboard")) score += 8
        if (interviewType === "assessment" && room.capacity >= 8) score += 12
        if (interviewType === "portfolio" && room.equipment.includes("TV")) score += 10
        if (minutes(start) >= minutes("10:00") && minutes(start) <= minutes("15:00")) score += 6
        if (room.capacity < 4 && interviewType === "assessment") {
          score -= 20
          risks.push("Room may be too small for assessment observers.")
        }
        if (minutes(start) === minutes("13:00")) {
          score -= 5
          risks.push("Lunch overlap may reduce punctuality.")
        }

        recommended.push({
          roomId: room.id,
          date,
          start,
          end,
          score: Math.min(score, 99),
          reason: `${room.name} fits ${candidate.name}'s ${candidate.role.toLowerCase()} interview because it supports ${room.focus.toLowerCase()}.`,
          risks,
        })
      }
    }
  }

  return recommended.sort((a, b) => b.score - a.score).slice(0, 4)
}

export function generateCopilotAnswer(question: string, bookings: Booking[]) {
  const lower = question.toLowerCase()
  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length
  const pending = bookings.filter((booking) => booking.status === "pending").length
  const highPriorityOpen = candidates.filter((candidate) => candidate.priority === "high").length

  if (lower.includes("pitch") || lower.includes("present")) {
    return "For the 2-minute pitch: lead with the real problem, show the booking flow, then show the AI recommendation explaining trade-offs. End by saying the backend can later replace the local store through the same booking actions."
  }

  if (lower.includes("risk") || lower.includes("no-show")) {
    return "Main risks: pending bookings need confirmation, lunch-overlap slots are weaker, and high-priority candidates should avoid cramped rooms. I would auto-remind pending participants 30 minutes before the slot."
  }

  if (lower.includes("scale") || lower.includes("backend")) {
    return "Backend path: keep the current client actions, swap local state for API routes, add Postgres tables for rooms/bookings/candidates, then add row-level permissions for recruiter/admin roles."
  }

  return `Current plan: ${confirmed} confirmed bookings, ${pending} pending booking, and ${highPriorityOpen} high-priority candidates in the pool. The best next action is to schedule high-priority candidates into rooms with the right equipment, then check in attendees from the booking card.`
}
