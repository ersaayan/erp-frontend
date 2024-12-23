import React from "react";
import dynamic from "next/dynamic";

// Dynamically import components
const StockList = dynamic(() => import("@/components/StockList/StockList"), {
  ssr: false,
});
const StockForm = dynamic(() => import("@/components/StockForm/StockForm"), {
  ssr: false,
});
const StockMovements = dynamic(() => import("@/components/StockMovements"), {
  ssr: false,
});
const Categories = dynamic(() => import("@/components/Categories"), {
  ssr: false,
});
const Properties = dynamic(() => import("@/components/Properties"), {
  ssr: false,
});
const BundleSetStocks = dynamic(() => import("@/components/BundleSetStocks"), {
  ssr: false,
});
const BundleSetStockForm = dynamic(
  () => import("@/components/BundleSetStockForm"),
  { ssr: false }
);
const QuickStock = dynamic(() => import("@/components/QuickStock"), {
  ssr: false,
});
const Barcodes = dynamic(() => import("@/components/BarcodeGenerator"), {
  ssr: false,
});
const Campaigns = dynamic(() => import("@/components/Campaigns"), {
  ssr: false,
});
const CurrentList = dynamic(() => import("@/components/CurrentList"), {
  ssr: false,
});
const CurrentCategories = dynamic(
  () => import("@/components/CurrentCategories"),
  { ssr: false }
);
const AccountSummary = dynamic(() => import("@/components/AccountSummary"), {
  ssr: false,
});
const CurrentForm = dynamic(() => import("@/components/CurrentForm"), {
  ssr: false,
});
const QuickSales = dynamic(() => import("@/components/QuickSales"), {
  ssr: false,
});
const Warehouses = dynamic(() => import("@/components/Warehouses"), {
  ssr: false,
});
const OrderPreparation = dynamic(
  () => import("@/components/OrderPreparation"),
  { ssr: false }
);
const StockCount = dynamic(() => import("@/components/StockCount"), {
  ssr: false,
});
const InvoiceList = dynamic(() => import("@/components/InvoiceList"), {
  ssr: false,
});
const PurchaseInvoice = dynamic(() => import("@/components/PurchaseInvoice"), {
  ssr: false,
});
const SalesInvoice = dynamic(() => import("@/components/SalesInvoice"), {
  ssr: false,
});
const CurrentTransactions = dynamic(
  () => import("@/components/CurrentTransactions"),
  { ssr: false }
);
const VaultOperations = dynamic(() => import("@/components/VaultOperations"), {
  ssr: false,
});
const BankOperations = dynamic(() => import("@/components/BankOperations"), {
  ssr: false,
});
const PosOperations = dynamic(() => import("@/components/PosOperations"), {
  ssr: false,
});
const UsersPage = dynamic(() => import("@/components/users"), { ssr: false });
const ProfileForm = dynamic(() => import("@/components/Profile/ProfileForm"), {
  ssr: false,
});
const CompanyForm = dynamic(() => import("@/components/CompanyForm"), {
  ssr: false,
});
const Definitions = dynamic(() => import("@/components/Definitions"), {
  ssr: false,
});
const Roles = dynamic(() => import("@/components/Roles"), { ssr: false });
interface MainTabsProps {
  activeTab: string | null;
  onMenuItemClick: (itemName: string) => void;
}

export const MainTabs: React.FC<MainTabsProps> = ({
  activeTab,
  onMenuItemClick,
}) => {
  const renderActiveTab = () => {
    switch (activeTab) {
      case "Stok Listesi":
        return <StockList onMenuItemClick={onMenuItemClick} />;
      case "Stok Formu":
        return <StockForm />;
      case "Bundle/Set Stoklar":
        return <BundleSetStocks />;
      case "Bundle/Set Stok Formu":
        return <BundleSetStockForm />;
      case "Hareketler":
        return <StockMovements />;
      case "Kategoriler":
        return <Categories />;
      case "Özellikler":
        return <Properties />;
      case "Hızlı Stok":
        return <QuickStock />;
      case "Barkod":
        return <Barcodes />;
      case "Kampanyalar":
        return <Campaigns />;
      case "Cari Listesi":
        return <CurrentList onMenuItemClick={onMenuItemClick} />;
      case "Cari Kategorileri":
        return <CurrentCategories />;
      case "Hesap Özeti":
        return <AccountSummary />;
      case "Cari Formu":
        return <CurrentForm />;
      case "Hızlı Satış":
        return <QuickSales />;
      case "Depo Listesi":
        return <Warehouses />;
      case "Sipariş Paketleme":
        return <OrderPreparation />;
      case "Stok Sayım":
        return <StockCount />;
      case "Fatura/İrsaliye Listesi":
        return <InvoiceList onMenuItemClick={onMenuItemClick} />;
      case "Alış Faturası":
        return <PurchaseInvoice />;
      case "Satış Faturası":
        return <SalesInvoice />;
      case "Cari İşlemleri":
        return <CurrentTransactions onMenuItemClick={onMenuItemClick} />;
      case "Kasa İşlemleri":
        return <VaultOperations />;
      case "Banka İşlemleri":
        return <BankOperations />;
      case "POS İşlemleri":
        return <PosOperations />;
      case "Kullanıcılar":
        return <UsersPage />;
      case "Profil":
        return <ProfileForm />;
      case "Firma":
        return <CompanyForm />;
      case "Tanımlar":
        return <Definitions />;
      case "Roller ve İzinler":
        return <Roles />;
      default:
        return null;
    }
  };

  return <>{renderActiveTab()}</>;
};
