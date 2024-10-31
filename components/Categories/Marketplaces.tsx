'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Plus, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { marketplaces } from './data';
import { useCategoryDialog } from './useCategoryDialog';

const availableMarketplaces = [
    { id: 'trendyol', name: 'Trendyol' },
    { id: 'hepsiburada', name: 'Hepsiburada' }
];

interface MarketplaceCategory {
    marketplaceId: string;
    categoryId: string;
}

const Marketplaces: React.FC = () => {
    const [activeMarketplaces, setActiveMarketplaces] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<string>('');
    const [selectedCategories, setSelectedCategories] = useState<MarketplaceCategory[]>([]);
    const { closeDialog } = useCategoryDialog();

    const handleAddMarketplace = (marketplaceId: string) => {
        if (!activeMarketplaces.includes(marketplaceId)) {
            const newActiveMarketplaces = [...activeMarketplaces, marketplaceId];
            setActiveMarketplaces(newActiveMarketplaces);
            setActiveTab(marketplaceId);
        }
    };

    const handleRemoveMarketplace = (marketplaceId: string) => {
        const newActiveMarketplaces = activeMarketplaces.filter(id => id !== marketplaceId);
        setActiveMarketplaces(newActiveMarketplaces);
        setSelectedCategories(prev => prev.filter(cat => cat.marketplaceId !== marketplaceId));
        if (activeTab === marketplaceId) {
            setActiveTab(newActiveMarketplaces[0] || '');
        }
    };

    const handleCategoryChange = (marketplaceId: string, categoryId: string) => {
        setSelectedCategories(prev => {
            const existing = prev.find(cat => cat.marketplaceId === marketplaceId);
            if (existing) {
                return prev.map(cat => 
                    cat.marketplaceId === marketplaceId 
                        ? { ...cat, categoryId } 
                        : cat
                );
            }
            return [...prev, { marketplaceId, categoryId }];
        });
    };

    const getSelectedCategory = (marketplaceId: string) => {
        return selectedCategories.find(cat => cat.marketplaceId === marketplaceId)?.categoryId || '';
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    Aktif pazaryerleri: {marketplaces.filter(m => m.isActive).map(m => m.name).join(', ')}
                </p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-[#3B82F6] hover:bg-[#2563EB]"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Pazaryeri Ekle
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {availableMarketplaces
                            .filter(marketplace => !activeMarketplaces.includes(marketplace.id))
                            .map(marketplace => (
                                <DropdownMenuItem 
                                    key={marketplace.id}
                                    onClick={() => handleAddMarketplace(marketplace.id)}
                                >
                                    {marketplace.name}
                                </DropdownMenuItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {activeMarketplaces.length === 0 ? (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Pazaryerinde stoklarınızı satışa açmak için + Pazaryeri Ekle butonuna tıklayınız.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="flex items-center space-x-2 border rounded-lg p-1">
                            <TabsList className="flex-grow">
                                {activeMarketplaces.map(marketplaceId => (
                                    <TabsTrigger 
                                        key={marketplaceId} 
                                        value={marketplaceId}
                                        className="flex-grow"
                                    >
                                        {availableMarketplaces.find(m => m.id === marketplaceId)?.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <div className="flex space-x-1 px-2">
                                {activeMarketplaces.map(marketplaceId => (
                                    <Button
                                        key={marketplaceId}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveMarketplace(marketplaceId)}
                                        className={`${activeTab === marketplaceId ? 'visible' : 'invisible'}`}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {activeMarketplaces.map(marketplaceId => (
                            <TabsContent key={marketplaceId} value={marketplaceId}>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Katalog Kategori Formu</h3>
                                        <Select
                                            value={getSelectedCategory(marketplaceId)}
                                            onValueChange={(value) => handleCategoryChange(marketplaceId, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Kategori Seçiniz" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="category1">Kategori 1</SelectItem>
                                                <SelectItem value="category2">Kategori 2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={closeDialog}>
                            İptal
                        </Button>
                        <Button className="bg-[#84CC16] hover:bg-[#65A30D]">
                            Kaydet
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplaces;