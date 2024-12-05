"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrents } from "./hooks/useCurrents";
import { useBrands } from "./hooks/useBrands";
import { useStockForm } from "./hooks/useStockForm";
import { Manufacturer } from "./types"; // Import Manufacturer interface
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import Dialog components

interface StockManufacturersProps {
  manufacturers: Manufacturer[];
  setManufacturers: React.Dispatch<React.SetStateAction<Manufacturer[]>>;
}

const StockManufacturers: React.FC<StockManufacturersProps> = ({
  manufacturers,
  setManufacturers,
}) => {
  const {
    currents,
    loading: currentsLoading,
    error: currentsError,
  } = useCurrents();
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const { formState, updateManufacturers } = useStockForm();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manufacturerToDelete, setManufacturerToDelete] =
    useState<Manufacturer | null>(null);

  useEffect(() => {
    // Initialize manufacturers from formState if available
    if (formState.manufacturers.length > 0) {
      setManufacturers(
        formState.manufacturers.map((m, index) => ({
          id: m.id?.toString() || "", // Ensure 'id' is a number
          currentId: m.currentId,
          stockName: m.productName,
          code: m.productCode,
          barcode: m.barcode,
          brandId: m.brandId,
          brandName: "", // Add brandName
          brandCode: "", // Add brandCode
        }))
      );
    }
  }, [formState.manufacturers]);

  const addManufacturer = () => {
    const newManufacturer: Manufacturer = {
      id: Date.now().toString(), // Convert 'id' to string
      brandName: "", // Added 'brandName'
      brandCode: "", // Added 'brandCode'
      currentId: "",
      stockName: "",
      code: "",
      barcode: "",
      brandId: "",
    };
    const updatedManufacturers = [...manufacturers, newManufacturer];
    setManufacturers(updatedManufacturers);
    updateFormState(updatedManufacturers);
  };

  const confirmDeleteManufacturer = (manufacturer: Manufacturer) => {
    setManufacturerToDelete(manufacturer);
    setDeleteDialogOpen(true);
  };

  const deleteManufacturer = async () => {
    if (!manufacturerToDelete) return;

    if (formState.isUpdateMode) {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/manufacturers/${manufacturerToDelete.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Error deleting manufacturer");
        }
      } catch (error) {
        console.error("Error deleting manufacturer:", error);
        return;
      }
    }

    const updatedManufacturers = manufacturers.filter(
      (m) => m.id !== manufacturerToDelete.id
    );
    setManufacturers(updatedManufacturers);
    updateFormState(updatedManufacturers);
    setDeleteDialogOpen(false);
    setManufacturerToDelete(null);
  };

  const updateManufacturer = (
    id: string,
    field: keyof Manufacturer,
    value: string
  ) => {
    // Change 'id' type to string
    const updatedManufacturers = manufacturers.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    );
    setManufacturers(updatedManufacturers);
    updateFormState(updatedManufacturers);
  };

  const updateFormState = (manufacturers: Manufacturer[]) => {
    updateManufacturers(
      manufacturers.map((m) => ({
        id: m.id, // id alanını koruyun
        productCode: m.code,
        productName: m.stockName,
        barcode: m.barcode,
        brandId: m.brandId,
        currentId: m.currentId,
      }))
    );
  };

  if (currentsLoading || brandsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (currentsError || brandsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{currentsError || brandsError}</AlertDescription>
      </Alert>
    );
  }

  if (currents.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          İthalat, İthalat/İhracat veya Tedarikçi tipinde cari bulunamadı.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {manufacturers.map((manufacturer, index) => (
        <Card key={manufacturer.id} className="relative">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">
                Üretici {index + 1}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => confirmDeleteManufacturer(manufacturer)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="ml-2">Sil</span>
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <Select
                  value={manufacturer.currentId}
                  onValueChange={(value) =>
                    updateManufacturer(manufacturer.id, "currentId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cari seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {currents.map((current) => (
                      <SelectItem key={current.id} value={current.id}>
                        {current.currentName} ({current.currentCode}) -{" "}
                        {current.currentType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Stok Adı"
                    value={manufacturer.stockName}
                    onChange={(e) =>
                      updateManufacturer(
                        manufacturer.id,
                        "stockName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Input
                    placeholder="Kod"
                    value={manufacturer.code}
                    onChange={(e) =>
                      updateManufacturer(
                        manufacturer.id,
                        "code",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Input
                    placeholder="Barkod"
                    value={manufacturer.barcode}
                    onChange={(e) =>
                      updateManufacturer(
                        manufacturer.id,
                        "barcode",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Select
                  value={manufacturer.brandId}
                  onValueChange={(value) =>
                    updateManufacturer(manufacturer.id, "brandId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.brandName} ({brand.brandCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button className="w-full" variant="outline" onClick={addManufacturer}>
        <Plus className="h-4 w-4 mr-2" />
        Yeni Üretici Ekle
      </Button>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Üreticiyi Sil</DialogTitle>
            <DialogDescription>
              Bu üreticiyi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={deleteManufacturer}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManufacturers;
