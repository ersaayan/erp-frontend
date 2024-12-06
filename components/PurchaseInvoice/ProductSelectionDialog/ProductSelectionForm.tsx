import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Current } from "@/components/CurrentList/types";
import { useProductPricing } from "../hooks/useProductPricing";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface StockCardWarehouse {
  warehouseId: string;
  quantity: string;
  warehouse: {
    id: string;
    warehouseName: string;
  };
}

interface Product {
  id: string;
  productCode: string;
  productName: string;
  unit: string;
  price: number;
  vatRate: number;
  currency: string;
  stockCardWarehouse: StockCardWarehouse[];
}

interface ProductSelectionFormProps {
  customer: Current | null;
  selectedWarehouseId?: string;
  onProductsSelected: (products: Product[]) => void;
  onClose: () => void;
}

const ProductSelectionForm: React.FC<ProductSelectionFormProps> = ({
  customer,
  selectedWarehouseId,
  onProductsSelected,
  onClose,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { fetchProducts, loading } = useProductPricing(customer);

  const searchProducts = useCallback(async () => {
    try {
      const results = await fetchProducts(debouncedSearchTerm);
      setProducts(results || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products",
      });
      setProducts([]);
    }
  }, [debouncedSearchTerm, fetchProducts, toast]);

  React.useEffect(() => {
    searchProducts();
  }, [debouncedSearchTerm, searchProducts]);

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSubmit = () => {
    const selectedItems = products.filter((p) => selectedProducts.has(p.id));
    if (selectedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one product",
      });
      return;
    }
    onProductsSelected(selectedItems);
    onClose();
  };

  const getWarehouseStock = (product: Product): number => {
    if (!selectedWarehouseId || !product.stockCardWarehouse) {
      return 0;
    }

    const warehouseStock = product.stockCardWarehouse.find(
      (w) => w.warehouseId === selectedWarehouseId
    );

    return warehouseStock ? parseInt(warehouseStock.quantity, 10) : 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ürün Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setSearchTerm("")}
          disabled={!searchTerm}
        >
          Temizle
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={
            selectedProducts.size === products.length && products.length > 0
          }
          onCheckedChange={handleSelectAll}
          id="select-all"
        />
        <label htmlFor="select-all" className="text-sm">
          Tümünü Seç ({selectedProducts.size} / {products.length})
        </label>
      </div>

      <ScrollArea className="h-[400px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Stok Kodu</TableHead>
              <TableHead>Stok Adı</TableHead>
              <TableHead>Birim</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead className="text-right">Fiyat</TableHead>
              <TableHead className="text-right">KDV</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Yükleniyor...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Ürün bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                    />
                  </TableCell>
                  <TableCell>{product.productCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-right">
                    {getWarehouseStock(product)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.price.toFixed(2)}{" "}
                    {getCurrencySymbol(product.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    %{product.vatRate}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedProducts.size === 0}
          className="bg-[#84CC16] hover:bg-[#65A30D]"
        >
          {selectedProducts.size} Ürün Ekle
        </Button>
      </div>
    </div>
  );
};

export default ProductSelectionForm;
