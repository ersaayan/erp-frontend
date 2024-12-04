import { useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import { Current } from '@/components/CurrentList/types';

export const useCustomerSearch = () => {
    const [results, setResults] = useState<Current[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const searchCustomers = useCallback(async (query: string) => {
        try {
            setLoading(true);
            const endpoint = query.length >= 3
                ? `${process.env.BASE_URL}/currents/search?query=${encodeURIComponent(query)}`
                : `${process.env.BASE_URL}/currents`;

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }

            const data = await response.json();
            setResults(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to search customers",
            });
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    return {
        results,
        loading,
        searchCustomers
    };
};