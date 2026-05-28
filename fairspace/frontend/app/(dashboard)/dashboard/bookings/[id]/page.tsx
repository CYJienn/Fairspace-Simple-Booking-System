"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DoorOpen,
  History,
  MapPin,
  QrCode,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDateLabel, getRoom, getRoomName } from "@/lib/booking-data"
import { useBookingStore } from "@/lib/booking-store"

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/30", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
}

const participantStatusConfig = {
  organizer: { label: "Organizer", color: "bg-primary/10 text-primary" },
  confirmed: { label: "Confirmed", color: "bg-success/10 text-success" },
  pending: { label: "Pending", color: "bg-warning/10 text-warning" },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive" },
}

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>()
  const { bookings, rooms, cancelBooking, checkInBooking, addParticipant } = useBookingStore()
  const [showQR, setShowQR] = useState(false)
  const [participantEmail, setParticipantEmail] = useState("")
  const booking = bookings.find((item) => item.id === params.id)

  if (!booking) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold">Booking not found</h1>
            <p className="text-muted-foreground mt-2">This booking may have been deleted or reset.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const room = getRoom(rooms, booking.roomId)
  const status = statusConfig[booking.status]
  const activeBooking = booking.status === "confirmed" || booking.status === "pending"

  const handleResult = (successMessage: string, action: () => { ok: boolean; message: string }) => {
    const result = action()
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success(successMessage)
  }

  const handleInvite = () => {
    const result = addParticipant(booking.id, participantEmail)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success("Participant invited")
    setParticipantEmail("")
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
            <DoorOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getRoomName(rooms, booking.roomId)}</h1>
              <Badge variant="outline" className={cn("gap-1 border", status.color)}>
                <status.icon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {room ? `${room.floor}, ${room.building}` : "Location unavailable"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/calendar">
              <RefreshCw className="h-4 w-4" />
              Reschedule
            </Link>
          </Button>
          {activeBooking && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel the booking and notify participants in the demo notification feed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleResult("Booking cancelled", () => cancelBooking(booking.id))}
                  >
                    Cancel Booking
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDateLabel(booking.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Purpose</p>
                <p className="text-foreground">{booking.purpose}</p>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in status</p>
                    <p className="text-2xl font-bold text-primary capitalize">
                      {booking.checkInStatus.replace("-", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Check-in deadline</p>
                    <p className="font-medium">{booking.checkInDeadline}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Participants ({booking.participants.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="new.participant@university.edu"
                  value={participantEmail}
                  onChange={(event) => setParticipantEmail(event.target.value)}
                />
                <Button variant="outline" onClick={handleInvite}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>

              <div className="space-y-3">
                {booking.participants.map((participant) => {
                  const participantStatus = participantStatusConfig[participant.status]
                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {participant.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium capitalize">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={cn("border-0", participantStatus.color)}>
                        {participantStatus.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking.timeline.map((event, index) => (
                  <div key={`${event.action}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {index < booking.timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{event.action}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{event.time}</span>
                        <span>-</span>
                        <span>{event.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Check-in QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-48 h-48 bg-muted rounded-2xl flex items-center justify-center overflow-hidden">
                  {showQR ? (
                    <div className="grid grid-cols-9 grid-rows-9 gap-1 h-full w-full p-5 bg-background">
                      {Array.from({ length: 81 }).map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "rounded-sm",
                            (index + booking.id.length) % 3 === 0 || index % 7 === 0 ? "bg-foreground" : "bg-transparent",
                          )}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">QR code hidden</p>
                    </div>
                  )}
                </div>

                <Button
                  variant={showQR ? "outline" : "default"}
                  className="w-full"
                  onClick={() => setShowQR(!showQR)}
                >
                  {showQR ? "Hide QR Code" : "Generate QR Code"}
                </Button>

                {activeBooking && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleResult("Checked in successfully", () => checkInBooking(booking.id))}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Checked In
                  </Button>
                )}

                <p className="text-xs text-muted-foreground">
                  Valid from {booking.startTime} to {booking.checkInDeadline}.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.success("Link copied")}>
                <Copy className="h-4 w-4" />
                Copy Booking Link
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/dashboard/calendar">
                  <Calendar className="h-4 w-4" />
                  Add to Calendar
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MapPin className="h-4 w-4" />
                Get Directions
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono">{booking.id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-right">{booking.createdAt}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {room?.capacity ?? "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
