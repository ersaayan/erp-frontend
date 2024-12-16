"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { InvoiceFormData, Branch, Warehouse } from "../types";
import { useToast } from "@/hooks/use-toast";

interface InvoiceFormProps {
  data: InvoiceFormData;
  onChange: (data: InvoiceFormData) => void;
  isEditMode?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  data,
  onChange,
  isEditMode = false,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSerial, setIsSerial] = useState(false);
  const [isGprSerial, setIsGprSerial] = useState(false);
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
    field: keyof InvoiceFormData,
    value: string | Date | number
  ) => {
    onChange({ ...data, [field]: value });

    // Update payment date when payment term changes
    if (field === "paymentTerm") {
      const newPaymentDate = new Date(data.invoiceDate);
      newPaymentDate.setDate(newPaymentDate.getDate() + Number(value));
      onChange({
        ...data,
        paymentTerm: Number(value),
        paymentDate: newPaymentDate,
      });
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

  const handleSerialToggle = async (checked: boolean) => {
    setIsSerial(checked);
    if (checked) {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/invoices/getLastInvoiceNoByType/Purchase`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch last invoice number");
        }

        const lastInvoiceNo = await response.text();

        // Extract components from the last invoice number
        const unitCode = lastInvoiceNo.substring(0, 3);
        const currentYear = new Date().getFullYear().toString();
        const sequentialNumber = parseInt(lastInvoiceNo.slice(-9)) + 1;

        // Generate new invoice number
        const newInvoiceNo = `${unitCode}${currentYear}${sequentialNumber
          .toString()
          .padStart(9, "0")}`;

        handleInputChange("invoiceNo", newInvoiceNo);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate invoice number",
        });
        throw error;
        setIsSerial(false);
      }
    }
  };

  const handleGprSerialToggle = async (checked: boolean) => {
    setIsGprSerial(checked);
    if (checked) {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/invoices/getLastInvoiceNoByType/Purchase`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch last invoice number");
        }

        const lastInvoiceNo = await response.text();

        // Extract components and replace SAL with GSL
        const currentYear = new Date().getFullYear().toString();
        const sequentialNumber = parseInt(lastInvoiceNo.slice(-9)) + 1;

        // Generate new invoice number with GSL prefix
        const newInvoiceNo = `GSL${currentYear}${sequentialNumber
          .toString()
          .padStart(9, "0")}`;

        handleInputChange("gibInvoiceNo", newInvoiceNo);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate GİB invoice number",
        });
        throw error;
        setIsGprSerial(false);
      }
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
        <div className="flex justify-between items-center mb-2">
          <Label>Fatura No</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isSerial}
              onCheckedChange={handleSerialToggle}
              id="serial-mode"
              disabled={isEditMode}
            />
            <Label htmlFor="serial-mode" className="text-sm">
              Seri
            </Label>
          </div>
        </div>
        <Input
          value={data.invoiceNo}
          onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
          placeholder="Fatura numarası giriniz"
          disabled={isSerial || isEditMode}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>GİB No</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isGprSerial}
              onCheckedChange={handleGprSerialToggle}
              id="gpr-serial-mode"
              disabled={isEditMode}
            />
            <Label htmlFor="gpr-serial-mode" className="text-sm">
              GSL
            </Label>
          </div>
        </div>
        <Input
          value={data.gibInvoiceNo}
          onChange={(e) => handleInputChange("gibInvoiceNo", e.target.value)}
          placeholder="GİB numarası giriniz"
          disabled={isGprSerial || isEditMode}
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
              onSelect={(date) =>
                date && handleInputChange("invoiceDate", date)
              }
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
          onChange={(e) =>
            handleInputChange("paymentTerm", parseInt(e.target.value))
          }
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
              onSelect={(date) =>
                date && handleInputChange("paymentDate", date)
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
