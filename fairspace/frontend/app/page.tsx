"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Bot,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Flag,
  Search,
  Send,
  ShieldCheck,
  Upload,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"

type Room = {
  id: string
  slug?: string
  name: string
  building: string
  floor: string
  capacity: number
  amenities: string[]
  status: "available" | "maintenance"
}

type BookingStatus = "confirmed" | "checked-in" | "pending" | "cancelled"

type Booking = {
  id: string
  roomId: string
  organizerId?: string
  date: string
  start: string
  end: string
  title: string
  organizer: string
  organizerAvatar?: string
  attendees: number
  status: BookingStatus
  requestMessage?: string
  backupEmail?: string
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  action?: ChatAction
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

type AiSource = "gemini" | "fallback" | "guardrail" | "analytics"

type RoomRow = {
  id: string
  slug?: string | null
  name: string
  building: string
  floor: string
  capacity: number
  amenities?: string[] | null
  status: string
}

type BookingRow = {
  id: string
  room_id: string
  organizer_id: string
  booking_date: string
  start_time: string
  end_time: string
  title: string
  attendees: number
  status: string
  request_message?: string | null
  backup_email?: string | null
  fairspace_profiles?: { full_name?: string | null; avatar_url?: string | null } | { full_name?: string | null; avatar_url?: string | null }[] | null
}

type ProfileState = {
  fullName: string
  email: string
  matricId: string
  faculty: string
  avatarUrl: string
}

type AdminReport = {
  id: string
  type: string
  message: string
  photo?: string
  booking?: Booking | null
  reporter: string
  createdAt: string
  status: "open" | "resolved"
  reply?: string
}

type MailMessage = {
  id: string
  title: string
  body: string
  createdAt: string
}

const fallbackRooms: Room[] = [
  {
    id: "discussion-room-1",
    name: "Discussion Room 1",
    building: "Main Library",
    floor: "Level 2",
    capacity: 4,
    amenities: ["Whiteboard", "Power Plugs", "Wi-Fi"],
    status: "available",
  },
  {
    id: "discussion-room-2",
    name: "Discussion Room 2",
    building: "Main Library",
    floor: "Level 2",
    capacity: 6,
    amenities: ["Whiteboard", "Display Screen", "Wi-Fi"],
    status: "available",
  },
  {
    id: "discussion-room-3",
    name: "Discussion Room 3",
    building: "Student Learning Hub",
    floor: "Level 1",
    capacity: 8,
    amenities: ["Display Screen", "Power Plugs", "Wi-Fi"],
    status: "available",
  },
  {
    id: "seminar-room-a",
    name: "Discussion Room 4",
    building: "Faculty Block",
    floor: "Level 3",
    capacity: 8,
    amenities: ["Projector", "Whiteboard", "Wi-Fi"],
    status: "available",
  },
  {
    id: "discussion-room-5",
    name: "Discussion Room 5",
    building: "Engineering Block",
    floor: "Level 1",
    capacity: 4,
    amenities: ["Whiteboard", "Power Plugs", "Wi-Fi"],
    status: "available",
  },
  {
    id: "discussion-room-6",
    name: "Discussion Room 6",
    building: "Science Library",
    floor: "Level 2",
    capacity: 6,
    amenities: ["Display Screen", "Whiteboard", "Wi-Fi"],
    status: "available",
  },
  {
    id: "discussion-room-7",
    name: "Discussion Room 7",
    building: "Main Library",
    floor: "Level 3",
    capacity: 8,
    amenities: ["Display Screen", "Power Plugs", "Wi-Fi"],
    status: "maintenance",
  },
  {
    id: "discussion-room-8",
    name: "Discussion Room 8",
    building: "Student Learning Hub",
    floor: "Level 2",
    capacity: 6,
    amenities: ["Whiteboard", "Power Plugs", "Wi-Fi"],
    status: "maintenance",
  },
]

const fallbackBookings: Booking[] = [
  {
    id: "BK-1001",
    roomId: "discussion-room-1",
    date: "2026-06-03",
    start: "10:00",
    end: "11:00",
    title: "Group assignment discussion",
    organizer: "Sarah Chen",
    attendees: 3,
    status: "confirmed",
  },
  {
    id: "BK-1002",
    roomId: "discussion-room-2",
    date: "2026-06-03",
    start: "14:00",
    end: "17:00",
    title: "Final year project rehearsal - 3-hour request",
    organizer: "Sarah Chen",
    attendees: 6,
    status: "pending",
    requestMessage: "We need extra time to rehearse our final year project presentation with all group members.",
  },
]

const dates = ["2026-06-03", "2026-06-04", "2026-06-05", "2026-06-06", "2026-06-07"]
const times = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
]
const MAX_STANDARD_MINUTES = 120

const statusStyle: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "checked-in": "bg-sky-100 text-sky-700 border-sky-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
}

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

function addMinutes(time: string, amount: number) {
  const total = minutes(time) + amount
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function durationMinutes(booking: Pick<Booking, "start" | "end">) {
  return Math.max(0, minutes(booking.end) - minutes(booking.start))
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-MY", { weekday: "short", month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  )
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("en-MY", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  )
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(date)
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-MY", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

function yesterdayIso(date: Date) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() - 1)
  return toIsoDate(copy)
}

function overlaps(a: Pick<Booking, "roomId" | "date" | "start" | "end" | "status">, b: Pick<Booking, "roomId" | "date" | "start" | "end">) {
  if (a.status === "cancelled") return false
  if (a.roomId !== b.roomId || a.date !== b.date) return false
  return minutes(b.start) < minutes(a.end) && minutes(b.end) > minutes(a.start)
}

function hasConflict(bookings: Booking[], booking: Pick<Booking, "roomId" | "date" | "start" | "end">) {
  return bookings.some((item) => overlaps(item, booking))
}

function hasConflictExcept(bookings: Booking[], booking: Pick<Booking, "roomId" | "date" | "start" | "end">, ignoredId: string) {
  return bookings.some((item) => item.id !== ignoredId && overlaps(item, booking))
}

