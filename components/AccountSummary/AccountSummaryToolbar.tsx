"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Filter, Settings, Import } from "lucide-react";

const AccountSummaryToolbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex-1 max-w-sm flex items-center gap-2">
        <div className="relative flex-1">
          <Input placeholder="Ara..." className="pl-8" />
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button variant="destructive" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtreleri Temizle
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Ayarlar
        </Button>

        <Button variant="outline" size="sm">
          <Import className="h-4 w-4 mr-2" />
          İçe Aktar
        </Button>
      </div>
    </div>
  );
};

export default AccountSummaryToolbar;
