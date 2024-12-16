import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface StockSearchResult {
    id: string;
    productCode: string;
    productName: string;
    unit: string;
    stockCardPriceLists: Array<{
        price: string;
        vatRate: string;
        priceListId: string;
    }>;
}

export const useStockSearch = (selectedPriceListId?: string) => {
    const [results, setResults] = useState<StockSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const searchStocks = useCallback(async (query: string) => {
        if (query.length < 3) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.BASE_URL}/stockcards/search?query=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch stocks');
            }

            const data = await response.json();

            // Filter and transform results to include price list information
            const transformedResults = data.map((stock: StockSearchResult) => {
                const priceListItem = stock.stockCardPriceLists.find(
                    pl => pl.priceListId === selectedPriceListId
                );

                return {
                    ...stock,
                    price: priceListItem?.price || '0',
                    vatRate: priceListItem?.vatRate || '0'
                };
            });

            setResults(transformedResults);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to search stocks",
            });
            console.error(error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [selectedPriceListId, toast]);

    return {
        results,
        loading,
        searchStocks
    };
};