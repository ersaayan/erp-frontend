import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Current } from "@/components/CurrentList/types";

interface StockCardWarehouse {
    warehouseId: string;
    quantity: string;
    warehouse: {
        id: string;
        warehouseName: string;
    };
}

interface ProcessedProduct {
    id: string;
    productCode: string;
    productName: string;
    unit: string;
    price: number;
    vatRate: number;
    currency: string;
    stockCardWarehouse: StockCardWarehouse[];
}

export const useProductPricing = (customer: Current | null) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const processProduct = useCallback((product: any): ProcessedProduct => {
        // Find matching price list for customer
        const matchingPriceList = customer?.priceListId
            ? product.stockCardPriceLists?.find(
                (pl: any) => pl.priceListId === customer.priceListId
            )
            : null;

        // Use matching price list or first available price list
        const priceList = matchingPriceList || product.stockCardPriceLists?.[0];

        return {
            id: product.id,
            productCode: product.productCode,
            productName: product.productName,
            unit: product.unit,
            price: priceList ? parseFloat(priceList.price) : 0,
            vatRate: priceList ? parseFloat(priceList.vatRate || "0") : 0,
            currency: priceList?.priceList?.currency || "TRY",
            stockCardWarehouse: product.stockCardWarehouse || [],
        };
    }, [customer?.priceListId]);

    const fetchProducts = useCallback(
        async (searchTerm?: string) => {
            try {
                setLoading(true);

                // Use stockCardsWithRelations endpoint for full data
                const endpoint = searchTerm
                    ? `${process.env.BASE_URL}/stockcards/search?query=${encodeURIComponent(
                        searchTerm
                    )}`
                    : `${process.env.BASE_URL}/stockcards/stockCardsWithRelations`;

                const response = await fetch(endpoint,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                        },
                        credentials: "include",
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();
                return data.map((product: any) => processProduct(product));
            } catch (error) {
                console.error("Error fetching products:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                        error instanceof Error
                            ? error.message
                            : "Failed to fetch product data",
                });
                return [];
            } finally {
                setLoading(false);
            }
        },
        [processProduct, toast]
    );

    return {
        fetchProducts,
        loading,
    };
};