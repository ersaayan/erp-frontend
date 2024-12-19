import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TabContainer from "@/components/TabContainer";
import { useToast } from "@/hooks/use-toast";
import { useAuthService } from "@/lib/services/auth";
import { MainHeader } from "./MainHeader";
import { MainTabs } from "./MainTabs";

export default function MainContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const sidebarState = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sidebarCollapsed="));
      return sidebarState ? sidebarState.split("=")[1] === "true" : false;
    }
    return false;
  });

  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedTabs = document.cookie
        .split("; ")
        .find((row) => row.startsWith("openTabs="));
      const tabsValue = savedTabs ? savedTabs.split("=")[1] : "";
      return tabsValue ? JSON.parse(decodeURIComponent(tabsValue)) : [];
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const savedActiveTab = document.cookie
        .split("; ")
        .find((row) => row.startsWith("activeTab="));
      const activeTabValue = savedActiveTab
        ? savedActiveTab.split("=")[1]
        : null;
      return activeTabValue ? decodeURIComponent(activeTabValue) : null;
    }
    return null;
  });

  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuthService();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    document.cookie = `sidebarCollapsed=${!isSidebarCollapsed}; path=/; max-age=31536000`;
  };

  const handleMenuItemClick = (itemName: string) => {
    if (!openTabs.includes(itemName)) {
      const newTabs = [...openTabs, itemName];
      setOpenTabs(newTabs);
      document.cookie = `openTabs=${encodeURIComponent(
        JSON.stringify(newTabs)
      )}; path=/; max-age=31536000`;
    }
    setActiveTab(itemName);
    document.cookie = `activeTab=${encodeURIComponent(
      itemName
    )}; path=/; max-age=31536000`;
  };

  const handleCloseTab = (tabName: string) => {
    const newOpenTabs = openTabs.filter((tab) => tab !== tabName);
    setOpenTabs(newOpenTabs);
    document.cookie = `openTabs=${encodeURIComponent(
      JSON.stringify(newOpenTabs)
    )}; path=/; max-age=31536000`;

    if (activeTab === tabName) {
      const newActiveTab = newOpenTabs[newOpenTabs.length - 1] || null;
      setActiveTab(newActiveTab);
      document.cookie = `activeTab=${encodeURIComponent(
        newActiveTab || ""
      )}; path=/; max-age=31536000`;
    }
  };

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Başarılı",
        description: "Çıkış yapıldı",
      });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
      });
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar-bg">
      <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onMenuItemClick={handleMenuItemClick}
        />
      </div>

      <div className="main-content">
        <MainHeader
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />

        <main className="overflow-auto bg-background p-4">
          <TabContainer
            tabs={openTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCloseTab={handleCloseTab}
            sidebarCollapsed={isSidebarCollapsed}
          >
            <MainTabs
              activeTab={activeTab}
              onMenuItemClick={handleMenuItemClick}
            />
          </TabContainer>
        </main>
      </div>
    </div>
  );
}
