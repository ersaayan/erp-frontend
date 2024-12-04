import { useState, useEffect } from 'react';
import { Current } from '@/components/CurrentTransactions/types';

export const useCurrents = () => {
    const [currents, setCurrents] = useState<Current[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCurrents = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.BASE_URL}/currents`);
                if (!response.ok) {
                    throw new Error('Failed to fetch currents');
                }
                const data = await response.json();
                setCurrents(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching currents');
                console.error('Error fetching currents:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrents();
    }, []);

    return { currents, loading, error };
};