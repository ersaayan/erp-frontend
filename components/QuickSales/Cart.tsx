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
import { CartItem } from "./types";
import { formatCurrency } from "@/lib/utils";

interface CartProps {
  items: CartItem[];
  onUpdateItem: (itemId: string, updates: Partial<CartItem>) => void;
  onRemoveItem: (itemId: string) => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateItem, onRemoveItem }) => {
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    onUpdateItem(itemId, { quantity });
  };

  const handleDiscountChange = (itemId: string, discountRate: number) => {
    if (discountRate < 0 || discountRate > 100) return;
    onUpdateItem(itemId, { discountRate });
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün</TableHead>
            <TableHead className="w-[100px] text-right">Miktar</TableHead>
            <TableHead className="w-[120px] text-right">Birim Fiyat</TableHead>
            <TableHead className="w-[100px] text-right">İndirim %</TableHead>
            <TableHead className="w-[100px] text-right">KDV %</TableHead>
            <TableHead className="w-[120px] text-right">Toplam</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.code}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value))
                  }
                  className="w-20 text-right"
                />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.discountRate}
                  onChange={(e) =>
                    handleDiscountChange(item.id, parseInt(e.target.value))
                  }
                  className="w-20 text-right"
                />
              </TableCell>
              <TableCell className="text-right">{item.vatRate}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.totalAmount)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Sepet boş
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Cart;
