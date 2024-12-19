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
      return localStorage.getItem("sidebarCollapsed") === "true";
    }
    return false;
  });

  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedTabs = localStorage.getItem("openTabs");
      return savedTabs ? JSON.parse(savedTabs) : [];
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const savedActiveTab = localStorage.getItem("activeTab");
      return savedActiveTab || null;
    }
    return null;
  });

  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuthService();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    localStorage.setItem("sidebarCollapsed", (!isSidebarCollapsed).toString());
  };

  const handleMenuItemClick = (itemName: string) => {
    if (!openTabs.includes(itemName)) {
      const newTabs = [...openTabs, itemName];
      setOpenTabs(newTabs);
      localStorage.setItem("openTabs", JSON.stringify(newTabs));
    }
    setActiveTab(itemName);
    localStorage.setItem("activeTab", itemName);
  };

  const handleCloseTab = (tabName: string) => {
    const newOpenTabs = openTabs.filter((tab) => tab !== tabName);
    setOpenTabs(newOpenTabs);
    localStorage.setItem("openTabs", JSON.stringify(newOpenTabs));

    if (activeTab === tabName) {
      const newActiveTab = newOpenTabs[newOpenTabs.length - 1] || null;
      setActiveTab(newActiveTab);
      localStorage.setItem("activeTab", newActiveTab || "");
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
