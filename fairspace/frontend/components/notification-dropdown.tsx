"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: 1,
    type: "booking",
    title: "Booking Confirmed",
    message: "Your booking for Discussion Room A at 2:00 PM has been confirmed.",
    time: "5 min ago",
    read: false,
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  {
    id: 2,
    type: "reminder",
    title: "Booking Reminder",
    message: "Your study session starts in 30 minutes. Don't forget to check in!",
    time: "25 min ago",
    read: false,
    icon: Clock,
    iconColor: "text-warning",
  },
  {
    id: 3,
    type: "calendar",
    title: "New Booking Request",
    message: "John Doe wants to join your booking for Study Pod B.",
    time: "1 hour ago",
    read: true,
    icon: Calendar,
    iconColor: "text-primary",
  },
  {
    id: 4,
    type: "alert",
    title: "No-Show Warning",
    message: "You missed your check-in yesterday. Please check in on time.",
    time: "2 hours ago",
    read: true,
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
]

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs text-primary">
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer",
                !notification.read && "bg-primary/5"
              )}
            >
              <div className={cn("flex-shrink-0 mt-0.5", notification.iconColor)}>
                <notification.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full text-sm">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
