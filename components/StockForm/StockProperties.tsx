'use client';

import React, { useState, useEffect } from 'react';
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
import { SelectedProperty } from './types';
import PropertyValueDialog from './PropertyValueDialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useStockForm } from './hooks/useStockForm';

const StockProperties: React.FC = () => {
    const { attributes, loading, error } = useAttributes();
    const [selectedProperties, setSelectedProperties] = useState<SelectedProperty[]>([]);
    const [valueDialogOpen, setValueDialogOpen] = useState(false);
    const [activePropertyName, setActivePropertyName] = useState<string | null>(null);
    const { formState, updateAttributes } = useStockForm();

    useEffect(() => {
        // Initialize selected properties from formState if available
        if (formState.attributes.length > 0) {
            const groupedAttributes = formState.attributes.reduce((acc, curr) => {
                if (!acc[curr.attributeId]) {
                    acc[curr.attributeId] = {
                        propertyName: attributes.find(attr =>
                            attr.values.some(v => v.id === curr.attributeId)
                        )?.name || '',
                        selectedValues: []
                    };
                }
                acc[curr.attributeId].selectedValues.push(curr.value);
                return acc;
            }, {} as Record<string, SelectedProperty>);

            setSelectedProperties(Object.values(groupedAttributes));
        }
    }, [formState.attributes, attributes]);

    const handleAddProperty = () => {
        const availableProperty = attributes.find(
            prop => !selectedProperties.some(selected => selected.propertyName === prop.name)
        );

        if (availableProperty) {
            const newProperties = [
                ...selectedProperties,
                {
                    propertyName: availableProperty.name,
                    selectedValues: []
                }
            ];
            setSelectedProperties(newProperties);
            updateFormState(newProperties);
        }
    };

    const handleRemoveProperty = (propertyName: string) => {
        const newProperties = selectedProperties.filter(prop => prop.propertyName !== propertyName);
        setSelectedProperties(newProperties);
        updateFormState(newProperties);
    };

    const handleValueChange = (propertyName: string, value: string) => {
        const newProperties = selectedProperties.map(prop => {
            if (prop.propertyName === propertyName) {
                const newValues = prop.selectedValues.includes(value)
                    ? prop.selectedValues.filter(v => v !== value)
                    : [...prop.selectedValues, value];
                return { ...prop, selectedValues: newValues };
            }
            return prop;
        });
        setSelectedProperties(newProperties);
        updateFormState(newProperties);
    };

    const updateFormState = (properties: SelectedProperty[]) => {
        const newAttributes: Array<{ attributeId: string; value: string }> = [];

        properties.forEach(property => {
            const propertyAttributes = attributes.find(attr => attr.name === property.propertyName);
            if (propertyAttributes) {
                property.selectedValues.forEach(value => {
                    const attributeValue = propertyAttributes.values.find(v => v.value === value);
                    if (attributeValue) {
                        newAttributes.push({
                            attributeId: attributeValue.id,
                            value: value
                        });
                    }
                });
            }
        });

        updateAttributes(newAttributes);
    };

    const openValueDialog = (propertyName: string) => {
        setActivePropertyName(propertyName);
        setValueDialogOpen(true);
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-32">
                        <p>Özellikler yükleniyor...</p>
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
                        <h3 className="text-lg font-semibold">Stok Özellikleri</h3>
                        <Button
                            variant="outline"
                            onClick={handleAddProperty}
                            disabled={selectedProperties.length === attributes.length}
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
                                <TableRow key={property.propertyName}>
                                    <TableCell className="font-medium">
                                        <Select
                                            value={property.propertyName}
                                            onValueChange={(value) => {
                                                const newProperties = selectedProperties.map(p =>
                                                    p.propertyName === property.propertyName
                                                        ? { propertyName: value, selectedValues: [] }
                                                        : p
                                                );
                                                setSelectedProperties(newProperties);
                                                updateFormState(newProperties);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue>{property.propertyName}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {attributes
                                                    .filter(p => p.name === property.propertyName ||
                                                        !selectedProperties.some(sp => sp.propertyName === p.name))
                                                    .map(p => (
                                                        <SelectItem key={p.name} value={p.name}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => openValueDialog(property.propertyName)}
                                        >
                                            {property.selectedValues.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {property.selectedValues.map(value => (
                                                        <Badge key={value} variant="secondary">
                                                            {value}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                "Değer seçin..."
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveProperty(property.propertyName)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {selectedProperties.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        Henüz özellik eklenmemiş
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {activePropertyName && (
                        <PropertyValueDialog
                            open={valueDialogOpen}
                            onClose={() => {
                                setValueDialogOpen(false);
                                setActivePropertyName(null);
                            }}
                            title={activePropertyName}
                            values={attributes.find(attr => attr.name === activePropertyName)?.values || []}
                            selectedValues={selectedProperties.find(p => p.propertyName === activePropertyName)?.selectedValues || []}
                            onValueChange={(value) => handleValueChange(activePropertyName, value)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StockProperties;