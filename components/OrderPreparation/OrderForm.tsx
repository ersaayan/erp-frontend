"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { OrderFormData, Branch, Warehouse } from "./types";
import { useToast } from "@/hooks/use-toast";

interface OrderFormProps {
  data: OrderFormData;
  onChange: (data: OrderFormData) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ data, onChange }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [branchesResponse, warehousesResponse] = await Promise.all([
          fetch(`${process.env.BASE_URL}/branches`, {
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

        if (!branchesResponse.ok || !warehousesResponse.ok) {
          throw new Error("Failed to fetch form data");
        }

        const [branchesData, warehousesData] = await Promise.all([
          branchesResponse.json(),
          warehousesResponse.json(),
        ]);

        setBranches(branchesData);
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

    fetchData();
  }, []);

  const handleInputChange = (
    field: keyof OrderFormData,
    value: string | Date | number
  ) => {
    onChange({ ...data, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading form data...</span>
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
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <Label>Sipariş No</Label>
        <Input
          value={data.orderNo}
          onChange={(e) => handleInputChange("orderNo", e.target.value)}
          placeholder="Sipariş numarası giriniz"
        />
      </div>

      <div>
        <Label>Sipariş Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.orderDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.orderDate ? (
                format(data.orderDate, "PPP")
              ) : (
                <span>Tarih seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.orderDate}
              onSelect={(date) => date && handleInputChange("orderDate", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Teslim Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.deliveryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.deliveryDate ? (
                format(data.deliveryDate, "PPP")
              ) : (
                <span>Tarih seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.deliveryDate}
              onSelect={(date) =>
                date && handleInputChange("deliveryDate", date)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Şube</Label>
        <Select
          value={data.branchCode}
          onValueChange={(value) => handleInputChange("branchCode", value)}
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

      <div>
        <Label>Depo</Label>
        <Select
          value={data.warehouseId}
          onValueChange={(value) => handleInputChange("warehouseId", value)}
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

      <div className="md:col-span-3">
        <Label>Açıklama</Label>
        <Textarea
          value={data.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Açıklama giriniz"
          className="resize-none"
        />
      </div>
    </div>
  );
};

export default OrderForm;
