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
import { SelectedProperty } from './types';

interface StockPropertiesProps {
    selectedProperties: SelectedProperty[];
    setSelectedProperties: (properties: SelectedProperty[]) => void;
}

const StockProperties: React.FC<StockPropertiesProps> = ({
    selectedProperties,
    setSelectedProperties
}) => {
    const { toast } = useToast();
    const { attributes, loading, error } = useAttributes();
    const [valueDialogOpen, setValueDialogOpen] = useState(false);
    const [activeAttributeName, setActiveAttributeName] = useState<string | null>(null);
    const { formState, updateAttributes } = useStockForm();

    // Group attributes by name
    const groupedAttributes = React.useMemo(() => {
        const groups = new Map<string, { name: string; values: Array<{ id: string; value: string }> }>();

        attributes.forEach(attr => {
            if (!groups.has(attr.attributeName)) {
                groups.set(attr.attributeName, {
                    name: attr.attributeName,
                    values: []
                });
            }
            const group = groups.get(attr.attributeName);
            if (group) {
                group.values.push({
                    id: attr.id,
                    value: attr.value
                });
            }
        });

        return Array.from(groups.values());
    }, [attributes]);

    // Get unique attribute names
    const uniqueAttributeNames = React.useMemo(() =>
        Array.from(new Set(groupedAttributes.map(attr => attr.name))),
        [groupedAttributes]
    );

    // Initialize from form state
    useEffect(() => {
        if (
            !loading &&
            attributes.length > 0 &&
            formState.attributes.length > 0 &&
            selectedProperties.length === 0
        ) {
            // Group attributes and initialize selectedProperties
            const propertyMap = new Map<string, {
                values: Set<string>;
                attributeIds: Set<string>;
            }>();

            formState.attributes.forEach(attr => {
                const attribute = attributes.find(a => a.id === attr.attributeId);
                if (attribute) {
                    const name = attribute.attributeName;
                    if (!propertyMap.has(name)) {
                        propertyMap.set(name, {
                            values: new Set(),
                            attributeIds: new Set(),
                        });
                    }
                    const property = propertyMap.get(name)!;
                    property.values.add(attr.value);
                    property.attributeIds.add(attr.attributeId);
                }
            });

            const initialProperties = Array.from(propertyMap.entries()).map(
                ([name, { values, attributeIds }]) => ({
                    propertyName: name,
                    selectedValues: Array.from(values),
                    attributeIds: Array.from(attributeIds),
                })
            );

            setSelectedProperties(initialProperties);
        }
    }, [loading, attributes]);

    const updateFormState = useCallback((properties: SelectedProperty[]) => {
        try {
            const newAttributes: Array<{ attributeId: string; value: string }> = [];

            properties.forEach(property => {
                const attributeGroup = groupedAttributes.find(group => group.name === property.propertyName);
                if (attributeGroup) {
                    property.selectedValues.forEach(value => {
                        const attributeValue = attributeGroup.values.find(v => v.value === value);
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
        } catch (err) {
            console.error('Form state update error:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Özellikler güncellenemedi"
            });
        }
    }, [groupedAttributes, updateAttributes, toast]);

    useEffect(() => {
        return () => {
            if (selectedProperties.length > 0) {
                updateFormState(selectedProperties);
            }
        };
    }, [selectedProperties, updateFormState]);

    const handleAddProperty = useCallback(() => {
        try {
            const availableAttribute = groupedAttributes.find(
                attr => !selectedProperties.some(selected => selected.propertyName === attr.name)
            );

            if (availableAttribute) {
                setSelectedProperties([
                    ...selectedProperties,
                    {
                        propertyName: availableAttribute.name,
                        selectedValues: [],
                        attributeIds: availableAttribute.values.map(v => v.id)
                    }
                ]);
            }
        } catch (err) {
            console.error('Add property error:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Özellik eklenemedi"
            });
        }
    }, [groupedAttributes, selectedProperties, setSelectedProperties, updateFormState, toast]);

    const handleRemoveProperty = useCallback((propertyName: string) => {
        try {
            setSelectedProperties(
                selectedProperties.filter(prop => prop.propertyName !== propertyName)
            );
        } catch (err) {
            console.error('Remove property error:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Özellik silinemedi"
            });
        }
    }, [selectedProperties, setSelectedProperties, updateFormState, toast]);

    const handleValueChange = useCallback((propertyName: string, value: string) => {
        try {
            const attributeGroup = groupedAttributes.find(group => group.name === propertyName);
            if (!attributeGroup) return;

            const attributeValue = attributeGroup.values.find(v => v.value === value);
            if (!attributeValue) return;

            setSelectedProperties(
                selectedProperties.map(prop => {
                    if (prop.propertyName === propertyName) {
                        const valueIndex = prop.selectedValues.indexOf(value);
                        if (valueIndex === -1) {
                            return {
                                ...prop,
                                selectedValues: [...prop.selectedValues, value],
                                attributeIds: [...prop.attributeIds, attributeValue.id]
                            };
                        } else {
                            const newValues = [...prop.selectedValues];
                            const newIds = [...prop.attributeIds];
                            newValues.splice(valueIndex, 1);
                            newIds.splice(valueIndex, 1);
                            return {
                                ...prop,
                                selectedValues: newValues,
                                attributeIds: newIds
                            };
                        }
                    }
                    return prop;
                })
            );
        } catch (err) {
            console.error('Value change error:', err);
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Değer güncellenemedi"
            });
        }
    }, [groupedAttributes, selectedProperties, setSelectedProperties, updateFormState, toast]);

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
                            disabled={selectedProperties.length === uniqueAttributeNames.length}
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
                                                const newProperties = selectedProperties.map(prop =>
                                                    prop.propertyName === property.propertyName
                                                        ? {
                                                            propertyName: value,
                                                            selectedValues: [],
                                                            attributeIds: groupedAttributes
                                                                .find(attr => attr.name === value)?.values
                                                                .map(v => v.id) || []
                                                        }
                                                        : prop
                                                );
                                                setSelectedProperties(newProperties);
                                                updateFormState(newProperties);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Özellik seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {uniqueAttributeNames.map(name => (
                                                    <SelectItem key={name} value={name}>
                                                        {name}
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
                                                setActiveAttributeName(property.propertyName);
                                                setValueDialogOpen(true);
                                            }}
                                        >
                                            {property.selectedValues.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {property.selectedValues.map((value) => (
                                                        <Badge key={`${property.propertyName}-${value}`}>
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
                                        Henüz özellik eklenmedi
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {activeAttributeName && (
                        <PropertyValueDialog
                            open={valueDialogOpen}
                            onClose={() => {
                                setValueDialogOpen(false);
                                setActiveAttributeName(null);
                            }}
                            title={activeAttributeName}
                            values={groupedAttributes.find(attr => attr.name === activeAttributeName)?.values || []}
                            selectedValues={
                                selectedProperties.find(p => p.propertyName === activeAttributeName)?.selectedValues || []
                            }
                            onValueChange={(value) => handleValueChange(activeAttributeName, value)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StockProperties;