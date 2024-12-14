import { useState, useCallback, useEffect } from 'react';
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
    const [isQRCodeGenerated, setIsQRCodeGenerated] = useState(false);
    const { toast } = useToast();

    const updateFormData = useCallback((
        field: keyof BarcodeFormData,
        value: string | number
    ) => {
        if (field === 'stockCode') {
            setFormData(prev => ({ ...prev, [field]: value as string }));
            setError(null);
            setIsQRCodeGenerated(false); // Reset QR code status when stock code changes
            setPreviewData(null); // Clear preview when stock code changes
        }
    }, []);

    // Auto-generate QR code when stock code changes
    useEffect(() => {
        const generateQRCodeForStockCode = async () => {
            if (!formData.stockCode.trim()) {
                setPreviewData(null);
                setIsQRCodeGenerated(false);
                return;
            }

            const validationError = validateFormData(formData);
            if (validationError) {
                setError(validationError);
                setIsQRCodeGenerated(false);
                return;
            }

            try {
                setLoading(true);
                const qrCode = await generateQRCode(formData.stockCode);
                const positions = calculatePositions();

                setPreviewData({
                    qrCode,
                    qrCodeSize: 20,
                    qrCodePosition: positions.qrCode,
                    textPosition: positions.text,
                    stockCode: formData.stockCode,
                    paperWidth: 80,
                    paperHeight: 40,
                });
                setIsQRCodeGenerated(true);
                setError(null);
            } catch (err) {
                setError('QR kod oluşturulurken bir hata oluştu');
                setIsQRCodeGenerated(false);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            generateQRCodeForStockCode();
        }, 500); // Add debounce delay

        return () => clearTimeout(timeoutId);
    }, [formData.stockCode]);

    const handlePrint = useCallback(async () => {
        if (!isQRCodeGenerated || !previewData) {
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
              <img class="qr-code" src="${previewData.qrCode}" />
              <div class="stock-code">${formData.stockCode}</div>
            </div>
          </body>
        </html>
      `);

            printWindow.document.close();

            // Wait for QR code image to load before printing
            const img = new Image();
            img.src = previewData.qrCode;
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
        } finally {
            setLoading(false);
        }
    }, [formData.stockCode, previewData, isQRCodeGenerated, toast]);

    return {
        formData,
        previewData,
        loading,
        error,
        isQRCodeGenerated,
        updateFormData,
        handlePrint,
    };
};