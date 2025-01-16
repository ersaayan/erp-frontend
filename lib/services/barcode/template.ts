import { BarcodeTemplate } from './types';

export const DEFAULT_TEMPLATE: BarcodeTemplate = {
    width: '50mm',
    height: '25mm',
    qrCodeSize: '15mm',
    qrCodePosition: {
        left: '33mm',
        top: '5mm'
    },
    textPosition: {
        top: '10mm'
    },
    fontFamily: 'Arial',
    fontSize: '10pt'
};