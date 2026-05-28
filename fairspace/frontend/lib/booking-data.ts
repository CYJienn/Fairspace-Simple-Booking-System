"use client"

import { addDays, format, isBefore, isSameDay, parseISO, startOfWeek } from "date-fns"

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled" | "expired"
export type CheckInStatus = "pending" | "checked-in" | "no-show"
export type RoomStatus = "active" | "maintenance"
export type RequestStatus = "pending" | "approved" | "rejected"
export type ReportStatus = "pending" | "investigating" | "resolved" | "dismissed"
export type UserStatus = "active" | "warning" | "suspended"

export interface Room {
  id: string
  name: string
  description: string
  capacity: number
  floor: string
  building: string
  amenities: string[]
  status: RoomStatus
  bookings: number
}

export interface Participant {
  id: string
  name: string
  email: string
  status: "organizer" | "confirmed" | "pending" | "declined"
  avatar: string
}

export interface BookingEvent {
  time: string
  action: string
  user: string
}

export interface Booking {
  id: string
  roomId: string
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
  checkInStatus: CheckInStatus
  checkInDeadline: string
  purpose: string
  ownerName: string
  ownerEmail: string
  ownerAvatar: string
  createdAt: string
  participants: Participant[]
  timeline: BookingEvent[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "Student" | "Admin" | "Recruiter"
  faculty: string
  bookings: number
  noShows: number
  status: UserStatus
}

export interface Report {
  id: string
  type: "overcrowding" | "unauthorized" | "noise" | "misuse"
  roomId: string
  reporter: string
  date: string
  description: string
  status: ReportStatus
  anonymous: boolean
}

export interface ExtendedRequest {
  id: string
  user: string
  email: string
  avatar: string
  roomId: string
  date: string
  startTime: string
  endTime: string
  durationHours: number
  reason: string
  status: RequestStatus
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  kind: "booking" | "reminder" | "calendar" | "alert"
}

export interface BookingState {
  rooms: Room[]
  bookings: Booking[]
  users: User[]
  reports: Report[]
  extendedRequests: ExtendedRequest[]
  notifications: Notification[]
}

export const DEMO_TODAY = "2026-05-22"
export const CURRENT_USER = {
  name: "Sarah Chen",
  email: "sarah@university.edu",
  avatar: "SC",
}

export const timeSlots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
]

export const reportTypes = [
  { id: "overcrowding", label: "Overcapacity", description: "More attendees than allowed capacity" },
  { id: "unauthorized", label: "Unauthorized Usage", description: "Room used without a booking" },
  { id: "noise", label: "Noise Issue", description: "Disturbance affecting nearby interviews" },
  { id: "misuse", label: "Room Misuse", description: "Equipment damage or improper room use" },
] as const

const initialRooms: Room[] = [
  {
    id: "interview-a",
    name: "Interview Room A",
    description: "Private interview room for first-round intern candidate screening.",
    capacity: 4,
    floor: "Level 3",
    building: "Talent Hub",
    amenities: ["whiteboard", "aircon", "charging", "wifi"],
    status: "active",
    bookings: 245,
  },
  {
    id: "mentor-booth-b",
    name: "Mentor Booth B",
    description: "Small booth for mentor chats, portfolio reviews, and coaching calls.",
    capacity: 3,
    floor: "Level 2",
    building: "Career Lounge",
    amenities: ["whiteboard", "aircon", "wifi"],
    status: "active",
    bookings: 198,
  },
  {
    id: "assessment-lab",
    name: "Assessment Lab",
    description: "Computer-ready space for coding tasks and structured assessments.",
    capacity: 10,
    floor: "Level 4",
    building: "Innovation Center",
    amenities: ["projector", "aircon", "charging", "wifi"],
    status: "active",
    bookings: 156,
  },
  {
    id: "final-panel",
    name: "Final Panel Room",
    description: "Formal room for panel interviews with hiring leads and faculty partners.",
    capacity: 6,
    floor: "Level 1",
    building: "Admin Building",
    amenities: ["projector", "aircon", "charging", "wifi"],
    status: "active",
    bookings: 134,
  },
  {
    id: "prep-pod",
    name: "Quiet Prep Pod",
    description: "Focused space for candidate preparation before interview slots.",
    capacity: 2,
    floor: "Level 5",
    building: "Library Block B",
    amenities: ["aircon", "charging", "wifi"],
    status: "active",
    bookings: 98,
  },
  {
    id: "workshop-studio",
    name: "Workshop Studio",
    description: "Large room for intern onboarding sessions and hiring workshops.",
    capacity: 20,
    floor: "Level 2",
    building: "Learning Commons",
    amenities: ["whiteboard", "projector", "aircon", "charging", "wifi"],
    status: "maintenance",
    bookings: 0,
  },
]

