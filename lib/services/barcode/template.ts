import { BarcodeTemplate } from './types';

export const DEFAULT_TEMPLATE: BarcodeTemplate = {
    width: '50mm',
    height: '25mm',
    qrCodeSize: '20mm',
    qrCodePosition: {
        left: 'calc(50mm - 16mm)',
        top: '2.5mm'
    },
    textPosition: {
        top: '5mm'
    },
    fontFamily: 'Arial',
    fontSize: '10pt'
};