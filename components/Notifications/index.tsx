import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Eye,
  Loader2,
  CheckCheck,
  Filter,
} from "lucide-react";
import type { Notification, NotificationSeverity } from "./types";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        showUnreadOnly ? "/api/notifications/unread" : "/api/notifications"
      );
      if (!response.ok) {
        throw new Error("Bildirimler alınırken bir hata oluştu");
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length === 0) {
        toast({
          title: "Bilgi",
          description: "Okunmamış bildirim bulunmamaktadır.",
        });
        return;
      }

      const response = await fetch(`/api/notifications/mark-as-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: unreadNotifications.map((n) => n.id) }),
      });

      if (!response.ok) {
        throw new Error(
          "Bildirimler okundu olarak işaretlenirken bir hata oluştu"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        }))
      );

      toast({
        title: "Başarılı",
        description: "Tüm bildirimler okundu olarak işaretlendi",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/mark-as-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(
          "Bildirim okundu olarak işaretlenirken bir hata oluştu"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );

      toast({
        title: "Başarılı",
        description: "Bildirim okundu olarak işaretlendi",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    }
  };

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "ERROR":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "SUCCESS":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: NotificationSeverity) => {
    const variants = {
      WARNING: "secondary",
      ERROR: "destructive",
      SUCCESS: "default",
      INFO: "outline",
    } as const;

    return (
      <Badge variant={variants[severity]} className="ml-2">
        {severity === "WARNING"
          ? "Uyarı"
          : severity === "ERROR"
          ? "Hata"
          : severity === "SUCCESS"
          ? "Başarılı"
          : "Bilgi"}
      </Badge>
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, [showUnreadOnly]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Bildirimler</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showUnreadOnly
              ? "Tüm Bildirimleri Göster"
              : "Sadece Okunmayanları Göster"}
          </Button>
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={loading || notifications.every((n) => n.read)}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Tümünü Okundu İşaretle
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirimler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Bildirim bulunmamaktadır.
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="flex flex-col gap-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={notification.read ? "bg-muted" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getSeverityIcon(notification.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">
                                {notification.title}
                                {getSeverityBadge(notification.severity)}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>
                              Oluşturulma:{" "}
                              {format(
                                new Date(notification.createdAt),
                                "d MMMM yyyy HH:mm",
                                { locale: tr }
                              )}
                            </span>
                            {notification.read && (
                              <>
                                <span>•</span>
                                <span>
                                  Okunma:{" "}
                                  {format(
                                    new Date(notification.readAt!),
                                    "d MMMM yyyy HH:mm",
                                    { locale: tr }
                                  )}
                                </span>
                                <span>•</span>
                                <span>Okuyan: {notification.readBy}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
