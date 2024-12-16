import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BarcodeFormData } from '../types';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { formatStockCodeForDisplay } from '../utils/stockCodeFormatter';

export const useBarcodeGenerator = () => {
  const [formData, setFormData] = useState<BarcodeFormData>({
    stockCode: '',
    paperWidth: 80, // Fixed width: 80mm
    paperHeight: 40, // Fixed height: 40mm
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQRCodeGenerated, setIsQRCodeGenerated] = useState(false);
  const { toast } = useToast();

  const updateFormData = useCallback((field: keyof BarcodeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Generate QR code when stock code changes
  useEffect(() => {
    const generateQR = async () => {
      if (!formData.stockCode.trim()) {
        setQrCodeData(null);
        setIsQRCodeGenerated(false);
        return;
      }

      try {
        const qrCode = await generateQRCode(formData.stockCode);
        setQrCodeData(qrCode);
        setIsQRCodeGenerated(true);
        setError(null);
      } catch (err) {
        setError('QR kod oluşturulamadı');
        setIsQRCodeGenerated(false);
        throw err;
      }
    };

    generateQR();
  }, [formData.stockCode]);

  const handlePrint = useCallback(async () => {
    if (!isQRCodeGenerated || !qrCodeData) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen önce QR kod oluşturulmasını bekleyin",
      });
      return;
    }

    try {
      setLoading(true);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Yazdırma penceresi açılamadı');
      }

      const formattedStockCode = formatStockCodeForDisplay(formData.stockCode);

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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yazdırma işlemi başlatılırken bir hata oluştu",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData.stockCode, qrCodeData, isQRCodeGenerated, toast]);

  return {
    formData,
    loading,
    error,
    isQRCodeGenerated,
    updateFormData,
    handlePrint,
  };
};