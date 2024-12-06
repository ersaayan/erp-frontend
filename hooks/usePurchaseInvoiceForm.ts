import { useState, useCallback } from 'react';
import { Current } from '@/components/CurrentList/types';
import { StockItem } from '@/components/PurchaseInvoice/types';
import { PaymentDetails } from '@/components/PurchaseInvoice/PaymentSection/types';

interface PurchaseInvoiceData {
    faturaBilgileri: {
        invoiceNo: string;
        gibInvoiceNo: string;
        invoiceDate: Date;
        paymentDate: Date;
        paymentTerm: number;
        branchCode: string;
        warehouseId: string;
        description: string;
        current: Current | null;
    };
    kalemler: StockItem[];
    odemeBilgileri: PaymentDetails[];
}

interface ValidationErrors {
    faturaBilgileri?: {
        [key: string]: string;
    };
    kalemler?: string;
    odemeBilgileri?: string;
}

export const usePurchaseInvoiceForm = () => {
    const [formData, setFormData] = useState<PurchaseInvoiceData>({
        faturaBilgileri: {
            invoiceNo: '',
            gibInvoiceNo: '',
            invoiceDate: new Date(),
            paymentDate: new Date(),
            paymentTerm: 0,
            branchCode: '',
            warehouseId: '',
            description: '',
            current: null,
        },
        kalemler: [],
        odemeBilgileri: [],
    });

    const validateForm = useCallback((): ValidationErrors | null => {
        const errors: ValidationErrors = {};

        // Validate faturaBilgileri
        const faturaBilgileriErrors: { [key: string]: string } = {};
        if (!formData.faturaBilgileri.invoiceNo) {
            faturaBilgileriErrors.invoiceNo = 'Fatura numarası zorunludur';
        }
        if (!formData.faturaBilgileri.gibInvoiceNo) {
            faturaBilgileriErrors.gibInvoiceNo = 'GİB numarası zorunludur';
        }
        if (!formData.faturaBilgileri.branchCode) {
            faturaBilgileriErrors.branchCode = 'Şube seçimi zorunludur';
        }
        if (!formData.faturaBilgileri.warehouseId) {
            faturaBilgileriErrors.warehouseId = 'Depo seçimi zorunludur';
        }
        if (!formData.faturaBilgileri.current) {
            faturaBilgileriErrors.current = 'Cari seçimi zorunludur';
        }

        if (Object.keys(faturaBilgileriErrors).length > 0) {
            errors.faturaBilgileri = faturaBilgileriErrors;
        }

        // Validate kalemler
        if (formData.kalemler.length === 0) {
            errors.kalemler = 'En az bir ürün eklenmeli';
        }

        // Validate odemeBilgileri
        if (formData.odemeBilgileri.length === 0) {
            errors.odemeBilgileri = 'En az bir ödeme eklenmeli';
        }

        return Object.keys(errors).length > 0 ? errors : null;
    }, [formData]);

    const updateFaturaBilgileri = useCallback((field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            faturaBilgileri: {
                ...prev.faturaBilgileri,
                [field]: value,
            },
        }));
    }, []);

    const updateKalemler = useCallback((items: StockItem[]) => {
        setFormData(prev => ({
            ...prev,
            kalemler: items,
        }));
    }, []);

    const updateOdemeBilgileri = useCallback((payments: PaymentDetails[]) => {
        setFormData(prev => ({
            ...prev,
            odemeBilgileri: payments,
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
        const errors = validateForm();
        if (errors) {
            console.error('Form validation errors:', errors);
            return { success: false, errors };
        }

        // Log the complete form data
        console.log('Form Data:', JSON.stringify(formData, null, 2));

        return { success: true, data: formData };
    }, [formData, validateForm]);

    return {
        formData,
        updateFaturaBilgileri,
        updateKalemler,
        updateOdemeBilgileri,
        handleSubmit,
        validateForm,
    };
};