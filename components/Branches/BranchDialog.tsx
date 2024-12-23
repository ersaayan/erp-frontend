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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBranchDialog } from "./useBranchDialog";
import { Company, Warehouse } from "./types";

const BranchDialog: React.FC = () => {
    const { isOpen, closeDialog, editingBranch } = useBranchDialog();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        branchName: "",
        branchCode: "",
        address: "",
        countryCode: "",
        city: "",
        district: "",
        phone: "",
        email: "",
        website: "",
        companyCode: "",
        warehouseId: "",
    });

    useEffect(() => {
        if (editingBranch) {
            setFormData({
                branchName: editingBranch.branchName,
                branchCode: editingBranch.branchCode,
                address: editingBranch.address,
                countryCode: editingBranch.countryCode,
                city: editingBranch.city,
                district: editingBranch.district,
                phone: editingBranch.phone,
                email: editingBranch.email,
                website: editingBranch.website,
                companyCode: editingBranch.companyCode,
                warehouseId: editingBranch.warehouse?.[0]?.id || "",
            });
        } else {
            setFormData({
                branchName: "",
                branchCode: "",
                address: "",
                countryCode: "",
                city: "",
                district: "",
                phone: "",
                email: "",
                website: "",
                companyCode: "",
                warehouseId: "",
            });
        }
    }, [editingBranch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [companiesResponse, warehousesResponse] = await Promise.all([
                    fetch(`${process.env.BASE_URL}/companies`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                        },
                        credentials: "include",
                    }),
                    fetch(`${process.env.BASE_URL}/warehouses`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                        },
                        credentials: "include",
                    }),
                ]);

                if (!companiesResponse.ok || !warehousesResponse.ok) {
                    throw new Error("Failed to fetch data");
                }

                const [companiesData, warehousesData] = await Promise.all([
                    companiesResponse.json(),
                    warehousesResponse.json(),
                ]);

                setCompanies(companiesData);
                setWarehouses(warehousesData);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "An error occurred while fetching data"
                );
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (!formData.branchName || !formData.branchCode || !formData.companyCode) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please fill in all required fields",
                });
                return;
            }

            const url = editingBranch
                ? `${process.env.BASE_URL}/branches/${editingBranch.id}`
                : `${process.env.BASE_URL}/branches`;

            const response = await fetch(url, {
                method: editingBranch ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(
                    editingBranch ? "Failed to update branch" : "Failed to create branch"
                );
            }

            toast({
                title: "Success",
                description: `Branch ${editingBranch ? "updated" : "created"
                    } successfully`,
            });
            closeDialog();

            // Trigger a refresh of the branches list
            const refreshEvent = new CustomEvent("refreshBranches");
            window.dispatchEvent(refreshEvent);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "An error occurred",
            });
        }
    };

    const handleDelete = async () => {
        if (!editingBranch) return;

        try {
            const response = await fetch(
                `${process.env.BASE_URL}/branches/${editingBranch.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete branch");
            }

            toast({
                title: "Success",
                description: "Branch deleted successfully",
            });
            setDeleteDialogOpen(false);
            closeDialog();

            // Trigger a refresh of the branches list
            const refreshEvent = new CustomEvent("refreshBranches");
            window.dispatchEvent(refreshEvent);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description:
                    err instanceof Error ? err.message : "Failed to delete branch",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] w-[90vw]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBranch ? "Şube Düzenle" : "Yeni Şube"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div>
                            <Label>Firma</Label>
                            <Select
                                name="companyCode"
                                value={formData.companyCode}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, companyCode: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Firma seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.companyCode}>
                                            {company.companyName} ({company.companyCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Depo</Label>
                            <Select
                                name="warehouseId"
                                value={formData.warehouseId}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, warehouseId: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Depo seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.warehouseName} ({warehouse.warehouseCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Şube Adı</Label>
                                <Input
                                    name="branchName"
                                    value={formData.branchName}
                                    onChange={handleInputChange}
                                    placeholder="Şube adını giriniz"
                                />
                            </div>
                            <div>
                                <Label>Şube Kodu</Label>
                                <Input
                                    name="branchCode"
                                    value={formData.branchCode}
                                    onChange={handleInputChange}
                                    placeholder="Şube kodunu giriniz"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Adres</Label>
                            <Input
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Adresi giriniz"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Ülke Kodu</Label>
                                <Input
                                    name="countryCode"
                                    value={formData.countryCode}
                                    onChange={handleInputChange}
                                    placeholder="TR"
                                />
                            </div>
                            <div>
                                <Label>Şehir</Label>
                                <Input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Şehir giriniz"
                                />
                            </div>
                            <div>
                                <Label>İlçe</Label>
                                <Input
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    placeholder="İlçe giriniz"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Telefon</Label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Telefon giriniz"
                                />
                            </div>
                            <div>
                                <Label>E-posta</Label>
                                <Input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="E-posta giriniz"
                                    type="email"
                                />
                            </div>
                            <div>
                                <Label>Website</Label>
                                <Input
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder="Website giriniz"
                                    type="url"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        {editingBranch && (
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Sil
                            </Button>
                        )}
                        <Button variant="outline" onClick={closeDialog}>
                            İptal
                        </Button>
                        <Button
                            className="bg-[#84CC16] hover:bg-[#65A30D]"
                            onClick={handleSubmit}
                        >
                            {editingBranch ? "Güncelle" : "Kaydet"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Şube Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu şubeyi silmek istediğinizden emin misiniz? Bu işlem geri
                            alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default BranchDialog;