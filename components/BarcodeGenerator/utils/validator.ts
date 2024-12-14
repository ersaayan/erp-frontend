import { BarcodeFormData } from '../types';

export const validateFormData = (data: BarcodeFormData): string | null => {
    if (!data.stockCode.trim()) {
        return 'Stok kodu zorunludur';
    }

    // Paper dimensions are now fixed, so we don't need to validate them
    return null;
};