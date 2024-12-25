/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Customer } from "./types";
import { CartItem } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface ProductSearchProps {
  onProductSelect: (product: CartItem) => void;
  warehouseId: string;
  disabled?: boolean;
  customer: Customer | null;
}


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
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isDisabled = !customer || !warehouseId;
  const placeholderText = !customer
    ? "Önce müşteri seçimi yapmalısınız"
    : !warehouseId
      ? "Önce depo seçin"
      : "Ürün kodu, adı veya barkod ile arama yapın...";

  const handleSearch = useCallback(async () => {
    try {
      if (!debouncedSearchTerm.trim() || !warehouseId) {
        setResults([]);
        return;
      }

      setLoading(true);

      const response = await fetch(
        `${process.env.BASE_URL}/stockcards/byWarehouse/search/${warehouseId}?query=${encodeURIComponent(debouncedSearchTerm)}`,
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
  }, [debouncedSearchTerm, warehouseId, customer?.priceList?.id, toast]);

  React.useEffect(() => {
    handleSearch();
  }, [debouncedSearchTerm, handleSearch]);

  const handleProductSelect = (product: any) => {
    // Find price list item matching customer's price list
    const priceListItem = product.stockCardPriceLists.find(
      (pl: any) => pl.priceListId === customer?.priceList?.id
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

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <Input
            placeholder={placeholderText}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isDisabled}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

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