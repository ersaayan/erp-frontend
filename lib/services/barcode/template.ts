import { BarcodeTemplate } from './types';

export const DEFAULT_TEMPLATE: BarcodeTemplate = {
    width: '50mm',
    height: '25mm',
    qrCodeSize: '20mm',
    qrCodePosition: {
        left: '29mm',
        top: '2.5mm'
    },
    fontFamily: 'Arial',
    fontSize: '9pt'
};