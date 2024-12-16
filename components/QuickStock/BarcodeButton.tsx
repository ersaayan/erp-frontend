"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useBarcodeGenerator } from "@/components/BarcodeGenerator/hooks/useBarcodeGenerator";
import { Stock } from "./types";
import { useToast } from "@/hooks/use-toast";
import { generateQRCode } from "@/components/BarcodeGenerator/utils/qrCodeGenerator";

interface BarcodeButtonProps {
  stock: Stock | null;
}

const BarcodeButton: React.FC<BarcodeButtonProps> = ({ stock }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { loading, handlePrint } = useBarcodeGenerator();
  const [qrCodeReady, setQrCodeReady] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const generateQR = async () => {
      if (!stock?.code) {
        setQrCodeReady(false);
        setQrCodeData(null);
        return;
      }

      try {
        const qrCode = await generateQRCode(stock.code);
        setQrCodeData(qrCode);
        setQrCodeReady(true);
      } catch (err) {
        setQrCodeReady(false);
        setQrCodeData(null);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "QR kod oluşturulamadı",
        });
        console.error(err);
      }
    };

    generateQR();
  }, [stock?.code, toast]);

  const handleClick = async () => {
    if (!stock?.code || !qrCodeReady || !qrCodeData) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "QR kod henüz hazır değil",
      });
      return;
    }

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Yazdırma penceresi açılamadı");
      }

      const formattedStockCode = stock.code.split("/").join("\n");

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
              .container {
                width: 80mm;
                height: 40mm;
                position: relative;
              }
              img.qr-code {
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
            <div class="container">
              <img class="qr-code" src="${qrCodeData}" />
              <div class="stock-code">${formattedStockCode}</div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      const img = new Image();
      img.src = qrCodeData;
      img.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 100);
      };

      toast({
        title: "Başarılı",
        description: "Barkod yazdırma işlemi başlatıldı",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yazdırma işlemi başlatılırken bir hata oluştu",
      });
      console.error(error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={!stock?.code || loading || !qrCodeReady}
      className="min-w-[120px]"
    >
      <Printer className="h-4 w-4 mr-2" />
      {loading
        ? "Yazdırılıyor..."
        : qrCodeReady
        ? "Barkod Yazdır"
        : "QR Kod Hazırlanıyor..."}
    </Button>
  );
};

export default BarcodeButton;
