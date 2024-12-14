import { useState, useCallback } from 'react';
import { BarcodeFormData, PreviewData } from '../types';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { calculatePositions } from '../utils/layoutCalculator';
import { validateFormData } from '../utils/validator';
import { useToast } from '@/hooks/use-toast';

const initialFormData: BarcodeFormData = {
    stockCode: '',
    paperWidth: 80, // Fixed width: 80mm
    paperHeight: 40, // Fixed height: 40mm
};

export const useBarcodeGenerator = () => {
    const [formData, setFormData] = useState<BarcodeFormData>(initialFormData);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const updateFormData = useCallback((
        field: keyof BarcodeFormData,
        value: string | number
    ) => {
        // Only allow updating stockCode since dimensions are fixed
        if (field === 'stockCode') {
            setFormData(prev => ({ ...prev, [field]: value as string }));
            setError(null);
        }
    }, []);

    const validateForm = useCallback(async () => {
        const validationError = validateFormData(formData);
        if (validationError) {
            setError(validationError);
            return false;
        }

        try {
            setLoading(true);
            const qrCode = await generateQRCode(formData.stockCode);
            const positions = calculatePositions();

            setPreviewData({
                qrCode,
                qrCodeSize: 20, // Fixed QR code size: 20mm
                qrCodePosition: positions.qrCode,
                textPosition: positions.text,
                stockCode: formData.stockCode,
                paperWidth: 80, // Fixed width
                paperHeight: 40, // Fixed height
            });

            return true;
        } catch (err) {
            setError('QR kod oluşturulurken bir hata oluştu');
            return false;
        } finally {
            setLoading(false);
        }
    }, [formData.stockCode]);

    const handlePrint = useCallback(async () => {
        if (!await validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Yazdırma penceresi açılamadı');
            }

            // Print template with fixed dimensions and positions
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
                left: 5mm;
                top: 25mm;
                font-family: Arial;
                font-size: 12pt;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img class="qr-code" src="${previewData?.qrCode}" />
              <div class="stock-code">${formData.stockCode}</div>
            </div>
          </body>
        </html>
      `);

            printWindow.document.close();

            // Wait for QR code image to load before printing
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);

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
        } finally {
            setLoading(false);
        }
    }, [formData.stockCode, previewData, toast, validateForm]);

    return {
        formData,
        previewData,
        loading,
        error,
        updateFormData,
        handlePrint,
        validateForm,
    };
};