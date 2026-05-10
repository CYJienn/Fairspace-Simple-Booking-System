"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  MoreHorizontal,
  Users,
  FileWarning,
  DoorOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Shield,
  UserCheck,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const pendingRequests = [
  {
    id: 1,
    user: "Alex Kim",
    email: "alex@university.edu",
    avatar: "AK",
    room: "Collaboration Hub",
    date: "May 12, 2026",
    time: "9:00 AM - 12:00 PM",
    duration: "3 hours",
    durationHours: 3,
    reason: "Faculty workshop with 15 participants",
    status: "pending",
  },
  {
    id: 2,
    user: "Maria Garcia",
    email: "maria@university.edu",
    avatar: "MG",
    room: "Meeting Room 101",
    date: "May 15, 2026",
    time: "2:00 PM - 6:00 PM",
    duration: "4 hours",
    durationHours: 4,
    reason: "Student organization planning meeting",
    status: "pending",
  },
]

const users = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@university.edu",
    avatar: "SC",
    role: "Student",
    faculty: "Computing",
    bookings: 24,
    noShows: 0,
    status: "active",
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@university.edu",
    avatar: "JD",
    role: "Student",
    faculty: "Engineering",
    bookings: 18,
    noShows: 2,
    status: "active",
  },
  {
    id: 3,
    name: "Emily Wang",
    email: "emily@university.edu",
    avatar: "EW",
    role: "Student",
    faculty: "Science",
    bookings: 12,
    noShows: 1,
    status: "active",
  },
  {
    id: 4,
    name: "Mike Johnson",
    email: "mike@university.edu",
    avatar: "MJ",
    role: "Student",
    faculty: "Business",
    bookings: 8,
    noShows: 4,
    status: "warning",
  },
  {
    id: 5,
    name: "Lisa Brown",
    email: "lisa@university.edu",
    avatar: "LB",
    role: "Student",
    faculty: "Arts",
    bookings: 3,
    noShows: 3,
    status: "suspended",
  },
]

const reports = [
  {
    id: 1,
    type: "Noise",
    room: "Discussion Room A",
    reporter: "Anonymous",
    date: "May 9, 2026",
    description: "Loud music and conversation disrupting nearby study areas.",
    status: "resolved",
    anonymous: true,
  },
  {
    id: 2,
    type: "Overcrowding",
    room: "Study Pod B",
    reporter: "John Doe",
    date: "May 8, 2026",
    description: "10 people in a 4-person pod, blocking the hallway.",
    status: "investigating",
    anonymous: false,
  },
  {
    id: 3,
    type: "Unauthorized",
    room: "Collaboration Hub",
    reporter: "Sarah Chen",
    date: "May 7, 2026",
    description: "Group using room without any booking during peak hours.",
    status: "pending",
    anonymous: false,
  },
]

const rooms = [
  { id: 1, name: "Discussion Room A", capacity: 8, floor: "Level 3", status: "active", bookings: 245 },
  { id: 2, name: "Study Pod B", capacity: 4, floor: "Level 2", status: "active", bookings: 198 },
  { id: 3, name: "Collaboration Hub", capacity: 12, floor: "Level 4", status: "active", bookings: 156 },
  { id: 4, name: "Meeting Room 101", capacity: 6, floor: "Level 1", status: "active", bookings: 134 },
  { id: 5, name: "Quiet Study Zone", capacity: 2, floor: "Level 5", status: "active", bookings: 98 },
  { id: 6, name: "Workshop Room", capacity: 20, floor: "Level 2", status: "maintenance", bookings: 0 },
]

const statusColors = {
  active: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
  investigating: "bg-primary/10 text-primary",
  resolved: "bg-success/10 text-success",
  maintenance: "bg-muted text-muted-foreground",
}

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const overLimitRequests = pendingRequests.filter((request) => request.durationHours > 3)
  const anonymousReports = reports.filter((report) => report.anonymous)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Review anonymous reports and special booking requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Access
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Over 3-hour Requests</p>
              <p className="text-xl font-semibold">{overLimitRequests.length}</p>
            </div>
            <Badge variant="secondary" className="bg-warning/10 text-warning border-0">
              Pending Review
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Anonymous Reports</p>
              <p className="text-xl font-semibold">{anonymousReports.length}</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
              Open
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.filter(r => r.status !== "resolved").length}</p>
                <p className="text-sm text-muted-foreground">Open Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <DoorOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rooms.filter(r => r.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Active Rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests" className="gap-2">
            <Clock className="h-4 w-4" />
            Requests
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center bg-warning text-warning-foreground">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileWarning className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <DoorOpen className="h-4 w-4" />
            Rooms
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="requests" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Special Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending requests to review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {request.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium">{request.user}</p>
                          <p className="text-sm text-muted-foreground truncate">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{request.room}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.date} • {request.time} ({request.duration})
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{request.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead className="text-center">Bookings</TableHead>
                  <TableHead className="text-center">No-Shows</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.faculty}</TableCell>
                    <TableCell className="text-center">{user.bookings}</TableCell>
                    <TableCell className="text-center">
                      <span className={user.noShows > 2 ? "text-destructive font-medium" : ""}>
                        {user.noShows}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("border-0 capitalize", statusColors[user.status as keyof typeof statusColors])}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCheck className="mr-2 h-4 w-4" />
                            View Bookings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status !== "suspended" ? (
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-success focus:text-success">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Reactivate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Type</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>{report.room}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("border-0 capitalize", statusColors[report.status as keyof typeof statusColors])}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Dismiss
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Rooms */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <DoorOpen className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
          <Card className="border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Room Name</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Total Bookings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="text-center">{room.capacity}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell className="text-center">{room.bookings}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("border-0 capitalize", statusColors[room.status as keyof typeof statusColors])}
                      >
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Room
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Amenities
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
