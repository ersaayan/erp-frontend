'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { categories } from './data';
import { useCategoryDialog } from './useCategoryDialog';

const GeneralInfo: React.FC = () => {
    const [isMainCategory, setIsMainCategory] = useState(false);
    const { closeDialog } = useCategoryDialog();

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="isMainCategory" 
                    checked={isMainCategory}
                    onCheckedChange={setIsMainCategory}
                />
                <Label htmlFor="isMainCategory">Ana Kategori mi?</Label>
            </div>

            {!isMainCategory && (
                <div>
                    <Label>Üst Kategori</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Üst kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories
                                .filter(cat => !cat.parentId)
                                .map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div>
                <Label>Kategori Adı</Label>
                <Input placeholder="Kategori adını giriniz" />
            </div>

            <div>
                <Label>Kategori Kodu</Label>
                <Input placeholder="Kategori kodunu giriniz" />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={closeDialog}>
                    İptal
                </Button>
                <Button className="bg-[#84CC16] hover:bg-[#65A30D]">
                    Kaydet
                </Button>
            </div>
        </div>
    );
};

export default GeneralInfo;