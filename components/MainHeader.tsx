"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, ChevronDown, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import ExchangeRateDisplay from "@/components/ExchangeRateDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { decodeJWT } from "@/lib/utils/jwt";

interface MainHeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
  onMenuItemClick: (itemName: string) => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  toggleSidebar,
  onLogout,
  onMenuItemClick,
}) => {
  const [username, setUsername] = React.useState<string>("User");
  const [unreadNotifications, setUnreadNotifications] =
    React.useState<number>(0);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/unread");
      if (!response.ok) {
        throw new Error("Bildirimler alınamadı");
      }
      const data = await response.json();
      setUnreadNotifications(data.length);
    } catch (error) {
      console.error("Bildirimler alınırken hata oluştu:", error);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.username) {
        setUsername(decoded.username);
      }
    }

    // İlk yüklemede bildirimleri getir
    fetchUnreadNotifications();

    // Her 30 saniyede bir bildirimleri güncelle
    const interval = setInterval(fetchUnreadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationsClick = () => {
    // Navigate to Notifications page
    onMenuItemClick?.("Bildirimler");
  };

  return (
    <header className="bg-sidebar-bg text-sidebar-text p-2 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2 text-sidebar-text hover:bg-sidebar-hover"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <ExchangeRateDisplay />
        <ThemeToggle />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-text hover:bg-sidebar-hover relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Bildirimler</h4>
                {unreadNotifications > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      {unreadNotifications} adet okunmamış bildiriminiz var.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleNotificationsClick}
                    >
                      Bildirimleri Görüntüle
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Okunmamış bildiriminiz bulunmamaktadır.
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sidebar-text hover:bg-sidebar-hover border border-sidebar-text"
              >
                <span className="mr-2">{username}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
