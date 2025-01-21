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

export const useCashPaymentForm = (currentCode: string) => {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [vaultsResponse, branchesResponse] = await Promise.all([
                    fetch(`${process.env.BASE_URL}/vaults`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                            },
                            credentials: "include",
                        }),
                    fetch(`${process.env.BASE_URL}/branches`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                            },
                            credentials: "include",
                        }),
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
            debtAmount: 0,
            creditAmount: values.amount,
            movementType: 'Alacak',
            documentType: 'Devir',
            vaultDocumentType: 'General',
            paymentType: 'Kasa',
            branchCode: values.branchCode,
            vaultId: values.vaultId
        };

        const response = await fetch(`${process.env.BASE_URL}/currentMovements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to process cash payment');
        }
        // response.body is a ReadableStream, so we need to convert it to a JSON object
        const responseBody = await response.json();
        // Create vault movement
        const vaultMovementPayload = {
            vaultId: values.vaultId,
            description: `Cash payment to ${currentCode}${values.description ? ` - ${values.description}` : ''}`,
            entering: '0',
            emerging: values.amount,
            vaultDirection: 'Exit',
            vaultType: 'ReceivableTransfer',
            vaultDocumentType: 'General',
            currentMovementId: responseBody.id,
        };

        const vaultResponse = await fetch(`${process.env.BASE_URL}/vaultMovements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: 'include',
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