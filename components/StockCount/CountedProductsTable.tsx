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
import { CountedProduct } from "./types";

interface CountedProductsTableProps {
  products: CountedProduct[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CountedProductsTable: React.FC<CountedProductsTableProps> = ({
  products,
  onQuantityChange,
  onRemove,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Henüz ürün eklenmedi
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Ürün Kodu</TableHead>
            <TableHead className="w-[150px] text-right">Miktar</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.productName}</TableCell>
              <TableCell>{product.productCode}</TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      onQuantityChange(product.id, value);
                    }
                  }}
                  className="w-20 text-right"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(product.id)}
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

export default CountedProductsTable;
