// components/Roles/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import RolesGrid from "./RolesGrid";
import RoleDialog from "./RoleDialog";
import RolesToolbar from "./RolesToolbar";
import { useRoleDialog } from "./RoleDialog/useRoleDialog";
import { Role } from "./types";

const Roles: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isOpen } = useRoleDialog();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BASE_URL}/roles`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch roles");
            }

            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();

        const handleRefresh = () => {
            fetchRoles();
        };

        window.addEventListener("refreshRoles", handleRefresh);
        return () => {
            window.removeEventListener("refreshRoles", handleRefresh);
        };
    }, []);

    return (
        <div className="grid-container">
            <Card className="p-6">
                <RolesToolbar />
                <RolesGrid roles={roles} loading={loading} />
                <RoleDialog />
            </Card>
        </div>
    );
};

export default Roles;
