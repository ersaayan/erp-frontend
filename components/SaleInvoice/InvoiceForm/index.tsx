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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { InvoiceFormData, Branch, Warehouse } from "../types";

interface InvoiceFormProps {
  data: InvoiceFormData;
  onChange: (data: InvoiceFormData) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, onChange }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          err instanceof Error ? err.message : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    field: keyof InvoiceFormData,
    value: string | Date | number
  ) => {
    onChange({ ...data, [field]: value });

    // Update payment date when payment term changes
    if (field === "paymentTerm") {
      const newPaymentDate = new Date(data.invoiceDate);
      newPaymentDate.setDate(newPaymentDate.getDate() + Number(value));
      onChange({ ...data, paymentTerm: Number(value), paymentDate: newPaymentDate });
    }

    // Update payment term when payment date changes
    if (field === "paymentDate" && value instanceof Date) {
      const diffTime = value.getTime() - data.invoiceDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      onChange({ ...data, paymentDate: value, paymentTerm: diffDays });
    }

    // Update payment date when invoice date changes
    if (field === "invoiceDate" && value instanceof Date) {
      const newPaymentDate = new Date(value);
      newPaymentDate.setDate(newPaymentDate.getDate() + data.paymentTerm);
      onChange({ ...data, invoiceDate: value, paymentDate: newPaymentDate });
    }
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
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label>Fatura No</Label>
        <Input
          value={data.invoiceNo}
          onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
          placeholder="Fatura numarası giriniz"
        />
      </div>

      <div>
        <Label>GİB No</Label>
        <Input
          value={data.gibInvoiceNo}
          onChange={(e) => handleInputChange("gibInvoiceNo", e.target.value)}
          placeholder="GİB numarası giriniz"
        />
      </div>

      <div>
        <Label>Fatura Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.invoiceDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.invoiceDate ? (
                format(data.invoiceDate, "PPP")
              ) : (
                <span>Tarih seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.invoiceDate}
              onSelect={(date) => date && handleInputChange("invoiceDate", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Vade (Gün)</Label>
        <Input
          type="number"
          value={data.paymentTerm}
          onChange={(e) => handleInputChange("paymentTerm", parseInt(e.target.value))}
          className="text-right"
        />
      </div>

      <div>
        <Label>Vade Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.paymentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.paymentDate ? (
                format(data.paymentDate, "PPP")
              ) : (
                <span>Tarih seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.paymentDate}
              onSelect={(date) => date && handleInputChange("paymentDate", date)}
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

      <div className="col-span-3">
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

export default InvoiceForm;