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
import { useWarehouseDialog } from "./useWarehouseDialog";
import { Company } from "./types";

const WarehouseDialog: React.FC = () => {
  const { isOpen, closeDialog, editingWarehouse } = useWarehouseDialog();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    warehouseName: "",
    warehouseCode: "",
    address: "",
    countryCode: "",
    city: "",
    district: "",
    phone: "",
    email: "",
    companyCode: "",
  });

  useEffect(() => {
    if (editingWarehouse) {
      setFormData({
        warehouseName: editingWarehouse.warehouseName,
        warehouseCode: editingWarehouse.warehouseCode,
        address: editingWarehouse.address,
        countryCode: editingWarehouse.countryCode,
        city: editingWarehouse.city,
        district: editingWarehouse.district,
        phone: editingWarehouse.phone,
        email: editingWarehouse.email,
        companyCode: editingWarehouse.companyCode,
      });
    } else {
      setFormData({
        warehouseName: "",
        warehouseCode: "",
        address: "",
        countryCode: "",
        city: "",
        district: "",
        phone: "",
        email: "",
        companyCode: "",
      });
    }
  }, [editingWarehouse]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.BASE_URL}/companies`);
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        setCompanies(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching companies"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCompanies();
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
      if (
        !formData.warehouseName ||
        !formData.warehouseCode ||
        !formData.companyCode
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      const url = editingWarehouse
        ? `${process.env.BASE_URL}/warehouses/${editingWarehouse.id}`
        : `${process.env.BASE_URL}/warehouses`;

      const response = await fetch(url, {
        method: editingWarehouse ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          editingWarehouse
            ? "Failed to update warehouse"
            : "Failed to create warehouse"
        );
      }

      toast({
        title: "Success",
        description: `Warehouse ${
          editingWarehouse ? "updated" : "created"
        } successfully`,
      });
      closeDialog();

      // Trigger a refresh of the warehouses list
      const refreshEvent = new CustomEvent("refreshWarehouses");
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
    if (!editingWarehouse) return;

    try {
      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/${editingWarehouse.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete warehouse");
      }

      toast({
        title: "Success",
        description: "Warehouse deleted successfully",
      });
      setDeleteDialogOpen(false);
      closeDialog();

      // Trigger a refresh of the warehouses list
      const refreshEvent = new CustomEvent("refreshWarehouses");
      window.dispatchEvent(refreshEvent);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete warehouse",
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? "Depo Düzenle" : "Yeni Depo"}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Depo Adı</Label>
                <Input
                  name="warehouseName"
                  value={formData.warehouseName}
                  onChange={handleInputChange}
                  placeholder="Depo adını giriniz"
                />
              </div>
              <div>
                <Label>Depo Kodu</Label>
                <Input
                  name="warehouseCode"
                  value={formData.warehouseCode}
                  onChange={handleInputChange}
                  placeholder="Depo kodunu giriniz"
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {editingWarehouse && (
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
              {editingWarehouse ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Depo Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu depoyu silmek istediğinizden emin misiniz? Bu işlem geri
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

export default WarehouseDialog;
