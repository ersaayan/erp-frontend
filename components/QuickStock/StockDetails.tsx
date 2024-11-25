"use client";

import React from "react";
import { Stock } from "./types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockDetailsProps {
  stock: Stock;
}

const StockDetails: React.FC<StockDetailsProps> = ({ stock }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6 p-1">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium mb-3">Fiyat Listesi</h4>
            <div className="grid gap-2">
              {stock.prices.map((price) => (
                <Card key={price.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{price.priceListName}</span>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(price.price)} {price.currency}
                      </div>
                      {price.vatRate && (
                        <div className="text-sm text-muted-foreground">
                          KDV: %{price.vatRate}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Ürün Adı
              </Label>
              <p className="text-lg font-medium mt-1">{stock.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Ürün Kodu
                </Label>
                <p className="text-lg font-medium mt-1">{stock.code}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Barkod
                </Label>
                <p className="text-lg font-medium mt-1">{stock.barcode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Marka
                </Label>
                <p className="text-lg font-medium mt-1">{stock.brand}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Depo
                </Label>
                <p className="text-lg font-medium mt-1">
                  {stock.warehouseName}
                </p>
              </div>
            </div>

            <Card className="p-4">
              <div className="text-center">
                <Label className="text-sm font-medium text-muted-foreground">
                  Stok Miktarı
                </Label>
                <p className="text-2xl font-bold mt-1">
                  {stock.currentQuantity} {stock.unit}
                </p>
              </div>
            </Card>

            {stock.shortDescription && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Kısa Açıklama
                </Label>
                <p className="text-sm mt-1 bg-muted p-2 rounded">
                  {stock.shortDescription}
                </p>
              </div>
            )}

            {stock.description && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Detaylı Açıklama
                </Label>
                <p className="text-sm mt-1 bg-muted p-2 rounded">
                  {stock.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default StockDetails;
