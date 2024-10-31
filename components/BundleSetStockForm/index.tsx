'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';
import GeneralInfo from './GeneralInfo';
import StockProperties from '@/components/StockForm/StockProperties';
import StockUnits from '@/components/StockForm/StockUnits';
import GroupStocks from './GroupStocks';
import { Card, CardContent } from '../ui/card';

const BundleSetStockForm: React.FC = () => {

    return (
        <div className="flex flex-col h-auto">
            <div className="flex justify-between items-center mb-4 p-4">
                <h2 className="text-2xl font-bold">Gruplu Stok Formu</h2>
                <div className="flex space-x-2">
                    <Button variant="default" className="bg-[#84CC16] hover:bg-[#65A30D]">
                        <Save className="mr-2 h-4 w-4" />
                        KAYDET
                    </Button>
                </div>
            </div>
            <div className="flex-grow overflow-auto">
                <div className="flex h-auto">
                    <div className="w-1/2 p-4 overflow-auto">
                        <Tabs defaultValue="general" className="h-auto">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
                                <TabsTrigger value="properties">Özellikler</TabsTrigger>
                                <TabsTrigger value="units">Birimler</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general">
                                <GeneralInfo />
                            </TabsContent>

                            <TabsContent value="properties">
                                <StockProperties />
                            </TabsContent>

                            <TabsContent value="units">
                                <StockUnits />
                            </TabsContent>
                        </Tabs>

                        <div className="mt-4">
                            <GroupStocks />
                        </div>
                    </div>
                    <div className="w-1/2 p-4 overflow-auto">
                        <Card className="h-auto">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-4">Pazaryerleri</h3>
                                <p>Pazaryeri işlemleri yapabilmek için stok formunu kayıt ediniz.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BundleSetStockForm;