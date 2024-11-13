'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { usePropertyDialog } from './usePropertyDialog';
import { useToast } from "@/hooks/use-toast";

const PropertiesToolbar: React.FC = () => {
    const { openDialog } = usePropertyDialog();
    const { toast } = useToast();

    const handleRefresh = async () => {
        try {
            // Trigger a refresh of the properties list
            const refreshEvent = new CustomEvent('refreshProperties');
            window.dispatchEvent(refreshEvent);

            toast({
                title: "Success",
                description: "Properties refreshed successfully",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to refresh properties",
            });
        }
    };

    const handleAddProperty = () => {
        openDialog();
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
                onClick={handleAddProperty}
            >
                <Plus className="h-4 w-4 mr-2" />
                Özellik Ekle
            </Button>
        </div>
    );
};

export default PropertiesToolbar;