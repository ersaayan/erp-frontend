import React from "react";
import AccountSummaryGrid from "./AccountSummaryGrid";

const AccountSummary: React.FC = () => {
  return (
    <div>
      <h1>Hesap Özeti</h1>
      <div className="grid-container">
        <AccountSummaryGrid />
      </div>
    </div>
  );
};

export default AccountSummary;
