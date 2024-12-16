import { BarcodeData, BarcodeValidationResult } from './types';

export const validateBarcodeData = (data: BarcodeData): BarcodeValidationResult => {
    if (!data.stockCode) {
        return {
            isValid: false,
            message: 'Stok kodu bulunamadı'
        };
    }

    if (!data.barcode) {
        return {
            isValid: false,
            message: 'Barkod bulunamadı'
        };
    }

    return {
        isValid: true
    };
};