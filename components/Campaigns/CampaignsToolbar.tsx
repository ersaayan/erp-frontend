'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Plus } from 'lucide-react';
import { useCampaignDialog } from './useCampaignDialog';

const CampaignsToolbar: React.FC = () => {
    const { openDialog } = useCampaignDialog();

    return (
        <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    İşlemler
                </Button>
            </div>

            <Button 
                variant="default" 
                size="sm" 
                className="bg-[#84CC16] hover:bg-[#65A30D]"
                onClick={openDialog}
            >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kampanya Ekle
            </Button>
        </div>
    );
};

export default CampaignsToolbar;