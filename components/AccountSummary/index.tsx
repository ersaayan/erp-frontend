"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import AccountSummaryToolbar from "./AccountSummaryToolbar";
import AccountSummaryGrid from "./AccountSummaryGrid";

const AccountSummary: React.FC = () => {
  return (
    <div className="grid-container">
      <AccountSummaryGrid />
    </div>
  );
};

export default AccountSummary;
