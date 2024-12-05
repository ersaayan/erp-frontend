import { useState, useEffect, useCallback } from 'react';

interface Invoice {
    id: string;
    invoiceNo: string;
    invoiceType: string;
}

interface Receipt {
    id: string;
    documentNo: string;
    receiptType: string;
}

interface FormValues {
    amount: string;
    description: string;
    documentType: 'General' | 'Official' | 'Accounting';
    entryType: string;
    invoiceId: string | null;
    receiptId: string | null;
}

const ENTRY_TYPES = {
    income: [
        { value: 'DebtTransfer', label: 'Borç Tahsilatı' },
        { value: 'ServiceChargeCollection', label: 'Hizmet/Masraf Tahsilatı' },
        { value: 'CompanyCreditCardWithdrawals', label: 'Şirket Kredi Kartı Çekimi' },
        { value: 'BuyingForeignCurrency', label: 'Döviz Alış' },
        { value: 'InputReceipt', label: 'Gelir Makbuzu' },
        { value: 'BankWithdrawals', label: 'Banka Çekimi' },
        { value: 'ReceivingValuableAssets', label: 'Kıymetli Varlık Alımı' },
    ],
    expense: [
        { value: 'ReceivableTransfer', label: 'Alacak Ödemesi' },
        { value: 'ServiceChargePayment', label: 'Hizmet/Masraf Ödemesi' },
        { value: 'CompanyCreditCardDeposit', label: 'Şirket Kredi Kartı Yatırma' },
        { value: 'CurrencyExchange', label: 'Döviz Satış' },
        { value: 'LoanPayment', label: 'Kredi Ödemesi' },
        { value: 'ExitReceipt', label: 'Gider Makbuzu' },
        { value: 'PaymentToBank', label: 'Banka Yatırma' },
        { value: 'PreciousMetalExchange', label: 'Kıymetli Varlık Satışı' },
    ],
};

export const useCashTransactionForm = (vaultId: string, type: 'income' | 'expense') => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [invoicesResponse, receiptsResponse] = await Promise.all([
                    fetch(`${process.env.BASE_URL}/invoices/`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                            },
                            credentials: "include",
                        }),
                    fetch(`${process.env.BASE_URL}/receipts/`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                            },
                            credentials: "include",
                        }),
                ]);

                if (invoicesResponse.ok) {
                    const invoicesData = await invoicesResponse.json();
                    setInvoices(invoicesData);
                }

                if (receiptsResponse.ok) {
                    const receiptsData = await receiptsResponse.json();
                    setReceipts(receiptsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = useCallback(async (values: FormValues) => {
        const payload = {
            vaultId,
            invoiceId: values.invoiceId,
            receiptId: values.receiptId,
            description: values.description,
            entering: type === 'income' ? values.amount : '0',
            emerging: type === 'expense' ? values.amount : '0',
            vaultDirection: type === 'income' ? 'Introduction' : 'Exit',
            vaultType: values.entryType,
            vaultDocumentType: values.documentType,
        };

        const response = await fetch(`${process.env.BASE_URL}/vaultMovements/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to create transaction');
        }

        // Trigger a refresh event
        window.dispatchEvent(new CustomEvent('refreshVaultOperations'));
    }, [vaultId, type]);

    return {
        invoices,
        receipts,
        entryTypes: ENTRY_TYPES[type],
        isLoading,
        handleSubmit,
    };
};