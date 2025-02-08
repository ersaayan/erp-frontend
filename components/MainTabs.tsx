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
const StockPurchaseMovements = dynamic(
  () => import("@/components/StockPurchaseMovements"),
  {
    ssr: false,
  }
);
const StockSalesMovements = dynamic(
  () => import("@/components/StockSalesMovements"),
  {
    ssr: false,
  }
);
const StockOrderMovements = dynamic(
  () => import("@/components/StockOrderMovements"),
  {
    ssr: false,
  }
);
const StockTakeMovements = dynamic(
  () => import("@/components/StockTakeMovements"),
  {
    ssr: false,
  }
);
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
const FisListesi = dynamic(() => import("@/components/ReceiptList"), {
  ssr: false,
});
const BankMovements = dynamic(() => import("@/components/BankMovements"), {
  ssr: false,
});
const VaultMovements = dynamic(() => import("@/components/VaultMovements"), {
  ssr: false,
});
const PosMovements = dynamic(() => import("@/components/PosMovements"), {
  ssr: false,
});
const Roles = dynamic(() => import("@/components/Roles"), { ssr: false });
const Branches = dynamic(() => import("@/components/Branches"), { ssr: false });
const StockBalanceReport = dynamic(
  () => import("@/components/StockBalanceReport"),
  { ssr: false }
);
const Notifications = dynamic(() => import("@/components/Notifications"), {
  ssr: false,
});

interface MainTabsProps {
  activeTab: string | null;
  onMenuItemClick: (itemName: string) => void;
}

export const MainTabs: React.FC<MainTabsProps> = ({
  activeTab,
  onMenuItemClick,
}) => {
  const renderActiveTab = () => {
    switch (true) {
      case activeTab?.startsWith("Alış Faturası-"):
        return <PurchaseInvoice key={activeTab} tabId={activeTab} />;
      case activeTab?.startsWith("Satış Faturası-"):
        return <SalesInvoice key={activeTab} tabId={activeTab} />;
      case activeTab?.startsWith("Hızlı Satış-"):
        return <QuickSales key={activeTab} tabId={activeTab} />;
      case activeTab === "Stok Listesi":
        return <StockList onMenuItemClick={onMenuItemClick} />;
      case activeTab === "Stok Formu":
        return <StockForm />;
      case activeTab === "Bundle/Set Stoklar":
        return <BundleSetStocks />;
      case activeTab === "Bundle/Set Stok Formu":
        return <BundleSetStockForm />;
      case activeTab === "Hareketler":
        return <StockMovements />;
      case activeTab === "Stok Hareketleri":
        return <StockMovements />;
      case activeTab === "Alış Hareketleri":
        return <StockPurchaseMovements />;
      case activeTab === "Satış Hareketleri":
        return <StockSalesMovements />;
      case activeTab === "Sipariş Hareketleri":
        return <StockOrderMovements />;
      case activeTab === "Stok Sayım Hareketleri":
        return <StockTakeMovements />;
      case activeTab === "Banka Hareketleri":
        return <BankMovements />;
      case activeTab === "POS Hareketleri":
        return <PosMovements />;
      case activeTab === "Nakit Hareketleri":
        return <VaultMovements />;
      case activeTab === "Kategoriler":
        return <Categories />;
      case activeTab === "Özellikler":
        return <Properties />;
      case activeTab === "Hızlı Stok":
        return <QuickStock />;
      case activeTab === "Barkod":
        return <Barcodes />;
      case activeTab === "Kampanyalar":
        return <Campaigns />;
      case activeTab === "Cari Listesi":
        return <CurrentList onMenuItemClick={onMenuItemClick} />;
      case activeTab === "Cari Kategorileri":
        return <CurrentCategories />;
      case activeTab === "Cari Hareketleri":
        return <CurrentTransactions onMenuItemClick={onMenuItemClick} />;
      case activeTab === "Cari Formu":
        return <CurrentForm />;
      case activeTab === "Hızlı Satış":
        return <QuickSales />;
      case activeTab === "Depo Listesi":
        return <Warehouses />;
      case activeTab === "Sipariş Paketleme":
        return <OrderPreparation />;
      case activeTab === "Stok Sayım":
        return <StockCount />;
      case activeTab === "Fatura/İrsaliye Listesi":
        return <InvoiceList onMenuItemClick={onMenuItemClick} />;
      case activeTab === "Fiş Listesi":
        return <FisListesi />;
      case activeTab === "Satış Faturası":
        return <SalesInvoice />;
      case activeTab === "Cari İşlemleri":
        return <CurrentTransactions onMenuItemClick={onMenuItemClick} />;
      case activeTab === "Kasa İşlemleri":
        return <VaultOperations />;
      case activeTab === "Banka İşlemleri":
        return <BankOperations />;
      case activeTab === "POS İşlemleri":
        return <PosOperations />;
      case activeTab === "Kullanıcılar":
        return <UsersPage />;
      case activeTab === "Profil":
        return <ProfileForm />;
      case activeTab === "Firma":
        return <CompanyForm />;
      case activeTab === "Tanımlar":
        return <Definitions />;
      case activeTab === "Roller ve İzinler":
        return <Roles />;
      case activeTab === "Şubeler":
        return <Branches />;
      case activeTab === "Stok Bakiye Raporu":
        return <StockBalanceReport />;
      case activeTab === "Bildirimler":
        return <Notifications />;
      default:
        return null;
    }
  };

  return <>{renderActiveTab()}</>;
};