export default function BookingSystemApp() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profileId, setProfileId] = useState<string>("")
  const [portalRole, setPortalRole] = useState<"student" | "admin">("student")
  const [authLoading, setAuthLoading] = useState(true)
  const [dataMode, setDataMode] = useState<"supabase" | "fallback">("supabase")
  const [rooms, setRooms] = useState<Room[]>(fallbackRooms)
  const [bookings, setBookings] = useState<Booking[]>(fallbackBookings)
  const [selectedDate, setSelectedDate] = useState(dates[0])
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState(fallbackRooms[0].id)
  const [start, setStart] = useState("11:30")
  const [duration, setDuration] = useState(60)
  const [title, setTitle] = useState("Study room booking")
  const [attendees, setAttendees] = useState(3)
  const [backupEmail, setBackupEmail] = useState("")
  const [now, setNow] = useState(new Date())
  const [chatInput, setChatInput] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [mailboxDialogOpen, setMailboxDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")
  const [reportType, setReportType] = useState("Room misuse")
  const [reportMessage, setReportMessage] = useState("")
  const [reportPhoto, setReportPhoto] = useState("")
  const [reportBooking, setReportBooking] = useState<Booking | null>(null)
  const [reports, setReports] = useState<AdminReport[]>([])
  const [mailMessages, setMailMessages] = useState<MailMessage[]>([])
  const [removalTarget, setRemovalTarget] = useState<Booking | null>(null)
  const [removalReason, setRemovalReason] = useState("")
  const [reportReply, setReportReply] = useState<Record<string, string>>({})
  const [banEmail, setBanEmail] = useState("")
  const [banMonths, setBanMonths] = useState(1)
  const [banReason, setBanReason] = useState("")
  const [requestStart, setRequestStart] = useState("10:00")
  const [requestEnd, setRequestEnd] = useState("13:00")
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [profile, setProfile] = useState<ProfileState>({
    fullName: "",
    email: "",
    matricId: "",
    faculty: "",
    avatarUrl: "",
  })
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [aiSource, setAiSource] = useState<AiSource | "warming" | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I am your booking assistant. Ask me things like: 'Find a discussion room for 4 people tomorrow morning' or 'Book Discussion Room 2 on June 4 at 2pm for 1 hour'.",
    },
  ])
  const chatBottomRef = useRef<HTMLDivElement | null>(null)
  const aiWarmStartedRef = useRef(false)

  const organizer = profile.fullName || user?.user_metadata?.name || user?.email?.split("@")[0] || "Student"
  const end = addMinutes(start, duration)
  const scopedMetricBookings = bookings.filter((booking) => {
    if (booking.status === "cancelled") return false
    if (portalRole === "admin") return true
    return booking.organizerId === profileId
  })
  const metricBookings = scopedMetricBookings.filter((booking) => booking.date >= yesterdayIso(now))

  const visibleBookings = bookings
    .filter((booking) => {
      if (selectedScheduleDate && booking.date !== selectedScheduleDate) return false
      if (booking.status === "cancelled") return false
      if (portalRole === "admin") return true
      return booking.organizerId === profileId
    })
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))

  const pending = metricBookings.filter((booking) => booking.status === "pending").length

  const roomName = (roomId: string) => rooms.find((room) => room.id === roomId)?.name ?? "Unknown room"

  const ensureProfile = async (currentUser: User, requestedRole: "student" | "admin") => {
    const supabase = createBrowserClient()
    const fullName = currentUser.user_metadata?.name || currentUser.email?.split("@")[0] || "FairSpace User"
    const matricId = currentUser.user_metadata?.matric_id || ""
    const faculty = currentUser.user_metadata?.faculty || ""
    const avatarUrl = currentUser.user_metadata?.avatar_url || ""
    const metadataRole = currentUser.user_metadata?.role === "admin" || currentUser.user_metadata?.role === "student"
      ? currentUser.user_metadata.role
      : undefined
    const { data: existingProfile, error: existingError } = await supabase
      .from("fairspace_profiles")
      .select("id, role, full_name, email, matric_id, faculty, avatar_url")
      .eq("id", currentUser.id)
      .maybeSingle()

    if (existingError) throw existingError

    if (existingProfile) {
      const finalRole = metadataRole ?? (existingProfile.role === "admin" ? "admin" : "student")
      let profileData = existingProfile
      if (existingProfile.role !== finalRole) {
        const { data, error } = await supabase
          .from("fairspace_profiles")
          .update({ role: finalRole })
          .eq("id", currentUser.id)
          .select("id, role, full_name, email, matric_id, faculty, avatar_url")
          .single()

        if (error) throw error
        profileData = data
      }

      if (!profileData) throw new Error("Unable to load profile.")
      setProfileId(profileData.id)
      setPortalRole(finalRole)
      window.localStorage.setItem("fairspace-role", finalRole)
      setProfile({
        fullName: profileData.full_name ?? fullName,
        email: profileData.email ?? currentUser.email ?? "",
        matricId: profileData.matric_id ?? matricId,
        faculty: profileData.faculty ?? faculty,
        avatarUrl: profileData.avatar_url ?? avatarUrl,
      })
      return
    }

    const finalRole = metadataRole ?? requestedRole
    const { data, error } = await supabase
      .from("fairspace_profiles")
      .insert({
        id: currentUser.id,
        full_name: fullName,
        email: currentUser.email,
        role: finalRole,
        matric_id: matricId,
        faculty,
        avatar_url: avatarUrl,
      })
      .select("id, role, full_name, email, matric_id, faculty, avatar_url")
      .single()

    if (error) throw error
    setProfileId(data.id)
    setPortalRole(data.role === "admin" ? "admin" : "student")
    window.localStorage.setItem("fairspace-role", data.role === "admin" ? "admin" : "student")
    setProfile({
      fullName: data.full_name ?? fullName,
      email: data.email ?? currentUser.email ?? "",
      matricId: data.matric_id ?? matricId,
      faculty: data.faculty ?? faculty,
      avatarUrl: data.avatar_url ?? avatarUrl,
    })
  }

  const loadRealData = async () => {
    const supabase = createBrowserClient()
    const [roomsResult, bookingsResult] = await Promise.all([
      supabase.from("fairspace_rooms").select("id, slug, name, building, floor, capacity, amenities, status").order("name"),
      supabase
        .from("fairspace_bookings")
        .select("id, room_id, organizer_id, booking_date, start_time, end_time, title, attendees, status, request_message, backup_email, fairspace_profiles(full_name, avatar_url)")
        .order("booking_date")
        .order("start_time"),
    ])

    if (roomsResult.error) throw roomsResult.error
    if (bookingsResult.error) throw bookingsResult.error

    const roomRows = (roomsResult.data ?? []) as RoomRow[]
    const bookingRows = (bookingsResult.data ?? []) as BookingRow[]

    const mappedRooms = roomRows.map((room) => ({
      id: room.id,
      slug: room.slug ?? undefined,
      name: room.name,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      amenities: room.amenities ?? [],
      status: room.status as Room["status"],
    }))

    const mappedBookings = bookingRows.map((booking) => {
      const profile = Array.isArray(booking.fairspace_profiles)
        ? booking.fairspace_profiles[0]
        : booking.fairspace_profiles

      return {
        id: booking.id,
        roomId: booking.room_id,
        organizerId: booking.organizer_id,
        date: booking.booking_date,
        start: String(booking.start_time).slice(0, 5),
        end: String(booking.end_time).slice(0, 5),
        title: booking.title,
        organizer: profile?.full_name ?? "Unknown",
        organizerAvatar: profile?.avatar_url ?? "",
        attendees: booking.attendees,
        status: booking.status as BookingStatus,
        requestMessage: booking.request_message ?? "",
        backupEmail: booking.backup_email ?? "",
      }
    })

    setRooms(mappedRooms.length ? mappedRooms : fallbackRooms)
    setSelectedRoom(mappedRooms[0]?.id ?? fallbackRooms[0].id)
    setBookings(mappedBookings)
    setDataMode("supabase")
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (portalRole !== "student" || !chatOpen || aiWarmStartedRef.current) return
    aiWarmStartedRef.current = true
    setAiSource("warming")

    void fetch("/api/ai-booking-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "hello",
        context: {
          rooms,
          bookings,
          selectedDate,
          defaultOrganizer: organizer,
          role: portalRole,
        },
        history: [],
      }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { source?: AiSource }
        setAiSource(data.source ?? "gemini")
      })
      .catch(() => {
        aiWarmStartedRef.current = false
        setAiSource("fallback")
      })
  }, [bookings, chatOpen, organizer, portalRole, rooms, selectedDate])

  useEffect(() => {
    if (!hasBrowserSupabaseConfig()) {
      toast.error("Supabase public keys are missing. Add them in .env.local, then restart the dev server.")
      router.replace("/login")
      return
    }

    const supabase = createBrowserClient()
    const storedRole = window.localStorage.getItem("fairspace-role")

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/login")
        return
      }

      setUser(data.session.user)
      await ensureProfile(data.session.user, storedRole === "admin" || data.session.user.user_metadata?.role === "admin" ? "admin" : "student")
      await loadRealData()
      setAuthLoading(false)
    }

    init().catch(() => {
      toast.error("Unable to load Supabase data. Showing fallback data.")
      setDataMode("fallback")
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login")
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  const createBooking = async (payload?: Partial<Booking>, status: BookingStatus = "confirmed", allowLongBooking = false) => {
    const next = {
      roomId: payload?.roomId ?? selectedRoom,
      date: payload?.date ?? selectedDate,
      start: payload?.start ?? start,
      end: payload?.end ?? end,
      title: payload?.title ?? title,
      organizer: payload?.organizer ?? organizer,
      organizerAvatar: payload?.organizerAvatar ?? profile.avatarUrl,
      attendees: payload?.attendees ?? attendees,
      requestMessage: payload?.requestMessage ?? "",
      backupEmail: payload?.backupEmail ?? backupEmail,
    }

    const room = rooms.find((item) => item.id === next.roomId)
    if (!room || room.status !== "available") {
      toast.error("That room is not available for booking.")
      return false
    }

    if (!allowLongBooking && durationMinutes(next) > MAX_STANDARD_MINUTES) {
      toast.error("Standard bookings are limited to 2 hours. Ask admin for longer slots later.")
      return false
    }

    if (next.attendees > room.capacity) {
      toast.error(`${room.name} only supports ${room.capacity} people.`)
      return false
    }

    if (hasConflict(bookings, next)) {
      toast.error("That slot conflicts with an existing booking.")
      return false
    }

    const sameDayMinutes = bookings
      .filter((booking) => booking.organizerId === profileId && booking.date === next.date && booking.status !== "cancelled")
      .reduce((sum, booking) => sum + durationMinutes(booking), 0)

    if (!allowLongBooking && sameDayMinutes + durationMinutes(next) > MAX_STANDARD_MINUTES) {
      toast.error("You already reached the 2-hour booking limit for this day.", {
        action: {
          label: "Ask admin",
          onClick: () => {
            setSelectedRoom(next.roomId)
            setSelectedDate(next.date)
            setRequestStart(next.start)
            setRequestEnd(next.end)
            setRequestMessage("I already reached the 2-hour daily limit, but need another room slot for this date.")
            setRequestDialogOpen(true)
          },
        },
      })
      return false
    }

    if (dataMode === "supabase" && profileId) {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("fairspace_bookings")
        .insert({
          room_id: next.roomId,
          organizer_id: profileId,
          booking_date: next.date,
          start_time: next.start,
          end_time: next.end,
          title: next.title,
          attendees: next.attendees,
          status,
          request_message: next.requestMessage || null,
          backup_email: next.backupEmail || null,
        })
        .select("id")
        .single()

      if (error) {
        toast.error(error.message)
        return false
      }

      setBookings((current) => [{ id: data.id, ...next, status }, ...current])
    } else {
      setBookings((current) => [{ id: `BK-${Math.floor(2000 + Math.random() * 7000)}`, ...next, status }, ...current])
    }

    toast.success(status === "pending" ? "Longer booking request sent to admin" : "Booking created", {
      description: `${room.name}, ${formatDate(next.date)} ${next.start}-${next.end}`,
    })
    return true
  }

  const requestLongerSlot = async () => {
    if (!requestMessage.trim()) {
      toast.error("Write a short message for the admin before requesting more hours.")
      return
    }

    const requestedMinutes = minutes(requestEnd) - minutes(requestStart)
    if (requestedMinutes <= MAX_STANDARD_MINUTES) {
      toast.error("Choose a time range longer than 2 hours.")
      return
    }

    const ok = await createBooking(
      {
        roomId: selectedRoom,
        date: selectedDate,
        start: requestStart,
        end: requestEnd,
        title: `${title} - longer-hours request`,
        organizer,
        organizerAvatar: profile.avatarUrl,
        attendees,
        requestMessage: requestMessage.trim(),
      },
      "pending",
      true,
    )

    if (ok) {
      setBookingDialogOpen(false)
      setRequestDialogOpen(false)
      setRequestMessage("")
    }
  }

  const updateBooking = async () => {
    if (!editingBooking) return

    const room = rooms.find((item) => item.id === editingBooking.roomId)
    if (!room) {
      toast.error("Room not found.")
      return
    }

    if (durationMinutes(editingBooking) > MAX_STANDARD_MINUTES) {
      toast.error("Edits can only keep bookings within the 2-hour standard limit.")
      return
    }

    if (editingBooking.attendees > room.capacity) {
      toast.error(`${room.name} only supports ${room.capacity} people.`)
      return
    }

    if (hasConflictExcept(bookings, editingBooking, editingBooking.id)) {
      toast.error("That updated time conflicts with another booking.")
      return
    }

    if (dataMode === "supabase") {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("fairspace_bookings")
        .update({
          room_id: editingBooking.roomId,
          booking_date: editingBooking.date,
          start_time: editingBooking.start,
          end_time: editingBooking.end,
          title: editingBooking.title,
          attendees: editingBooking.attendees,
        })
        .eq("id", editingBooking.id)

      if (error) {
        toast.error(error.message)
        return
      }
    }

    setBookings((current) => current.map((booking) => (booking.id === editingBooking.id ? editingBooking : booking)))
    toast.success("Booking updated")
    setEditDialogOpen(false)
    setEditingBooking(null)
  }

  const openReport = (booking?: Booking | null) => {
    setReportBooking(booking ?? null)
    setReportMessage("")
    setReportPhoto("")
    setReportType(booking ? "Booking hogging" : "Room misuse")
    setReportDialogOpen(true)
  }

  const submitReport = () => {
    if (!reportMessage.trim()) {
      toast.error("Write a short report message for the admin.")
      return
    }

    const ticket: AdminReport = {
      id: crypto.randomUUID(),
      type: reportType,
      message: reportMessage.trim(),
      photo: reportPhoto,
      booking: reportBooking,
      reporter: organizer,
      createdAt: formatDateTime(new Date()),
      status: "open",
    }

    setReports((current) => [ticket, ...current])
    toast.success("Report sent to admin", {
      description: reportBooking ? `${reportType}: ${reportBooking.title} on ${formatDate(reportBooking.date)}` : `${reportType} report submitted`,
    })
    setReportDialogOpen(false)
    setReportBooking(null)
    setReportMessage("")
    setReportPhoto("")
  }

  const resolveReport = (report: AdminReport) => {
    const reply = reportReply[report.id]?.trim()
    if (!reply) {
      toast.error("Write a reply before resolving this report.")
      return
    }

    setReports((current) => current.map((item) => (item.id === report.id ? { ...item, status: "resolved", reply } : item)))
    setMailMessages((current) => [
      {
        id: crypto.randomUUID(),
        title: `Report resolved: ${report.type}`,
        body: reply,
        createdAt: formatDateTime(new Date()),
      },
      ...current,
    ])
    toast.success("Report resolved")
  }

  const updateRoom = async (roomId: string, patch: Partial<Room>) => {
    setRooms((current) => current.map((room) => (room.id === roomId ? { ...room, ...patch } : room)))

    if (dataMode === "supabase") {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("fairspace_rooms")
        .update({
          name: patch.name,
          building: patch.building,
          floor: patch.floor,
          capacity: patch.capacity,
          amenities: patch.amenities,
          status: patch.status,
        })
        .eq("id", roomId)

      if (error) toast.error(error.message)
    }
  }

  const banUser = () => {
    if (!banEmail.trim() || !banReason.trim()) {
      toast.error("Add user email and ban reason.")
      return
    }

    setMailMessages((current) => [
      {
        id: crypto.randomUUID(),
        title: "User ban recorded",
        body: `${banEmail} banned for ${banMonths} month(s). Reason: ${banReason}`,
        createdAt: formatDateTime(new Date()),
      },
      ...current,
    ])
    toast.success("Ban recorded")
    setBanEmail("")
    setBanMonths(1)
    setBanReason("")
    setBanDialogOpen(false)
  }

  const readReportPhoto = (file?: File) => {
    if (!file) return
    if (file.size > 900_000) {
      toast.error("Use an image smaller than 900 KB for this report.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setReportPhoto(String(reader.result))
    reader.readAsDataURL(file)
  }

  const updateProfile = async () => {
    if (!user || !profileId) return

    const supabase = createBrowserClient()
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: profile.fullName,
        matric_id: profile.matricId,
        faculty: profile.faculty,
        avatar_url: profile.avatarUrl,
        role: portalRole,
      },
    })

    if (authError) {
      toast.error(authError.message)
      return
    }

    const { error } = await supabase
      .from("fairspace_profiles")
      .update({
        full_name: profile.fullName,
        matric_id: profile.matricId || null,
        faculty: profile.faculty || null,
        avatar_url: profile.avatarUrl || null,
      })
      .eq("id", profileId)

    if (error) {
      toast.error(error.message)
      return
    }

    setUser({ ...user, user_metadata: { ...user.user_metadata, name: profile.fullName, matric_id: profile.matricId, faculty: profile.faculty, avatar_url: profile.avatarUrl } })
    toast.success("Profile updated")
    setProfileDialogOpen(false)
  }

  const readProfilePhoto = (file?: File) => {
    if (!file) return
    if (file.size > 700_000) {
      toast.error("Use an image smaller than 700 KB for this demo profile photo.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setProfile((current) => ({ ...current, avatarUrl: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    if (dataMode === "supabase") {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("fairspace_bookings").update({ status }).eq("id", bookingId)
      if (error) {
        toast.error(error.message)
        return
      }
    }

    setBookings((current) => current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)))
    toast.success(status === "cancelled" ? "Booking cancelled" : "Booking updated")
  }

  const openRemoveBooking = (booking: Booking) => {
    setRemovalTarget(booking)
    setRemovalReason("")
    setRemoveDialogOpen(true)
  }

  const removeBookingWithReason = async () => {
    if (!removalTarget) return
    if (portalRole === "admin" && !removalReason.trim()) {
      toast.error("Admin must include a reason before removing a booking.")
      return
    }

    await updateStatus(removalTarget.id, "cancelled")
    setMailMessages((current) => [
      {
        id: crypto.randomUUID(),
        title: "Booking removed",
        body: `${removalTarget.title} (${roomName(removalTarget.roomId)}, ${formatDate(removalTarget.date)} ${removalTarget.start}-${removalTarget.end}) was removed. Reason: ${removalReason.trim() || "Cancelled by user."}`,
        createdAt: formatDateTime(new Date()),
      },
      ...current,
    ])
    setRemoveDialogOpen(false)
    setRemovalTarget(null)
    setRemovalReason("")
  }

  const signOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    window.localStorage.removeItem("fairspace-role")
    router.replace("/login")
  }

  const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

  const typeAssistantReply = async (reply: string, action?: ChatAction) => {
    const assistantId = crypto.randomUUID()
    setMessages((current) => [...current, { id: assistantId, role: "assistant", content: "" }])
    await sleep(1000)

    for (let index = 1; index <= reply.length; index += 2) {
      const partial = reply.slice(0, index)
      setMessages((current) =>
        current.map((item) => (item.id === assistantId ? { ...item, content: partial } : item)),
      )
      if (index % 16 === 1) {
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0)
      }
      await sleep(14)
    }

    setMessages((current) =>
      current.map((item) => (item.id === assistantId ? { ...item, content: reply, action } : item)),
    )
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  const sendChat = async () => {
    const message = chatInput.trim()
    if (!message || isChatLoading) return

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message }
    setMessages((current) => [...current, userMessage])
    setChatInput("")
    setIsChatLoading(true)

    try {
      const response = await fetch("/api/ai-booking-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: {
            rooms,
            bookings,
            selectedDate,
            defaultOrganizer: organizer,
            role: portalRole,
          },
          history: messages.slice(-8).map((item) => ({ role: item.role, content: item.content })),
        }),
      })

      const data = (await response.json()) as { reply: string; action?: ChatAction; source?: AiSource }
      setAiSource(data.source ?? null)
      await typeAssistantReply(data.reply, data.action)

      if (data.action?.type === "CREATE_BOOKING") {
        if (portalRole === "admin") {
          await typeAssistantReply(
            "You're in admin mode, so I can't create bookings here. I can help review, approve, or manage bookings, or you can switch to a student account to book a slot.",
          )
          return
        }

        return
      }
    } catch {
      await typeAssistantReply("I could not reach the booking assistant endpoint. Please try again.")
    } finally {
      setIsChatLoading(false)
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4]">
        <div className="flex items-center gap-3 rounded-md border border-[#dfe5de] bg-white px-4 py-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your booking workspace...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#18201d]">
      <header className="border-b border-[#dfe5de] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#173f3a] text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">FairSpace</p>
              <p className="text-xs text-[#66736c]">University discussion room booking with AI assistance</p>
              <p className="text-xs font-medium text-[#173f3a]">{formatDateTime(now)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="hidden rounded-md border-0 bg-[#fff4cf] text-[#765a00] sm:inline-flex">
              {portalRole}
            </Badge>
            <Button variant="outline" className="h-10 w-10 rounded-full p-0" onClick={() => setMailboxDialogOpen(true)}>
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-10 rounded-full px-2 pr-4" onClick={() => setProfileDialogOpen(true)}>
              <ProfileAvatar name={organizer} src={profile.avatarUrl} size="sm" />
              <span className="ml-2 hidden sm:inline">{organizer}</span>
            </Button>
            <Button variant="outline" className="h-9 rounded-md" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="space-y-6">
          <Card className="rounded-md border-[#dfe5de] bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge className="rounded-md border-0 bg-[#173f3a] text-white">Core booking app</Badge>
                    <Badge className="rounded-md border-0 bg-[#dff3ff] text-[#075174]">AI booking chatbot</Badge>
                    <Badge className="rounded-md border-0 bg-[#fff4cf] text-[#765a00]">2-hour limit</Badge>
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight">University room booking dashboard</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736c]">
                    Book discussion rooms from the calendar, review your schedule, request longer study sessions, and let the AI assistant find open slots.
                  </p>
                </div>
                {portalRole !== "admin" && (
                  <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
                    <Metric label="Active" value={metricBookings.length} tone="green" />
                    <Metric label="Checked in" value={metricBookings.filter((booking) => booking.status === "checked-in").length} tone="blue" />
                    <Metric label="Pending" value={pending} tone="amber" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="calendar" className="space-y-5">
            <TabsList className={cn("grid h-auto w-full rounded-md bg-[#e7ece6] p-1", portalRole === "admin" ? "grid-cols-2 lg:w-[1040px] lg:grid-cols-6" : "grid-cols-3 lg:w-[620px]")}>
              <TabsTrigger value="calendar" className="rounded-md">Calendar</TabsTrigger>
              <TabsTrigger value="schedule" className="rounded-md">Schedule</TabsTrigger>
              <TabsTrigger value="rooms" className="rounded-md">Rooms</TabsTrigger>
              {portalRole === "admin" && (
                <>
                  <TabsTrigger value="admin" className="relative rounded-md">
                    Admin Queue
                    {pending > 0 && <CountBadge value={pending} />}
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="relative rounded-md">
                    Admin Report
                    {reports.filter((report) => report.status === "open").length > 0 && <CountBadge value={reports.filter((report) => report.status === "open").length} />}
                  </TabsTrigger>
                  <TabsTrigger value="ban" className="rounded-md">Ban User</TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="calendar">
              <CalendarView
                rooms={rooms}
                bookings={bookings}
                portalRole={portalRole}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onPickSlot={(roomId, date, slot) => {
                  if (portalRole === "admin") return
                  setSelectedRoom(roomId)
                  setSelectedDate(date)
                  setStart(slot)
                  setRequestStart(slot)
                  setRequestEnd(addMinutes(slot, 180))
                  setDuration(120)
                  setBookingDialogOpen(true)
                }}
                onOpenBooking={(booking) => {
                  setSelectedBookingDetail(booking)
                  setDetailDialogOpen(true)
                }}
                onReport={() => openReport(null)}
              />
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid gap-5 lg:grid-cols-[290px_1fr]">
                <MiniMonthCalendar
                  selectedDate={selectedScheduleDate}
                  onSelectDate={setSelectedScheduleDate}
                  markedDates={bookings
                    .filter((booking) => booking.status !== "cancelled" && (portalRole === "admin" || booking.organizerId === profileId))
                    .map((booking) => booking.date)}
                />
                <div className="space-y-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-semibold">{selectedScheduleDate ? formatLongDate(selectedScheduleDate) : "All your bookings"}</h2>
                      <p className="text-sm text-[#66736c]">
                        {selectedScheduleDate ? "Bookings on the selected date." : "Select a date on the mini calendar to filter your schedule."}
                      </p>
                    </div>
                    {selectedScheduleDate && (
                      <Button variant="outline" className="rounded-md" onClick={() => setSelectedScheduleDate(null)}>
                        Show all
                      </Button>
                    )}
                  </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    roomName={roomName(booking.roomId)}
                    canCheckIn={portalRole === "admin"}
                    canCancel={portalRole === "admin" || booking.organizerId === profileId}
                    canEdit={booking.organizerId === profileId && booking.status !== "cancelled"}
                    onCheckIn={() => updateStatus(booking.id, "checked-in")}
                    onCancel={() => (portalRole === "admin" ? openRemoveBooking(booking) : updateStatus(booking.id, "cancelled"))}
                    onEdit={() => {
                      setEditingBooking({ ...booking })
                      setEditDialogOpen(true)
                    }}
                  />
                ))}
              </div>
              {visibleBookings.length === 0 && <EmptyState text={portalRole === "admin" ? "No bookings found." : "You do not have bookings for this selection yet."} />}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rooms">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="rounded-md border-[#dfe5de] bg-white shadow-sm">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{room.name}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-[#66736c]">
                            <MapPin className="h-3.5 w-3.5" />
                            {room.floor}, {room.building}
                          </p>
                        </div>
                        <Badge className={cn("rounded-md border-0", room.status === "available" ? "bg-[#e7f4ef] text-[#19624f]" : "bg-[#fff4cf] text-[#765a00]")}>
                          {room.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, index) => <Badge key={`${room.id}-${amenity}-${index}`} variant="outline" className="rounded-md border-[#d5ddd6]">{amenity}</Badge>)}
                      </div>
                      <p className="text-sm text-[#66736c]">Capacity: {room.capacity} people</p>
                      {portalRole === "admin" && (
                        <div className="grid gap-3 border-t border-[#edf1ee] pt-4">
                          <Field label="Status">
                            <select value={room.status} onChange={(event) => updateRoom(room.id, { status: event.target.value as Room["status"] })} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                              <option value="available">available</option>
                              <option value="maintenance">maintenance</option>
                            </select>
                          </Field>
                          <Field label="Capacity">
                            <Input type="number" min={1} max={8} value={room.capacity} onChange={(event) => updateRoom(room.id, { capacity: Number(event.target.value) })} className="rounded-md border-[#d5ddd6]" />
                          </Field>
                          <Field label="Amenities">
                            <Input value={room.amenities.join(", ")} onChange={(event) => updateRoom(room.id, { amenities: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="rounded-md border-[#d5ddd6]" />
                          </Field>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {portalRole === "admin" && (
              <TabsContent value="admin">
                <Card className="rounded-md border-[#dfe5de] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShieldCheck className="h-5 w-5 text-[#236b60]" />
                      Pending approvals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {bookings.filter((booking) => booking.status === "pending").map((booking) => (
                      <div key={booking.id} className="flex flex-col justify-between gap-3 rounded-md border border-[#dfe5de] p-4 sm:flex-row sm:items-center">
                        <div className="flex gap-3">
                          <ProfileAvatar name={booking.organizer} src={booking.organizerAvatar} />
                          <div>
                            <p className="font-semibold">{booking.title}</p>
                            <p className="mt-1 text-sm text-[#66736c]">{roomName(booking.roomId)} - {formatDate(booking.date)} - {booking.start}-{booking.end}</p>
                            <p className="mt-2 text-sm text-[#4d5a53]">{booking.requestMessage || "No message provided."}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="rounded-md" onClick={() => openRemoveBooking(booking)}>Reject</Button>
                          <Button className="rounded-md bg-[#173f3a] hover:bg-[#24534d]" onClick={() => updateStatus(booking.id, "confirmed")}>Approve</Button>
                        </div>
                      </div>
                    ))}
                    {pending === 0 && <EmptyState text="No pending bookings to review." />}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            {portalRole === "admin" && (
              <TabsContent value="reports">
                <Card className="rounded-md border-[#dfe5de] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Flag className="h-5 w-5 text-[#b42318]" />
                      Student reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reports.map((report) => (
                      <div key={report.id} className="rounded-md border border-[#dfe5de] p-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{report.type}</p>
                              <Badge className={cn("rounded-md border-0", report.status === "open" ? "bg-[#fff4cf] text-[#765a00]" : "bg-[#e7f4ef] text-[#19624f]")}>{report.status}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-[#66736c]">From {report.reporter} - {report.createdAt}</p>
                            {report.booking && <p className="mt-1 text-sm text-[#66736c]">{roomName(report.booking.roomId)} - {formatDate(report.booking.date)} - {report.booking.start}-{report.booking.end}</p>}
                            <p className="mt-3 text-sm">{report.message}</p>
                            {report.photo && <img src={report.photo} alt="Report evidence" className="mt-3 h-28 rounded-md border border-[#d5ddd6] object-cover" />}
                          </div>
                        </div>
                        {report.status === "open" ? (
                          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                            <Input value={reportReply[report.id] ?? ""} onChange={(event) => setReportReply((current) => ({ ...current, [report.id]: event.target.value }))} placeholder="Reply to student before resolving" className="rounded-md border-[#d5ddd6]" />
                            <Button className="rounded-md bg-[#173f3a] hover:bg-[#24534d]" onClick={() => resolveReport(report)}>Resolve</Button>
                          </div>
                        ) : (
                          <p className="mt-3 rounded-md bg-[#f8faf7] p-3 text-sm text-[#4d5a53]">Reply: {report.reply}</p>
                        )}
                      </div>
                    ))}
                    {reports.length === 0 && <EmptyState text="No reports received yet." />}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            {portalRole === "admin" && (
              <TabsContent value="ban">
                <Card className="rounded-md border-[#dfe5de] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Ban user</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <Field label="User email">
                      <Input value={banEmail} onChange={(event) => setBanEmail(event.target.value)} placeholder="student@university.edu" className="rounded-md border-[#d5ddd6]" />
                    </Field>
                    <Field label="Ban duration">
                      <select value={banMonths} onChange={(event) => setBanMonths(Number(event.target.value))} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                        <option value={1}>1 month</option>
                        <option value={3}>3 months</option>
                        <option value={6}>6 months</option>
                        <option value={12}>12 months</option>
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Reason">
                        <Textarea value={banReason} onChange={(event) => setBanReason(event.target.value)} placeholder="Explain why this user is banned..." className="min-h-24 rounded-md border-[#d5ddd6]" />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Button className="rounded-md bg-[#b42318] hover:bg-[#8f1d14]" onClick={() => setBanDialogOpen(true)}>Ban user</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </section>
      </div>

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Book this calendar slot</DialogTitle>
            <DialogDescription>
              {roomName(selectedRoom)} on {formatDate(selectedDate)}, starting {start}. Standard bookings can be up to 2 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Booking title">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-md border-[#d5ddd6]" />
            </Field>
            <Field label="Attendees">
              <Input type="number" min={1} value={attendees} onChange={(event) => setAttendees(Number(event.target.value))} className="rounded-md border-[#d5ddd6]" />
            </Field>
            <Field label="Backup confirmer email">
              <Input type="email" value={backupEmail} onChange={(event) => setBackupEmail(event.target.value)} placeholder="friend@university.edu" className="rounded-md border-[#d5ddd6]" />
            </Field>
            <Field label="Start time">
              <select value={start} onChange={(event) => setStart(event.target.value)} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                {times.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration">
              <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours max</option>
              </select>
            </Field>
            <div className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-3 text-sm sm:col-span-2">
              Selected slot: {roomName(selectedRoom)} - {start}-{end}
              <p className="mt-1 text-xs text-[#66736c]">Arrival confirmation can be handled by you or the backup email if you cannot access your email.</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" className="rounded-md" onClick={() => setRequestDialogOpen(true)}>
              Ask admin for more hours
            </Button>
            <Button
              className="rounded-md bg-[#173f3a] hover:bg-[#24534d]"
              onClick={async () => {
                const ok = await createBooking()
                if (ok) setBookingDialogOpen(false)
              }}
            >
              Book {duration / 60 === 1 ? "1 hour" : `${duration / 60} hours`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Request longer booking</DialogTitle>
            <DialogDescription>
              Send the admin a reason for booking {roomName(selectedRoom)} for more than 2 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="From">
                <select value={requestStart} onChange={(event) => setRequestStart(event.target.value)} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                  {times.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </Field>
              <Field label="To">
                <select value={requestEnd} onChange={(event) => setRequestEnd(event.target.value)} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                  {times.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-3 text-sm">
              <p><span className="font-semibold">Room:</span> {roomName(selectedRoom)}</p>
              <p><span className="font-semibold">Date:</span> {formatDate(selectedDate)}</p>
              <p><span className="font-semibold">Time:</span> {requestStart}-{requestEnd}</p>
            </div>
            <Field label="Message to admin">
              <Textarea
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Explain why your group needs more than 2 hours..."
                className="min-h-28 rounded-md border-[#d5ddd6]"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button className="rounded-md bg-[#173f3a] hover:bg-[#24534d]" onClick={requestLongerSlot}>
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>
              See who booked this slot before using the room.
            </DialogDescription>
          </DialogHeader>
          {selectedBookingDetail && (
            <div className="space-y-4">
              <div className="flex gap-3 rounded-md border border-[#dfe5de] bg-[#f8faf7] p-4">
                <ProfileAvatar name={selectedBookingDetail.organizer} src={selectedBookingDetail.organizerAvatar} />
                <div>
                  <p className="font-semibold">{selectedBookingDetail.title}</p>
                  <p className="mt-1 text-sm text-[#66736c]">{selectedBookingDetail.organizer}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="font-semibold">Room:</span> {roomName(selectedBookingDetail.roomId)}</p>
                <p><span className="font-semibold">Date:</span> {formatDate(selectedBookingDetail.date)}</p>
                <p><span className="font-semibold">Time:</span> {selectedBookingDetail.start}-{selectedBookingDetail.end}</p>
                <p><span className="font-semibold">Attendees:</span> {selectedBookingDetail.attendees}</p>
              </div>
              {selectedBookingDetail.requestMessage && (
                <div className="rounded-md border border-[#f0d893] bg-[#fff9df] p-3 text-sm text-[#765a00]">
                  {selectedBookingDetail.requestMessage}
                </div>
              )}
            </div>
          )}
          {selectedBookingDetail && (
            <DialogFooter className="gap-2 sm:justify-between">
              {portalRole === "admin" ? (
                <Button
                  variant="outline"
                  className="rounded-md text-[#a23a3a]"
                  onClick={() => {
                    openRemoveBooking(selectedBookingDetail)
                    setDetailDialogOpen(false)
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Delete booking
                </Button>
              ) : selectedBookingDetail.organizerId === profileId ? (
                <>
                  <Button
                    variant="outline"
                    className="rounded-md text-[#a23a3a]"
                    onClick={() => {
                      updateStatus(selectedBookingDetail.id, "cancelled")
                      setDetailDialogOpen(false)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Remove booking
                  </Button>
                  <Button
                    className="rounded-md bg-[#173f3a] hover:bg-[#24534d]"
                    onClick={() => {
                      setEditingBooking({ ...selectedBookingDetail })
                      setDetailDialogOpen(false)
                      setEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit details
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-md"
                  onClick={() => {
                    openReport(selectedBookingDetail)
                    setDetailDialogOpen(false)
                  }}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report booking
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Report room issue</DialogTitle>
            <DialogDescription>
              Send the admin a short note if a room is being misused, occupied by the wrong group, or repeatedly booked unfairly.
            </DialogDescription>
          </DialogHeader>
          {reportBooking && (
            <div className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-3 text-sm">
              <p><span className="font-semibold">Booking:</span> {reportBooking.title}</p>
              <p><span className="font-semibold">Booked by:</span> {reportBooking.organizer}</p>
              <p><span className="font-semibold">Slot:</span> {roomName(reportBooking.roomId)} - {formatDate(reportBooking.date)} - {reportBooking.start}-{reportBooking.end}</p>
            </div>
          )}
          {!reportBooking && (
            <Field label="Report type">
              <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                <option>Room misuse</option>
                <option>Wrong group using room</option>
                <option>Booking hogging</option>
                <option>Room damage</option>
                <option>Cleanliness issue</option>
                <option>Other</option>
              </select>
            </Field>
          )}
          {reportBooking && (
            <Field label="Report type">
              <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                <option>Booking hogging</option>
                <option>Wrong person using booking</option>
                <option>No-show booking</option>
                <option>Room misuse</option>
                <option>Other</option>
              </select>
            </Field>
          )}
          <Field label="Message to admin">
            <Textarea
              value={reportMessage}
              onChange={(event) => setReportMessage(event.target.value)}
              placeholder="Describe what happened..."
              className="min-h-28 rounded-md border-[#d5ddd6]"
            />
          </Field>
          <div className="space-y-3">
            {reportPhoto && <img src={reportPhoto} alt="Report evidence preview" className="h-32 w-full rounded-md border border-[#d5ddd6] object-cover" />}
            <div className="flex flex-wrap gap-2">
              <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#d5ddd6] px-3 py-2 text-sm hover:bg-[#f8faf7]">
                <Upload className="h-4 w-4" />
                Upload photo
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => readReportPhoto(event.target.files?.[0])} />
              </Label>
              <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#d5ddd6] px-3 py-2 text-sm hover:bg-[#f8faf7]">
                <Camera className="h-4 w-4" />
                Take photo
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => readReportPhoto(event.target.files?.[0])} />
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button className="rounded-md bg-[#b42318] hover:bg-[#8f1d14]" onClick={submitReport}>
              Send report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Remove booking</DialogTitle>
            <DialogDescription>
              Admin removals require a reason so the student can receive it in their mailbox.
            </DialogDescription>
          </DialogHeader>
          {removalTarget && (
            <div className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-3 text-sm">
              <p><span className="font-semibold">Booking:</span> {removalTarget.title}</p>
              <p><span className="font-semibold">Slot:</span> {roomName(removalTarget.roomId)} - {formatDate(removalTarget.date)} - {removalTarget.start}-{removalTarget.end}</p>
            </div>
          )}
          <Field label="Reason">
            <Textarea value={removalReason} onChange={(event) => setRemovalReason(event.target.value)} placeholder="Explain why this slot is being removed..." className="min-h-24 rounded-md border-[#d5ddd6]" />
          </Field>
          <DialogFooter>
            <Button className="rounded-md bg-[#b42318] hover:bg-[#8f1d14]" onClick={removeBookingWithReason}>Remove booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm ban</DialogTitle>
            <DialogDescription>
              This demo records the ban action locally. Backend enforcement can connect to this later.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-3 text-sm">
            <p><span className="font-semibold">User:</span> {banEmail || "No email entered"}</p>
            <p><span className="font-semibold">Duration:</span> {banMonths} month(s)</p>
            <p><span className="font-semibold">Reason:</span> {banReason || "No reason entered"}</p>
          </div>
          <DialogFooter>
            <Button className="rounded-md bg-[#b42318] hover:bg-[#8f1d14]" onClick={banUser}>Confirm ban</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit booking</DialogTitle>
            <DialogDescription>
              Change your room, time, title, or attendees. Longer-than-2-hour changes still require admin approval.
            </DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Booking title">
                <Input value={editingBooking.title} onChange={(event) => setEditingBooking({ ...editingBooking, title: event.target.value })} className="rounded-md border-[#d5ddd6]" />
              </Field>
              <Field label="Attendees">
                <Input type="number" min={1} value={editingBooking.attendees} onChange={(event) => setEditingBooking({ ...editingBooking, attendees: Number(event.target.value) })} className="rounded-md border-[#d5ddd6]" />
              </Field>
              <Field label="Room">
                <select value={editingBooking.roomId} onChange={(event) => setEditingBooking({ ...editingBooking, roomId: event.target.value })} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id} disabled={room.status !== "available"}>{room.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <select value={editingBooking.date} onChange={(event) => setEditingBooking({ ...editingBooking, date: event.target.value })} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                  {dates.map((date) => (
                    <option key={date} value={date}>{formatDate(date)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start">
                <select value={editingBooking.start} onChange={(event) => setEditingBooking({ ...editingBooking, start: event.target.value })} className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm">
                  {times.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </Field>
              <Field label="Duration">
                <select
                  value={durationMinutes(editingBooking)}
                  onChange={(event) => setEditingBooking({ ...editingBooking, end: addMinutes(editingBooking.start, Number(event.target.value)) })}
                  className="h-10 rounded-md border border-[#d5ddd6] bg-white px-3 text-sm"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours max</option>
                </select>
              </Field>
            </div>
          )}
          <DialogFooter>
            <Button className="rounded-md bg-[#173f3a] hover:bg-[#24534d]" onClick={updateBooking}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              Update the details other students and admins see on bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="space-y-3">
              <ProfileAvatar name={profile.fullName || organizer} src={profile.avatarUrl} size="lg" />
              <Label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[#d5ddd6] px-3 py-2 text-sm hover:bg-[#f8faf7]">
                <Upload className="h-4 w-4" />
                Photo
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => readProfilePhoto(event.target.files?.[0])} />
              </Label>
            </div>
            <div className="grid gap-4">
              <Field label="Full name">
                <Input value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} className="rounded-md border-[#d5ddd6]" />
              </Field>
              <Field label="Email">
                <Input value={profile.email} disabled className="rounded-md border-[#d5ddd6] bg-muted/40" />
              </Field>
              {portalRole === "student" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Matric ID">
                    <Input value={profile.matricId} onChange={(event) => setProfile((current) => ({ ...current, matricId: event.target.value }))} className="rounded-md border-[#d5ddd6]" />
                  </Field>
                  <Field label="Faculty">
                    <Input value={profile.faculty} onChange={(event) => setProfile((current) => ({ ...current, faculty: event.target.value }))} className="rounded-md border-[#d5ddd6]" />
                  </Field>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button className="rounded-md bg-[#173f3a] hover:bg-[#24534d]" onClick={updateProfile}>
              Save profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mailboxDialogOpen} onOpenChange={setMailboxDialogOpen}>
        <DialogContent className="rounded-md sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Mailbox</DialogTitle>
            <DialogDescription>
              Any follow up admin messages will appear here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {portalRole === "admin" && reports.filter((report) => report.status === "open").map((report) => (
              <div key={report.id} className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-4">
                <p className="font-semibold">{report.type}</p>
                <p className="mt-1 text-sm text-[#66736c]">{report.createdAt} - {report.reporter}</p>
                <p className="mt-2 text-sm">{report.message}</p>
              </div>
            ))}
            {portalRole === "admin" && bookings.filter((booking) => booking.status === "pending").map((booking) => (
              <div key={booking.id} className="rounded-md border border-[#dfe5de] bg-[#fff9df] p-4">
                <p className="font-semibold">Pending request</p>
                <p className="mt-1 text-sm text-[#66736c]">{booking.title} - {formatDate(booking.date)} {booking.start}-{booking.end}</p>
              </div>
            ))}
            {mailMessages.map((message) => (
              <div key={message.id} className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-4">
                <p className="font-semibold">{message.title}</p>
                <p className="mt-1 text-xs text-[#66736c]">{message.createdAt}</p>
                <p className="mt-2 text-sm">{message.body}</p>
              </div>
            ))}
            {mailMessages.length === 0 && !(portalRole === "admin" && (reports.some((report) => report.status === "open") || bookings.some((booking) => booking.status === "pending"))) && (
              <div className="rounded-md border border-[#dfe5de] bg-[#f8faf7] p-4">
                <p className="font-semibold">No new admin messages</p>
                <p className="mt-1 text-sm text-[#66736c]">Any follow up admin messages will appear here.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {portalRole === "student" && (
        <FloatingChat
          open={chatOpen}
          setOpen={setChatOpen}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isChatLoading={isChatLoading}
          sendChat={sendChat}
          chatBottomRef={chatBottomRef}
          aiSource={aiSource}
          onConfirmAction={async (action) => {
            const isLongBooking = minutes(action.payload.end) - minutes(action.payload.start) > MAX_STANDARD_MINUTES
            const ok = await createBooking(
              {
                ...action.payload,
                requestMessage:
                  action.payload.requestMessage ??
                  (isLongBooking ? "Requested through the AI booking assistant." : undefined),
              },
              isLongBooking ? "pending" : "confirmed",
              isLongBooking,
            )
            await typeAssistantReply(
              ok
                ? isLongBooking
                  ? "Done. I sent this as a pending approval request to admin."
                  : "Done. I booked that slot for you."
                : "I could not complete it because of capacity, maintenance, conflict, or your daily booking limit.",
            )
          }}
        />
      )}
    </main>
  )
}

function FloatingChat({
  open,
  setOpen,
  messages,
  chatInput,
  setChatInput,
  isChatLoading,
  sendChat,
  chatBottomRef,
  aiSource,
  onConfirmAction,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  messages: ChatMessage[]
  chatInput: string
  setChatInput: (value: string) => void
  isChatLoading: boolean
  sendChat: () => void
  chatBottomRef: React.RefObject<HTMLDivElement | null>
  aiSource: AiSource | "warming" | null
  onConfirmAction: (action: ChatAction) => void | Promise<void>
}) {
  const statusText = aiSource === "warming" ? "AI Assistant connecting..." : "AI Assistant active"

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <Card className="w-[calc(100vw-2.5rem)] max-w-[390px] rounded-md border-[#c9d9d3] bg-[#17221f] text-white shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-[#8de0c2]" />
                  AI Booking Assistant
                </CardTitle>
                <p className="mt-2 text-sm font-normal leading-6 text-white/65">
                  Ask about room availability, capacity, and booking slots.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-md text-white hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[320px] space-y-3 overflow-y-auto rounded-md border border-white/10 bg-white/5 p-3">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[88%] space-y-3 rounded-md px-3 py-2 text-sm leading-6", message.role === "user" ? "bg-[#8de0c2] text-[#10221d]" : "bg-white/10 text-white/85")}>
                    <p>{message.content}</p>
                    {message.action?.type === "CREATE_BOOKING" && (
                      <div className="rounded-md border border-white/10 bg-white/10 p-3">
                        <p className="font-semibold text-white">Suggested slot</p>
                        <p className="text-xs text-white/75">
                          {message.action.payload.date}, {message.action.payload.start}-{message.action.payload.end}
                        </p>
                        <p className="text-xs text-white/75">
                          {message.action.payload.attendees} attendee(s)
                        </p>
                        <Button
                          size="sm"
                          className="mt-3 w-full rounded-md bg-[#8de0c2] text-[#10221d] hover:bg-[#b8ecd9]"
                          onClick={() => onConfirmAction(message.action!)}
                        >
                          {minutes(message.action.payload.end) - minutes(message.action.payload.start) > MAX_STANDARD_MINUTES
                            ? "Send pending request"
                            : "Book this slot"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-sm text-white/65">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Writing response...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>
            <div className="space-y-2">
              <Textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    sendChat()
                  }
                }}
                placeholder="Ask: Find a room for 4 people tomorrow morning..."
                className="min-h-20 rounded-md border-white/15 bg-white/10 text-white placeholder:text-white/45"
              />
              <Button className="w-full rounded-md bg-[#8de0c2] text-[#10221d] hover:bg-[#b8ecd9]" onClick={sendChat} disabled={isChatLoading}>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
              <p className="text-xs text-white/45">{statusText}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="h-14 rounded-full bg-[#173f3a] px-5 text-white shadow-xl hover:bg-[#24534d]"
        onClick={() => setOpen(!open)}
      >
        <Bot className="mr-2 h-5 w-5" />
        AI Assistant
      </Button>
    </div>
  )
}

function ProfileAvatar({ name, src, size = "md" }: { name: string; src?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-24 w-24 text-2xl",
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U"

  if (src) {
    return <img src={src} alt={name} className={cn("rounded-full border border-[#d5ddd6] object-cover", sizes[size])} />
  }

  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full border border-[#d5ddd6] bg-[#e7f4ef] font-semibold text-[#19624f]", sizes[size])}>
      {initials || <UserCircle className="h-5 w-5" />}
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "green" | "blue" | "amber" }) {
  const tones = {
    green: "bg-[#e7f4ef] text-[#19624f]",
    blue: "bg-[#dff3ff] text-[#075174]",
    amber: "bg-[#fff4cf] text-[#765a00]",
  }
  return (
    <div className={cn("rounded-md p-3", tones[tone])}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  )
}

function CountBadge({ value }: { value: number }) {
  return (
    <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b42318] px-1 text-xs font-semibold text-white">
      {value}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase text-[#66736c]">{label}</Label>
      {children}
    </div>
  )
}

function MiniMonthCalendar({
  selectedDate,
  onSelectDate,
  markedDates,
  frameless = false,
}: {
  selectedDate: string | null
  onSelectDate: (date: string) => void
  markedDates: string[]
  frameless?: boolean
}) {
  const initial = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date(`${dates[0]}T00:00:00`)
  const [visibleMonth, setVisibleMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const marked = new Set(markedDates)
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - firstDay.getDay())
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })

  const moveMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  const content = (
    <>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-semibold">{monthLabel(visibleMonth)}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-md px-2" onClick={() => moveMonth(-1)}>Prev</Button>
            <Button variant="outline" size="sm" className="h-8 rounded-md px-2" onClick={() => moveMonth(1)}>Next</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#66736c]">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={`${day}-${index}`} className="py-1">{day}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const iso = toIsoDate(day)
            const selected = selectedDate === iso
            const inMonth = day.getMonth() === visibleMonth.getMonth()
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelectDate(iso)}
                className={cn(
                  "flex h-10 flex-col items-center justify-center rounded-md text-sm transition hover:bg-[#edf4ef]",
                  selected && "bg-[#173f3a] text-white hover:bg-[#173f3a]",
                  !selected && !inMonth && "text-[#a3aaa5]",
                )}
              >
                <span>{day.getDate()}</span>
                <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", marked.has(iso) ? "bg-[#1b8bd4]" : "bg-transparent", selected && marked.has(iso) && "bg-white")} />
              </button>
            )
          })}
        </div>
    </>
  )

  if (frameless) return content

  return (
    <Card className="rounded-md border-[#dfe5de] bg-white shadow-sm">
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  )
}

function CalendarView({
  rooms,
  bookings,
  portalRole,
  selectedDate,
  setSelectedDate,
  onPickSlot,
  onOpenBooking,
  onReport,
}: {
  rooms: Room[]
  bookings: Booking[]
  portalRole: "student" | "admin"
  selectedDate: string
  setSelectedDate: (date: string) => void
  onPickSlot: (roomId: string, date: string, slot: string) => void
  onOpenBooking: (booking: Booking) => void
  onReport: () => void
}) {
  const [roomSearch, setRoomSearch] = useState("")
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const activeRooms = rooms.filter((room) => {
    const searchText = `${room.name} ${room.building} ${room.floor} ${room.amenities.join(" ")}`.toLowerCase()
    return room.status === "available" && searchText.includes(roomSearch.toLowerCase())
  })
  const roomName = (roomId: string) => rooms.find((room) => room.id === roomId)?.name ?? "Unknown room"

  return (
    <div className="space-y-4">
      <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
            <div>
          <h2 className="text-lg font-semibold">Calendar view</h2>
              <p className="text-sm text-[#66736c]">
                {portalRole === "admin"
                  ? "Click an occupied slot to review or remove a booking. Empty slots are read-only for admins."
                  : "Click an empty slot to book, or click an occupied slot to see who booked it."}
              </p>
              <p className="mt-2 text-base font-semibold">{formatLongDate(selectedDate)}</p>
            </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8780]" />
            <Input
              value={roomSearch}
              onChange={(event) => setRoomSearch(event.target.value)}
              placeholder="Search rooms"
              className="rounded-md border-[#d5ddd6] pl-9"
            />
          </div>
            <Button variant="outline" className="rounded-md" onClick={() => setDatePickerOpen(true)}>
              <CalendarDays className="mr-2 h-4 w-4" />
              {formatDate(selectedDate)}
            </Button>
            <Button variant="outline" className="rounded-md border-[#f3b4ad] text-[#b42318] hover:bg-[#fff1ef] hover:text-[#8f1d14]" onClick={onReport}>
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          </div>
        </div>

      <Card className="overflow-hidden rounded-md border-[#dfe5de] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {activeRooms.length === 0 ? (
              <EmptyState text="No available rooms match your search." />
            ) : (
            <div className="min-w-[860px]">
              <div className="grid border-b border-[#dfe5de]" style={{ gridTemplateColumns: `110px repeat(${activeRooms.length}, minmax(180px, 1fr))` }}>
                <div className="bg-[#f8faf7] p-3 text-sm font-semibold text-[#66736c]">Time</div>
                {activeRooms.map((room) => (
                  <div key={room.id} className="border-l border-[#dfe5de] bg-[#f8faf7] p-3">
                    <p className="text-sm font-semibold">{room.name}</p>
                    <p className="text-xs text-[#66736c]">{room.capacity} pax</p>
                  </div>
                ))}
              </div>
              {times.map((slot) => (
                <div key={slot} className="grid border-b border-[#edf1ee] last:border-b-0" style={{ gridTemplateColumns: `110px repeat(${activeRooms.length}, minmax(180px, 1fr))` }}>
                  <div className="flex min-h-16 items-center bg-[#fbfcfa] px-3 text-sm text-[#66736c]">{slot}</div>
                  {activeRooms.map((room) => {
                    const booking = bookings.find((item) => item.date === selectedDate && item.roomId === room.id && item.status !== "cancelled" && minutes(slot) >= minutes(item.start) && minutes(slot) < minutes(item.end))
                    const isBookingStart = booking?.start === slot
                    const isPending = booking?.status === "pending"
                    return (
                      <button
                        key={`${room.id}-${slot}`}
                        type="button"
                        disabled={!booking && portalRole === "admin"}
                        className={cn(
                          "min-h-16 border-l border-[#edf1ee] p-2 text-left transition",
                          booking && !isPending && "bg-[#e7f4ef] hover:bg-[#dcefe7]",
                          isPending && "bg-[#fff4cf] hover:bg-[#ffedb0]",
                          !booking && portalRole !== "admin" && "hover:bg-[#f2f6f3]",
                          !booking && portalRole === "admin" && "cursor-default",
                        )}
                        onClick={() => booking ? onOpenBooking(booking) : onPickSlot(room.id, selectedDate, slot)}
                      >
                        {booking && isBookingStart ? (
                          <div className={cn("rounded-md border bg-white p-2", isPending ? "border-[#f0d893]" : "border-[#b9d8cb]")}>
                            <div className="mb-1 flex items-center gap-2">
                              <ProfileAvatar name={booking.organizer} src={booking.organizerAvatar} size="sm" />
                              <p className="truncate text-sm font-semibold">{booking.title}</p>
                            </div>
                            <p className="text-xs text-[#66736c]">{roomName(booking.roomId)} - {booking.start}-{booking.end}</p>
                            {isPending && <p className="mt-1 text-xs font-medium text-[#765a00]">Pending admin approval</p>}
                          </div>
                        ) : booking ? (
                          <span className={cn("text-xs", isPending ? "text-[#765a00]" : "text-[#8a968f]")}>
                            {isPending ? `Pending until ${booking.end}` : `Occupied until ${booking.end}`}
                          </span>
                        ) : (
                          <span className="text-xs text-[#8a968f]">Available</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <DialogContent className="rounded-md p-0 sm:max-w-[360px]">
          <DialogHeader className="border-b border-[#dfe5de] px-4 py-3 text-left">
            <DialogTitle className="text-base">{formatLongDate(selectedDate)}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <MiniMonthCalendar
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date)
                setDatePickerOpen(false)
              }}
              markedDates={bookings.filter((booking) => booking.status !== "cancelled").map((booking) => booking.date)}
              frameless
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BookingCard({
  booking,
  roomName,
  canCheckIn,
  canCancel,
  canEdit,
  onCheckIn,
  onCancel,
  onEdit,
}: {
  booking: Booking
  roomName: string
  canCheckIn: boolean
  canCancel: boolean
  canEdit: boolean
  onCheckIn: () => void
  onCancel: () => void
  onEdit: () => void
}) {
  return (
    <Card className="rounded-md border-[#dfe5de] bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <ProfileAvatar name={booking.organizer} src={booking.organizerAvatar} />
            <div>
            <p className="font-semibold">{booking.title}</p>
            <p className="mt-1 text-sm text-[#66736c]">{roomName}</p>
            </div>
          </div>
          <Badge className={cn("rounded-md border", statusStyle[booking.status])}>{booking.status}</Badge>
        </div>
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-[#66736c]">
          <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" />{booking.start}-{booking.end}</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" />{booking.attendees} people</span>
          <span className="flex items-center gap-1"><DoorOpen className="h-4 w-4" />{booking.organizer}</span>
        </div>
        {booking.requestMessage && (
          <div className="mb-4 rounded-md border border-[#f0d893] bg-[#fff9df] p-3 text-sm text-[#765a00]">
            {booking.requestMessage}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button size="sm" variant="outline" className="rounded-md" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canCheckIn && (
            <Button size="sm" variant="outline" className="rounded-md" onClick={onCheckIn} disabled={booking.status === "checked-in"}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Check in
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="outline" className="rounded-md text-[#a23a3a]" onClick={onCancel}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#cfd8d1] bg-white p-6 text-center text-sm text-[#66736c]">
      <AlertCircle className="mx-auto mb-2 h-5 w-5" />
      {text}
    </div>
  )
}
