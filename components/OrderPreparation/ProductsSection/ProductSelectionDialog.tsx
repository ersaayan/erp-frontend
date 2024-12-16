"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { StockItem } from "../types";
import { Current } from "@/components/CurrentList/types";
import { ProductSearchResult } from "./types";

interface ProductSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsSelect: (products: StockItem[]) => void;
  current: Current | null;
  warehouseId: string;
}

const ProductSelectionDialog: React.FC<ProductSelectionDialogProps> = ({
  open,
  onOpenChange,
  onProductsSelect,
  current,
  warehouseId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const searchProducts = useCallback(async () => {
    if (!debouncedSearchTerm || !current?.priceList?.id || !warehouseId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.BASE_URL
        }/stockcards/byWarehouse/search/${warehouseId}?query=${encodeURIComponent(
          debouncedSearchTerm
        )}`,
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
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search products",
      });
      throw error;
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, current?.priceList?.id, warehouseId, toast]);

  useEffect(() => {
    if (open && debouncedSearchTerm) {
      searchProducts();
    }
  }, [debouncedSearchTerm, open, searchProducts]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedProductIds(new Set());
    }
  }, [open]);

  const handleProductToggle = useCallback((productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const calculatePrice = useCallback(
    (price: string, vatRate: string, isVatIncluded: boolean) => {
      const priceValue = parseFloat(price);
      const vatRateValue = parseFloat(vatRate);

      if (isVatIncluded) {
        // If price includes VAT, calculate the price without VAT
        const vatMultiplier = 1 + vatRateValue / 100;
        return priceValue / vatMultiplier;
      }

      // If price doesn't include VAT, return as is
      return priceValue;
    },
    []
  );

  const handleAddProducts = useCallback(() => {
    const selectedItems: StockItem[] = products
      .filter((product) => selectedProductIds.has(product.id))
      .map((product) => {
        const priceListItem = product.stockCardPriceLists.find(
          (pl) => pl.priceListId === current?.priceList?.id
        );
        const warehouseStock = product.stockCardWarehouse.find(
          (w) => w.warehouseId === warehouseId
        );

        if (!priceListItem) {
          throw new Error(`No price found for product ${product.productName}`);
        }

        const unitPrice = calculatePrice(
          priceListItem.price,
          priceListItem.vatRate,
          priceListItem.priceList.isVatIncluded
        );
        const vatRate = parseFloat(priceListItem.vatRate);
        const quantity = 1;
        const subtotal = unitPrice * quantity;
        const vatAmount = subtotal * (vatRate / 100);

        return {
          id: crypto.randomUUID(),
          stockId: product.id,
          stockCode: product.productCode,
          stockName: product.productName,
          quantity: quantity,
          unit: product.unit,
          stockLevel: parseFloat(warehouseStock?.quantity || "0"),
          unitPrice: unitPrice,
          vatRate: vatRate,
          vatAmount: vatAmount,
          totalAmount: subtotal + vatAmount,
          priceListId: current?.priceList?.id || "",
          currency: priceListItem.priceList.currency,
          isVatIncluded: priceListItem.priceList.isVatIncluded,
        };
      });

    if (selectedItems.length > 0) {
      onProductsSelect(selectedItems);
      toast({
        title: "Success",
        description: `${selectedItems.length} ürün başarıyla eklendi`,
      });
      onOpenChange(false);
    }
  }, [
    products,
    selectedProductIds,
    current,
    warehouseId,
    calculatePrice,
    onProductsSelect,
    toast,
    onOpenChange,
  ]);

  const handleRowClick = useCallback(
    (productId: string) => {
      handleProductToggle(productId);
    },
    [handleProductToggle]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Ürün Seç</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <ScrollArea className="h-[500px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Ürün Kodu</TableHead>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Birim</TableHead>
                  <TableHead className="text-right">Stok Miktarı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Ürünler yükleniyor...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      {searchTerm
                        ? "Arama kriterlerine uygun ürün bulunamadı"
                        : "Arama yapmak için yukarıdaki alanı kullanın"}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const warehouseStock = product.stockCardWarehouse.find(
                      (w) => w.warehouseId === warehouseId
                    );
                    return (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(product.id)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedProductIds.has(product.id)}
                            onCheckedChange={() =>
                              handleProductToggle(product.id)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>{product.productCode}</TableCell>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell className="text-right">
                          {parseFloat(warehouseStock?.quantity || "0").toFixed(
                            2
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedProductIds.size} ürün seçildi
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button
                onClick={handleAddProducts}
                disabled={selectedProductIds.size === 0}
                className="bg-[#84CC16] hover:bg-[#65A30D]"
              >
                Seçili Ürünleri Ekle
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSelectionDialog;
