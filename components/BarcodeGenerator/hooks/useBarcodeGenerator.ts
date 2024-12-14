import { useState, useCallback } from 'react';
import { BarcodeFormData, PreviewData } from '../types';
import { generateQRCode } from '../utils/qrCodeGenerator';
import { calculatePositions } from '../utils/layoutCalculator';
import { validateFormData } from '../utils/validator';
import { useToast } from '@/hooks/use-toast';

const initialFormData: BarcodeFormData = {
    stockCode: '',
    paperWidth: 50,
    paperHeight: 30,
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
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
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
            const positions = calculatePositions(formData.paperWidth, formData.paperHeight);

            setPreviewData({
                qrCode,
                qrCodeSize: 20,
                qrCodePosition: positions.qrCode,
                textPosition: positions.text,
                stockCode: formData.stockCode,
                paperWidth: formData.paperWidth,
                paperHeight: formData.paperHeight,
            });

            return true;
        } catch (err) {
            setError('QR kod oluşturulurken bir hata oluştu');
            return false;
        } finally {
            setLoading(false);
        }
    }, [formData]);

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

            // Print template
            printWindow.document.write(`
        <html>
          <head>
            <title>Barkod Yazdır</title>
            <style>
              @page {
                size: ${formData.paperWidth}mm ${formData.paperHeight}mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .container {
                width: ${formData.paperWidth}mm;
                height: ${formData.paperHeight}mm;
                position: relative;
              }
              img.qr-code {
                position: absolute;
                width: 20mm;
                height: 20mm;
                left: ${(formData.paperWidth - 20) / 2}mm;
                top: 1mm;
              }
              .stock-code {
                position: absolute;
                left: ${(formData.paperWidth - 20) / 2 + 4}mm;
                top: 23mm;
                font-family: Arial;
                font-size: 10pt;
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
            printWindow.print();
            printWindow.close();

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
    }, [formData, previewData, toast, validateForm]);

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