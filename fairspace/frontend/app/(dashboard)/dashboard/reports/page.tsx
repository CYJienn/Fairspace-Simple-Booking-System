"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Users,
  Volume2,
  Ban,
  FileWarning,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const reportTypes = [
  { id: "overcrowding", label: "Overcrowding", icon: Users, description: "More people than allowed capacity" },
  { id: "unauthorized", label: "Unauthorized Usage", icon: Ban, description: "Room used without booking" },
  { id: "noise", label: "Excessive Noise", icon: Volume2, description: "Noise disturbance affecting others" },
  { id: "misuse", label: "Room Misuse", icon: FileWarning, description: "Improper use of room facilities" },
]

const rooms = [
  { id: "room-a", name: "Discussion Room A" },
  { id: "room-b", name: "Study Pod B" },
  { id: "room-c", name: "Collaboration Hub" },
  { id: "room-d", name: "Meeting Room 101" },
  { id: "room-e", name: "Quiet Study Zone" },
]

const recentReports = [
  {
    id: 1,
    type: "noise",
    room: "Discussion Room A",
    description: "Loud music and conversation disrupting nearby study areas.",
    status: "resolved",
    date: "May 9, 2026",
    anonymous: false,
  },
  {
    id: 2,
    type: "overcrowding",
    room: "Study Pod B",
    description: "10 people in a 4-person pod, blocking the hallway.",
    status: "investigating",
    date: "May 8, 2026",
    anonymous: true,
  },
  {
    id: 3,
    type: "unauthorized",
    room: "Collaboration Hub",
    description: "Group using room without any booking during peak hours.",
    status: "pending",
    date: "May 7, 2026",
    anonymous: false,
  },
  {
    id: 4,
    type: "misuse",
    room: "Meeting Room 101",
    description: "Equipment left damaged after use, projector not working.",
    status: "resolved",
    date: "May 5, 2026",
    anonymous: true,
  },
]

const statusConfig = {
  pending: { label: "Pending Review", color: "bg-warning/10 text-warning", icon: Clock },
  investigating: { label: "Investigating", color: "bg-primary/10 text-primary", icon: Eye },
  resolved: { label: "Resolved", color: "bg-success/10 text-success", icon: CheckCircle2 },
  dismissed: { label: "Dismissed", color: "bg-muted text-muted-foreground", icon: XCircle },
}

export default function ReportsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    room: "",
    description: "",
    anonymous: false,
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsDialogOpen(false)
    setFormData({ type: "", room: "", description: "", anonymous: false })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Report Misuse</h1>
          <p className="text-muted-foreground mt-1">
            Help us maintain a fair and respectful environment for everyone.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit a Report</DialogTitle>
              <DialogDescription>
                Report any misuse or issues with study rooms. Your feedback helps maintain a fair environment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Report Type */}
              <div className="space-y-3">
                <Label>Report Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        formData.type === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <type.icon className={cn(
                        "h-6 w-6",
                        formData.type === type.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => setFormData({ ...formData, room: value })}
                >
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about the incident..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous" className="cursor-pointer">Submit Anonymously</Label>
                  <p className="text-xs text-muted-foreground">
                    Your identity will not be shared with anyone.
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.type || !formData.room || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report Types Quick Access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((type) => (
          <Card
            key={type.id}
            className="border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
            onClick={() => {
              setFormData({ ...formData, type: type.id })
              setIsDialogOpen(true)
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <type.icon className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Your Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                You haven&apos;t submitted any reports. Help us maintain a fair environment by reporting any issues.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Submit a Report
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => {
                const type = reportTypes.find((t) => t.id === report.type)
                const status = statusConfig[report.status as keyof typeof statusConfig]
                return (
                  <div
                    key={report.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 flex-shrink-0">
                      {type && <type.icon className="h-5 w-5 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{type?.label}</h4>
                            <span className="text-sm text-muted-foreground">• {report.room}</span>
                            {report.anonymous && (
                              <Badge variant="outline" className="text-xs">Anonymous</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {report.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className={cn("flex-shrink-0 gap-1 border-0", status.color)}>
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{report.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
