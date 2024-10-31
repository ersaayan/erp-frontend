'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { usePropertyDialog } from './usePropertyDialog';

const PropertyDialog: React.FC = () => {
    const { isOpen, closeDialog, editingProperty } = usePropertyDialog();
    const [propertyName, setPropertyName] = useState('');
    const [propertyValues, setPropertyValues] = useState<string[]>([]);

    useEffect(() => {
        if (editingProperty) {
            setPropertyName(editingProperty.name || '');
            setPropertyValues(editingProperty.values || []);
        } else {
            setPropertyName('');
            setPropertyValues([]);
        }
    }, [editingProperty]);

    const handleClose = () => {
        setPropertyName('');
        setPropertyValues([]);
        closeDialog();
    };

    const handleSave = () => {
        // TODO: Implement save logic
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editingProperty ? 'Özellik Düzenle' : 'Yeni Özellik Ekle'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="propertyName">Özellik Adı</Label>
                        <Input
                            id="propertyName"
                            value={propertyName}
                            onChange={(e) => setPropertyName(e.target.value)}
                            placeholder="Özellik adını giriniz"
                        />
                    </div>
                    <div>
                        <Label htmlFor="propertyValues">Özellik Değerleri</Label>
                        <TagInput
                            id="propertyValues"
                            placeholder="Değer girin ve Enter'a basın"
                            tags={propertyValues}
                            className="mt-1"
                            onTagsChange={(newTags) => setPropertyValues(newTags || [])}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Her bir değeri girdikten sonra Enter tuşuna basın
                        </p>
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleClose}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!propertyName || propertyValues.length === 0}
                    >
                        {editingProperty ? 'Güncelle' : 'Ekle'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PropertyDialog;