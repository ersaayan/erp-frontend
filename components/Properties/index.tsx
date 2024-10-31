'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import PropertiesToolbar from './PropertiesToolbar';
import PropertiesGrid from './PropertiesGrid';
import PropertyDialog from './PropertyDialog';

const Properties: React.FC = () => {
    return (
        <div className="grid-container">
            <PropertiesToolbar />
            <Card className='mt-4'>
                <PropertiesGrid />
            </Card>
            <PropertyDialog />
        </div>
    );
};

export default Properties;