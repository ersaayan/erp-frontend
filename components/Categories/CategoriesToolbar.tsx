'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { useCategoryDialog } from './useCategoryDialog';

const CategoriesToolbar: React.FC = () => {
    const { openDialog } = useCategoryDialog();

    return (
        <div className="flex justify-end items-center gap-2">
            <Button variant="outline" size="sm">
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