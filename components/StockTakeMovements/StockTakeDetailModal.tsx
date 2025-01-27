import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from "@mui/material";
import { X } from "lucide-react";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "InProgress":
        return "warning";
      case "Cancelled":
        return "error";
      default:
        return "default";
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Full":
        return "primary";
      case "Partial":
        return "info";
      default:
        return "default";
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <DialogTitle
        className="flex justify-between items-center bg-gray-50 px-6 py-4"
        sx={{ margin: 0 }}
      >
        <div className="flex items-center space-x-4">
          <span className="text-xl font-semibold">Stok Sayım Detayı</span>
          <Chip
            label={getStatusText(data.status)}
            color={getStatusColor(data.status) as any}
            size="small"
          />
          <Chip
            label={getTypeText(data.stockTakeType)}
            color={getTypeColor(data.stockTakeType) as any}
            size="small"
            variant="outlined"
          />
        </div>
        <IconButton
          onClick={onClose}
          className="hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </IconButton>
      </DialogTitle>
      <DialogContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Sayım Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Belge No</div>
                  <div className="font-medium">{data.documentNo}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Referans</div>
                  <div className="font-medium">{data.reference || "-"}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Başlangıç</div>
                  <div className="font-medium">
                    {new Date(data.startedAt).toLocaleString("tr-TR")}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Oluşturan</div>
                  <div className="font-medium">{data.createdBy}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Açıklama</div>
                  <div className="font-medium">{data.description || "-"}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Depo Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Depo Adı</div>
                  <div className="font-medium">
                    {data.warehouse.warehouseName}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Depo Kodu</div>
                  <div className="font-medium">
                    {data.warehouse.warehouseCode}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Şehir/İlçe</div>
                  <div className="font-medium">
                    {data.warehouse.city} / {data.warehouse.district}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Telefon</div>
                  <div className="font-medium">{data.warehouse.phone}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">E-posta</div>
                  <div className="font-medium">{data.warehouse.email}</div>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Sayım Detayları
              </h3>
            </div>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold">Ürün Kodu</TableCell>
                    <TableCell className="font-semibold">Ürün Adı</TableCell>
                    <TableCell className="font-semibold">Birim</TableCell>
                    <TableCell className="font-semibold" align="right">
                      Miktar
                    </TableCell>
                    <TableCell className="font-semibold" align="right">
                      Fark
                    </TableCell>
                    <TableCell className="font-semibold">Not</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.details.map((detail) => (
                    <TableRow key={detail.id} hover>
                      <TableCell className="font-medium">
                        {detail.stockCard.productCode}
                      </TableCell>
                      <TableCell>{detail.stockCard.productName}</TableCell>
                      <TableCell>{detail.stockCard.unit}</TableCell>
                      <TableCell align="right" className="font-medium">
                        {detail.quantity}
                      </TableCell>
                      <TableCell
                        align="right"
                        className={`font-medium ${
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
            </TableContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockTakeDetailModal;
