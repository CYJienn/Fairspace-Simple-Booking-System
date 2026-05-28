"use client"

import { useState } from "react"
import type { ElementType } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  DoorOpen,
  Eye,
  FileWarning,
  Filter,
  MoreHorizontal,
  Search,
  Settings,
  Shield,
  Users,
  XCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDateLabel, getRoomName } from "@/lib/booking-data"
import { useBookingStore } from "@/lib/booking-store"

const statusColors = {
  active: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
  investigating: "bg-primary/10 text-primary",
  resolved: "bg-success/10 text-success",
  dismissed: "bg-muted text-muted-foreground",
  maintenance: "bg-muted text-muted-foreground",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
}

export default function AdminPage() {
  const {
    extendedRequests,
    reports,
    users,
    rooms,
    reviewExtendedRequest,
    resolveReport,
    updateRoomStatus,
    resetDemoData,
  } = useBookingStore()
  const [searchQuery, setSearchQuery] = useState("")

  const pendingRequests = extendedRequests.filter((request) => request.status === "pending")
  const openReports = reports.filter((report) => report.status !== "resolved" && report.status !== "dismissed")
  const anonymousReports = reports.filter((report) => report.anonymous)
  const filteredUsers = users.filter((user) => {
    const haystack = `${user.name} ${user.email} ${user.faculty}`.toLowerCase()
    return haystack.includes(searchQuery.toLowerCase())
  })

  const handleResult = (action: () => { ok: boolean; message: string }) => {
    const result = action()
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success(result.message)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Review extended hiring-session requests, reports, users, and room availability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetDemoData}>
            Reset Demo
          </Button>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Access
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="Pending Requests" value={pendingRequests.length} tone="warning" />
        <StatCard icon={AlertTriangle} label="Open Reports" value={openReports.length} tone="destructive" />
        <StatCard icon={Users} label="Active Users" value={users.filter((user) => user.status === "active").length} tone="success" />
        <StatCard icon={DoorOpen} label="Active Rooms" value={rooms.filter((room) => room.status === "active").length} tone="primary" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Over 3-hour Requests</p>
              <p className="text-xl font-semibold">{pendingRequests.length}</p>
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

        <TabsContent value="requests" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Special Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {extendedRequests.length === 0 ? (
                <EmptyState icon={CheckCircle2} title="All caught up" description="No extended requests to review." />
              ) : (
                <div className="space-y-4">
                  {extendedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">{request.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium">{request.user}</p>
                          <p className="text-sm text-muted-foreground truncate">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{getRoomName(rooms, request.roomId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateLabel(request.date)} - {request.startTime} to {request.endTime} ({request.durationHours}h)
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{request.reason}</p>
                      </div>
                      <Badge variant="secondary" className={cn("border-0 capitalize", statusColors[request.status])}>
                        {request.status}
                      </Badge>
                      {request.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResult(() => reviewExtendedRequest(request.id, "rejected"))}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => handleResult(() => reviewExtendedRequest(request.id, "approved"))}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">{user.avatar}</AvatarFallback>
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
                      <span className={user.noShows > 2 ? "text-destructive font-medium" : ""}>{user.noShows}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("border-0 capitalize", statusColors[user.status])}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <MoreMenu />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

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
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRoomName(rooms, report.roomId)}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell>{formatDateLabel(report.date)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("border-0 capitalize", statusColors[report.status])}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleResult(() => resolveReport(report.id, "investigating"))}>
                          Investigate
                        </Button>
                        <Button size="sm" onClick={() => handleResult(() => resolveReport(report.id, "resolved"))}>
                          Resolve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card className="border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Room Name</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Total Bookings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="text-center">{room.capacity}</TableCell>
                    <TableCell>
                      {room.floor}, {room.building}
                    </TableCell>
                    <TableCell className="text-center">{room.bookings}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("border-0 capitalize", statusColors[room.status])}>
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleResult(() => updateRoomStatus(room.id, room.status === "active" ? "maintenance" : "active"))
                        }
                      >
                        {room.status === "active" ? "Maintain" : "Activate"}
                      </Button>
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

const statToneClasses = {
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
  primary: "bg-primary/10 text-primary",
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ElementType
  label: string
  value: number
  tone: keyof typeof statToneClasses
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", statToneClasses[tone])}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: ElementType; title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-success mx-auto mb-4" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function MoreMenu() {
  return (
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
          <Settings className="mr-2 h-4 w-4" />
          Manage Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Ban className="mr-2 h-4 w-4" />
          Suspend User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
