import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockTakeDetail {
  id: string;
  documentNo: string;
  warehouseId: string;
  branchCode: string;
  stockTakeType: string;
  status: string;
  description: string | null;
  reference: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
  warehouse: {
    id: string;
    warehouseName: string;
    warehouseCode: string;
    address: string;
    countryCode: string;
    city: string;
    district: string;
    phone: string;
    email: string;
  };
  details: Array<{
    id: string;
    stockTakeId: string;
    stockCardId: string;
    quantity: string;
    difference: string;
    note: string;
    stockCard: {
      id: string;
      productCode: string;
      productName: string;
      unit: string;
    };
  }>;
}

interface StockTakeDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: StockTakeDetail | null;
}

const StockTakeDetailModal = ({
  open,
  onClose,
  data,
}: StockTakeDetailModalProps) => {
  if (!data) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "secondary" as const;
      case "InProgress":
        return "default" as const;
      case "Cancelled":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Completed":
        return "Tamamlandı";
      case "InProgress":
        return "Devam Ediyor";
      case "Cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const getTypeVariant = (
    type: string
  ): "default" | "outline" | "secondary" => {
    switch (type) {
      case "Full":
        return "default";
      case "Partial":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "Full":
        return "Tam Sayım";
      case "Partial":
        return "Kısmi Sayım";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-xl">Stok Sayım Detayı</DialogTitle>
              <Badge variant={getStatusVariant(data.status)}>
                {getStatusText(data.status)}
              </Badge>
              <Badge variant={getTypeVariant(data.stockTakeType)}>
                {getTypeText(data.stockTakeType)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6 p-1">
            <div className="grid grid-cols-2 gap-8">
              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Sayım Bilgileri</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Belge No</div>
                    <div className="font-medium">{data.documentNo}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Referans</div>
                    <div className="font-medium">{data.reference || "-"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Başlangıç</div>
                    <div className="font-medium">
                      {new Date(data.startedAt).toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Oluşturan</div>
                    <div className="font-medium">{data.createdBy}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Açıklama</div>
                    <div className="font-medium">{data.description || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Depo Bilgileri</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Depo Adı</div>
                    <div className="font-medium">
                      {data.warehouse.warehouseName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Depo Kodu</div>
                    <div className="font-medium">
                      {data.warehouse.warehouseCode}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Şehir/İlçe</div>
                    <div className="font-medium">
                      {data.warehouse.city} / {data.warehouse.district}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Telefon</div>
                    <div className="font-medium">{data.warehouse.phone}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">E-posta</div>
                    <div className="font-medium">{data.warehouse.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Sayım Detayları</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün Kodu</TableHead>
                    <TableHead>Ürün Adı</TableHead>
                    <TableHead>Birim</TableHead>
                    <TableHead className="text-right">Miktar</TableHead>
                    <TableHead className="text-right">Fark</TableHead>
                    <TableHead>Not</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">
                        {detail.stockCard.productCode}
                      </TableCell>
                      <TableCell>{detail.stockCard.productName}</TableCell>
                      <TableCell>{detail.stockCard.unit}</TableCell>
                      <TableCell className="text-right font-medium">
                        {detail.quantity}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          Number(detail.difference) > 0
                            ? "text-green-600"
                            : Number(detail.difference) < 0
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {Number(detail.difference) > 0 ? "+" : ""}
                        {detail.difference}
                      </TableCell>
                      <TableCell>{detail.note || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StockTakeDetailModal;
