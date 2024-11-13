'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { useCategoryDialog } from './useCategoryDialog';
import { useToast } from "@/hooks/use-toast";

const CategoriesToolbar: React.FC = () => {
    const { openDialog } = useCategoryDialog();
    const { toast } = useToast();

    const handleRefresh = async () => {
        try {
            // Trigger a refresh of the categories list
            const refreshEvent = new CustomEvent('refreshCategories');
            window.dispatchEvent(refreshEvent);

            toast({
                title: "Success",
                description: "Categories refreshed successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to refresh categories",
            });
        }
    };

    return (
        <div className="flex justify-end items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
            </Button>

            <Button
                variant="default"
                size="sm"
                className="bg-[#84CC16] hover:bg-[#65A30D]"
                onClick={openDialog}
            >
                <Plus className="h-4 w-4 mr-2" />
                Kategori Ekle
            </Button>
        </div>
    );
};

export default CategoriesToolbar;