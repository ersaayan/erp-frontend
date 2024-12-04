import { useState, useEffect, useCallback } from 'react';

export interface PriceList {
    id: string;
    priceListName: string;
    currency: string;
    isVatIncluded: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}

export const usePriceLists = () => {
    const [priceLists, setPriceLists] = useState<PriceList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPriceLists = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.BASE_URL}/priceLists`);
            const data: PriceList[] = await response.json();

            // Filter active price lists
            const activePriceLists = data.filter(list => list.isActive);
            setPriceLists(activePriceLists);
            setError(null);
        } catch (err) {
            setError('Fiyat listeleri yüklenirken bir hata oluştu');
            console.error('Error fetching price lists:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPriceLists();
    }, [fetchPriceLists]);

    return { priceLists, loading, error, fetchPriceLists };
};