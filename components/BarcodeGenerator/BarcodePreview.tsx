"use client";

import React, { useRef, useEffect } from "react";
import { PreviewData } from "./types";
import { Loader2 } from "lucide-react";
import { formatStockCode } from "./utils/stockCodeFormatter";

interface BarcodePreviewProps {
  data: PreviewData | null;
  loading: boolean;
}

const BarcodePreview: React.FC<BarcodePreviewProps> = ({ data, loading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw QR code
    if (data.qrCode) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(
          img,
          data.qrCodePosition.x,
          data.qrCodePosition.y,
          data.qrCodeSize,
          data.qrCodeSize
        );

        // Draw stock code text after QR code is drawn
        if (data.stockCode) {
          const stockCodeParts = formatStockCode(data.stockCode);
          ctx.font = "12px Arial";
          ctx.fillStyle = "black";
          ctx.textAlign = "left";

          // Draw each part on a new line
          stockCodeParts.forEach((part, index) => {
            const yPosition = data.textPosition.y + index * 6; // 6mm spacing between lines
            ctx.fillText(part, data.textPosition.x, yPosition);
          });
        }
      };
      img.src = data.qrCode;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>QR kod oluşturuluyor...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Önizleme burada görüntülenecek
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-lg font-semibold">Önizleme</h3>
      <div className="border rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={data.paperWidth}
          height={data.paperHeight}
          className="border"
          style={{
            width: `${data.paperWidth}mm`,
            height: `${data.paperHeight}mm`,
          }}
        />
      </div>
    </div>
  );
};

export default BarcodePreview;
