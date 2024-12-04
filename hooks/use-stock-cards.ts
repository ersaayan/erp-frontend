import { useState, useEffect } from 'react';
import { StockCard } from '@/components/StockList/types';

export const useStockCards = () => {
    const [stockCards, setStockCards] = useState<StockCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStockCards = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.BASE_URL}/stockcards/stockCardsWithRelations`);
                if (!response.ok) {
                    throw new Error('Failed to fetch stock cards');
                }
                const data = await response.json();
                setStockCards(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching stock cards');
                console.error('Error fetching stock cards:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStockCards();
    }, []);

    return { stockCards, loading, error };
};