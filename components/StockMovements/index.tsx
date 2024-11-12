'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import MovementsToolbar from './MovementsToolbar';
import MovementsGrid from './MovementsGrid';

const StockMovements: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all-movements');

    return (
        <div className="grid-container">
            <MovementsToolbar />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="previous-purchases">Önceki Alışlar</TabsTrigger>
                    <TabsTrigger value="previous-sales">Önceki Satışlar</TabsTrigger>
                    <TabsTrigger value="orders">Siparişler</TabsTrigger>
                    <TabsTrigger value="all-movements">Tüm Hareketler</TabsTrigger>
                </TabsList>

                <TabsContent value="previous-purchases">
                    <Card>
                        <MovementsGrid type="previous-purchases" />
                    </Card>
                </TabsContent>

                <TabsContent value="previous-sales">
                    <Card>
                        <MovementsGrid type="previous-sales" />
                    </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                        <MovementsGrid type="orders" />
                    </Card>
                </TabsContent>

                <TabsContent value="all-movements">
                    <Card>
                        <MovementsGrid type="all-movements" />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StockMovements;