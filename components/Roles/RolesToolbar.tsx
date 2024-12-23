// components/Roles/RolesToolbar.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useRoleDialog } from "./useRoleDialog";
import { useToast } from "@/hooks/use-toast";

const RolesToolbar: React.FC = () => {
    const { openDialog } = useRoleDialog();
    const { toast } = useToast();

    const handleRefresh = () => {
        window.dispatchEvent(new CustomEvent("refreshRoles"));
        toast({
            title: "Success",
            description: "Roles refreshed successfully",
        });
    };

    return (
        <div className="flex justify-end items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
            </Button>

            <Button
                variant="default"
                size="sm"
                className="bg-[#84CC16] hover:bg-[#65A30D]"
                onClick={() => openDialog()}
            >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Rol
            </Button>
        </div>
    );
};

export default RolesToolbar;
