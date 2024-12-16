import { BarcodeData, BarcodeValidationResult } from './types';

export const validateBarcodeData = (data: BarcodeData): BarcodeValidationResult => {
    if (!data.stockCode) {
        return {
            isValid: false,
            message: 'Stok kodu bulunamadı'
        };
    }

    return {
        isValid: true
    };
};