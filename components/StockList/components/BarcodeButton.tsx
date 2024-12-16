"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useBarcodeGenerator } from "@/components/BarcodeGenerator/hooks/useBarcodeGenerator";
import { StockCard } from "../types";
import { useToast } from "@/hooks/use-toast";
import { generateQRCode } from "@/components/BarcodeGenerator/utils/qrCodeGenerator";

interface BarcodeButtonProps {
  stocks: StockCard[] | null;
}

const BarcodeButton: React.FC<BarcodeButtonProps> = ({ stocks }) => {
  const { loading, handlePrint } = useBarcodeGenerator();
  const [qrCodesReady, setQrCodesReady] = useState(false);
  const [qrCodesData, setQrCodesData] = useState<string[] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const generateQRs = async () => {
      if (!stocks || stocks.length === 0) {
        setQrCodesReady(false);
        setQrCodesData(null);
        return;
      }

      try {
        const qrCodes = await Promise.all(
          stocks.map((stock) => generateQRCode(stock.productCode))
        );
        setQrCodesData(qrCodes);
        setQrCodesReady(true);
      } catch (err) {
        setQrCodesReady(false);
        setQrCodesData(null);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "QR kodlar oluşturulamadı",
        });
      }
    };

    generateQRs();
  }, [stocks, toast]);

  const handleClick = async () => {
    if (
      !stocks ||
      stocks.length === 0 ||
      !qrCodesReady ||
      !qrCodesData ||
      qrCodesData.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "QR kodlar henüz hazır değil",
      });
      return;
    }

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Yazdırma penceresi açılamadı");
      }

      let bodyContent = "";

      stocks.forEach((stock, index) => {
        const qrCode = qrCodesData[index];
        const formattedStockCode = stock.productCode.split("/").join("<br>");
        bodyContent += `
        <div class="barcode-container">
          <img src="${qrCode}" alt="QR Kod" />
          <p>${formattedStockCode}</p>
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
              display: flex;
              flex-wrap: wrap;
              margin: 0;
              padding: 0;
            }
            .barcode-container {
              width: 80mm;
              height: 40mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            img {
              max-width: 100%;
              max-height: 70%;
            }
            p {
              margin: 0;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          ${bodyContent}
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Barkodlar yazdırılamadı",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={!stocks || stocks.length === 0 || loading || !qrCodesReady}
      className="min-w-[120px]"
    >
      <Printer className="h-4 w-4 mr-2" />
      {loading
        ? "Yazdırılıyor..."
        : qrCodesReady
        ? "Barkodları Yazdır"
        : "QR Kodlar Hazırlanıyor..."}
    </Button>
  );
};

export default BarcodeButton;
