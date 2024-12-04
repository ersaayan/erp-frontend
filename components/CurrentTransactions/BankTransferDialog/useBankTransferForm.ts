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

export const useBankTransferForm = (currentCode: string) => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [banksResponse, branchesResponse] = await Promise.all([
                    fetch(`${process.env.BASE_URL}/banks`),
                    fetch(`${process.env.BASE_URL}/branches`),
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
            debtAmount: values.amount,
            creditAmount: 0,
            movementType: 'Alacak',
            documentType: 'Devir',
            bankDocumentType: 'General',
            paymentType: 'Banka',
            branchCode: values.branchCode,
            bankId: values.bankId
        };

        const response = await fetch(`${process.env.BASE_URL}/currentMovements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to process bank transfer');
        }

        // Create bank movement
        const bankMovementPayload = {
            bankId: values.bankId,
            description: `Bank transfer from ${currentCode}${values.description ? ` - ${values.description}` : ''}`,
            entering: values.amount,
            emerging: '0',
            bankDirection: 'Introduction',
            bankType: 'DebtTransfer',
            bankDocumentType: 'General',
        };

        const bankResponse = await fetch(`${process.env.BASE_URL}/bankMovements`, {
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