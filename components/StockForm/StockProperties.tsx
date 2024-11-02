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
import { SelectedProperty } from './types';
import PropertyValueDialog from './PropertyValueDialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { useStockForm } from './hooks/useStockForm';
import { useToast } from '@/hooks/use-toast';

interface StockPropertiesProps {
    selectedProperties: SelectedProperty[];
    setSelectedProperties: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}

const StockProperties: React.FC<StockPropertiesProps> = ({ selectedProperties, setSelectedProperties }) => {
    const { toast } = useToast();
    const { attributes, loading, error } = useAttributes();
    const [valueDialogOpen, setValueDialogOpen] = useState(false);
    const [activePropertyName, setActivePropertyName] = useState<string | null>(null);
    const { formState, updateAttributes } = useStockForm();

    // Initialize properties from form state
    useEffect(() => {
        if (formState.attributes.length > 0 && selectedProperties.length === 0) {
            setSelectedProperties(
                formState.attributes.map(attr => ({
                    propertyName: attr.attributeId || '',
                    selectedValues: [attr.value],
                }))
            );
        }
    }, [formState.attributes]);

    // Update form state when properties change
    const updateFormState = useCallback((properties: SelectedProperty[]) => {
        try {
            const newAttributes: Array<{ attributeId: string; value: string }> = [];

            properties.forEach(property => {
                const propertyAttributes = attributes.filter(attr => attr.attributeName === property.propertyName);
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
            console.error('Error updating form state:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update properties"
            });
        }
    }, [attributes, updateAttributes, toast]);

    // Save state before unmounting
    useEffect(() => {
        return () => {
            if (selectedProperties.length > 0) {
                updateFormState(selectedProperties);
            }
        };
    }, [selectedProperties, updateFormState]);

    const handleAddProperty = useCallback(() => {
        try {
            const availableProperty = attributes.find(
                prop => !selectedProperties.some(selected => selected.propertyName === prop.attributeName)
            );

            if (availableProperty) {
                const newProperties = [
                    ...selectedProperties,
                    {
                        propertyName: availableProperty.attributeName,
                        selectedValues: []
                    }
                ];
                setSelectedProperties(newProperties);
                updateFormState(newProperties);
            }
        } catch (err) {
            console.error('Error adding property:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add property"
            });
        }
    }, [attributes, selectedProperties, updateFormState, toast, setSelectedProperties]);

    const handleRemoveProperty = useCallback((propertyName: string) => {
        try {
            const newProperties = selectedProperties.filter(prop => prop.propertyName !== propertyName);
            setSelectedProperties(newProperties);
            updateFormState(newProperties);
        } catch (err) {
            console.error('Error removing property:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to remove property"
            });
        }
    }, [selectedProperties, updateFormState, toast, setSelectedProperties]);

    const handleValueChange = useCallback((propertyName: string, value: string) => {
        try {
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
        } catch (err) {
            console.error('Error updating value:', err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update value"
            });
        }
    }, [selectedProperties, updateFormState, toast, setSelectedProperties]);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading properties...</span>
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
                        <h3 className="text-lg font-semibold">Properties</h3>
                        <Button
                            variant="outline"
                            onClick={handleAddProperty}
                            disabled={selectedProperties.length === attributes.length}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Property
                        </Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Property</TableHead>
                                <TableHead>Values</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
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
                                                    .filter(p => p.attributeName === property.propertyName ||
                                                        !selectedProperties.some(sp => sp.propertyName === p.attributeName))
                                                    .map(p => (
                                                        <SelectItem key={p.attributeName} value={p.attributeName}>
                                                            {p.attributeName}
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
                                                setActivePropertyName(property.propertyName);
                                                setValueDialogOpen(true);
                                            }}
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
                                                "Select values..."
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
                                        No properties added yet
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
                            values={attributes.filter(attr => attr.attributeName === activePropertyName)}
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