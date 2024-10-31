'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ServicesToolbar from './toolbar';
import ServicesCostsGrid from './dataGrid';

const ServicesCosts: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all-movements');

    return (
        <div className="grid-container">
            <ServicesToolbar />
            <Card className='mt-4'>
                <ServicesCostsGrid />
            </Card>
        </div>
    );
};

export default ServicesCosts;