import { useCallback } from 'react';
import { useBarcodeGenerator } from '@/components/BarcodeGenerator/hooks/useBarcodeGenerator';
import { Stock } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useBarcodeIntegration = () => {
    const { handlePrint } = useBarcodeGenerator();
    const { toast } = useToast();

    const printBarcode = useCallback(async (stock: Stock) => {
        if (!stock.code) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Stok kodu bulunamadı",
            });
            return;
        }

        try {
            await handlePrint();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Barkod yazdırma işlemi başarısız oldu",
            });
        }
    }, [handlePrint, toast]);

    return {
        printBarcode,
    };
};