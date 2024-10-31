'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import VouchersToolbar from './VouchersToolbar';
import VouchersGrid from './VouchersGrid';

const StockVouchers: React.FC = () => {
    const [activeTab, setActiveTab] = useState('stock-vouchers');

    return (
        <div className="grid-container">
            <VouchersToolbar />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="stock-vouchers">Stok Fişleri</TabsTrigger>
                    <TabsTrigger value="pending-transfer">Bekleyen Nakil Fişleri</TabsTrigger>
                    <TabsTrigger value="incomplete">Yarım Bırakılan Fişler</TabsTrigger>
                </TabsList>

                <TabsContent value="stock-vouchers">
                    <Card>
                        <VouchersGrid type="stock-vouchers" />
                    </Card>
                </TabsContent>

                <TabsContent value="pending-transfer">
                    <Card>
                        <VouchersGrid type="pending-transfer" />
                    </Card>
                </TabsContent>

                <TabsContent value="incomplete">
                    <Card>
                        <VouchersGrid type="incomplete" />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StockVouchers;