import React from "react";
import { Button } from "@/components/ui/button";
import { Current } from "@/components/CurrentList/types";

interface CustomerInfoProps {
  customer: Current;
  onClear: () => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, onClear }) => {
  return (
    <div className="rounded-lg border p-4 relative">
      <Button
        variant="ghost"
        className="absolute right-2 top-2 text-sm"
        onClick={onClear}
      >
        Cariyi Sil
      </Button>

      <div className="flex space-x-4">
        <div>
          <span className="text-sm text-muted-foreground">Cari Adı</span>
          <div className="font-medium">{customer.currentName}</div>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Cari Kodu</span>
          <div className="font-medium">{customer.currentCode}</div>
        </div>
        {customer.priceList && (
          <div>
            <span className="text-sm text-muted-foreground">Fiyat Listesi</span>
            <div className="font-medium">
              {customer.priceList.priceListName} ({customer.priceList.currency})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInfo;
