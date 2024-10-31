'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  ShoppingBag,
  BarChart2,
  Settings,
  Server,
  File,
  Circle,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onMenuItemClick: (itemName: string) => void;
}

const menuItems = [
  {
    name: 'İşlemler',
    icon: <LayoutDashboard className="h-5 w-5" />,
    subItems: [
      { name: 'Cari İşlemleri', disabled: true },
      { name: 'Kasa İşlemleri', disabled: true },
      { name: 'Banka İşlemleri', disabled: true },
      { name: 'Kredi Kartı İşlemleri', disabled: true },
      { name: 'POS İşlemleri', disabled: true },
      { name: 'Çek/Senet İşlemleri', disabled: true },
      { name: 'Hizmet/Masraf İşlemleri', disabled: true },
      { name: 'Evrak Yönetimi', disabled: true },
      { name: 'Online Banka İşlemleri', disabled: true },
    ],
  },
  {
    name: 'Stoklar',
    icon: <Package className="h-5 w-5" />,
    subItems: [
      { name: 'Stok Listesi', disabled: false },
      { name: 'Stok Formu', disabled: false },
      { name: 'Hizmet - Masraflar', disabled: true },
      { name: 'Hareketler', disabled: false },
      { name: 'Kategoriler', disabled: false },
      { name: 'Özellikler', disabled: false },
      { name: 'Fişler', disabled: true },
      { name: 'Bundle/Set Stoklar', disabled: false },
      { name: 'Bundle/Set Stok Formu', disabled: false },
      { name: 'Hızlı Stok', disabled: false },
      { name: 'Kampanyalar', disabled: true },
    ],
  },
  {
    name: 'Cariler',
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { name: 'Cari Listesi', disabled: true },
      { name: 'Cari Kategorileri', disabled: true },
      { name: 'Hesap Özeti', disabled: true },
      { name: 'Ödeme/Tahsilat Plan', disabled: true },
    ],
  },
  {
    name: 'Hızlı Satış',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    name: 'Depolar',
    icon: <Warehouse className="h-5 w-5" />,
    subItems: [
      { name: 'Depo Tanımlama', disabled: false },
      { name: 'Depo Listesi', disabled: false },
      { name: 'Mal Kabul', disabled: true },
      { name: 'Mal Çıkış', disabled: true },
      { name: 'Stok Sayım', disabled: true },
      { name: 'Sipariş Paketleme', disabled: true },
    ],
  },
  {
    name: 'Pazaryerleri',
    icon: <ShoppingBag className="h-5 w-5" />,
    subItems: [
      { name: 'Siparişler', disabled: true },
      { name: 'Servisler', disabled: true },
      { name: 'İşlem Geçmişi', disabled: true },
    ],
  },
  {
    name: 'Fatura / İrsaliye',
    icon: <File className="h-5 w-5" />,
    subItems: [
      { name: 'Fatura Listesi', disabled: true },
      { name: 'İrsaliye Listesi', disabled: true },
      { name: 'Planlı Fatura', disabled: true },
      { name: 'BA/BS', disabled: true },
      { name: 'Gelen E-Faturalar', disabled: true },
      { name: 'Gelen E-İrsaliyeler', disabled: true },
    ],
  },
  {
    name: 'Raporlar',
    icon: <BarChart2 className="h-5 w-5" />,
    subItems: [
      { name: 'Cari Bakiye', disabled: true },
      { name: 'Cari Satışlar', disabled: true },
      { name: 'Banka Bakiye', disabled: true },
      { name: 'Kasa Bakiye', disabled: true },
      { name: 'Stok Devir Hiz', disabled: true },
      { name: 'Stok', disabled: true },
      { name: 'Envanter', disabled: true },
      { name: 'Fatura Hareketleri', disabled: true },
      { name: 'Sipariş Hareketleri', disabled: true },
      { name: 'Sipariş Stokları', disabled: true },
      { name: 'Pazaryeri Hakediş', disabled: true },
      { name: 'Fatura Karlılık', disabled: true },
      { name: 'Günlük Rapor', disabled: true },
      { name: 'Sayım Rapor Liste', disabled: true },
      { name: 'Stok Hareketleri', disabled: true },
      { name: 'Stok Bakiyeleri', disabled: true },
      { name: 'Kdv Rapor', disabled: true },
      { name: 'Firma/Şube Durum Raporu', disabled: true },
    ],
  },
  {
    name: 'Ayarlar',
    icon: <Settings className="h-5 w-5" />,
    subItems: [
      { name: 'Kullanıcılar', disabled: true },
      { name: 'Rol Grupları', disabled: true },
      { name: 'Tanımlar', disabled: true },
      { name: 'Firma', disabled: true },
      { name: 'Günlükler', disabled: true },
      { name: 'Servis Şablonları', disabled: true },
      { name: 'Yedekleme', disabled: true },
      { name: 'Bildirimler', disabled: true },
      { name: 'Queue Workers', disabled: true },
    ],
  },
  {
    name: 'Servisler',
    icon: <Server className="h-5 w-5" />,
    subItems: [
      { name: 'Xml Stok Servisi', disabled: true },
      { name: 'NetGsm Sms', disabled: true },
      { name: 'Mail Servisi', disabled: true },
      { name: 'PayTR Ödeme Servisi', disabled: true },
    ],
  },
  {
    name: 'Yazdırma Şablonları',
    icon: <FileText className="h-5 w-5" />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onMenuItemClick }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const logoSrc = mounted && (theme === 'dark' || resolvedTheme === 'dark') ? '/logo-light.svg' : '/logo-dark.svg';

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={`bg-sidebar-bg text-sidebar-text transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'
        }`}
    >
      <div className="p-4 flex justify-center items-center">
        <Image
          src={logoSrc}
          alt="Logo"
          width={isCollapsed ? 64 : 240}
          height={isCollapsed ? 32 : 40}
        />
      </div>
      <ScrollArea className="h-[calc(100vh-4rem-64px)]">
        <nav className="p-2">
          {menuItems.map((item) => (
            <div key={item.name} className="mb-1">
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm text-sidebar-text hover:bg-sidebar-hover ${isCollapsed ? 'px-2' : 'px-3'
                  }`}
                onClick={() => {
                  if (item.subItems && !isCollapsed) {
                    toggleExpand(item.name);
                  } else {
                    onMenuItemClick(item.name);
                  }
                }}
              >
                {item.icon}
                {!isCollapsed && (
                  <>
                    <span className="ml-2 truncate">{item.name}</span>
                    {item.subItems && (
                      <span className="ml-auto">
                        {expandedItems.includes(item.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </>
                )}
              </Button>
              {!isCollapsed &&
                item.subItems &&
                expandedItems.includes(item.name) && (
                  <div className="ml-4 mt-1">
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.name}
                        variant="ghost"
                        className="w-full justify-start text-sm py-1 px-2 mb-1 text-sidebar-text hover:bg-sidebar-hover"
                        onClick={() => !subItem.disabled && onMenuItemClick(subItem.name)}
                        disabled={subItem.disabled}
                      >
                        <Circle className="h-1 w-1 mr-2" />
                        <span className="truncate">{subItem.name}</span>
                      </Button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;