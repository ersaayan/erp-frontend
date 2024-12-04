import { useState, useEffect, useCallback } from 'react';

interface Pos {
    id: string;
    posName: string;
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
    posId: string;
    branchCode: string;
    description?: string;
}

export const usePosCollectionForm = (currentCode: string) => {
    const [posDevices, setPosDevices] = useState<Pos[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [posResponse, branchesResponse] = await Promise.all([
                    fetch(`${process.env.BASE_URL}/pos`),
                    fetch(`${process.env.BASE_URL}/branches`),
                ]);

                if (posResponse.ok) {
                    const posData = await posResponse.json();
                    setPosDevices(posData);
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
            posDocumentType: 'General',
            paymentType: 'POS',
            branchCode: values.branchCode,
            posId: values.posId
        };

        const response = await fetch(`${process.env.BASE_URL}/currentMovements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to process POS payment');
        }

        // Create POS movement
        const posMovementPayload = {
            posId: values.posId,
            description: `POS payment from ${currentCode}${values.description ? ` - ${values.description}` : ''}`,
            entering: values.amount,
            emerging: '0',
            posDirection: 'Introduction',
            posType: 'DebtTransfer',
            posDocumentType: 'General',
        };

        const posResponse = await fetch(`${process.env.BASE_URL}/posMovements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(posMovementPayload),
        });

        if (!posResponse.ok) {
            throw new Error('Failed to create POS movement');
        }

        // Trigger refresh events
        window.dispatchEvent(new CustomEvent('refreshCurrentMovements'));
        window.dispatchEvent(new CustomEvent('refreshPosOperations'));

    }, [currentCode]);

    return {
        posDevices,
        branches,
        isLoading,
        handleSubmit,
    };
};