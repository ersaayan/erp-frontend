"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Barcode, Hash, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CartItem } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface ProductSearchProps {
  onProductSelect: (product: CartItem) => void;
  warehouseId: string;
  disabled?: boolean;
}

type SearchOption = "barcodeOnly" | "stockCodeOnly" | "stockNameOnly" | null;

const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductSelect,
  warehouseId,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<SearchOption>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearch = useCallback(async () => {
    try {
      if (!debouncedSearchTerm.trim() || !warehouseId) {
        setResults([]);
        return;
      }

      setLoading(true);

      const searchParams = new URLSearchParams();
      if (selectedOption === "barcodeOnly")
        searchParams.append("barcodes", debouncedSearchTerm);
      else if (selectedOption === "stockCodeOnly")
        searchParams.append("productCode", debouncedSearchTerm);
      else if (selectedOption === "stockNameOnly")
        searchParams.append("productName", debouncedSearchTerm);
      else searchParams.append("query", debouncedSearchTerm);

      const response = await fetch(
        `${process.env.BASE_URL}/stockcards/byWarehouse/search/${warehouseId}?${searchParams}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Product search failed");
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
  }, [debouncedSearchTerm, selectedOption, warehouseId, toast]);

  React.useEffect(() => {
    handleSearch();
  }, [debouncedSearchTerm, handleSearch]);

  const handleProductSelect = (product: any) => {
    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.productName,
      code: product.productCode,
      barcode: product.barcodes[0]?.barcode || "",
      quantity: 1,
      unitPrice: parseFloat(product.stockCardPriceLists[0]?.price || "0"),
      discountRate: 0,
      discountAmount: 0,
      vatRate: parseFloat(product.stockCardPriceLists[0]?.vatRate || "0"),
      vatAmount: 0,
      totalAmount: parseFloat(product.stockCardPriceLists[0]?.price || "0"),
      unit: product.unit,
      currency: product.stockCardPriceLists[0]?.priceList.currency || "TRY",
    };

    onProductSelect(cartItem);
    setSearchTerm("");
    setResults([]);
  };

  const getSearchIcon = () => {
    switch (selectedOption) {
      case "barcodeOnly":
        return <Barcode className="h-4 w-4" />;
      case "stockCodeOnly":
        return <Hash className="h-4 w-4" />;
      case "stockNameOnly":
        return <Type className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-3 top-3 text-muted-foreground">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            getSearchIcon()
          )}
        </div>
        <Input
          placeholder={disabled ? "Önce depo seçin..." : "Ürün Ara..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      <RadioGroup
        value={selectedOption || ""}
        onValueChange={(value) => setSelectedOption(value as SearchOption)}
        className="grid grid-cols-2 gap-2"
      >
        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors">
          <RadioGroupItem value="" id="general" />
          <Label htmlFor="general" className="flex-1 cursor-pointer">
            Genel Arama
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors">
          <RadioGroupItem value="barcodeOnly" id="barcode" />
          <Label htmlFor="barcode" className="flex-1 cursor-pointer">
            Barkod ile Ara
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors">
          <RadioGroupItem value="stockCodeOnly" id="stockCode" />
          <Label htmlFor="stockCode" className="flex-1 cursor-pointer">
            Stok Kodu ile Ara
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors">
          <RadioGroupItem value="stockNameOnly" id="stockName" />
          <Label htmlFor="stockName" className="flex-1 cursor-pointer">
            Stok Adı ile Ara
          </Label>
        </div>
      </RadioGroup>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative"
          >
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 grid grid-cols-1 gap-2">
                {results.map((product) => {
                  const warehouseStock = product.stockCardWarehouse.find(
                    (w: any) => w.warehouseId === warehouseId
                  );
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left p-4 h-auto"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex justify-between w-full">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {product.productName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {product.productCode} -{" "}
                              {product.barcodes[0]?.barcode}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-primary">
                              {formatCurrency(
                                parseFloat(
                                  product.stockCardPriceLists[0]?.price || "0"
                                )
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Stok: {warehouseStock?.quantity || 0}{" "}
                              {product.unit}
                            </div>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;
