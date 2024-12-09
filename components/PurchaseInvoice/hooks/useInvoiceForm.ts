import { useState, useCallback } from 'react';
import { InvoiceFormData } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useInvoiceForm = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const generateInvoiceNumber = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.BASE_URL}/invoices/generateNumber`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to generate invoice number');
            }

            const data = await response.json();
            return data.invoiceNumber;
        } catch (error) {
            console.error('Error generating invoice number:', error);
            return '';
        }
    }, []);

    const validateForm = useCallback((data: InvoiceFormData) => {
        const errors: Partial<Record<keyof InvoiceFormData, string>> = {};

        if (!data.invoiceNo) errors.invoiceNo = 'Fatura numarası zorunludur';
        if (!data.gibInvoiceNo) errors.gibInvoiceNo = 'GİB numarası zorunludur';
        if (!data.branchCode) errors.branchCode = 'Şube seçimi zorunludur';
        if (!data.warehouseId) errors.warehouseId = 'Depo seçimi zorunludur';
        if (!data.current) errors.current = 'Cari seçimi zorunludur';

        return Object.keys(errors).length > 0 ? errors : null;
    }, []);

    return {
        loading,
        generateInvoiceNumber,
        validateForm,
    };
};