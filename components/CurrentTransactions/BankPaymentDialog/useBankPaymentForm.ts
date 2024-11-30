import { useState, useEffect, useCallback } from 'react';

interface Bank {
    id: string;
    bankName: string;
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
    bankId: string;
    branchCode: string;
    description?: string;
}

export const useBankPaymentForm = (currentCode: string) => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [banksResponse, branchesResponse] = await Promise.all([
                    fetch('http://localhost:1303/banks'),
                    fetch('http://localhost:1303/branches'),
                ]);

                if (banksResponse.ok) {
                    const banksData = await banksResponse.json();
                    setBanks(banksData);
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
            movementType: 'Borc',
            documentType: 'Devir',
            bankDocumentType: 'General',
            paymentType: 'Banka',
            branchCode: values.branchCode,
            bankId: values.bankId
        };

        const response = await fetch('http://localhost:1303/currentMovements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to process bank payment');
        }

        // Create bank movement
        const bankMovementPayload = {
            bankId: values.bankId,
            description: `Bank payment to ${currentCode}${values.description ? ` - ${values.description}` : ''}`,
            entering: '0',
            emerging: values.amount,
            bankDirection: 'Exit',
            bankType: 'ReceivableTransfer',
            bankDocumentType: 'General',
        };

        const bankResponse = await fetch('http://localhost:1303/bankMovements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bankMovementPayload),
        });

        if (!bankResponse.ok) {
            throw new Error('Failed to create bank movement');
        }

        // Trigger refresh events
        window.dispatchEvent(new CustomEvent('refreshCurrentMovements'));
        window.dispatchEvent(new CustomEvent('refreshBankOperations'));

    }, [currentCode]);

    return {
        banks,
        branches,
        isLoading,
        handleSubmit,
    };
};