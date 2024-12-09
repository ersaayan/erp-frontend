"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvoiceFormData, Branch, Warehouse } from "./types";
import { Current } from "../CurrentList/types";
import { ScrollArea } from "../ui/scroll-area";

interface InvoiceFormProps {
  invoiceData: InvoiceFormData;
  onInvoiceDataChange: (data: InvoiceFormData) => void;
  currentData: Current | null;
  onCurrentChange: (current: Current | null) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  onInvoiceDataChange,
  currentData,
  onCurrentChange,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [autoInvoiceNo, setAutoInvoiceNo] = useState(true);
  const [autoGibNo, setAutoGibNo] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Current[]>([]);

  useEffect(() => {
    // Fetch branches and warehouses
    const fetchData = async () => {
      try {
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

        const branchesData = await branchesResponse.json();
        const warehousesData = await warehousesResponse.json();

        setBranches(branchesData);
        setWarehouses(warehousesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (
    field: "invoiceDate" | "paymentDate",
    date: Date
  ) => {
    onInvoiceDataChange({
      ...invoiceData,
      [field]: date,
    });
  };

  const handlePaymentTermChange = (value: string) => {
    const term = parseInt(value);
    if (!isNaN(term) && term >= 0) {
      const newPaymentDate = new Date(invoiceData.invoiceDate);
      newPaymentDate.setDate(newPaymentDate.getDate() + term);

      onInvoiceDataChange({
        ...invoiceData,
        paymentTerm: term,
        paymentDate: newPaymentDate,
      });
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.BASE_URL}/currents/search?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching currents:", error);
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Invoice Number */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Fatura No</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoInvoiceNo}
                onCheckedChange={setAutoInvoiceNo}
              />
              <Label>Seri</Label>
            </div>
          </div>
          <Input
            value={invoiceData.invoiceNo}
            onChange={(e) =>
              onInvoiceDataChange({ ...invoiceData, invoiceNo: e.target.value })
            }
            disabled={autoInvoiceNo}
          />
        </div>

        {/* GIB Invoice Number */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>GİB No</Label>
            <div className="flex items-center space-x-2">
              <Switch checked={autoGibNo} onCheckedChange={setAutoGibNo} />
              <Label>Seri</Label>
            </div>
          </div>
          <Input
            value={invoiceData.gibInvoiceNo}
            onChange={(e) =>
              onInvoiceDataChange({
                ...invoiceData,
                gibInvoiceNo: e.target.value,
              })
            }
            disabled={autoGibNo}
          />
        </div>

        {/* Branch Selection */}
        <div className="space-y-2">
          <Label>Şube</Label>
          <Select
            value={invoiceData.branchCode}
            onValueChange={(value) =>
              onInvoiceDataChange({ ...invoiceData, branchCode: value })
            }
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

        {/* Invoice Date */}
        <div className="space-y-2">
          <Label>Fatura Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !invoiceData.invoiceDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoiceData.invoiceDate ? (
                  format(invoiceData.invoiceDate, "PPP")
                ) : (
                  <span>Tarih seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={invoiceData.invoiceDate}
                onSelect={(date) =>
                  date && handleDateChange("invoiceDate", date)
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Payment Term */}
        <div className="space-y-2">
          <Label>Vade (Gün)</Label>
          <Input
            type="number"
            min="0"
            value={invoiceData.paymentTerm}
            onChange={(e) => handlePaymentTermChange(e.target.value)}
          />
        </div>

        {/* Payment Date */}
        <div className="space-y-2">
          <Label>Ödeme Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !invoiceData.paymentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoiceData.paymentDate ? (
                  format(invoiceData.paymentDate, "PPP")
                ) : (
                  <span>Tarih seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={invoiceData.paymentDate}
                onSelect={(date) =>
                  date && handleDateChange("paymentDate", date)
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Warehouse Selection */}
        <div className="space-y-2">
          <Label>Depo</Label>
          <Select
            value={invoiceData.warehouseId}
            onValueChange={(value) =>
              onInvoiceDataChange({ ...invoiceData, warehouseId: value })
            }
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

        {/* Description */}
        <div className="col-span-3">
          <Label>Açıklama</Label>
          <Textarea
            value={invoiceData.description}
            onChange={(e) =>
              onInvoiceDataChange({
                ...invoiceData,
                description: e.target.value,
              })
            }
            placeholder="Fatura açıklaması..."
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
