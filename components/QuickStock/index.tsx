"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "./SearchBar";
import StockDetails from "./StockDetails";
import BarcodeButton from "./BarcodeButton";
import { Stock } from "./types";

const QuickStock: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  return (
    <div className="flex flex-col h-auto">
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-2xl font-bold">HIZLI STOK ARAMA</h2>
        {selectedStock && <BarcodeButton stock={selectedStock} />}
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        <Card>
          <CardContent className="p-6">
            <SearchBar onStockSelect={setSelectedStock} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {selectedStock ? (
              <StockDetails stock={selectedStock} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Stok detayları burada görüntülenecek
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickStock;
