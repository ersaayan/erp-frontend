import { useState, useCallback } from 'react';
import { StockCard } from '../types';
import { useToast } from '@/hooks/use-toast';
import { currencyService } from '@/lib/services/currency';

export const useStockList = () => {
    const [stockData, setStockData] = useState<StockCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exchangeRates, setExchangeRates] = useState<{
        USD_TRY: number;
        EUR_TRY: number;
    } | null>(null);
    const [selectedStocks, setSelectedStocks] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const savedStocks = localStorage.getItem('selectedStocks');
            return savedStocks ? JSON.parse(savedStocks) : [];
        }
        return [];
    });
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Önce localStorage'dan seçili stokları al
            const savedStocks = localStorage.getItem('selectedStocks');
            if (savedStocks) {
                setSelectedStocks(JSON.parse(savedStocks));
            }
            const [stockResponse, ratesResponse] = await Promise.all([
                fetch(`${process.env.BASE_URL}/stockcards/stockCardsWithRelations`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    credentials: "include",
                }),
                currencyService.getExchangeRates(),
            ]);

            if (!stockResponse.ok) {
                throw new Error("Failed to fetch stock data");
            }

            const data = await stockResponse.json();
            setStockData(data);
            setExchangeRates(ratesResponse);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while fetching data");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch stock data. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const handleDeleteSelected = useCallback(async (selectedRowKeys: string[]) => {
        if (selectedRowKeys.length === 0) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Lütfen silmek için en az bir stok seçin.",
            });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.BASE_URL}/stockcards/deleteManyStockCardsWithRelations/`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                    credentials: "include",
                    body: JSON.stringify({ ids: selectedRowKeys }),
                }
            );

            if (!response.ok) {
                throw new Error("Silme işlemi başarısız oldu.");
            }

            toast({
                title: "Başarılı",
                description: "Seçili stoklar başarıyla silindi.",
            });

            await fetchData();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.",
            });
        } finally {
            setLoading(false);
        }
    }, [fetchData, toast]);

    return {
        stockData,
        loading,
        error,
        exchangeRates,
        selectedStocks,
        setSelectedStocks,
        fetchData,
        handleDeleteSelected,
    };
};