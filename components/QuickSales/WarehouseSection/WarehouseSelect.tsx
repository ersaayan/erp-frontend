"use client";

import React, { useState, useEffect } from "react";
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

interface Branch {
  id: string;
  branchName: string;
  branchCode: string;
}

interface Warehouse {
  id: string;
  warehouseName: string;
  warehouseCode: string;
  branchCode: string;
}

interface WarehouseSelectProps {
  onWarehouseSelect: (warehouseId: string, branchCode: string) => void;
}

const WarehouseSelect: React.FC<WarehouseSelectProps> = ({
  onWarehouseSelect,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/branches`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch branches");
        const data = await response.json();
        setBranches(data);

        // If only one branch, select it automatically
        if (data.length === 1) {
          setSelectedBranch(data[0].branchCode);
        }
      } catch (error) {
        setError("Failed to load branches");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  // Fetch warehouses when branch is selected
  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!selectedBranch) {
        setWarehouses([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${process.env.BASE_URL}/warehouses/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch warehouses");
        const data = await response.json();

        setWarehouses(data);

        // If only one warehouse, select it automatically
        if (data.length === 1) {
          setSelectedWarehouse(data[0].id);
          onWarehouseSelect(data[0].id, selectedBranch);
        }
      } catch (error) {
        setError("Failed to load warehouses");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [selectedBranch, onWarehouseSelect]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="space-y-2">
        <Label>Şube</Label>
        <Select
          value={selectedBranch}
          onValueChange={(value) => {
            setSelectedBranch(value);
            setSelectedWarehouse(""); // Reset warehouse when branch changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Şube seçin" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.branchCode}>
                {branch.branchName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Depo</Label>
        <Select
          value={selectedWarehouse}
          onValueChange={(value) => {
            setSelectedWarehouse(value);
            onWarehouseSelect(value, selectedBranch);
          }}
          disabled={!selectedBranch}
        >
          <SelectTrigger>
            <SelectValue placeholder="Depo seçin" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouseName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default WarehouseSelect;
