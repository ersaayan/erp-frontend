"use client";

import React from "react";
import CustomerSearch from "./CustomerSearch";
import CustomerInfo from "./CustomerInfo";
import { Current } from "@/components/CurrentList/types";

interface CustomerSectionProps {
  customer: Current | null;
  onCustomerChange: (customer: Current | null) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  customer,
  onCustomerChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cari</h2>
      </div>

      {customer ? (
        <CustomerInfo
          customer={customer}
          onClear={() => onCustomerChange(null)}
        />
      ) : (
        <CustomerSearch onCustomerSelect={onCustomerChange} />
      )}
    </div>
  );
};

export default CustomerSection;
