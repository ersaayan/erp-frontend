import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateQRCode } from '@/components/BarcodeGenerator/utils/qrCodeGenerator';
import { StockCard } from '../types';

export const useBulkPrint = () => {
    const [printLoading, setPrintLoading] = useState(false);
    const { toast } = useToast();

    const handleBulkPrint = useCallback(async (selectedStocks: StockCard[]) => {
        if (selectedStocks.length === 0) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Yazdırılacak stok bulunamadı.",
            });
            return;
        }

        try {
            setPrintLoading(true);

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Yazdırma penceresi açılamadı');
            }

            // Her stok için QR kod oluştur
            const stockElements = await Promise.all(
                selectedStocks.map(async (stock) => {
                    const qrCode = await generateQRCode(stock.productCode);
                    const formattedStockCode = stock.productCode.split('/').join('\n');
                    return `
                        <div class="container">
                            <img class="qr-code" src="${qrCode}" />
                            <div class="stock-code">${formattedStockCode}</div>
                        </div>
                    `;
                })
            );

            // HTML şablonunu oluştur
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
                                page-break-after: always;
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
                        ${stockElements.join('')}
                    </body>
                </html>
            `);

            printWindow.document.close();

            // Görsellerin yüklenmesini bekle
            await new Promise((resolve) => {
                const images = printWindow.document.getElementsByTagName('img');
                let loadedImages = 0;
                const totalImages = images.length;

                if (totalImages === 0) {
                    resolve(null);
                    return;
                }

                Array.from(images).forEach((img) => {
                    if (img.complete) {
                        loadedImages++;
                        if (loadedImages === totalImages) resolve(null);
                    } else {
                        img.onload = () => {
                            loadedImages++;
                            if (loadedImages === totalImages) resolve(null);
                        };
                        img.onerror = () => {
                            loadedImages++;
                            if (loadedImages === totalImages) resolve(null);
                        };
                    }
                });
            });

            // Yazdırma işlemini başlat
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);

            toast({
                title: "Başarılı",
                description: `${selectedStocks.length} adet barkod yazdırma işlemi başlatıldı`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: error instanceof Error ? error.message : "Barkod yazdırma işlemi başlatılırken bir hata oluştu",
            });
        } finally {
            setPrintLoading(false);
        }
    }, [toast]);

    return {
        printLoading,
        handleBulkPrint,
    };
};