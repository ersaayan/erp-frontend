'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCurrents } from './hooks/useCurrents';
import { useBrands } from './hooks/useBrands';
import { useStockForm } from './hooks/useStockForm';

interface Manufacturer {
    id: number;
    currentId: string;
    stockName: string;
    code: string;
    barcode: string;
    brandId: string;
}

const StockManufacturers: React.FC = () => {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const { currents, loading: currentsLoading, error: currentsError } = useCurrents();
    const { brands, loading: brandsLoading, error: brandsError } = useBrands();
    const { formState, updateManufacturers } = useStockForm();

    useEffect(() => {
        // Initialize manufacturers from formState if available
        if (formState.manufacturers.length > 0) {
            setManufacturers(formState.manufacturers.map((m, index) => ({
                id: index + 1,
                currentId: m.currentId,
                stockName: m.productName,
                code: m.productCode,
                barcode: m.barcode,
                brandId: m.brandId
            })));
        }
    }, [formState.manufacturers]);

    const addManufacturer = () => {
        const newManufacturer: Manufacturer = {
            id: Date.now(),
            currentId: '',
            stockName: '',
            code: '',
            barcode: '',
            brandId: '',
        };
        const updatedManufacturers = [...manufacturers, newManufacturer];
        setManufacturers(updatedManufacturers);
        updateFormState(updatedManufacturers);
    };

    const removeManufacturer = (id: number) => {
        const updatedManufacturers = manufacturers.filter(m => m.id !== id);
        setManufacturers(updatedManufacturers);
        updateFormState(updatedManufacturers);
    };

    const updateManufacturer = (id: number, field: keyof Manufacturer, value: string) => {
        const updatedManufacturers = manufacturers.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        );
        setManufacturers(updatedManufacturers);
        updateFormState(updatedManufacturers);
    };

    const updateFormState = (manufacturers: Manufacturer[]) => {
        updateManufacturers(manufacturers.map(m => ({
            productCode: m.code,
            productName: m.stockName,
            barcode: m.barcode,
            brandId: m.brandId,
            currentId: m.currentId
        })));
    };

    if (currentsLoading || brandsLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (currentsError || brandsError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{currentsError || brandsError}</AlertDescription>
            </Alert>
        );
    }

    if (currents.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    İthalat, İthalat/İhracat veya Tedarikçi tipinde cari bulunamadı.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4 p-4">
            {manufacturers.map((manufacturer, index) => (
                <Card key={manufacturer.id} className="relative">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Üretici {index + 1}</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeManufacturer(manufacturer.id)}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                                <span className="ml-2">Sil</span>
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Select
                                    value={manufacturer.currentId}
                                    onValueChange={(value) => updateManufacturer(manufacturer.id, 'currentId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Cari seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currents.map((current) => (
                                            <SelectItem key={current.id} value={current.id}>
                                                {current.currentName} ({current.currentCode}) - {current.currentType}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Input
                                        placeholder="Stok Adı"
                                        value={manufacturer.stockName}
                                        onChange={(e) => updateManufacturer(manufacturer.id, 'stockName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder="Kod"
                                        value={manufacturer.code}
                                        onChange={(e) => updateManufacturer(manufacturer.id, 'code', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder="Barkod"
                                        value={manufacturer.barcode}
                                        onChange={(e) => updateManufacturer(manufacturer.id, 'barcode', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Select
                                    value={manufacturer.brandId}
                                    onValueChange={(value) => updateManufacturer(manufacturer.id, 'brandId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Marka seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.brandName} ({brand.brandCode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button
                className="w-full"
                variant="outline"
                onClick={addManufacturer}
            >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Üretici Ekle
            </Button>
        </div>
    );
};

export default StockManufacturers;