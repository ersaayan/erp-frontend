import { useState, useEffect, useCallback } from 'react';
import { currencyService } from '@/lib/services/currency';
import { Vault } from '../types';

interface FormValues {
    targetVaultId: string;
    amount: string;
    enableConversion: boolean;
}

export const useTransferForm = (sourceVaultId: string) => {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchVaults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.BASE_URL}/vaults`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                        credentials: 'include',
                    });
                if (response.ok) {
                    const data = await response.json();
                    setVaults(data);
                }
            } catch (error) {
                console.error('Error fetching vaults:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVaults();
    }, []);

    const handleSubmit = useCallback(async (values: FormValues) => {
        setIsLoading(true);
        try {
            const sourceVault = vaults.find(v => v.id === sourceVaultId);
            const targetVault = vaults.find(v => v.id === values.targetVaultId);

            if (!sourceVault || !targetVault) {
                throw new Error('Invalid vault selection');
            }

            let transferAmount = parseFloat(values.amount);

            // Handle currency conversion if needed
            if (values.enableConversion && sourceVault.currency !== targetVault.currency) {
                const rates = await currencyService.getExchangeRates();
                const sourceRate = sourceVault.currency === 'TRY' ? 1 :
                    sourceVault.currency === 'USD' ? rates.USD_TRY : rates.EUR_TRY;
                const targetRate = targetVault.currency === 'TRY' ? 1 :
                    targetVault.currency === 'USD' ? rates.USD_TRY : rates.EUR_TRY;

                transferAmount = (transferAmount * sourceRate) / targetRate;
            }

            const description = `Transfer from ${sourceVault.vaultName} to ${targetVault.vaultName}`;

            // Create withdrawal transaction
            const withdrawalResponse = await fetch(`${process.env.BASE_URL}/vaultMovements/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                    vaultId: sourceVaultId,
                    invoiceId: null,
                    receiptId: null,
                    description,
                    entering: 0,
                    emerging: values.amount,
                    vaultDirection: 'ReceivedVirement',
                    vaultType: 'OutgoingVirement',
                    vaultDocumentType: 'General'
                }),
            });

            if (!withdrawalResponse.ok) {
                throw new Error('Failed to process withdrawal');
            }

            // Create deposit transaction
            const depositResponse = await fetch(`${process.env.BASE_URL}/vaultMovements/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    vaultId: values.targetVaultId,
                    invoiceId: null,
                    receiptId: null,
                    description,
                    entering: transferAmount.toString(),
                    emerging: 0,
                    vaultDirection: 'ReceivedVirement',
                    vaultType: 'InGoingVirement',
                    vaultDocumentType: 'General'
                }),
            });

            if (!depositResponse.ok) {
                throw new Error('Failed to process deposit');
            }

            // Trigger refresh
            window.dispatchEvent(new CustomEvent('refreshVaultOperations'));

        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [sourceVaultId, vaults]);

    return {
        vaults,
        isLoading,
        handleSubmit,
    };
};