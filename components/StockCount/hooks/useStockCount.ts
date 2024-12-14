import { useState, useCallback } from 'react';
import { CountedProduct } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useStockCount = () => {
    const [countedProducts, setCountedProducts] = useState<CountedProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const addProduct = useCallback((product: CountedProduct) => {
        setCountedProducts(current => {
            const existingProduct = current.find(p => p.id === product.id);

            if (existingProduct) {
                return current.map(p =>
                    p.id === product.id
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                );
            }

            return [...current, { ...product, quantity: 1 }];
        });
    }, []);

    const updateProductQuantity = useCallback((productId: string, quantity: number) => {
        setCountedProducts(current =>
            current.map(product =>
                product.id === productId
                    ? { ...product, quantity }
                    : product
            )
        );
    }, []);

    const removeProduct = useCallback((productId: string) => {
        setCountedProducts(current =>
            current.filter(product => product.id !== productId)
        );
    }, []);

    const submitCount = useCallback(async (warehouseId: string) => {
        try {
            setLoading(true);

            const response = await fetch(`${process.env.BASE_URL}/warehouses/stoktake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                    warehouseId,
                    products: countedProducts.map(product => ({
                        stockCardId: product.id,
                        quantity: product.quantity
                    }))
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit stock count');
            }

            toast({
                title: "Başarılı",
                description: "Stok sayımı başarıyla kaydedildi",
            });

            // Clear the counted products after successful submission
            setCountedProducts([]);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Stok sayımı kaydedilirken bir hata oluştu",
            });
        } finally {
            setLoading(false);
        }
    }, [countedProducts, toast]);

    return {
        countedProducts,
        loading,
        addProduct,
        updateProductQuantity,
        removeProduct,
        submitCount,
    };
};