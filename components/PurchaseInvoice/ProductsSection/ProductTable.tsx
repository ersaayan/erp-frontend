"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StockItem } from "../types";

interface ProductTableProps {
  products: StockItem[];
  onUpdate: (index: number, updates: Partial<StockItem>) => void;
  onDelete: (index: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onUpdate,
  onDelete,
}) => {
  const handleInputChange = (
    index: number,
    field: keyof StockItem,
    value: string
  ) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onUpdate(index, { [field]: numericValue });
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Henüz ürün eklenmedi
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[150px]">Ürün Kodu</TableHead>
            <TableHead className="min-w-[200px]">Ürün Adı</TableHead>
            <TableHead className="w-[100px] text-right">Miktar</TableHead>
            <TableHead className="w-[100px]">Birim</TableHead>
            <TableHead className="w-[150px] text-right">Birim Fiyat</TableHead>
            <TableHead className="w-[100px] text-right">KDV %</TableHead>
            <TableHead className="w-[120px] text-right">KDV Tutarı</TableHead>
            <TableHead className="w-[150px] text-right">Toplam</TableHead>
            <TableHead className="w-[50px] sticky right-0 bg-background"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {products.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell>{product.stockCode}</TableCell>
              <TableCell>{product.stockName}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={product.quantity}
                  onChange={(e) =>
                    handleInputChange(index, "quantity", e.target.value)
                  }
                  className="w-20 text-right"
                />
              </TableCell>
              <TableCell>{product.unit}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={product.unitPrice}
                  onChange={(e) =>
                    handleInputChange(index, "unitPrice", e.target.value)
                  }
                  className="w-28 text-right"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={product.vatRate}
                  onChange={(e) =>
                    handleInputChange(index, "vatRate", e.target.value)
                  }
                  className="w-20 text-right"
                />
              </TableCell>
              <TableCell className="text-right">
                {product.vatAmount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {product.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell className="sticky right-0 bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
