/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Barcode, Hash, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Customer } from "./types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CartItem } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface ProductSearchProps {
  onProductSelect: (product: CartItem) => void;
  warehouseId: string;
  disabled?: boolean;
  customer: Customer | null;
}

type SearchOption = "barcodeOnly" | "stockCodeOnly" | "stockNameOnly" | null;

const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductSelect,
  warehouseId,
  _disabled = false, // Prefix with underscore since we use isDisabled instead
  customer
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchOption>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isDisabled = !customer || !warehouseId;
  const placeholderText = !customer
    ? "Önce müşteri seçimi yapmalısınız"
    : !warehouseId
      ? "Önce depo seçin"
      : "Ürün ara...";

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

      const rawData = await response.json();

      // Filter products based on customer's price list
      const filteredData = rawData.map(product => {
        const priceListItem = product.stockCardPriceLists.find(
          pl => pl.priceListId === customer?.priceList?.id
        );
        return {
          ...product,
          price: priceListItem?.price || '0',
          vatRate: priceListItem?.vatRate || '0'
        };
      });

      setResults(filteredData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search products",
      });
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedOption, warehouseId, customer?.priceList?.id, toast]);

  React.useEffect(() => {
    handleSearch();
  }, [debouncedSearchTerm, handleSearch]);

  const handleProductSelect = (product: any) => {
    // Find price list item matching customer's price list
    const priceListItem = product.stockCardPriceLists.find(
      (pl: any) => pl.id === customer?.priceList?.id
    );

    if (!priceListItem) {
      toast({
        variant: "destructive",
        title: "Fiyat Bulunamadı",
        description: "Bu ürün için müşterinin fiyat listesinde fiyat tanımlanmamış.",
      });
      return;
    }

    // Calculate initial prices
    const unitPrice = parseFloat(priceListItem.price);
    const vatRate = parseFloat(priceListItem.vatRate);
    const subtotal = unitPrice;
    const vatAmount = (subtotal * vatRate) / 100;
    const totalAmount = subtotal + vatAmount;

    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.productName,
      code: product.productCode,
      barcode: product.barcodes[0]?.barcode || "",
      quantity: 1,
      unitPrice: unitPrice,
      discountRate: 0,
      discountAmount: 0,
      vatRate: vatRate,
      vatAmount: vatAmount,
      totalAmount: totalAmount,
      unit: product.unit,
      currency: priceListItem.priceList.currency,
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
          placeholder={placeholderText}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={isDisabled}
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
                                  product.price || "0"
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
