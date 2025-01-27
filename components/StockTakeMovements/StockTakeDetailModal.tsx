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
  Paper,
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        Stok Sayım Detayı
        <IconButton onClick={onClose}>
          <X className="h-4 w-4" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Sayım Bilgileri</h3>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Belge No:</span>{" "}
                  {data.documentNo}
                </p>
                <p>
                  <span className="font-medium">Durum:</span> {data.status}
                </p>
                <p>
                  <span className="font-medium">Sayım Tipi:</span>{" "}
                  {data.stockTakeType}
                </p>
                <p>
                  <span className="font-medium">Referans:</span>{" "}
                  {data.reference}
                </p>
                <p>
                  <span className="font-medium">Başlangıç:</span>{" "}
                  {new Date(data.startedAt).toLocaleString("tr-TR")}
                </p>
                <p>
                  <span className="font-medium">Oluşturan:</span>{" "}
                  {data.createdBy}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Depo Bilgileri</h3>
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Depo Adı:</span>{" "}
                  {data.warehouse.warehouseName}
                </p>
                <p>
                  <span className="font-medium">Depo Kodu:</span>{" "}
                  {data.warehouse.warehouseCode}
                </p>
                <p>
                  <span className="font-medium">Adres:</span>{" "}
                  {data.warehouse.address}
                </p>
                <p>
                  <span className="font-medium">Şehir:</span>{" "}
                  {data.warehouse.city}
                </p>
                <p>
                  <span className="font-medium">İlçe:</span>{" "}
                  {data.warehouse.district}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Sayım Detayları</h3>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün Kodu</TableCell>
                    <TableCell>Ürün Adı</TableCell>
                    <TableCell>Birim</TableCell>
                    <TableCell align="right">Miktar</TableCell>
                    <TableCell align="right">Fark</TableCell>
                    <TableCell>Not</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.stockCard.productCode}</TableCell>
                      <TableCell>{detail.stockCard.productName}</TableCell>
                      <TableCell>{detail.stockCard.unit}</TableCell>
                      <TableCell align="right">{detail.quantity}</TableCell>
                      <TableCell align="right">{detail.difference}</TableCell>
                      <TableCell>{detail.note}</TableCell>
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
