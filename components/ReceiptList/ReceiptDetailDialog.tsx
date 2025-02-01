"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Printer, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReceiptDetail } from "./types";
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
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { toast } = useToast();

  const handlePrint = useCallback(() => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Yazdırma penceresi açılamadı");
      }

      // Format the receipt details for printing
      const totalAmount = receipt.receiptDetail.reduce(
        (sum, detail) => sum + parseFloat(detail.totalPrice),
        0
      );

      const totalQuantity = receipt.receiptDetail.reduce(
        (sum, detail) => sum + parseFloat(detail.quantity),
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
                      new Date(receipt.receiptDate),
                      "dd.MM.yyyy HH:mm"
                    )}</span>
                    <span class="label">Şube:</span>
                    <span class="value">${receipt.branchCode}</span>
                    <span class="label">Açıklama:</span>
                    <span class="value">${receipt.description}</span>
                  </div>
                </div>
                
                <div class="info-block">
                  <h3>Cari Bilgileri</h3>
                  <div class="info-grid">
                    <span class="label">Cari Kodu:</span>
                    <span class="value">${receipt.current.currentCode}</span>
                    <span class="label">Cari Adı:</span>
                    <span class="value">${receipt.current.currentName}</span>
                    <span class="label">Cari Tipi:</span>
                    <span class="value">${receipt.current.currentType}</span>
                  </div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Ürün Kodu</th>
                    <th>Ürün Adı</th>
                    <th class="text-right">Miktar</th>
                    <th>Birim</th>
                    <th class="text-right">B.Fiyat</th>
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
                      <td class="text-right">${detail.quantity}</td>
                      <td>${detail.stockCard.unit}</td>
                      <td class="text-right">${parseFloat(
                        detail.unitPrice
                      ).toFixed(2)}</td>
                      <td class="text-right">${parseFloat(
                        detail.totalPrice
                      ).toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join("")}
                  <tr class="total-row">
                    <td colspan="5" class="text-right">Genel Toplam:</td>
                    <td class="text-right">${totalAmount.toLocaleString(
                      "tr-TR",
                      { minimumFractionDigits: 2 }
                    )} ${receipt.current.priceList.currency}</td>
                  </tr>
                </tbody>
              </table>

              <div class="summary-section">
                <div class="summary-item">
                  <span class="summary-label">Toplam Ürün Kalemi:</span>
                  <span class="summary-value">${
                    receipt.receiptDetail.length
                  }</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Toplam Ürün Adedi:</span>
                  <span class="summary-value">${totalQuantity.toLocaleString(
                    "tr-TR",
                    { maximumFractionDigits: 2 }
                  )}</span>
                </div>
              </div>

              <div class="footer">
                <p>
                  Oluşturan: ${receipt.createdByUser.firstName} ${
        receipt.createdByUser.lastName
      } | 
                  Tarih: ${format(
                    new Date(receipt.createdAt),
                    "dd.MM.yyyy HH:mm"
                  )} | 
                  Belge No: ${receipt.documentNo}
                </p>
              </div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
      printWindow.close();

      toast({
        title: "Başarılı",
        description: "Yazdırma işlemi başlatıldı",
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description:
          error instanceof Error
            ? error.message
            : "Yazdırma işlemi başarısız oldu",
      });
    }
  }, [receipt, toast]);

  const handleDelete = async () => {
    if (!receipt) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/warehouses/order-prepare/${receipt.id}`,
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
        description: error instanceof Error ? error.message : "Fiş silinemedi",
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
          throw new Error("Failed to fetch receipt details");
        }

        const data = await response.json();
        setReceipt(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching receipt details"
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch receipt details",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && receiptId) {
      fetchReceiptDetail();
    }
  }, [isOpen, receiptId, toast]);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Fiş Detayı</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading receipt details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fiş Detayı</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  if (!receipt) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Fiş Detayı - {receipt?.documentNo}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Yükleniyor...</span>
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : receipt ? (
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Üst Bilgiler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">
                        Fiş Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fiş Tipi:</span>
                        <Badge
                          variant={
                            receipt.receiptType === "Giris"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {receipt.receiptType === "Giris"
                            ? "Giriş Fişi"
                            : "Çıkış Fişi"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Fiş Tarihi:
                        </span>
                        <span>
                          {format(
                            new Date(receipt.receiptDate),
                            "dd.MM.yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Şube:</span>
                        <span>{receipt.branchCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Açıklama:</span>
                        <span>{receipt.description}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium">
                        Cari Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Cari Kodu:
                        </span>
                        <span>{receipt.current.currentCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cari Adı:</span>
                        <span>{receipt.current.currentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vergi No:</span>
                        <span>{receipt.current.taxNumber || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Vergi Dairesi:
                        </span>
                        <span>{receipt.current.taxOffice || "-"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Ürün Tablosu */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">
                        Ürün Detayları
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteAlert(true)}
                          disabled={loading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrint}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Yazdır
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ürün Kodu</TableHead>
                            <TableHead>Ürün Adı</TableHead>
                            <TableHead className="text-right">Miktar</TableHead>
                            <TableHead>Birim</TableHead>
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
                            <TableRow key={detail.id}>
                              <TableCell>
                                {detail.stockCard.productCode}
                              </TableCell>
                              <TableCell>
                                {detail.stockCard.productName}
                              </TableCell>
                              <TableCell className="text-right">
                                {detail.quantity}
                              </TableCell>
                              <TableCell>{detail.stockCard.unit}</TableCell>
                              <TableCell className="text-right">
                                {parseFloat(detail.unitPrice).toLocaleString(
                                  "tr-TR",
                                  { minimumFractionDigits: 2 }
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {detail.vatRate}
                              </TableCell>
                              <TableCell className="text-right">
                                {detail.discount}
                              </TableCell>
                              <TableCell className="text-right">
                                {parseFloat(detail.netPrice).toLocaleString(
                                  "tr-TR",
                                  { minimumFractionDigits: 2 }
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {parseFloat(detail.totalPrice).toLocaleString(
                                  "tr-TR",
                                  { minimumFractionDigits: 2 }
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/50 font-medium">
                            <TableCell colSpan={8} className="text-right">
                              Genel Toplam:
                            </TableCell>
                            <TableCell className="text-right">
                              {receipt.receiptDetail
                                .reduce(
                                  (sum, detail) =>
                                    sum + parseFloat(detail.totalPrice),
                                  0
                                )
                                .toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                })}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 flex justify-end gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>Toplam Ürün Kalemi:</span>
                        <span className="font-medium text-foreground">
                          {receipt.receiptDetail.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Toplam Ürün Adedi:</span>
                        <span className="font-medium text-foreground">
                          {receipt.receiptDetail
                            .reduce(
                              (sum, detail) =>
                                sum + parseFloat(detail.quantity),
                              0
                            )
                            .toLocaleString("tr-TR", {
                              maximumFractionDigits: 2,
                            })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Fişi Silmek İstediğinize Emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Fiş ve ilgili tüm veriler kalıcı olarak
              silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Siliniyor...
                </>
              ) : (
                "Evet, Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReceiptDetailDialog;
