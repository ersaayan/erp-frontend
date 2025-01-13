/* eslint-disable @typescript-eslint/no-unused-vars */
import { generateQRCode } from "@/components/BarcodeGenerator/utils/qrCodeGenerator";
import { BarcodeData, BarcodeTemplate } from "./types";
import { DEFAULT_TEMPLATE } from "./template";

export const generateBarcodeHTML = async (
    data: BarcodeData,
    template: BarcodeTemplate = DEFAULT_TEMPLATE
): Promise<string> => {
    const qrCode = await generateQRCode(data.stockCode);
    const formattedStockCode = data.stockCode.split("/").join("\n");

    return `
        <div class="page-container">
            <div class="barcode-container">
                <img class="qr-code" src="${qrCode}" />
                <div class="stock-code">${formattedStockCode}</div>
            </div>
        </div>
    `;
};

export const generateStyleSheet = (template: BarcodeTemplate = DEFAULT_TEMPLATE): string => {
    return `
        @page {
            size: ${template.width} ${template.height};
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
        }
        .page-container {
            page-break-after: always;
            page-break-inside: avoid;
            height: ${template.height};
            width: ${template.width};
        }
        .barcode-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        .qr-code {
            position: absolute;
            width: ${template.qrCodeSize};
            height: ${template.qrCodeSize};
            left: ${template.qrCodePosition.left};
            top: ${template.qrCodePosition.top};
        }
        .stock-code {
            position: absolute;
            width: 100%;
            top: ${template.textPosition.top};
            text-align: center;
            font-family: ${template.fontFamily};
            font-size: ${template.fontSize};
            font-weight: bold;
            white-space: pre-line;
        }
    `;
};