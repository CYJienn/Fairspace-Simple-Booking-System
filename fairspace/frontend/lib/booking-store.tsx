"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  bookingOverlaps,
  Booking,
  BookingState,
  CheckInStatus,
  CURRENT_USER,
  ExtendedRequest,
  getCheckInDeadline,
  getRoom,
  getRoomName,
  initialBookingState,
  initialsFromEmail,
  makeId,
  Notification,
  Report,
  Room,
  timeSlots,
} from "@/lib/booking-data"

const STORAGE_KEY = "fairspace-booking-state-v2"

type BookingCreateInput = {
  roomId: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  participantEmails: string[]
}

type Result<T = void> = {
  ok: boolean
  message: string
  data?: T
}

type BookingStore = BookingState & {
  createBooking: (input: BookingCreateInput) => Result<Booking>
  cancelBooking: (bookingId: string) => Result
  checkInBooking: (bookingId: string) => Result
  addParticipant: (bookingId: string, email: string) => Result
  submitReport: (input: Pick<Report, "type" | "roomId" | "description" | "anonymous">) => Result<Report>
  submitExtendedRequest: (input: Omit<ExtendedRequest, "id" | "user" | "email" | "avatar" | "status">) => Result<ExtendedRequest>
  reviewExtendedRequest: (requestId: string, status: "approved" | "rejected") => Result
  resolveReport: (reportId: string, status: "investigating" | "resolved" | "dismissed") => Result
  updateRoomStatus: (roomId: string, status: Room["status"]) => Result
  markAllNotificationsRead: () => void
  resetDemoData: () => void
}

const BookingContext = createContext<BookingStore | null>(null)

function cloneInitialState(): BookingState {
  return JSON.parse(JSON.stringify(initialBookingState))
}

function loadInitialState(): BookingState {
  if (typeof window === "undefined") return cloneInitialState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneInitialState()
    const parsed = JSON.parse(raw) as BookingState

    if (!Array.isArray(parsed.rooms) || !Array.isArray(parsed.bookings)) {
      return cloneInitialState()
    }

    return parsed
  } catch {
    return cloneInitialState()
  }
}

