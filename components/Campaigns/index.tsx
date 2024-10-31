'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import CampaignsToolbar from './CampaignsToolbar';
import CampaignsGrid from './CampaignsGrid';

const Campaigns: React.FC = () => {
    return (
        <div className="grid-container">
            <CampaignsToolbar />
            <Card className='mt-4'>
                <CampaignsGrid />
            </Card>
        </div>
    );
};

export default Campaigns;