'use client';

import React from 'react';
import Image from 'next/image';
import { Stock } from './types';

interface StockDetailsProps {
    stock: Stock;
}

const StockDetails: React.FC<StockDetailsProps> = ({ stock }) => {
    return (
        <div className="space-y-6">
            {stock.imageUrl && (
                <div className="flex justify-center">
                    <Image
                        src={stock.imageUrl}
                        alt={stock.name}
                        width={200}
                        height={200}
                        className="rounded-lg"
                    />
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Satış Fiyatı:</h3>
                    <div className="bg-[#84CC16] text-white p-4 rounded-md text-center text-xl font-bold">
                        {stock.salePrice.toFixed(2)} {stock.currency}
                    </div>
                    <div className="bg-muted p-4 rounded-md text-center text-xl font-bold mt-2">
                        {stock.salePriceWithTax.toFixed(2)} {stock.currency}
                    </div>
                </div>

                <div className="space-y-2">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Ürün Adı:</h3>
                        <p className="text-lg">{stock.name}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Ürün Kodu:</h3>
                        <p className="text-lg">{stock.code}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Ürün Barkodu:</h3>
                        <p className="text-lg">{stock.barcode}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Güncel Miktar:</h3>
                        <p className="text-lg">{stock.currentQuantity} {stock.unit}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetails;