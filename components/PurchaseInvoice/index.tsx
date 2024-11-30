"use client";

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import PurchaseInvoiceHeader from './PurchaseInvoiceHeader';
import PurchaseInvoiceForm from './PurchaseInvoiceForm';
import PurchaseInvoiceItems from './PurchaseInvoiceItems';
import { Current } from '../CurrentList/types';

interface PurchaseInvoiceProps {
    current: Current;
}

const PurchaseInvoice: React.FC<PurchaseInvoiceProps> = ({ current }) => {
    return (
        <div className="grid-container">
            <PurchaseInvoiceHeader current={current} />
            <Card className="mt-4 p-6">
                <div className="space-y-6">
                    <PurchaseInvoiceForm current={current} />
                    <PurchaseInvoiceItems />
                </div>
            </Card>
        </div>
    );
};

export default PurchaseInvoice;