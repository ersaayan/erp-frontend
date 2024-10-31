'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategoryDialog } from './useCategoryDialog';
import GeneralInfo from './GeneralInfo';
import Marketplaces from './Marketplaces';

const CategoryDialog: React.FC = () => {
    const { isOpen, closeDialog } = useCategoryDialog();
    const [activeTab, setActiveTab] = useState('general');

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Kategori Formu</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
                        <TabsTrigger value="marketplaces">Pazaryerleri</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <GeneralInfo />
                    </TabsContent>

                    <TabsContent value="marketplaces">
                        <Marketplaces />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryDialog;