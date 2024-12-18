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
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  toggleSidebar,
  onLogout,
}) => {
  const [username, setUsername] = React.useState<string>("User");
  const [notifications] = React.useState([
    { id: 1, message: "Yeni bir bildirim var" },
    { id: 2, message: "Önemli güncelleme mevcut" },
  ]);

  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.username) {
        setUsername(decoded.username);
      }
    }
  }, []);

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
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Bildirimler</h4>
                <p className="text-sm text-muted-foreground">
                  Son bildirimleriniz burada görüntülenir.
                </p>
              </div>
              <div className="grid gap-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center space-x-2"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">{notification.message}</span>
                  </div>
                ))}
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
