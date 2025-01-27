"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import MovementsToolbar from "./MovementsToolbar";
import MovementsGrid from "./MovementsGrid";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StockMovement } from "./types";
import { StockSearchCombobox } from "@/components/ui/stock-search-combobox";

const StockMovements: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const handleStockSelect = async (stockId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/stockMovements/orders/${stockId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stock movements");
      }

      const data = await response.json();
      setMovements(data);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllMovements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/stockMovements/orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all stock movements");
      }

      const data = await response.json();
      setMovements(data);
    } catch (error) {
      console.error("Error fetching all movements:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-container">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <StockSearchCombobox onSelect={handleStockSelect} />
        </div>
        <Button onClick={handleAllMovements}>Tüm Hareketler</Button>
      </div>

      <MovementsToolbar />

      <Card className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <MovementsGrid movements={movements} />
        )}
      </Card>
    </div>
  );
};

export default StockMovements;
