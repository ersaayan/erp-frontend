import { useState, useEffect, useCallback } from 'react';
import { currencyService } from '@/lib/services/currency';
import { Bank } from '../types';

interface FormValues {
    targetBankId: string;
    amount: string;
    enableConversion: boolean;
}

export const useTransferForm = (sourceBankId: string) => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBanks = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.BASE_URL}/banks`);
                if (response.ok) {
                    const data = await response.json();
                    setBanks(data);
                }
            } catch (error) {
                console.error('Error fetching banks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBanks();
    }, []);

    const handleSubmit = useCallback(async (values: FormValues) => {
        setIsLoading(true);
        try {
            const sourceBank = banks.find(v => v.id === sourceBankId);
            const targetBank = banks.find(v => v.id === values.targetBankId);

            if (!sourceBank || !targetBank) {
                throw new Error('Invalid bank selection');
            }

            let transferAmount = parseFloat(values.amount);

            // Handle currency conversion if needed
            if (values.enableConversion && sourceBank.currency !== targetBank.currency) {
                const rates = await currencyService.getExchangeRates();
                const sourceRate = sourceBank.currency === 'TRY' ? 1 :
                    sourceBank.currency === 'USD' ? rates.USD_TRY : rates.EUR_TRY;
                const targetRate = targetBank.currency === 'TRY' ? 1 :
                    targetBank.currency === 'USD' ? rates.USD_TRY : rates.EUR_TRY;

                transferAmount = (transferAmount * sourceRate) / targetRate;
            }

            const description = `Transfer from ${sourceBank.bankName} to ${targetBank.bankName}`;

            // Create withdrawal transaction
            const withdrawalResponse = await fetch(`${process.env.BASE_URL}/bankMovements/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bankId: sourceBankId,
                    invoiceId: null,
                    receiptId: null,
                    description,
                    entering: 0,
                    emerging: values.amount,
                    bankDirection: 'ReceivedVirement',
                    bankType: 'OutgoingVirement',
                    bankDocumentType: 'General'
                }),
            });

            if (!withdrawalResponse.ok) {
                throw new Error('Failed to process withdrawal');
            }

            // Create deposit transaction
            const depositResponse = await fetch(`${process.env.BASE_URL}/bankMovements/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bankId: values.targetBankId,
                    invoiceId: null,
                    receiptId: null,
                    description,
                    entering: transferAmount.toString(),
                    emerging: 0,
                    bankDirection: 'ReceivedVirement',
                    bankType: 'InGoingVirement',
                    bankDocumentType: 'General'
                }),
            });

            if (!depositResponse.ok) {
                throw new Error('Failed to process deposit');
            }

            // Trigger refresh
            window.dispatchEvent(new CustomEvent('refreshBankOperations'));

        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [sourceBankId, banks]);

    return {
        banks,
        isLoading,
        handleSubmit,
    };
};