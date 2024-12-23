import { BarcodeTemplate } from './types';

export const DEFAULT_TEMPLATE: BarcodeTemplate = {
    width: '80mm',
    height: '35mm',
    qrCodeSize: '20mm',
    qrCodePosition: {
        left: '30mm',
        top: '3mm'
    },
    textPosition: {
        top: '25mm'
    },
    fontFamily: 'Arial',
    fontSize: '10pt',
    bold: true
};