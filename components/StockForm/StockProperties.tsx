'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAttributes } from './hooks/useAttributes';
import { useStockForm } from './hooks/useStockForm';
import { useToast } from '@/hooks/use-toast';
import PropertyValueDialog from './PropertyValueDialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';

interface SelectedProperty {
    attributeId: string;
    propertyName: string;
    selectedValues: string[];
}

interface StockPropertiesProps {
    selectedProperties: SelectedProperty[];
    setSelectedProperties: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}

const StockProperties: React.FC<StockPropertiesProps> = ({ selectedProperties, setSelectedProperties }) => {
    const { toast } = useToast();
    const { attributes, loading, error } = useAttributes();
    const [valueDialogOpen, setValueDialogOpen] = useState(false);
    const [activeAttributeId, setActiveAttributeId] = useState<string | null>(null);
    const { formState, updateAttributes } = useStockForm();

    // Benzersiz attributeId'leri çıkarın
    const uniqueAttributeIds = Array.from(new Set(attributes.map(attr => attr.id)));

    // Form durumundan özellikleri başlatın
    useEffect(() => {
        if (
            !loading &&
            attributes.length > 0 &&
            formState.attributes.length > 0 &&
            selectedProperties.length === 0
        ) {
            setSelectedProperties(
                formState.attributes.map((attr) => ({
                    attributeId: attr.attributeId,
                    propertyName:
                        attributes.find((attribute) => attribute.id === attr.attributeId)
                            ?.attributeName || '',
                    selectedValues: [attr.value],
                }))
            );
        }
    }, [loading, attributes, formState.attributes, selectedProperties.length]);

    // Özellikler değiştiğinde form durumunu güncelleyin
    const updateFormState = useCallback((properties: SelectedProperty[]) => {
        try {
            const newAttributes: Array<{ attributeId: string; value: string }> = [];

            properties.forEach(property => {
                const propertyAttributes = attributes.filter(attr => attr.id === property.attributeId);
                property.selectedValues.forEach(value => {
                    const attributeValue = propertyAttributes.find(v => v.value === value);
                    if (attributeValue) {
                        newAttributes.push({
                            attributeId: attributeValue.id,
                            value: value
                        });
                    }
                });
            });

            updateAttributes(newAttributes);
        } catch (err) {
            console.error('Form durumu güncellenirken hata oluştu:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Özellikler güncellenemedi"
            });
        }
    }, [attributes, updateAttributes, toast]);

    // Bileşen unmount olmadan önce durumu kaydedin
    useEffect(() => {
        return () => {
            if (selectedProperties.length > 0) {
                updateFormState(selectedProperties);
            }
        };
    }, [selectedProperties, updateFormState]);

    const handleAddProperty = useCallback(() => {
        try {
            const availableAttribute = attributes.find(
                attr => !selectedProperties.some(selected => selected.attributeId === attr.id)
            );

            if (availableAttribute) {
                const newProperties = [
                    ...selectedProperties,
                    {
                        attributeId: availableAttribute.id,
                        propertyName: availableAttribute.attributeName || '',
                        selectedValues: []
                    }
                ];
                setSelectedProperties(newProperties);
                updateFormState(newProperties);
            }
        } catch (err) {
            console.error('Özellik eklenirken hata oluştu:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Özellik eklenemedi"
            });
        }
    }, [attributes, selectedProperties, updateFormState, toast, setSelectedProperties]);

    const handleRemoveProperty = useCallback((attributeId: string) => {
        try {
            const newProperties = selectedProperties.filter(prop => prop.attributeId !== attributeId);
            setSelectedProperties(newProperties);
            updateFormState(newProperties);
        } catch (err) {
            console.error('Özellik silinirken hata oluştu:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Özellik silinemedi"
            });
        }
    }, [selectedProperties, updateFormState, toast, setSelectedProperties]);

    const handleValueChange = useCallback((attributeId: string, value: string) => {
        try {
            const newProperties = selectedProperties.map(prop => {
                if (prop.attributeId === attributeId) {
                    const newValues = prop.selectedValues.includes(value)
                        ? prop.selectedValues.filter(v => v !== value)
                        : [...prop.selectedValues, value];
                    return { ...prop, selectedValues: newValues };
                }
                return prop;
            });
            setSelectedProperties(newProperties);
            updateFormState(newProperties);
        } catch (err) {
            console.error('Değer güncellenirken hata oluştu:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Değer güncellenemedi"
            });
        }
    }, [selectedProperties, updateFormState, toast, setSelectedProperties]);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Özellikler yükleniyor...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Özellikler</h3>
                        <Button
                            variant="outline"
                            onClick={handleAddProperty}
                            disabled={selectedProperties.length === uniqueAttributeIds.length}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Özellik Ekle
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Özellik</TableHead>
                                <TableHead>Değerler</TableHead>
                                <TableHead className="w-[100px]">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedProperties.map((property) => (
                                <TableRow key={property.attributeId}>
                                    <TableCell className="font-medium">
                                        <Select
                                            value={property.attributeId}
                                            onValueChange={(value) => { property.propertyName }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Özellik seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {attributes.map(attr => (
                                                    <SelectItem key={attr.id} value={attr.id}>
                                                        {attr.attributeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => {
                                                setActiveAttributeId(property.attributeId);
                                                setValueDialogOpen(true);
                                            }}
                                        >
                                            {property.selectedValues.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {property.selectedValues.map((value) => (
                                                        <Badge key={`${property.attributeId}-${value}`}>
                                                            {value}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                'Değerleri Seçin'
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveProperty(property.attributeId)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {selectedProperties.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        Henüz özellik eklenmedi
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {activeAttributeId && (
                        <PropertyValueDialog
                            open={valueDialogOpen}
                            onClose={() => {
                                setValueDialogOpen(false);
                                setActiveAttributeId(null);
                            }}
                            title={
                                attributes.find(attr => attr.id === activeAttributeId)?.attributeName || ''
                            }
                            values={attributes.filter(attr => attr.id === activeAttributeId)}
                            selectedValues={
                                selectedProperties.find(p => p.attributeId === activeAttributeId)?.selectedValues || []
                            }
                            onValueChange={(value) => handleValueChange(activeAttributeId, value)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StockProperties;