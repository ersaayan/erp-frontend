"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer } from "lucide-react";
import { PrintBarcodeDialogProps, PrintBarcodeItem } from "../types";

const PrintBarcodeDialog: React.FC<PrintBarcodeDialogProps> = ({
  open,
  onOpenChange,
  selectedStocks,
  onPrint,
}) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Dialog açıldığında quantities state'ini başlat
  useEffect(() => {
    if (open) {
      const initialQuantities = selectedStocks.reduce((acc, stock) => {
        acc[stock.id] = 1; // Varsayılan değer 1
        return acc;
      }, {} as { [key: string]: number });
      setQuantities(initialQuantities);
    }
  }, [open, selectedStocks]);

  const handleQuantityChange = (stockId: string, value: string) => {
    const quantity = parseInt(value) || 1;
    setQuantities((prev) => ({
      ...prev,
      [stockId]: Math.max(1, quantity), // En az 1 olmalı
    }));
  };

  const handlePrint = () => {
    const items: PrintBarcodeItem[] = selectedStocks.map((stock) => ({
      stockCard: stock,
      quantity: quantities[stock.id] || 1,
    }));
    onPrint(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Barkod Yazdır</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ScrollArea className="h-[400px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stok Kodu</TableHead>
                  <TableHead>Stok Adı</TableHead>
                  <TableHead>Birim</TableHead>
                  <TableHead className="w-[120px] text-right">Adet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedStocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell>{stock.productCode}</TableCell>
                    <TableCell>{stock.productName}</TableCell>
                    <TableCell>{stock.unit}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="1"
                        value={quantities[stock.id] || 1}
                        onChange={(e) =>
                          handleQuantityChange(stock.id, e.target.value)
                        }
                        className="w-20 text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-[#84CC16] hover:bg-[#65A30D]"
            >
              <Printer className="h-4 w-4 mr-2" />
              Yazdır
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintBarcodeDialog;
