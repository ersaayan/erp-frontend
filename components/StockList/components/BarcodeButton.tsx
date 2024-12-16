import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { StockCard } from "../types";
import { useToast } from "@/hooks/use-toast";
import { BarcodeData } from "@/lib/services/barcode/types";
import { BarcodePrinter } from "@/lib/services/barcode/printer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BarcodeButtonProps {
  selectedStocks: StockCard[];
}

const BarcodeButton: React.FC<BarcodeButtonProps> = ({ selectedStocks }) => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handlePrint = async () => {
    if (selectedStocks.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen en az bir ürün seçin",
      });
      return;
    }

    try {
      setLoading(true);

      // Convert selected stocks to barcode data
      const barcodeData: BarcodeData[] = selectedStocks.map((stock) => ({
        stockCode: stock.productCode,
        stockName: stock.productName,
        barcode: stock.barcodes[0]?.barcode || stock.productCode,
      }));

      // Initialize printer with default template
      const printer = new BarcodePrinter();

      // Print barcodes
      await printer.printBarcodes(barcodeData);

      toast({
        title: "Başarılı",
        description: "Barkod yazdırma işlemi başlatıldı",
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Yazdırma işlemi başarısız oldu",
      });
    } finally {
      setLoading(false);
      setShowPreview(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(true)}
        disabled={selectedStocks.length === 0 || loading}
        className="min-w-[120px]"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {loading ? "Yazdırılıyor..." : "Barkod Yazdır"}
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Barkod Yazdırma Önizleme</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <p>Seçili Ürünler:</p>
              <ul className="list-disc pl-4 space-y-2">
                {selectedStocks.map((stock) => (
                  <li key={stock.id}>
                    {stock.productName} ({stock.productCode})
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              İptal
            </Button>
            <Button
              onClick={handlePrint}
              disabled={loading}
              className="bg-[#84CC16] hover:bg-[#65A30D]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yazdır
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeButton;
