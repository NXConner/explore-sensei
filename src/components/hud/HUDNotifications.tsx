import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface HUDNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // ms, 0 = no auto dismiss
}

interface HUDNotificationsProps {
  className?: string;
}

const notifications: HUDNotification[] = [];
const subscribers = new Set<(notifications: HUDNotification[]) => void>();

export const addHUDNotification = (notification: Omit<HUDNotification, "id">) => {
  const id = `hud-notif-${Date.now()}-${Math.random()}`;
  const newNotif: HUDNotification = { id, duration: 5000, ...notification };
  notifications.push(newNotif);
  subscribers.forEach((cb) => cb([...notifications]));

  if (newNotif.duration && newNotif.duration > 0) {
    setTimeout(() => {
      removeHUDNotification(id);
    }, newNotif.duration);
  }
};

export const removeHUDNotification = (id: string) => {
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notifications.splice(idx, 1);
    subscribers.forEach((cb) => cb([...notifications]));
  }
};

export const HUDNotifications: React.FC<HUDNotificationsProps> = ({ className }) => {
  const [notifs, setNotifs] = useState<HUDNotification[]>([]);

  useEffect(() => {
    const cb = (updated: HUDNotification[]) => setNotifs(updated);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  if (notifs.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-24 right-4 z-[999] flex flex-col gap-2 pointer-events-none",
        className
      )}
    >
      {notifs.map((notif) => (
        <NotificationCard key={notif.id} notification={notif} />
      ))}
    </div>
  );
};

const NotificationCard: React.FC<{ notification: HUDNotification }> = ({ notification }) => {
  const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
  };
  const Icon = iconMap[notification.type];

  const colorMap = {
    info: "border-primary/60 bg-background/95",
    success: "border-success/60 bg-success/10",
    warning: "border-yellow-500/60 bg-yellow-500/10",
    error: "border-destructive/60 bg-destructive/10",
  };

  return (
    <div
      className={cn(
        "hud-element pointer-events-auto animate-notification-slide",
        "min-w-[280px] max-w-[360px] p-3 flex items-start gap-3",
        "backdrop-blur-md transition-all",
        colorMap[notification.type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm uppercase tracking-wide">{notification.title}</div>
        <div className="text-xs text-muted-foreground mt-1">{notification.message}</div>
      </div>
      <button
        onClick={() => removeHUDNotification(notification.id)}
        className="flex-shrink-0 hover:text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
