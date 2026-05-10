"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Users,
  Wifi,
  Monitor,
  Snowflake,
  Plug,
  PenTool,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const amenityIcons = {
  whiteboard: PenTool,
  projector: Monitor,
  aircon: Snowflake,
  charging: Plug,
  wifi: Wifi,
}

const rooms = [
  {
    id: 1,
    name: "Discussion Room A",
    description: "A spacious room perfect for group discussions and collaborative work.",
    capacity: 8,
    floor: "Level 3",
    building: "Library Block A",
    amenities: ["whiteboard", "projector", "aircon", "charging", "wifi"],
    status: "available",
    nextAvailable: null,
    image: "/rooms/room-a.jpg",
  },
  {
    id: 2,
    name: "Study Pod B",
    description: "A cozy private pod ideal for focused study sessions or small meetings.",
    capacity: 4,
    floor: "Level 2",
    building: "Learning Commons",
    amenities: ["whiteboard", "aircon", "charging", "wifi"],
    status: "occupied",
    nextAvailable: "3:00 PM",
    image: "/rooms/room-b.jpg",
  },
  {
    id: 3,
    name: "Collaboration Hub",
    description: "A large open space with flexible seating for team projects.",
    capacity: 12,
    floor: "Level 4",
    building: "Innovation Center",
    amenities: ["whiteboard", "projector", "aircon", "charging", "wifi"],
    status: "available",
    nextAvailable: null,
    image: "/rooms/room-c.jpg",
  },
  {
    id: 4,
    name: "Meeting Room 101",
    description: "Professional meeting room with video conferencing capabilities.",
    capacity: 6,
    floor: "Level 1",
    building: "Admin Building",
    amenities: ["projector", "aircon", "charging", "wifi"],
    status: "occupied",
    nextAvailable: "4:30 PM",
    image: "/rooms/room-d.jpg",
  },
  {
    id: 5,
    name: "Quiet Study Zone",
    description: "A silent individual study space for focused work.",
    capacity: 2,
    floor: "Level 5",
    building: "Library Block B",
    amenities: ["aircon", "charging", "wifi"],
    status: "available",
    nextAvailable: null,
    image: "/rooms/room-e.jpg",
  },
  {
    id: 6,
    name: "Workshop Room",
    description: "A versatile room for workshops, presentations, and training sessions.",
    capacity: 20,
    floor: "Level 2",
    building: "Learning Commons",
    amenities: ["whiteboard", "projector", "aircon", "charging", "wifi"],
    status: "maintenance",
    nextAvailable: "Tomorrow",
    image: "/rooms/room-f.jpg",
  },
]

export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [capacityFilter, setCapacityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCapacity = capacityFilter === "all" ||
      (capacityFilter === "small" && room.capacity <= 4) ||
      (capacityFilter === "medium" && room.capacity > 4 && room.capacity <= 8) ||
      (capacityFilter === "large" && room.capacity > 8)
    
    const matchesStatus = statusFilter === "all" || room.status === statusFilter

    return matchesSearch && matchesCapacity && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Study Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Browse and book available study rooms and pods.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/calendar">
            <Calendar className="mr-2 h-4 w-4" />
            Book a Room
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms or buildings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={capacityFilter} onValueChange={setCapacityFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            <SelectItem value="small">Small (1-4)</SelectItem>
            <SelectItem value="medium">Medium (5-8)</SelectItem>
            <SelectItem value="large">Large (9+)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span>{rooms.filter((r) => r.status === "available").length} Available</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-warning">
          <Clock className="h-4 w-4" />
          <span>{rooms.filter((r) => r.status === "occupied").length} Occupied</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
          <XCircle className="h-4 w-4" />
          <span>{rooms.filter((r) => r.status === "maintenance").length} Maintenance</span>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <Card
            key={room.id}
            className={cn(
              "group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
              room.status === "maintenance" && "opacity-75"
            )}
          >
            {/* Room Image */}
            <div className="relative h-40 bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Monitor className="h-16 w-16 opacity-20" />
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-20">
                <Badge
                  className={cn(
                    "border-0 shadow-lg",
                    room.status === "available"
                      ? "bg-success text-success-foreground"
                      : room.status === "occupied"
                      ? "bg-warning text-warning-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {room.status === "available" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Available
                    </>
                  ) : room.status === "occupied" ? (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Until {room.nextAvailable}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Maintenance
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5">
              <div className="space-y-4">
                {/* Room Info */}
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {room.description}
                  </p>
                </div>

                {/* Location & Capacity */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {room.floor} • {room.building}
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {room.capacity}
                  </Badge>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                    return (
                      <div
                        key={amenity}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground"
                        title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    )
                  })}
                </div>

                {/* Action */}
                <Button
                  className="w-full"
                  variant={room.status === "available" ? "default" : "outline"}
                  disabled={room.status === "maintenance"}
                  asChild={room.status !== "maintenance"}
                >
                  {room.status === "maintenance" ? (
                    <span>Under Maintenance</span>
                  ) : (
                    <Link href="/dashboard/calendar">
                      {room.status === "available" ? "Book Now" : "View Schedule"}
                    </Link>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No rooms found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No rooms match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
