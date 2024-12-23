"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useBrandDialog } from "./useBrandDialog";

const BrandDialog: React.FC = () => {
  const { isOpen, closeDialog, editingBrand } = useBrandDialog();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    brandName: "",
    brandCode: "",
  });

  React.useEffect(() => {
    if (editingBrand) {
      setFormData({
        brandName: editingBrand.brandName,
        brandCode: editingBrand.brandCode,
      });
    } else {
      setFormData({
        brandName: "",
        brandCode: "",
      });
    }
  }, [editingBrand]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.brandName || !formData.brandCode) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      const url = editingBrand
        ? `${process.env.BASE_URL}/brands/${editingBrand.id}`
        : `${process.env.BASE_URL}/brands`;

      const response = await fetch(url, {
        method: editingBrand ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save brand");
      }

      toast({
        title: "Success",
        description: editingBrand
          ? "Brand updated successfully"
          : "Brand created successfully",
      });

      closeDialog();
      window.dispatchEvent(new CustomEvent("refreshBrands"));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save brand",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingBrand) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/brands/${editingBrand.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete brand");
      }

      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });

      setDeleteDialogOpen(false);
      closeDialog();
      window.dispatchEvent(new CustomEvent("refreshBrands"));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete brand",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Marka Düzenle" : "Yeni Marka"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Marka Adı</Label>
              <Input
                value={formData.brandName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    brandName: e.target.value,
                  }))
                }
                placeholder="Marka adını giriniz"
              />
            </div>

            <div>
              <Label>Marka Kodu</Label>
              <Input
                value={formData.brandCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    brandCode: e.target.value,
                  }))
                }
                placeholder="Marka kodunu giriniz"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {editingBrand && (
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
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#84CC16] hover:bg-[#65A30D]"
            >
              {editingBrand ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marka Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu markayı silmek istediğinizden emin misiniz? Bu işlem geri
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

export default BrandDialog;