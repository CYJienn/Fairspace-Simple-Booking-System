"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DoorOpen,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  XCircle,
  History,
  RefreshCw,
  Trash2,
  UserPlus,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock booking data
const bookingData = {
  id: 1,
  room: "Discussion Room A",
  location: "Level 3, Library Block A",
  date: "May 10, 2026",
  startTime: "2:00 PM",
  endTime: "4:00 PM",
  status: "confirmed",
  purpose: "Team project discussion and planning session for the upcoming presentation.",
  checkInStatus: "pending",
  checkInDeadline: "2:15 PM",
  createdAt: "May 8, 2026 at 10:30 AM",
  participants: [
    { id: 1, name: "Sarah Chen", email: "sarah@university.edu", status: "organizer", avatar: "SC" },
    { id: 2, name: "John Doe", email: "john@university.edu", status: "confirmed", avatar: "JD" },
    { id: 3, name: "Emily Wang", email: "emily@university.edu", status: "confirmed", avatar: "EW" },
    { id: 4, name: "Alex Kim", email: "alex@university.edu", status: "pending", avatar: "AK" },
  ],
  timeline: [
    { time: "May 8, 10:30 AM", action: "Booking created", user: "Sarah Chen" },
    { time: "May 8, 10:32 AM", action: "Invitations sent to 3 participants", user: "System" },
    { time: "May 8, 11:15 AM", action: "John Doe accepted invitation", user: "John Doe" },
    { time: "May 8, 2:30 PM", action: "Emily Wang accepted invitation", user: "Emily Wang" },
    { time: "May 9, 9:00 AM", action: "Reminder sent", user: "System" },
  ],
}

const statusConfig = {
  confirmed: { label: "Confirmed", color: "bg-success/10 text-success border-success/30", icon: CheckCircle2 },
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/30", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
}

const participantStatusConfig = {
  organizer: { label: "Organizer", color: "bg-primary/10 text-primary" },
  confirmed: { label: "Confirmed", color: "bg-success/10 text-success" },
  pending: { label: "Pending", color: "bg-warning/10 text-warning" },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive" },
}

export default function BookingDetailsPage() {
  const params = useParams()
  const [showQR, setShowQR] = useState(false)
  const status = statusConfig[bookingData.status as keyof typeof statusConfig]

  const timeUntilBooking = "1 hour 30 minutes"

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/bookings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
            <DoorOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{bookingData.room}</h1>
              <Badge variant="outline" className={cn("gap-1 border", status.color)}>
                <status.icon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{bookingData.location}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reschedule
          </Button>
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
                  Are you sure you want to cancel this booking? This action cannot be undone and all participants will be notified.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Cancel Booking
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Details */}
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
                    <p className="font-medium">{bookingData.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{bookingData.startTime} - {bookingData.endTime}</p>
                  </div>
                </div>
              </div>

              {bookingData.purpose && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Purpose</p>
                  <p className="text-foreground">{bookingData.purpose}</p>
                </div>
              )}

              {/* Countdown */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Time until booking</p>
                    <p className="text-2xl font-bold text-primary">{timeUntilBooking}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Check-in deadline</p>
                    <p className="font-medium">{bookingData.checkInDeadline}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Participants ({bookingData.participants.length})</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookingData.participants.map((participant) => {
                  const pStatus = participantStatusConfig[participant.status as keyof typeof participantStatusConfig]
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
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={cn("border-0", pStatus.color)}>
                        {pStatus.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingData.timeline.map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {i < bookingData.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{event.action}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Check-in */}
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
                    <div className="w-full h-full p-4">
                      {/* Mock QR Code Pattern */}
                      <div className="w-full h-full bg-foreground rounded-lg relative">
                        <div className="absolute inset-2 bg-background rounded-md">
                          <div className="grid grid-cols-7 grid-rows-7 gap-0.5 h-full p-2">
                            {Array.from({ length: 49 }).map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "rounded-sm",
                                  Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
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

                <p className="text-xs text-muted-foreground">
                  Show this QR code at the room to check in. Valid from {bookingData.startTime} to {bookingData.checkInDeadline}.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Copy className="h-4 w-4" />
                Copy Booking Link
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Add to Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MapPin className="h-4 w-4" />
                Get Directions
              </Button>
            </CardContent>
          </Card>

          {/* Booking Info */}
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono">#{String(bookingData.id).padStart(6, "0")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{bookingData.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in Status</span>
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-0">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
