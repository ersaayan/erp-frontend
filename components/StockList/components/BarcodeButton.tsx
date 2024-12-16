"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { StockCard } from "../types";
import { useToast } from "@/hooks/use-toast";
import { generateQRCode } from "@/components/BarcodeGenerator/utils/qrCodeGenerator";

interface BarcodeButtonProps {
  selectedStocks: StockCard[];
}

const BarcodeButton: React.FC<BarcodeButtonProps> = ({ selectedStocks }) => {
  const [loading, setLoading] = useState(false);
  const [qrCodesReady, setQrCodesReady] = useState(false);
  const [qrCodesData, setQrCodesData] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const generateQRs = async () => {
      if (selectedStocks.length === 0) {
        setQrCodesReady(false);
        setQrCodesData([]);
        return;
      }

      try {
        const codes = await Promise.all(
          selectedStocks.map((stock) => generateQRCode(stock.productCode))
        );
        setQrCodesData(codes);
        setQrCodesReady(true);
      } catch (err) {
        console.error("Error generating QR codes:", err);
        setQrCodesReady(false);
        setQrCodesData([]);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "QR kodlar oluşturulamadı",
        });
      }
    };

    generateQRs();
  }, [selectedStocks, toast]);

  const handlePrint = async () => {
    if (
      selectedStocks.length === 0 ||
      !qrCodesReady ||
      qrCodesData.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yazdırılacak barkod bulunamadı",
      });
      return;
    }

    try {
      setLoading(true);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Yazdırma penceresi açılamadı");
      }

      let bodyContent = "";
      selectedStocks.forEach((stock, index) => {
        const qrCode = qrCodesData[index];
        const formattedStockCode = stock.productCode.split("/").join("\n");
        bodyContent += `
          <div class="barcode-container">
            <img class="qr-code" src="${qrCode}" />
            <div class="stock-code">${formattedStockCode}</div>
          </div>
        `;
      });

      printWindow.document.write(`
        <html>
          <head>
            <title>Barkod Yazdır</title>
            <style>
              @page {
                size: 80mm 40mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .barcode-container {
                width: 80mm;
                height: 40mm;
                position: relative;
              }
              .qr-code {
                position: absolute;
                width: 20mm;
                height: 20mm;
                left: 30mm;
                top: 3mm;
              }
              .stock-code {
                position: absolute;
                width: 100%;
                top: 25mm;
                text-align: center;
                font-family: Arial;
                font-size: 12pt;
                font-weight: bold;
                white-space: pre-line;
              }
            </style>
          </head>
          <body>
            ${bodyContent}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setLoading(false);
      }, 500);

      toast({
        title: "Başarılı",
        description: "Barkod yazdırma işlemi başlatıldı",
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yazdırma işlemi başlatılırken bir hata oluştu",
      });
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      disabled={selectedStocks.length === 0 || loading || !qrCodesReady}
      className="min-w-[120px]"
    >
      <Printer className="h-4 w-4 mr-2" />
      {loading
        ? "Yazdırılıyor..."
        : qrCodesReady
        ? "Barkod Yazdır"
        : "QR Kodlar Hazırlanıyor..."}
    </Button>
  );
};

export default BarcodeButton;
