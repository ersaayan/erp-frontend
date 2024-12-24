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
  const calculateTotals = (
    quantity: number,
    unitPrice: number,
    vatRate: number,
    discountRate: number
  ) => {
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountRate) / 100;
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = (afterDiscount * vatRate) / 100;
    const totalAmount = afterDiscount + vatAmount;

    return { discountAmount, vatAmount, totalAmount };
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const totals = calculateTotals(
      quantity,
      item.unitPrice,
      item.vatRate,
      item.discountRate
    );
    onUpdateItem(itemId, { quantity, ...totals });
  };

  const handleUnitPriceChange = (itemId: string, unitPrice: number) => {
    if (unitPrice < 0) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const totals = calculateTotals(
      item.quantity,
      unitPrice,
      item.vatRate,
      item.discountRate
    );
    onUpdateItem(itemId, { unitPrice, ...totals });
  };

  const handleVatRateChange = (itemId: string, vatRate: number) => {
    if (vatRate < 0 || vatRate > 100) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const totals = calculateTotals(
      item.quantity,
      item.unitPrice,
      vatRate,
      item.discountRate
    );
    onUpdateItem(itemId, { vatRate, ...totals });
  };

  const handleDiscountChange = (itemId: string, discountRate: number) => {
    if (discountRate < 0 || discountRate > 100) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const totals = calculateTotals(
      item.quantity,
      item.unitPrice,
      item.vatRate,
      discountRate
    );
    onUpdateItem(itemId, { discountRate, ...totals });
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün</TableHead>
            <TableHead className="w-[100px] text-right">Miktar</TableHead>
            <TableHead className="w-[120px] text-right">
              <div className="text-right">Birim Fiyat</div>
            </TableHead>
            <TableHead className="w-[100px] text-right">İndirim %</TableHead>
            <TableHead className="w-[100px] text-right">
              <div className="text-right">KDV %</div>
            </TableHead>
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
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleUnitPriceChange(item.id, parseFloat(e.target.value))
                  }
                  className="w-28 text-right"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.vatRate}
                  onChange={(e) =>
                    handleVatRateChange(item.id, parseFloat(e.target.value))
                  }
                  className="w-20 text-right"
                />
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
