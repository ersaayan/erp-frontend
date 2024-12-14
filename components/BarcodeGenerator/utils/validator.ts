import { BarcodeFormData } from '../types';

export const validateFormData = (data: BarcodeFormData): string | null => {
    if (!data.stockCode.trim()) {
        return 'Stok kodu zorunludur';
    }

    if (data.paperWidth < 20) {
        return 'Kağıt genişliği en az 20mm olmalıdır';
    }

    if (data.paperHeight < 30) {
        return 'Kağıt yüksekliği en az 30mm olmalıdır';
    }

    return null;
};