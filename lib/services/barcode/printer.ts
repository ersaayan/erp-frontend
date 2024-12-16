import { BarcodeData, BarcodeTemplate } from './types';
import { generateBarcodeHTML, generateStyleSheet } from './generator';
import { validateBarcodeData } from './validator';
import { DEFAULT_TEMPLATE } from './template';

export class BarcodePrinter {
    private template: BarcodeTemplate;

    constructor(template: BarcodeTemplate = DEFAULT_TEMPLATE) {
        this.template = template;
    }

    async printBarcodes(barcodes: BarcodeData[]): Promise<void> {
        try {
            // Validate all barcodes first
            for (const barcode of barcodes) {
                const validationResult = validateBarcodeData(barcode);
                if (!validationResult.isValid) {
                    throw new Error(`Barkod doğrulama hatası: ${validationResult.message}`);
                }
            }

            // Generate HTML content for all barcodes
            let bodyContent = '';
            for (const barcode of barcodes) {
                const barcodeHtml = await generateBarcodeHTML(barcode, this.template);
                bodyContent += barcodeHtml;
            }

            // Create print window
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                throw new Error('Yazdırma penceresi açılamadı');
            }

            // Write content to print window
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Barkod Yazdır</title>
                        <style>${generateStyleSheet(this.template)}</style>
                    </head>
                    <body>${bodyContent}</body>
                </html>
            `);

            printWindow.document.close();

            // Wait for images to load before printing
            const images = printWindow.document.getElementsByTagName('img');
            let loadedImages = 0;

            const printWhenReady = () => {
                loadedImages++;
                if (loadedImages === images.length) {
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                }
            };

            if (images.length === 0) {
                printWindow.print();
                printWindow.close();
            } else {
                Array.from(images).forEach(img => {
                    if (img.complete) {
                        printWhenReady();
                    } else {
                        img.onload = printWhenReady;
                    }
                });
            }

        } catch (error) {
            throw new Error(`Yazdırma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
    }
}