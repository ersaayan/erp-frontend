"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { StockItem } from "../types";
import { Current } from "@/components/CurrentList/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

interface ProductSearchProps {
  warehouseId: string;
  current: Current | null;
  onProductSelect: (product: StockItem) => void;
}

interface SearchResult {
  id: string;
  productCode: string;
  productName: string;
  unit: string;
  stockCardPriceLists: Array<{
    price: string;
    vatRate: string;
    priceListId: string;
    priceList: {
      currency: string;
      isVatIncluded: boolean;
    };
  }>;
  stockCardWarehouse: Array<{
    quantity: string;
  }>;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  warehouseId,
  current,
  onProductSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const searchProducts = useCallback(async () => {
    if (!warehouseId || !current || !debouncedSearchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/stockcards/byWarehouse/${warehouseId}?query=${debouncedSearchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search products");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search products",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, warehouseId, current, toast]);

  React.useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  const handleProductSelect = (result: SearchResult) => {
    const priceListItem = result.stockCardPriceLists.find(
      (pl) => pl.priceListId === current?.priceList?.id
    );

    if (!priceListItem) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No price found for selected price list",
      });
      return;
    }

    const unitPrice = parseFloat(priceListItem.price);
    const vatRate = parseFloat(priceListItem.vatRate);
    const quantity = 1;

    const newProduct: StockItem = {
      id: crypto.randomUUID(),
      stockId: result.id,
      stockCode: result.productCode,
      stockName: result.productName,
      quantity,
      unit: result.unit,
      stockLevel: parseInt(result.stockCardWarehouse[0]?.quantity || "0"),
      unitPrice,
      vatRate,
      vatAmount: (quantity * unitPrice * vatRate) / 100,
      totalAmount:
        quantity * unitPrice + (quantity * unitPrice * vatRate) / 100,
      priceListId: priceListItem.priceListId,
      currency: priceListItem.priceList.currency,
      isVatIncluded: priceListItem.priceList.isVatIncluded,
    };

    onProductSelect(newProduct);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Ürün ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          disabled={!warehouseId || !current}
        />
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
      </div>

      {results.length > 0 && (
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4">
            {results.map((result) => (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start text-left mb-2"
                onClick={() => handleProductSelect(result)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{result.productName}</span>
                  <span className="text-sm text-muted-foreground">
                    {result.productCode} - {result.unit}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ProductSearch;
