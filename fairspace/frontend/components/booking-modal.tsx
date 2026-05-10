"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Users,
  DoorOpen,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const rooms = [
  { id: "room-a", name: "Discussion Room A", capacity: 8 },
  { id: "room-b", name: "Study Pod B", capacity: 4 },
  { id: "room-c", name: "Collaboration Hub", capacity: 12 },
  { id: "room-d", name: "Meeting Room 101", capacity: 6 },
  { id: "room-e", name: "Quiet Study Zone", capacity: 2 },
]

const timeOptions = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM",
]

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours (max)" },
]

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate?: Date
  selectedTime?: string
}

export function BookingModal({
  open,
  onOpenChange,
  selectedDate,
  selectedTime,
}: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    room: "",
    startTime: selectedTime || "",
    duration: "60",
    purpose: "",
    participants: [] as string[],
  })
  const [participantInput, setParticipantInput] = useState("")

  const handleAddParticipant = () => {
    if (participantInput.trim() && !formData.participants.includes(participantInput.trim())) {
      setFormData({
        ...formData,
        participants: [...formData.participants, participantInput.trim()],
      })
      setParticipantInput("")
    }
  }

  const handleRemoveParticipant = (email: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p !== email),
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    // Simulate booking creation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    onOpenChange(false)
    // Reset form
    setFormData({
      room: "",
      startTime: "",
      duration: "60",
      purpose: "",
      participants: [],
    })
  }

  const selectedRoom = rooms.find((r) => r.id === formData.room)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Booking</DialogTitle>
          <DialogDescription>
            Book a study room for your session. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Display */}
          {selectedDate && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">Selected date</p>
              </div>
            </div>
          )}

          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <Select
              value={formData.room}
              onValueChange={(value) => setFormData({ ...formData, room: value })}
            >
              <SelectTrigger id="room" className="h-11">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{room.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {room.capacity} seats
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoom && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Capacity: {selectedRoom.capacity} people
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => setFormData({ ...formData, startTime: value })}
              >
                <SelectTrigger id="startTime" className="h-11">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger id="duration" className="h-11">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rules Info */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-primary">Booking Rules</p>
              <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                <li>• Maximum booking duration: 2 hours</li>
                <li>• 30-minute interval slots only</li>
                <li>• Check-in required within 15 minutes</li>
              </ul>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (Optional)</Label>
            <Textarea
              id="purpose"
              placeholder="Describe the purpose of your booking..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={3}
            />
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label>Add Participants (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddParticipant()
                  }
                }}
                className="h-10"
              />
              <Button type="button" variant="secondary" onClick={handleAddParticipant}>
                Add
              </Button>
            </div>

            {formData.participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.participants.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 gap-1 bg-muted"
                  >
                    <span className="text-xs">{email}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 bg-warning/10 text-warning border-warning/30"
                    >
                      pending
                    </Badge>
                    <button
                      onClick={() => handleRemoveParticipant(email)}
                      className="ml-1 hover:bg-destructive/20 rounded p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.room || !formData.startTime || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
