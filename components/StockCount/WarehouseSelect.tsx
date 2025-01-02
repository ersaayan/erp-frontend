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
import { Branch, Warehouse } from "./types";

interface WarehouseSelectProps {
  onWarehouseSelect: (warehouseId: string) => void;
  onBranchSelect: (branchCode: string) => void;
  selectedBranchCode: string;
}

const WarehouseSelect: React.FC<WarehouseSelectProps> = ({
  onWarehouseSelect,
  onBranchSelect,
  selectedBranchCode,
}) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesResponse, branchesResponse] = await Promise.all([
          fetch(`${process.env.BASE_URL}/warehouses`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }),
          fetch(`${process.env.BASE_URL}/branches`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }),
        ]);

        if (!warehousesResponse.ok || !branchesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [warehousesData, branchesData] = await Promise.all([
          warehousesResponse.json(),
          branchesResponse.json(),
        ]);

        setWarehouses(warehousesData);
        setBranches(branchesData);
      } catch (err) {
        setError("Depolar yüklenirken bir hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="mb-4">
        <Label>Şube</Label>
        <Select
          value={selectedBranchCode}
          onValueChange={(value) => {
            onBranchSelect(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Şube seçin" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.branchCode}>
                {branch.branchName} ({branch.branchCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Label>Depo</Label>
      <Select onValueChange={onWarehouseSelect}>
        <SelectTrigger>
          <SelectValue
            placeholder={selectedBranchCode ? "Depo seçin" : "Önce şube seçin"}
          />
        </SelectTrigger>
        <SelectContent>
          {selectedBranchCode ? (
            warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouseName} ({warehouse.warehouseCode})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="disabled" disabled>
              Önce şube seçin
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WarehouseSelect;
