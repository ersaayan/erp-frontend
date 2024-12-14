"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Warehouse } from "./types";

interface WarehouseSelectProps {
  onWarehouseSelect: (warehouseId: string) => void;
}

const WarehouseSelect: React.FC<WarehouseSelectProps> = ({
  onWarehouseSelect,
}) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/warehouses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch warehouses");
        }

        const data = await response.json();
        setWarehouses(data);
      } catch (err) {
        setError("Depolar yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Depolar yükleniyor...</span>
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
    <div className="space-y-2">
      <Label>Depo</Label>
      <Select onValueChange={onWarehouseSelect}>
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
  );
};

export default WarehouseSelect;