function withNotification(state: BookingState, notification: Omit<Notification, "id" | "time" | "read">): BookingState {
  return {
    ...state,
    notifications: [
      {
        id: makeId("NOT"),
        time: "Just now",
        read: false,
        ...notification,
      },
      ...state.notifications,
    ],
  }
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(() => loadInitialState())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const store = useMemo<BookingStore>(() => {
    const createBooking: BookingStore["createBooking"] = (input) => {
      const room = getRoom(state.rooms, input.roomId)
      if (!room) return { ok: false, message: "Select a valid room." }
      if (room.status === "maintenance") return { ok: false, message: `${room.name} is under maintenance.` }
      if (!input.date || !input.startTime || !input.endTime) return { ok: false, message: "Select a date and time." }

      const startIndex = timeSlots.indexOf(input.startTime)
      const endIndex = timeSlots.indexOf(input.endTime)
      if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
        return { ok: false, message: "Choose a valid booking time." }
      }

      const candidate = {
        date: input.date,
        roomId: input.roomId,
        startTime: input.startTime,
        endTime: input.endTime,
      }

      const conflict = state.bookings.some((booking) => bookingOverlaps(booking, candidate))
      if (conflict) return { ok: false, message: "That room already has a booking during this slot." }

      const participantList = input.participantEmails
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
        .filter((email, index, all) => all.indexOf(email) === index)

      const booking: Booking = {
        id: makeId("BKG"),
        roomId: input.roomId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "pending",
        checkInStatus: "pending",
        checkInDeadline: getCheckInDeadline(input.startTime),
        purpose: input.purpose || "Interview booking",
        ownerName: CURRENT_USER.name,
        ownerEmail: CURRENT_USER.email,
        ownerAvatar: CURRENT_USER.avatar,
        createdAt: "Just now",
        participants: [
          {
            id: makeId("P"),
            name: CURRENT_USER.name,
            email: CURRENT_USER.email,
            status: "organizer",
            avatar: CURRENT_USER.avatar,
          },
          ...participantList.map((email) => ({
            id: makeId("P"),
            name: email.split("@")[0].replace(/[._-]/g, " "),
            email,
            status: "pending" as const,
            avatar: initialsFromEmail(email),
          })),
        ],
        timeline: [
          { time: "Just now", action: "Booking requested", user: CURRENT_USER.name },
          { time: "Just now", action: `Reserved ${room.name} pending confirmation`, user: "System" },
        ],
      }

      setState((prev) =>
        withNotification(
          {
            ...prev,
            bookings: [booking, ...prev.bookings],
            rooms: prev.rooms.map((item) =>
              item.id === room.id ? { ...item, bookings: item.bookings + 1 } : item,
            ),
          },
          {
            kind: "booking",
            title: "Booking Created",
            message: `${room.name} is reserved for ${input.startTime}.`,
          },
        ),
      )

      return { ok: true, message: "Booking created.", data: booking }
    }

    const cancelBooking: BookingStore["cancelBooking"] = (bookingId) => {
      const booking = state.bookings.find((item) => item.id === bookingId)
      if (!booking) return { ok: false, message: "Booking not found." }
      if (booking.status === "cancelled") return { ok: false, message: "Booking is already cancelled." }

      setState((prev) =>
        withNotification(
          {
            ...prev,
            bookings: prev.bookings.map((item) =>
              item.id === bookingId
                ? {
                    ...item,
                    status: "cancelled",
                    timeline: [
                      ...item.timeline,
                      { time: "Just now", action: "Booking cancelled", user: CURRENT_USER.name },
                    ],
                  }
                : item,
            ),
          },
          {
            kind: "alert",
            title: "Booking Cancelled",
            message: `${getRoomName(state.rooms, booking.roomId)} was cancelled.`,
          },
        ),
      )

      return { ok: true, message: "Booking cancelled." }
    }

    const checkInBooking: BookingStore["checkInBooking"] = (bookingId) => {
      const booking = state.bookings.find((item) => item.id === bookingId)
      if (!booking) return { ok: false, message: "Booking not found." }
      if (booking.status === "cancelled") return { ok: false, message: "Cancelled bookings cannot be checked in." }

      setState((prev) =>
        withNotification(
          {
            ...prev,
            bookings: prev.bookings.map((item) =>
              item.id === bookingId
                ? {
                    ...item,
                    status: "confirmed",
                    checkInStatus: "checked-in" as CheckInStatus,
                    timeline: [
                      ...item.timeline,
                      { time: "Just now", action: "Checked in successfully", user: CURRENT_USER.name },
                    ],
                  }
                : item,
            ),
          },
          {
            kind: "booking",
            title: "Checked In",
            message: `Check-in recorded for ${getRoomName(state.rooms, booking.roomId)}.`,
          },
        ),
      )

      return { ok: true, message: "Checked in successfully." }
    }

    const addParticipant: BookingStore["addParticipant"] = (bookingId, email) => {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail.includes("@")) return { ok: false, message: "Enter a valid email address." }

      const booking = state.bookings.find((item) => item.id === bookingId)
      if (!booking) return { ok: false, message: "Booking not found." }
      if (booking.participants.some((participant) => participant.email.toLowerCase() === cleanEmail)) {
        return { ok: false, message: "Participant already added." }
      }

      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((item) =>
          item.id === bookingId
            ? {
                ...item,
                participants: [
                  ...item.participants,
                  {
                    id: makeId("P"),
                    name: cleanEmail.split("@")[0].replace(/[._-]/g, " "),
                    email: cleanEmail,
                    status: "pending",
                    avatar: initialsFromEmail(cleanEmail),
                  },
                ],
                timeline: [
                  ...item.timeline,
                  { time: "Just now", action: `Invited ${cleanEmail}`, user: CURRENT_USER.name },
                ],
              }
            : item,
        ),
      }))

      return { ok: true, message: "Participant invited." }
    }

    const submitReport: BookingStore["submitReport"] = (input) => {
      const room = getRoom(state.rooms, input.roomId)
      if (!room) return { ok: false, message: "Select a valid room." }

      const report: Report = {
        id: makeId("RPT"),
        date: new Date().toISOString().slice(0, 10),
        reporter: input.anonymous ? "Anonymous" : CURRENT_USER.name,
        status: "pending",
        ...input,
      }

      setState((prev) =>
        withNotification(
          { ...prev, reports: [report, ...prev.reports] },
          {
            kind: "alert",
            title: "Report Submitted",
            message: `New room report submitted for ${room.name}.`,
          },
        ),
      )

      return { ok: true, message: "Report submitted.", data: report }
    }

    const submitExtendedRequest: BookingStore["submitExtendedRequest"] = (input) => {
      const room = getRoom(state.rooms, input.roomId)
      if (!room) return { ok: false, message: "Select a valid room." }
      if (input.durationHours <= 3) return { ok: false, message: "Extended requests must be over 3 hours." }

      const request: ExtendedRequest = {
        id: makeId("REQ"),
        user: CURRENT_USER.name,
        email: CURRENT_USER.email,
        avatar: CURRENT_USER.avatar,
        status: "pending",
        ...input,
      }

      setState((prev) =>
        withNotification(
          { ...prev, extendedRequests: [request, ...prev.extendedRequests] },
          {
            kind: "calendar",
            title: "Extended Request Sent",
            message: `${room.name} request is waiting for admin review.`,
          },
        ),
      )

      return { ok: true, message: "Extended booking request submitted.", data: request }
    }

    const reviewExtendedRequest: BookingStore["reviewExtendedRequest"] = (requestId, status) => {
      const request = state.extendedRequests.find((item) => item.id === requestId)
      if (!request) return { ok: false, message: "Request not found." }

      setState((prev) =>
        withNotification(
          {
            ...prev,
            extendedRequests: prev.extendedRequests.map((item) =>
              item.id === requestId ? { ...item, status } : item,
            ),
          },
          {
            kind: status === "approved" ? "booking" : "alert",
            title: status === "approved" ? "Request Approved" : "Request Rejected",
            message: `${getRoomName(state.rooms, request.roomId)} extended request was ${status}.`,
          },
        ),
      )

      return { ok: true, message: `Request ${status}.` }
    }

    const resolveReport: BookingStore["resolveReport"] = (reportId, status) => {
      if (!state.reports.some((item) => item.id === reportId)) return { ok: false, message: "Report not found." }

      setState((prev) => ({
        ...prev,
        reports: prev.reports.map((item) => (item.id === reportId ? { ...item, status } : item)),
      }))

      return { ok: true, message: `Report marked ${status}.` }
    }

    const updateRoomStatus: BookingStore["updateRoomStatus"] = (roomId, status) => {
      const room = getRoom(state.rooms, roomId)
      if (!room) return { ok: false, message: "Room not found." }

      setState((prev) => ({
        ...prev,
        rooms: prev.rooms.map((item) => (item.id === roomId ? { ...item, status } : item)),
      }))

      return { ok: true, message: `${room.name} updated.` }
    }

    return {
      ...state,
      createBooking,
      cancelBooking,
      checkInBooking,
      addParticipant,
      submitReport,
      submitExtendedRequest,
      reviewExtendedRequest,
      resolveReport,
      updateRoomStatus,
      markAllNotificationsRead: () =>
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((notification) => ({ ...notification, read: true })),
        })),
      resetDemoData: () => setState(cloneInitialState()),
    }
  }, [state])

  return <BookingContext.Provider value={store}>{children}</BookingContext.Provider>
}

export function useBookingStore() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBookingStore must be used within BookingProvider")
  }
  return context
}
