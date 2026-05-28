"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle, Bell, Calendar, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBookingStore } from "@/lib/booking-store"

const iconConfig = {
  booking: { icon: CheckCircle2, color: "text-success" },
  reminder: { icon: Clock, color: "text-warning" },
  calendar: { icon: Calendar, color: "text-primary" },
  alert: { icon: AlertTriangle, color: "text-destructive" },
}

export function NotificationDropdown() {
  const { notifications, markAllNotificationsRead } = useBookingStore()
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <DropdownMenu>
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
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-primary"
              onClick={markAllNotificationsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = iconConfig[notification.kind].icon
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors",
                  !notification.read && "bg-primary/5",
                )}
              >
                <div className={cn("flex-shrink-0 mt-0.5", iconConfig[notification.kind].color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium", !notification.read && "text-foreground")}>
                      {notification.title}
                    </p>
                    {!notification.read && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
                </div>
              </div>
            )
          })}
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
