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

interface ProductsTableProps {
  products: StockItem[];
  onProductUpdate: (product: StockItem) => void;
  onProductRemove: (productId: string) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onProductUpdate,
  onProductRemove,
}) => {
  const handleQuantityChange = (product: StockItem, quantity: number) => {
    if (quantity < 1) return;

    const vatAmount = (quantity * product.unitPrice * product.vatRate) / 100;
    const totalAmount = quantity * product.unitPrice + vatAmount;

    onProductUpdate({
      ...product,
      quantity,
      vatAmount,
      totalAmount,
    });
  };

  const handleUnitPriceChange = (product: StockItem, unitPrice: number) => {
    if (unitPrice < 0) return;

    const vatAmount = (product.quantity * unitPrice * product.vatRate) / 100;
    const totalAmount = product.quantity * unitPrice + vatAmount;

    onProductUpdate({
      ...product,
      unitPrice,
      vatAmount,
      totalAmount,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stok Kodu</TableHead>
            <TableHead>Stok Adı</TableHead>
            <TableHead className="text-right">Miktar</TableHead>
            <TableHead>Birim</TableHead>
            <TableHead className="text-right">Stok Seviyesi</TableHead>
            <TableHead className="text-right">Birim Fiyat</TableHead>
            <TableHead className="text-right">KDV %</TableHead>
            <TableHead className="text-right">KDV Tutarı</TableHead>
            <TableHead className="text-right">Toplam</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                Henüz ürün eklenmedi
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.stockCode}</TableCell>
                <TableCell>{product.stockName}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) =>
                      handleQuantityChange(product, parseInt(e.target.value))
                    }
                    className="w-20 text-right"
                  />
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="text-right">
                  {product.stockLevel}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.unitPrice}
                    onChange={(e) =>
                      handleUnitPriceChange(product, parseFloat(e.target.value))
                    }
                    className="w-28 text-right"
                  />
                </TableCell>
                <TableCell className="text-right">{product.vatRate}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.vatAmount, product.currency)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.totalAmount, product.currency)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onProductRemove(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
