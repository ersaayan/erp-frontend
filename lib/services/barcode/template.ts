import { BarcodeTemplate } from './types';

export const DEFAULT_TEMPLATE: BarcodeTemplate = {
    width: '50mm',
    height: '25mm',
    qrCodeSize: '20mm',
    qrCodePosition: {
        left: '28mm',
        top: '2.5mm'
    },
    textPosition: {
        top: '8mm'
    },
    fontFamily: 'Arial',
    fontSize: '8pt'
};