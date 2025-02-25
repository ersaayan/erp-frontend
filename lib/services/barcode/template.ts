import { BarcodeTemplate } from './types';

export const DEFAULT_TEMPLATE: BarcodeTemplate = {
    width: '50mm',
    height: '25mm',
    qrCodeSize: '15mm',
    qrCodePosition: {
        left: '31mm',
        top: '5mm'
    },
    fontFamily: 'Arial',
    fontSize: '9pt'
};