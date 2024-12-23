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
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/hooks/use-toast";
import { usePriceListDialog } from "./usePriceListDialog";

const currencies = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

const PriceListDialog: React.FC = () => {
  const { isOpen, closeDialog, editingPriceList } = usePriceListDialog();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    priceListName: "",
    currency: "TRY",
    isVatIncluded: false,
    isActive: true,
  });

  React.useEffect(() => {
    if (editingPriceList) {
      setFormData({
        priceListName: editingPriceList.priceListName,
        currency: editingPriceList.currency,
        isVatIncluded: editingPriceList.isVatIncluded,
        isActive: editingPriceList.isActive,
      });
    } else {
      setFormData({
        priceListName: "",
        currency: "TRY",
        isVatIncluded: false,
        isActive: true,
      });
    }
  }, [editingPriceList]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.priceListName || !formData.currency) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      const url = editingPriceList
        ? `${process.env.BASE_URL}/priceLists/${editingPriceList.id}`
        : `${process.env.BASE_URL}/priceLists`;

      const response = await fetch(url, {
        method: editingPriceList ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save price list");
      }

      toast({
        title: "Success",
        description: editingPriceList
          ? "Price list updated successfully"
          : "Price list created successfully",
      });

      closeDialog();
      window.dispatchEvent(new CustomEvent("refreshPriceLists"));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save price list",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingPriceList) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/priceLists/${editingPriceList.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete price list");
      }

      toast({
        title: "Success",
        description: "Price list deleted successfully",
      });

      setDeleteDialogOpen(false);
      closeDialog();
      window.dispatchEvent(new CustomEvent("refreshPriceLists"));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete price list",
      });
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
              {editingPriceList ? "Fiyat Listesi Düzenle" : "Yeni Fiyat Listesi"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Fiyat Listesi Adı</Label>
              <Input
                value={formData.priceListName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priceListName: e.target.value,
                  }))
                }
                placeholder="Fiyat listesi adını giriniz"
              />
            </div>

            <div>
              <Label>Para Birimi</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Para birimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>KDV Dahil</Label>
              <Switch
                checked={formData.isVatIncluded}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isVatIncluded: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Aktif</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {editingPriceList && (
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
              {editingPriceList ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fiyat Listesi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu fiyat listesini silmek istediğinizden emin misiniz? Bu işlem geri
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

export default PriceListDialog;