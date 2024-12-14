import { useState, useCallback } from 'react';
import { SearchResult } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useProductSearch = (warehouseId: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const searchProduct = useCallback(async (searchTerm: string): Promise<SearchResult | null> => {
        if (!warehouseId || !searchTerm) return null;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${process.env.BASE_URL}/stockcards/byWarehouse/search/${warehouseId}?query=${encodeURIComponent(searchTerm)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to search product');
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Ürün Bulunamadı",
                    description: "Arama kriterlerine uygun ürün bulunamadı",
                });
                return null;
            }

            // Return the first result
            return {
                id: data[0].id,
                productName: data[0].productName,
                productCode: data[0].productCode,
                unit: data[0].unit,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching';
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Ürün arama sırasında bir hata oluştu",
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, [warehouseId, toast]);

    return {
        searchProduct,
        loading,
        error,
    };
};