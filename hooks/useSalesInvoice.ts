import { useState, useCallback } from 'react';
import { InvoiceFormData, StockItem } from '@/components/SalesInvoice/types';
import { PaymentDetails } from '@/components/SalesInvoice/PaymentSection/types';
import { useToast } from '@/hooks/use-toast';
import { useSalesInvoiceValidation } from './useSalesInvoiceValidation';

export const useSalesInvoice = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { validateForm } = useSalesInvoiceValidation();

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
            const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

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
                totalDebt: totalAmount - totalPaid,
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

            // Send request to API and wait for response
            const url = isEditMode
                ? `${process.env.BASE_URL}/invoices/sales/${invoiceData.id}`
                : `${process.env.BASE_URL}/invoices/sales`;

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

            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
            const responseText = await response.text();
            console.log('API Raw Response:', responseText);

            if (!response.ok) {
                throw new Error(`API Hatası: ${response.status} - ${responseText || 'Bilinmeyen hata'}`);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse hatası:', parseError);
                throw new Error(`API yanıtı geçerli bir JSON formatında değil. Yanıt: ${responseText}`);
            }

            if (!result) {
                throw new Error('API yanıtı boş');
            }

            toast({
                title: "Başarılı",
                description: isEditMode ? "Fatura başarıyla güncellendi" : "Fatura başarıyla kaydedildi",
                variant: "success",
            });

            return { success: true, data: result };
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