const initialBookings: Booking[] = [
  {
    id: "BKG-1001",
    roomId: "interview-a",
    date: "2026-05-22",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    status: "confirmed",
    checkInStatus: "pending",
    checkInDeadline: "2:15 PM",
    purpose: "Frontend intern interview with portfolio walkthrough.",
    ownerName: CURRENT_USER.name,
    ownerEmail: CURRENT_USER.email,
    ownerAvatar: CURRENT_USER.avatar,
    createdAt: "May 20, 2026 at 10:30 AM",
    participants: [
      { id: "p-1", name: "Sarah Chen", email: "sarah@university.edu", status: "organizer", avatar: "SC" },
      { id: "p-2", name: "Aiman Rahman", email: "aiman@shortcut.asia", status: "confirmed", avatar: "AR" },
      { id: "p-3", name: "Emily Wang", email: "emily@university.edu", status: "confirmed", avatar: "EW" },
      { id: "p-4", name: "Alex Kim", email: "alex@university.edu", status: "pending", avatar: "AK" },
    ],
    timeline: [
      { time: "May 20, 10:30 AM", action: "Booking created", user: "Sarah Chen" },
      { time: "May 20, 10:32 AM", action: "Invitations sent to 3 participants", user: "System" },
      { time: "May 20, 11:15 AM", action: "Aiman Rahman accepted invitation", user: "Aiman Rahman" },
      { time: "May 21, 9:00 AM", action: "Reminder sent", user: "System" },
    ],
  },
  {
    id: "BKG-1002",
    roomId: "mentor-booth-b",
    date: "2026-05-22",
    startTime: "5:00 PM",
    endTime: "6:30 PM",
    status: "pending",
    checkInStatus: "pending",
    checkInDeadline: "5:15 PM",
    purpose: "Resume review for backend intern candidate.",
    ownerName: CURRENT_USER.name,
    ownerEmail: CURRENT_USER.email,
    ownerAvatar: CURRENT_USER.avatar,
    createdAt: "May 21, 2026 at 5:20 PM",
    participants: [
      { id: "p-5", name: "Sarah Chen", email: "sarah@university.edu", status: "organizer", avatar: "SC" },
      { id: "p-6", name: "John Doe", email: "john@university.edu", status: "pending", avatar: "JD" },
    ],
    timeline: [
      { time: "May 21, 5:20 PM", action: "Booking requested", user: "Sarah Chen" },
      { time: "May 21, 5:21 PM", action: "Awaiting participant confirmation", user: "System" },
    ],
  },
  {
    id: "BKG-1003",
    roomId: "assessment-lab",
    date: "2026-05-23",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    status: "confirmed",
    checkInStatus: "pending",
    checkInDeadline: "10:15 AM",
    purpose: "Coding challenge for intern hiring short-list.",
    ownerName: CURRENT_USER.name,
    ownerEmail: CURRENT_USER.email,
    ownerAvatar: CURRENT_USER.avatar,
    createdAt: "May 21, 2026 at 11:00 AM",
    participants: [
      { id: "p-7", name: "Sarah Chen", email: "sarah@university.edu", status: "organizer", avatar: "SC" },
      { id: "p-8", name: "Maria Garcia", email: "maria@university.edu", status: "confirmed", avatar: "MG" },
      { id: "p-9", name: "Lee Jun", email: "jun@shortcut.asia", status: "confirmed", avatar: "LJ" },
    ],
    timeline: [
      { time: "May 21, 11:00 AM", action: "Booking created", user: "Sarah Chen" },
      { time: "May 21, 11:03 AM", action: "Assessment lab reserved", user: "System" },
    ],
  },
  {
    id: "BKG-1004",
    roomId: "final-panel",
    date: "2026-05-20",
    startTime: "3:00 PM",
    endTime: "5:00 PM",
    status: "completed",
    checkInStatus: "checked-in",
    checkInDeadline: "3:15 PM",
    purpose: "Final interview for product intern candidate.",
    ownerName: CURRENT_USER.name,
    ownerEmail: CURRENT_USER.email,
    ownerAvatar: CURRENT_USER.avatar,
    createdAt: "May 18, 2026 at 9:45 AM",
    participants: [
      { id: "p-10", name: "Sarah Chen", email: "sarah@university.edu", status: "organizer", avatar: "SC" },
      { id: "p-11", name: "Nur Izzati", email: "izzati@shortcut.asia", status: "confirmed", avatar: "NI" },
    ],
    timeline: [
      { time: "May 18, 9:45 AM", action: "Booking created", user: "Sarah Chen" },
      { time: "May 20, 3:02 PM", action: "Checked in successfully", user: "Sarah Chen" },
      { time: "May 20, 5:00 PM", action: "Booking completed", user: "System" },
    ],
  },
  {
    id: "BKG-1005",
    roomId: "prep-pod",
    date: "2026-05-19",
    startTime: "1:00 PM",
    endTime: "2:30 PM",
    status: "cancelled",
    checkInStatus: "no-show",
    checkInDeadline: "1:15 PM",
    purpose: "Candidate prep slot before group assessment.",
    ownerName: CURRENT_USER.name,
    ownerEmail: CURRENT_USER.email,
    ownerAvatar: CURRENT_USER.avatar,
    createdAt: "May 18, 2026 at 8:20 AM",
    participants: [
      { id: "p-12", name: "Sarah Chen", email: "sarah@university.edu", status: "organizer", avatar: "SC" },
    ],
    timeline: [
      { time: "May 18, 8:20 AM", action: "Booking created", user: "Sarah Chen" },
      { time: "May 19, 10:00 AM", action: "Booking cancelled", user: "Sarah Chen" },
    ],
  },
]

