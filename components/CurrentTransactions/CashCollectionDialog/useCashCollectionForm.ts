import { useState, useEffect, useCallback } from 'react';

interface Vault {
    id: string;
    vaultName: string;
    currency: string;
}

interface Branch {
    id: string;
    branchName: string;
    branchCode: string;
}

interface FormValues {
    paymentDate: Date;
    amount: string;
    vaultId: string;
    branchCode: string;
    description?: string;
}

export const useCashCollectionForm = (currentCode: string) => {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [vaultsResponse, branchesResponse] = await Promise.all([
                    fetch('http://localhost:1303/vaults'),
                    fetch('http://localhost:1303/branches'),
                ]);

                if (vaultsResponse.ok) {
                    const vaultsData = await vaultsResponse.json();
                    setVaults(vaultsData);
                }

                if (branchesResponse.ok) {
                    const branchesData = await branchesResponse.json();
                    setBranches(branchesData);
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
            currentCode,
            dueDate: values.paymentDate.toISOString(),
            description: values.description || '',
            debtAmount: values.amount,
            creditAmount: 0,
            movementType: 'Alacak',
            documentType: 'Devir',
            vaultDocumentType: 'General',
            paymentType: 'Kasa',
            branchCode: values.branchCode,
            vaultId: values.vaultId
        };


        const response = await fetch('http://localhost:1303/currentMovements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to process cash collection');
        }

        // Create vault movement
        const vaultMovementPayload = {
            vaultId: values.vaultId,
            description: `Cash collection from ${currentCode}${values.description ? ` - ${values.description}` : ''}`,
            entering: values.amount,
            emerging: '0',
            vaultDirection: 'Introduction',
            vaultType: 'DebtTransfer',
            vaultDocumentType: 'General',
        };

        const vaultResponse = await fetch('http://localhost:1303/vaultMovements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vaultMovementPayload),
        });

        if (!vaultResponse.ok) {
            throw new Error('Failed to create vault movement');
        }

        // Trigger refresh events
        window.dispatchEvent(new CustomEvent('refreshCurrentMovements'));
        window.dispatchEvent(new CustomEvent('refreshVaultOperations'));

    }, [currentCode]);

    return {
        vaults,
        branches,
        isLoading,
        handleSubmit,
    };
};