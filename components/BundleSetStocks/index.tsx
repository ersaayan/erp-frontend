'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import BundleSetToolbar from './BundleSetToolbar';
import BundleSetGrid from './BundleSetGrid';

const BundleSetStocks: React.FC = () => {
    return (
        <div className="grid-container">
            <BundleSetToolbar />
            <Card className='mt-4'>
                <BundleSetGrid />
            </Card>
        </div>
    );
};

export default BundleSetStocks;