const initialUsers: User[] = [
  { id: "u-1", name: "Sarah Chen", email: "sarah@university.edu", avatar: "SC", role: "Student", faculty: "Computing", bookings: 24, noShows: 0, status: "active" },
  { id: "u-2", name: "John Doe", email: "john@university.edu", avatar: "JD", role: "Student", faculty: "Engineering", bookings: 18, noShows: 2, status: "active" },
  { id: "u-3", name: "Emily Wang", email: "emily@university.edu", avatar: "EW", role: "Student", faculty: "Science", bookings: 12, noShows: 1, status: "active" },
  { id: "u-4", name: "Mike Johnson", email: "mike@university.edu", avatar: "MJ", role: "Student", faculty: "Business", bookings: 8, noShows: 4, status: "warning" },
  { id: "u-5", name: "Lisa Brown", email: "lisa@university.edu", avatar: "LB", role: "Student", faculty: "Arts", bookings: 3, noShows: 3, status: "suspended" },
  { id: "u-6", name: "Aiman Rahman", email: "aiman@shortcut.asia", avatar: "AR", role: "Recruiter", faculty: "Shortcut Asia", bookings: 31, noShows: 0, status: "active" },
]

const initialReports: Report[] = [
  {
    id: "RPT-1001",
    type: "noise",
    roomId: "interview-a",
    reporter: "Anonymous",
    date: "2026-05-21",
    description: "A group was loudly rehearsing a pitch during an active interview slot.",
    status: "resolved",
    anonymous: true,
  },
  {
    id: "RPT-1002",
    type: "overcrowding",
    roomId: "mentor-booth-b",
    reporter: "John Doe",
    date: "2026-05-20",
    description: "Seven people entered a three-person booth and blocked the hallway.",
    status: "investigating",
    anonymous: false,
  },
  {
    id: "RPT-1003",
    type: "unauthorized",
    roomId: "assessment-lab",
    reporter: "Sarah Chen",
    date: "2026-05-19",
    description: "Assessment lab was used without an approved booking during peak hours.",
    status: "pending",
    anonymous: false,
  },
]

const initialExtendedRequests: ExtendedRequest[] = [
  {
    id: "REQ-1001",
    user: "Alex Kim",
    email: "alex@university.edu",
    avatar: "AK",
    roomId: "assessment-lab",
    date: "2026-05-24",
    startTime: "9:00 AM",
    endTime: "12:30 PM",
    durationHours: 3.5,
    reason: "Multi-part technical assessment for final intern short-list.",
    status: "pending",
  },
  {
    id: "REQ-1002",
    user: "Maria Garcia",
    email: "maria@university.edu",
    avatar: "MG",
    roomId: "final-panel",
    date: "2026-05-25",
    startTime: "2:00 PM",
    endTime: "6:00 PM",
    durationHours: 4,
    reason: "Partner company intern interview block with four consecutive candidates.",
    status: "pending",
  },
]

