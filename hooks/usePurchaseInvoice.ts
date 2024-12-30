import { useState, useCallback } from 'react';
import { InvoiceFormData, StockItem } from '@/components/PurchaseInvoice/types';
import { PaymentDetails } from '@/components/PurchaseInvoice/PaymentSection/types';
import { useToast } from '@/hooks/use-toast';
import { usePurchaseInvoiceValidation } from './usePurchaseInvoiceValidation';

export const usePurchaseInvoice = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { validateForm } = usePurchaseInvoiceValidation();

    const handleSubmit = useCallback(async (
        invoiceData: InvoiceFormData,
        products: StockItem[],
        payments: PaymentDetails[],
        isEditMode: boolean = false
    ) => {
        try {
            setLoading(true);

            // Validate form data
            if (!validateForm(invoiceData, products, payments)) {
                return { success: false };
            }

            // Calculate totals
            const totalAmount = products.reduce((sum, product) => sum + product.totalAmount, 0);
            const totalVat = products.reduce((sum, product) => sum + product.vatAmount, 0);

            // Separate payments by method
            const totalPaid = payments
                .filter(payment => payment.method !== 'openAccount')
                .reduce((sum, payment) => sum + payment.amount, 0);

            const totalDebt = payments
                .filter(payment => payment.method === 'openAccount')
                .reduce((sum, payment) => sum + payment.amount, 0);

            // Prepare invoice data
            const invoicePayload = {
                invoiceNo: invoiceData.invoiceNo,
                gibInvoiceNo: invoiceData.gibInvoiceNo,
                invoiceDate: invoiceData.invoiceDate.toISOString(),
                paymentDate: invoiceData.paymentDate.toISOString(),
                paymentDay: invoiceData.paymentTerm,
                branchCode: invoiceData.branchCode,
                warehouseId: invoiceData.warehouseId,
                description: invoiceData.description,
                currentCode: invoiceData.current?.currentCode,
                priceListId: invoiceData.current?.priceList?.id,
                totalAmount,
                totalVat,
                totalPaid,
                totalDebt,
                items: products.map(product => ({
                    stockCardId: product.stockId,
                    quantity: product.quantity,
                    unitPrice: product.unitPrice,
                    vatRate: product.vatRate,
                    vatAmount: product.vatAmount,
                    totalAmount: product.totalAmount,
                    priceListId: product.priceListId,
                    currency: product.currency,
                })),
                payments: payments.map(payment => ({
                    method: payment.method,
                    accountId: payment.accountId,
                    amount: payment.amount,
                    currency: payment.currency,
                    description: payment.description,
                })),
            };

            // Send request to API
            const url = isEditMode
                ? `${process.env.BASE_URL}/invoices/purchase/${invoiceData.id}`
                : `${process.env.BASE_URL}/invoices/purchase`;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
                body: JSON.stringify(invoicePayload),
            });

            if (!response.ok) {
                throw new Error('Failed to save invoice');
            }

            toast({
                title: "Başarılı",
                description: isEditMode ? "Fatura başarıyla güncellendi" : "Fatura başarıyla kaydedildi",
                variant: "success",
            });

            return { success: true };
        } catch (error) {
            console.error('Error saving invoice:', error);
            toast({
                variant: "destructive",
                title: "Hata",
                description: error instanceof Error ? error.message : "Fatura kaydedilemedi",
            });
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [toast, validateForm]);

    return {
        loading,
        handleSubmit,
    };
};