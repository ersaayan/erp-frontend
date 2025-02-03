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

      // Format the receipt details for printing
      const totalAmount = receipt.receiptDetail.reduce(
        (sum, detail) => sum + detail.totalPrice,
        0
      );

      const totalQuantity = receipt.receiptDetail.reduce(
        (sum, detail) => sum + detail.quantity,
        0
      );

      printWindow.document.write(`
        <html>
          <head>
            <title>Fiş - ${receipt.documentNo}</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                margin: 0;
                padding: 0;
                font-size: 9pt;
                line-height: 1.3;
                color: #333;
              }
              
              .container {
                max-width: 190mm;
                margin: 0 auto;
              }
              
              .header {
                text-align: center;
                padding: 10px 0;
                border-bottom: 2px solid #333;
                margin-bottom: 10px;
              }
              
              .header h2 {
                margin: 0;
                font-size: 14pt;
                font-weight: bold;
              }
              
              .header p {
                margin: 5px 0 0;
                font-size: 10pt;
                color: #666;
              }
              
              .info-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px;
                background: #f8f8f8;
                border-radius: 4px;
              }
              
              .info-block {
                flex: 1;
                padding: 0 10px;
              }
              
              .info-block h3 {
                margin: 0 0 5px;
                font-size: 10pt;
                color: #444;
                border-bottom: 1px solid #ddd;
                padding-bottom: 3px;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 3px 10px;
                font-size: 9pt;
              }
              
              .info-grid .label {
                font-weight: 500;
                color: #666;
              }
              
              .info-grid .value {
                color: #333;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 9pt;
              }
              
              th {
                background: #f3f4f6;
                font-weight: 600;
                text-align: left;
                padding: 5px;
                border-bottom: 2px solid #ddd;
                white-space: nowrap;
              }
              
              td {
                padding: 4px 5px;
                border-bottom: 1px solid #eee;
              }
              
              .text-right {
                text-align: right;
              }
              
              .total-row {
                font-weight: 600;
                background: #f8f8f8;
              }
              
              .total-row td {
                border-top: 2px solid #ddd;
                border-bottom: none;
                padding-top: 8px;
              }
              
              .footer {
                margin-top: 20px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-size: 8pt;
                color: #666;
                text-align: center;
              }
              
              .summary-section {
                display: flex;
                justify-content: flex-end;
                gap: 20px;
                margin: 10px 0;
                padding: 5px;
                font-size: 9pt;
              }
              
              .summary-item {
                display: flex;
                gap: 5px;
              }
              
              .summary-label {
                color: #666;
              }
              
              .summary-value {
                font-weight: 500;
                color: #333;
              }
              
              @media print {
                button { display: none; }
                body { -webkit-print-color-adjust: exact; }
                .info-section { -webkit-print-color-adjust: exact; }
                th { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>${receipt.documentNo}</h2>
                <p>${
                  receipt.receiptType === "Giris" ? "Giriş Fişi" : "Çıkış Fişi"
                }</p>
              </div>

              <div class="info-section">
                <div class="info-block">
                  <h3>Fiş Bilgileri</h3>
                  <div class="info-grid">
                    <span class="label">Fiş Tarihi:</span>
                    <span class="value">${format(
                      new Date(receipt.createdAt),
                      "dd.MM.yyyy HH:mm"
                    )}</span>
                    <span class="label">Şube:</span>
                    <span class="value">${receipt.branchCode}</span>
                    ${
                      receipt.description
                        ? `<span class="label">Açıklama:</span>
                           <span class="value">${receipt.description}</span>`
                        : ""
                    }
                  </div>
                </div>
                ${
                  receipt.current
                    ? `
                <div class="info-block">
                  <h3>Cari Bilgileri</h3>
                  <div class="info-grid">
                    <span class="label">Cari Kodu:</span>
                    <span class="value">${receipt.current.currentCode}</span>
                    <span class="label">Cari Adı:</span>
                    <span class="value">${receipt.current.currentName}</span>
                    ${
                      receipt.current.priceList
                        ? `
                    <span class="label">Fiyat Listesi:</span>
                    <span class="value">${receipt.current.priceList.priceListName}</span>
                    <span class="label">Para Birimi:</span>
                    <span class="value">${receipt.current.priceList.currency}</span>
                    `
                        : ""
                    }
                  </div>
                </div>`
                    : ""
                }
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Ürün Kodu</th>
                    <th>Ürün Adı</th>
                    <th>Birim</th>
                    <th class="text-right">Miktar</th>
                    <th class="text-right">Birim Fiyat</th>
                    <th class="text-right">KDV %</th>
                    <th class="text-right">İskonto</th>
                    <th class="text-right">Net Tutar</th>
                    <th class="text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  ${receipt.receiptDetail
                    .map(
                      (detail) => `
                    <tr>
                      <td>${detail.stockCard.productCode}</td>
                      <td>${detail.stockCard.productName}</td>
                      <td>${detail.stockCard.unit}</td>
                      <td class="text-right">${detail.quantity.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}</td>
                      <td class="text-right">${detail.unitPrice.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}</td>
                      <td class="text-right">${detail.vatRate.toLocaleString(
                        "tr-TR",
                        { minimumFractionDigits: 2 }
                      )}</td>
                      <td class="text-right">${detail.discount.toLocaleString(
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
                    <td colspan="3">Toplam</td>
                    <td class="text-right">${totalQuantity.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 2 }
                    )}</td>
                    <td colspan="4"></td>
                    <td class="text-right">${totalAmount.toLocaleString(
                      "tr-TR",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}</td>
                  </tr>
                </tbody>
              </table>

              ${
                receipt.currentMovement
                  ? `
              <div class="info-section">
                <div class="info-block">
                  <h3>Hareket Bilgileri</h3>
                  <div class="info-grid">
                    <span class="label">Hareket Tipi:</span>
                    <span class="value">${
                      receipt.currentMovement.movementType
                    }</span>
                    ${
                      receipt.currentMovement.documentType
                        ? `
                    <span class="label">Belge Tipi:</span>
                    <span class="value">${receipt.currentMovement.documentType}</span>`
                        : ""
                    }
                    ${
                      receipt.currentMovement.description
                        ? `
                    <span class="label">Açıklama:</span>
                    <span class="value">${receipt.currentMovement.description}</span>`
                        : ""
                    }
                    ${
                      receipt.currentMovement.debtAmount
                        ? `
                    <span class="label">Borç:</span>
                    <span class="value">${receipt.currentMovement.debtAmount.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 2 }
                    )}</span>`
                        : ""
                    }
                    ${
                      receipt.currentMovement.creditAmount
                        ? `
                    <span class="label">Alacak:</span>
                    <span class="value">${receipt.currentMovement.creditAmount.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 2 }
                    )}</span>`
                        : ""
                    }
                  </div>
                </div>
              </div>
              `
                  : ""
              }

              <div class="footer">
                <p>Oluşturan: ${
                  receipt.createdByUser
                    ? `${receipt.createdByUser.username} (${
                        receipt.createdByUser.firstName
                      } ${receipt.createdByUser.lastName || ""})`
                    : "Bilinmiyor"
                }</p>
                <p>Oluşturma Tarihi: ${format(
                  new Date(receipt.createdAt),
                  "dd.MM.yyyy HH:mm"
                )}</p>
              </div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
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
        `${process.env.BASE_URL}/warehouses/receipts/${receiptId}`,
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
          className="max-w-7xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
          aria-describedby="receipt-detail-description"
        >
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">
                  Fiş Detayı - {receipt?.documentNo}
                </span>
                {receipt && (
                  <Badge
                    className={cn(
                      "text-sm px-3 py-1",
                      receipt.receiptType === "Giris"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    )}
                  >
                    {receipt.receiptType === "Giris"
                      ? "Giriş Fişi"
                      : "Çıkış Fişi"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteAlert(true)}
                  disabled={!receipt}
                  className="bg-red-500 hover:bg-red-600 text-white gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!receipt}
                  className="gap-2 mr-2"
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
                  <span className="text-sm text-muted-foreground">
                    Yükleniyor...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {receipt && (
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Fiş Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">Fiş No:</span>
                        <span className="font-medium">
                          {receipt.documentNo}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">Tarih:</span>
                        <span className="font-medium">
                          {format(
                            new Date(receipt.createdAt),
                            "dd.MM.yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">Şube:</span>
                        <span className="font-medium">
                          {receipt.branchCode}
                        </span>
                      </div>
                      {receipt.description && (
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="text-muted-foreground">
                            Açıklama:
                          </span>
                          <span className="font-medium">
                            {receipt.description}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {receipt.current && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Cari Bilgileri
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="text-muted-foreground">
                            Cari Kodu:
                          </span>
                          <span className="font-medium">
                            {receipt.current.currentCode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="text-muted-foreground">
                            Cari Adı:
                          </span>
                          <span className="font-medium">
                            {receipt.current.currentName}
                          </span>
                        </div>
                        {receipt.current.priceList && (
                          <>
                            <div className="flex justify-between items-center py-1 border-b">
                              <span className="text-muted-foreground">
                                Fiyat Listesi:
                              </span>
                              <span className="font-medium">
                                {receipt.current.priceList.priceListName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b">
                              <span className="text-muted-foreground">
                                Para Birimi:
                              </span>
                              <span className="font-medium">
                                {receipt.current.priceList.currency}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b">
                              <span className="text-muted-foreground">
                                KDV Dahil:
                              </span>
                              <Badge
                                variant={
                                  receipt.current.priceList.isVatIncluded
                                    ? "default"
                                    : "secondary"
                                }
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

                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      Ürün Detayları
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Ürün Kodu</TableHead>
                            <TableHead>Ürün Adı</TableHead>
                            <TableHead>Birim</TableHead>
                            <TableHead className="text-right">Miktar</TableHead>
                            <TableHead className="text-right">
                              Birim Fiyat
                            </TableHead>
                            <TableHead className="text-right">KDV %</TableHead>
                            <TableHead className="text-right">
                              İskonto
                            </TableHead>
                            <TableHead className="text-right">
                              Net Tutar
                            </TableHead>
                            <TableHead className="text-right">Toplam</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receipt.receiptDetail.map((detail) => (
                            <TableRow
                              key={detail.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="font-medium">
                                {detail.stockCard.productCode}
                              </TableCell>
                              <TableCell>
                                {detail.stockCard.productName}
                              </TableCell>
                              <TableCell>{detail.stockCard.unit}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {detail.quantity.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {detail.unitPrice.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {detail.vatRate.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {detail.discount.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {detail.netPrice.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                {detail.totalPrice.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/50 font-medium">
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
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                        Hareket Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">
                          Hareket Tipi:
                        </span>
                        <Badge variant="outline">
                          {receipt.currentMovement.movementType}
                        </Badge>
                      </div>
                      {receipt.currentMovement.documentType && (
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="text-muted-foreground">
                            Belge Tipi:
                          </span>
                          <span className="font-medium">
                            {receipt.currentMovement.documentType}
                          </span>
                        </div>
                      )}
                      {receipt.currentMovement.description && (
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="text-muted-foreground">
                            Açıklama:
                          </span>
                          <span className="font-medium">
                            {receipt.currentMovement.description}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {receipt.currentMovement.debtAmount && (
                          <div className="p-4 rounded-lg bg-red-50">
                            <div className="text-sm text-red-600 mb-1">
                              Borç
                            </div>
                            <div className="text-lg font-semibold text-red-700 tabular-nums">
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
                          <div className="p-4 rounded-lg bg-green-50">
                            <div className="text-sm text-green-600 mb-1">
                              Alacak
                            </div>
                            <div className="text-lg font-semibold text-green-700 tabular-nums">
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

                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      Oluşturma Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {receipt.createdByUser && (
                      <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-muted-foreground">
                          Oluşturan:
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {receipt.createdByUser.username}
                          </Badge>
                          <span className="font-medium">
                            ({receipt.createdByUser.firstName}{" "}
                            {receipt.createdByUser.lastName})
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-muted-foreground">
                        Oluşturma Tarihi:
                      </span>
                      <span className="font-medium">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-red-600">
              Fişi Silmek İstediğinize Emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bu işlem geri alınamaz. Fiş ve ilgili tüm veriler kalıcı olarak
              silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
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