const initialNotifications: Notification[] = [
  {
    id: "NOT-1001",
    kind: "booking",
    title: "Booking Confirmed",
    message: "Interview Room A at 2:00 PM has been confirmed.",
    time: "5 min ago",
    read: false,
  },
  {
    id: "NOT-1002",
    kind: "reminder",
    title: "Check-in Reminder",
    message: "Your interview slot starts in 30 minutes. Check in before the deadline.",
    time: "25 min ago",
    read: false,
  },
  {
    id: "NOT-1003",
    kind: "calendar",
    title: "Participant Pending",
    message: "Alex Kim has not confirmed the Interview Room A booking yet.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "NOT-1004",
    kind: "alert",
    title: "No-show Warning",
    message: "A missed check-in was recorded earlier this week.",
    time: "2 hours ago",
    read: true,
  },
]

export const initialBookingState: BookingState = {
  rooms: initialRooms,
  bookings: initialBookings,
  users: initialUsers,
  reports: initialReports,
  extendedRequests: initialExtendedRequests,
  notifications: initialNotifications,
}

export function parseSlotMinutes(time: string) {
  const [rawTime, period] = time.split(" ")
  const [rawHour, rawMinute] = rawTime.split(":").map(Number)
  const hour = period === "PM" && rawHour !== 12 ? rawHour + 12 : period === "AM" && rawHour === 12 ? 0 : rawHour
  return hour * 60 + rawMinute
}

export function formatDateLabel(date: string) {
  return format(parseISO(`${date}T00:00:00`), "MMM d, yyyy")
}

export function formatHumanDate(date: string) {
  return format(parseISO(`${date}T00:00:00`), "EEEE, MMMM d, yyyy")
}

export function getRoom(rooms: Room[], roomId: string) {
  return rooms.find((room) => room.id === roomId)
}

export function getRoomName(rooms: Room[], roomId: string) {
  return getRoom(rooms, roomId)?.name ?? "Unknown room"
}

export function getBookingDurationMinutes(booking: Pick<Booking, "startTime" | "endTime">) {
  return Math.max(0, parseSlotMinutes(booking.endTime) - parseSlotMinutes(booking.startTime))
}

export function bookingOverlaps(
  booking: Pick<Booking, "date" | "roomId" | "startTime" | "endTime" | "status">,
  candidate: Pick<Booking, "date" | "roomId" | "startTime" | "endTime">,
) {
  if (booking.date !== candidate.date || booking.roomId !== candidate.roomId) return false
  if (booking.status === "cancelled" || booking.status === "expired") return false

  const bookingStart = parseSlotMinutes(booking.startTime)
  const bookingEnd = parseSlotMinutes(booking.endTime)
  const candidateStart = parseSlotMinutes(candidate.startTime)
  const candidateEnd = parseSlotMinutes(candidate.endTime)

  return candidateStart < bookingEnd && candidateEnd > bookingStart
}

export function getUpcomingBookings(bookings: Booking[]) {
  return bookings
    .filter((booking) => booking.status === "confirmed" || booking.status === "pending")
    .sort((a, b) => `${a.date} ${parseSlotMinutes(a.startTime)}`.localeCompare(`${b.date} ${parseSlotMinutes(b.startTime)}`))
}

export function getPastBookings(bookings: Booking[]) {
  return bookings
    .filter((booking) => booking.status === "completed" || booking.status === "cancelled" || booking.status === "expired")
    .sort((a, b) => `${b.date} ${parseSlotMinutes(b.startTime)}`.localeCompare(`${a.date} ${parseSlotMinutes(a.startTime)}`))
}

export function getWeekDays(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function dateStringFromDate(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function dateFromString(date: string) {
  return parseISO(`${date}T00:00:00`)
}

export function isBookingToday(booking: Pick<Booking, "date">) {
  return isSameDay(dateFromString(booking.date), dateFromString(DEMO_TODAY))
}

export function isBookingBeforeToday(booking: Pick<Booking, "date">) {
  return isBefore(dateFromString(booking.date), dateFromString(DEMO_TODAY))
}

export function getCheckInDeadline(startTime: string) {
  const startIndex = timeSlots.indexOf(startTime)
  const nextSlot = timeSlots[startIndex + 1]
  if (!nextSlot) return startTime

  const startMinutes = parseSlotMinutes(startTime)
  const deadlineMinutes = startMinutes + 15
  const hour24 = Math.floor(deadlineMinutes / 60)
  const minutes = deadlineMinutes % 60
  const period = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`
}

export function initialsFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2)
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}
