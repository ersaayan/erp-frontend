"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRoleDialog } from "./useRoleDialog";
import { Permission } from "./types";
import { Search, Loader2 } from "lucide-react";

const RoleDialog: React.FC = () => {
    const { isOpen, closeDialog, editingRole } = useRoleDialog();
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        roleName: "",
        description: "",
    });

    // Fetch permissions
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.BASE_URL}/permissions`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    credentials: "include",
                });

                if (!response.ok) throw new Error("Failed to fetch permissions");
                const data = await response.json();
                setPermissions(data);
            } catch (error) {
                console.error("Error fetching permissions:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch permissions",
                });
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchPermissions();
        }
    }, [isOpen, toast]);

    // Set form data when editing
    useEffect(() => {
        if (editingRole) {
            setFormData({
                roleName: editingRole.roleName,
                description: editingRole.description,
            });
            setSelectedPermissions(editingRole.permissions || []);
        } else {
            setFormData({
                roleName: "",
                description: "",
            });
            setSelectedPermissions([]);
        }
    }, [editingRole]);

    // Filter permissions based on search term
    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.route.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group permissions by their group
    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
        if (!acc[permission.group]) {
            acc[permission.group] = [];
        }
        acc[permission.group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const handleSubmit = async () => {
        try {
            if (!formData.roleName) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Role name is required",
                });
                return;
            }

            if (selectedPermissions.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "At least one permission must be selected",
                });
                return;
            }

            setLoading(true);

            const url = editingRole
                ? `${process.env.BASE_URL}/roles/${editingRole.id}`
                : `${process.env.BASE_URL}/roles`;

            const response = await fetch(url, {
                method: editingRole ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    permissions: selectedPermissions,
                }),
            });

            if (!response.ok) throw new Error("Failed to save role");

            toast({
                title: "Success",
                description: `Role ${editingRole ? "updated" : "created"} successfully`,
            });

            closeDialog();
            window.dispatchEvent(new CustomEvent("refreshRoles"));
        } catch (error) {
            console.error("Error saving role:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save role",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {editingRole ? "Rol Düzenle" : "Yeni Rol"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 flex-1 overflow-hidden">
                    <div className="grid gap-4">
                        <div>
                            <Label>Rol Adı</Label>
                            <Input
                                value={formData.roleName}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, roleName: e.target.value }))
                                }
                                placeholder="Rol adını giriniz"
                            />
                        </div>

                        <div>
                            <Label>Açıklama</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                placeholder="Rol açıklamasını giriniz"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>İzinler</Label>
                        <div className="relative">
                            <Input
                                placeholder="İzinlerde ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>

                        <ScrollArea className="h-[300px] border rounded-md p-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedPermissions).map(([group, perms]) => (
                                        <div key={group} className="space-y-2">
                                            <h4 className="font-medium text-sm">{group}</h4>
                                            <div className="ml-4 space-y-2">
                                                {perms.map((permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={permission.id}
                                                            checked={selectedPermissions.includes(permission.name)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedPermissions((prev) => [
                                                                        ...prev,
                                                                        permission.name,
                                                                    ]);
                                                                } else {
                                                                    setSelectedPermissions((prev) =>
                                                                        prev.filter((p) => p !== permission.name)
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={permission.id}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            <div>{permission.description}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {permission.route}
                                                            </div>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        <div className="text-sm text-muted-foreground">
                            {selectedPermissions.length} izin seçildi
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={closeDialog}>
                            İptal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-[#84CC16] hover:bg-[#65A30D]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingRole ? "Güncelle" : "Kaydet"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RoleDialog;
