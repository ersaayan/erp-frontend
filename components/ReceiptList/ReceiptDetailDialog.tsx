"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  Printer,
  Trash2,
  FileText,
  User,
  Package,
  ArrowLeftRight,
  Info,
  Warehouse,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReceiptDetailType } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ReceiptDetailDialogProps {
  receiptId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

const ReceiptDetailDialog: React.FC<ReceiptDetailDialogProps> = ({
  receiptId,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [receipt, setReceipt] = useState<ReceiptDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();

  const handlePrint = useCallback(() => {
    if (!receipt) return;

    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Yazdırma penceresi açılamadı");
      }

      const totalAmount = receipt.receiptDetail.reduce(
        (sum, detail) => sum + Number(detail.totalPrice),
        0
      );

      const totalQuantity = receipt.receiptDetail.reduce(
        (sum, detail) => sum + Number(detail.quantity),
        0
      );

      printWindow.document.write(`
        <html>
          <head>
            <title>Fiş - ${receipt.documentNo}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                @page {
                  size: auto;
                  margin: 10mm;
                }
              }
              
              body {
                font-family: system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 0;
                font-size: 9pt;
                line-height: 1.3;
                color: #333;
              }
              
              .container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 10mm;
                box-sizing: border-box;
              }
              
              .header {
                text-align: center;
                margin-bottom: 5mm;
                padding-bottom: 3mm;
                border-bottom: 0.5pt solid #666;
              }
              
              .header h1 {
                margin: 0;
                font-size: 14pt;
                font-weight: 700;
                color: #111;
              }
              
              .header .badge {
                display: inline-block;
                padding: 2pt 6pt;
                border-radius: 3pt;
                font-size: 9pt;
                font-weight: 600;
                margin-top: 2mm;
              }
              
              .badge.in {
                background: #dcfce7;
                color: #166534;
                border: 0.5pt solid #86efac;
              }
              
              .badge.out {
                background: #fef3c7;
                color: #92400e;
                border: 0.5pt solid #fcd34d;
              }
              
              .info-section {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 5mm;
                margin-bottom: 5mm;
              }
              
              .info-card {
                border: 0.5pt solid #e5e7eb;
                border-radius: 2pt;
                padding: 3mm;
              }
              
              .info-card h2 {
                font-size: 10pt;
                font-weight: 600;
                margin: 0 0 2mm 0;
                padding-bottom: 1mm;
                border-bottom: 0.5pt solid #e5e7eb;
                color: #111;
              }
              
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 1mm 0;
                font-size: 8pt;
              }
              
              .info-label {
                color: #666;
                font-weight: 500;
              }
              
              .info-value {
                font-weight: 600;
                color: #111;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 5mm 0;
                font-size: 8pt;
              }
              
              th {
                background: #f8fafc;
                text-align: left;
                padding: 2mm;
                font-weight: 600;
                color: #111;
                border: 0.5pt solid #e5e7eb;
                white-space: nowrap;
              }
              
              td {
                padding: 2mm;
                border: 0.5pt solid #e5e7eb;
                color: #333;
              }

              .text-right { text-align: right; }
              .text-center { text-align: center; }
              
              .badge-outline {
                display: inline-block;
                padding: 1pt 4pt;
                border-radius: 2pt;
                font-size: 8pt;
                border: 0.5pt solid #e5e7eb;
              }

              .badge-blue {
                background: #eff6ff;
                color: #1e40af;
                border-color: #bfdbfe;
              }

              .badge-amber {
                background: #fef3c7;
                color: #92400e;
                border-color: #fcd34d;
              }
              
              .total-row td {
                font-weight: 700;
                background: #f8fafc;
                border-top: 1pt solid #e5e7eb;
              }
              
              .footer {
                margin-top: 5mm;
                padding-top: 3mm;
                border-top: 0.5pt solid #e5e7eb;
                font-size: 8pt;
                color: #666;
                text-align: center;
              }

              .product-name {
                max-width: 200pt;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${receipt.documentNo}</h1>
                <div class="badge ${
                  receipt.receiptType === "Giris" ? "in" : "out"
                }">
                  ${
                    receipt.receiptType === "Giris"
                      ? "Giriş Fişi"
                      : "Çıkış Fişi"
                  }
                </div>
              </div>

              <div class="info-section">
                <div class="info-card">
                  <h2>Fiş Bilgileri</h2>
                  <div class="info-row">
                    <span class="info-label">Fiş Tarihi:</span>
                    <span class="info-value">${format(
                      new Date(receipt.createdAt),
                      "dd.MM.yyyy HH:mm"
                    )}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Şube:</span>
                    <span class="info-value">${receipt.branchCode}</span>
                  </div>
                  ${
                    receipt.description
                      ? `
                  <div class="info-row">
                    <span class="info-label">Açıklama:</span>
                    <span class="info-value">${receipt.description}</span>
                  </div>
                  `
                      : ""
                  }
                </div>

                ${
                  receipt.current
                    ? `
                <div class="info-card">
                  <h2>Cari Bilgileri</h2>
                  <div class="info-row">
                    <span class="info-label">Cari Kodu:</span>
                    <span class="info-value">${receipt.current.currentCode}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Cari Adı:</span>
                    <span class="info-value">${receipt.current.currentName}</span>
                  </div>
                </div>
                `
                    : ""
                }
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Ürün Kodu</th>
                    <th>Ürün Adı</th>
                    <th class="text-center">Birim</th>
                    <th class="text-right">Miktar</th>
                    <th class="text-right">B.Fiyat</th>
                    <th class="text-right">Net Fiyat</th>
                    <th class="text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  ${receipt.receiptDetail
                    .map(
                      (detail) => `
                    <tr>
                      <td>${detail.stockCard.productCode}</td>
                      <td class="product-name">${
                        detail.stockCard.productName
                      }</td>
                      <td class="text-center">
                        <span class="badge-outline">${
                          detail.stockCard.unit
                        }</span>
                      </td>
                      <td class="text-right">${detail.quantity.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}</td>
                      <td class="text-right">${detail.unitPrice.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}</td>
                      <td class="text-right">${detail.netPrice.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}</td>
                      <td class="text-right">${detail.totalPrice.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}</td>
                    </tr>
                  `
                    )
                    .join("")}
                  <tr class="total-row">
                    <td colspan="3" class="text-right">Toplam:</td>
                    <td class="text-right">${totalQuantity.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 2 }
                    )}</td>
                    <td colspan="2"></td>
                    <td class="text-right">${totalAmount.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 2 }
                    )}</td>
                  </tr>
                </tbody>
              </table>

              <div class="footer">
                <p>
                  Oluşturan: ${
                    receipt.createdByUser
                      ? `${receipt.createdByUser.username} (${
                          receipt.createdByUser.firstName
                        } ${receipt.createdByUser.lastName || ""})`
                      : "Bilinmiyor"
                  } | 
                  Oluşturma Tarihi: ${format(
                    new Date(receipt.createdAt),
                    "dd.MM.yyyy HH:mm"
                  )}
                </p>
              </div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error("Yazdırma hatası:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yazdırma işlemi sırasında bir hata oluştu",
      });
    }
  }, [receipt, toast]);

  const handleDelete = async () => {
    if (!receiptId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/order/${receiptId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Fiş silinirken bir hata oluştu");
      }

      toast({
        title: "Başarılı",
        description: "Fiş başarıyla silindi",
      });

      onDelete?.();
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Fiş silinirken bir hata oluştu",
      });
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
    }
  };

  useEffect(() => {
    const fetchReceiptDetail = async () => {
      if (!receiptId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.BASE_URL}/warehouses/receipts/${receiptId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Fiş detayları alınırken bir hata oluştu");
        }

        const data = await response.json();
        setReceipt(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Fiş detayları alınırken bir hata oluştu"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && receiptId) {
      fetchReceiptDetail();
    }
  }, [receiptId, isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-7xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-gray-950 border dark:border-gray-800 shadow-lg dark:shadow-gray-900/50"
          aria-describedby="receipt-detail-description"
        >
          <DialogHeader className="px-6 py-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold tracking-tight">
                  Fiş Detayı - {receipt?.documentNo}
                </span>
                {receipt && (
                  <Badge
                    className={cn(
                      "text-sm px-3 py-1 font-medium tracking-wide",
                      receipt.receiptType === "Giris"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50"
                    )}
                  >
                    {receipt.receiptType === "Giris"
                      ? "Giriş Fişi"
                      : "Çıkış Fişi"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mr-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteAlert(true)}
                  disabled={!receipt}
                  className="bg-red-500 hover:bg-red-600 text-white gap-2 shadow-sm transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!receipt}
                  className="bg-blue-500 hover:bg-blue-600 text-white gap-2 shadow-sm transition-colors duration-200"
                >
                  <Printer className="h-4 w-4" />
                  Yazdır
                </Button>
              </div>
            </DialogTitle>
            <p id="receipt-detail-description" className="sr-only">
              Fiş detaylarını görüntüleme ve düzenleme modalı
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-auto">
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground animate-pulse">
                    Yükleniyor...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6">
                <Alert
                  variant="destructive"
                  className="border-red-500/20 dark:border-red-900/30"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {receipt && (
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border dark:border-gray-800">
                    <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/50">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        Fiş Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm pt-4">
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                        <span className="text-muted-foreground font-medium">
                          Fiş No:
                        </span>
                        <span className="font-semibold tracking-wide">
                          {receipt.documentNo}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                        <span className="text-muted-foreground font-medium">
                          Tarih:
                        </span>
                        <span className="font-semibold tracking-wide">
                          {format(
                            new Date(receipt.createdAt),
                            "dd.MM.yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                        <span className="text-muted-foreground font-medium">
                          Şube:
                        </span>
                        <span className="font-semibold tracking-wide">
                          {receipt.branchCode}
                        </span>
                      </div>
                      {receipt.description && (
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                          <span className="text-muted-foreground font-medium">
                            Açıklama:
                          </span>
                          <span className="font-semibold tracking-wide">
                            {receipt.description}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border dark:border-gray-800">
                    <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/50">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        Depo Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm pt-4">
                      {receipt.outWarehouse && (
                        <>
                          <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                            <span className="text-muted-foreground font-medium">
                              Çıkış Depo:
                            </span>
                            <span className="font-semibold tracking-wide">
                              {receipt.outWarehouse.warehouseCode}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                            <span className="text-muted-foreground font-medium">
                              Depo Adı:
                            </span>
                            <span className="font-semibold tracking-wide">
                              {receipt.outWarehouse.warehouseName}
                            </span>
                          </div>
                        </>
                      )}
                      {receipt.inWarehouse && (
                        <>
                          <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                            <span className="text-muted-foreground font-medium">
                              Giriş Depo:
                            </span>
                            <span className="font-semibold tracking-wide">
                              {receipt.inWarehouse.warehouseCode}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                            <span className="text-muted-foreground font-medium">
                              Depo Adı:
                            </span>
                            <span className="font-semibold tracking-wide">
                              {receipt.inWarehouse.warehouseName}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {receipt.current && (
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border dark:border-gray-800">
                      <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/50">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                          Cari Bilgileri
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm pt-4">
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                          <span className="text-muted-foreground font-medium">
                            Cari Kodu:
                          </span>
                          <span className="font-semibold tracking-wide">
                            {receipt.current.currentCode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                          <span className="text-muted-foreground font-medium">
                            Cari Adı:
                          </span>
                          <span className="font-semibold tracking-wide">
                            {receipt.current.currentName}
                          </span>
                        </div>
                        {receipt.current.priceList && (
                          <>
                            <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                              <span className="text-muted-foreground font-medium">
                                Fiyat Listesi:
                              </span>
                              <span className="font-semibold tracking-wide">
                                {receipt.current.priceList.priceListName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                              <span className="text-muted-foreground font-medium">
                                Para Birimi:
                              </span>
                              <Badge
                                variant="outline"
                                className="font-semibold"
                              >
                                {receipt.current.priceList.currency}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                              <span className="text-muted-foreground font-medium">
                                KDV Dahil:
                              </span>
                              <Badge
                                variant={
                                  receipt.current.priceList.isVatIncluded
                                    ? "default"
                                    : "secondary"
                                }
                                className={cn(
                                  "font-semibold",
                                  receipt.current.priceList.isVatIncluded
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                )}
                              >
                                {receipt.current.priceList.isVatIncluded
                                  ? "Evet"
                                  : "Hayır"}
                              </Badge>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border dark:border-gray-800">
                  <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      Ürün Detayları
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border dark:border-gray-800 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/80 dark:bg-gray-900/80 hover:bg-gray-100/80 dark:hover:bg-gray-800/80">
                            <TableHead className="font-semibold">
                              Ürün Kodu
                            </TableHead>
                            <TableHead className="font-semibold">
                              Ürün Adı
                            </TableHead>
                            <TableHead className="font-semibold text-center">
                              Birim
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Miktar
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Birim Fiyat
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              İskonto
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Net Fiyat
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              KDV
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              Toplam
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receipt.receiptDetail.map((detail) => (
                            <TableRow
                              key={detail.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
                            >
                              <TableCell className="font-medium whitespace-nowrap">
                                {detail.stockCard.productCode}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {detail.stockCard.productName}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className="font-medium"
                                >
                                  {detail.stockCard.unit}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                {detail.quantity.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                {detail.unitPrice.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                {detail.discount > 0 ? (
                                  <Badge
                                    variant="outline"
                                    className="font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50"
                                  >
                                    %
                                    {detail.discount.toLocaleString("tr-TR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                {detail.netPrice.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                <Badge
                                  variant="outline"
                                  className="font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50"
                                >
                                  %
                                  {detail.vatRate.toLocaleString("tr-TR", {
                                    minimumFractionDigits: 0,
                                  })}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">
                                {detail.totalPrice.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50/80 dark:bg-gray-900/80 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 font-semibold">
                            <TableCell colSpan={3} className="text-right">
                              Toplam:
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {receipt.receiptDetail
                                .reduce(
                                  (sum, detail) =>
                                    sum + Number(detail.quantity),
                                  0
                                )
                                .toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                            </TableCell>
                            <TableCell colSpan={4}></TableCell>
                            <TableCell className="text-right tabular-nums">
                              {receipt.receiptDetail
                                .reduce(
                                  (sum, detail) =>
                                    sum + Number(detail.totalPrice),
                                  0
                                )
                                .toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {receipt.currentMovement && (
                  <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border dark:border-gray-800">
                    <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/50">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                        Hareket Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm pt-4">
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                        <span className="text-muted-foreground font-medium">
                          Hareket Tipi:
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {receipt.currentMovement.movementType}
                        </Badge>
                      </div>
                      {receipt.currentMovement.documentType && (
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                          <span className="text-muted-foreground font-medium">
                            Belge Tipi:
                          </span>
                          <span className="font-semibold tracking-wide">
                            {receipt.currentMovement.documentType}
                          </span>
                        </div>
                      )}
                      {receipt.currentMovement.description && (
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                          <span className="text-muted-foreground font-medium">
                            Açıklama:
                          </span>
                          <span className="font-semibold tracking-wide">
                            {receipt.currentMovement.description}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {receipt.currentMovement.debtAmount && (
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
                            <div className="text-sm text-red-600 dark:text-red-400 mb-1 font-medium">
                              Borç
                            </div>
                            <div className="text-lg font-semibold text-red-700 dark:text-red-300 tabular-nums">
                              {receipt.currentMovement.debtAmount.toLocaleString(
                                "tr-TR",
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </div>
                          </div>
                        )}
                        {receipt.currentMovement.creditAmount && (
                          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900">
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1 font-medium">
                              Alacak
                            </div>
                            <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                              {receipt.currentMovement.creditAmount.toLocaleString(
                                "tr-TR",
                                { minimumFractionDigits: 2 }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border dark:border-gray-800">
                  <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Info className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                      Oluşturma Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm pt-4">
                    {receipt.createdByUser && (
                      <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                        <span className="text-muted-foreground font-medium">
                          Oluşturan:
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {receipt.createdByUser.username}
                          </Badge>
                          <span className="font-semibold tracking-wide">
                            ({receipt.createdByUser.firstName}{" "}
                            {receipt.createdByUser.lastName})
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150">
                      <span className="text-muted-foreground font-medium">
                        Oluşturma Tarihi:
                      </span>
                      <span className="font-semibold tracking-wide">
                        {format(
                          new Date(receipt.createdAt),
                          "dd.MM.yyyy HH:mm"
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-white dark:bg-gray-950 border dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-red-600 dark:text-red-500">
              Fişi Silmek İstediğinize Emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bu işlem geri alınamaz. Fiş ve ilgili tüm veriler kalıcı olarak
              silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
              Vazgeç
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReceiptDetailDialog;
