"use client";

import React from "react";
import { DataGrid, Column } from "devextreme-react/data-grid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Current } from "./types";

interface CurrentDetailViewProps {
  data: Current;
}

const CurrentDetailView: React.FC<CurrentDetailViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderAddressGrid = () => {
    if (!data.currentAddress?.length) return null;
    return (
      <div className="mb-8">
        <h4 className="font-semibold mb-4 text-lg">Adres Bilgileri</h4>
        <DataGrid
          dataSource={data.currentAddress}
          showBorders={true}
          columnAutoWidth={true}
        >
          <Column dataField="addressName" caption="Adres Adı" />
          <Column dataField="addressType" caption="Adres Tipi" />
          <Column dataField="address" caption="Adres" />
          <Column dataField="city" caption="Şehir" />
          <Column dataField="district" caption="İlçe" />
          <Column dataField="phone" caption="Telefon" />
          <Column dataField="email" caption="E-posta" />
        </DataGrid>
      </div>
    );
  };

  const renderFinancialGrid = () => {
    if (!data.currentFinancial?.length) return null;
    return (
      <div className="mb-8">
        <h4 className="font-semibold mb-4 text-lg">Finansal Bilgiler</h4>
        <DataGrid
          dataSource={data.currentFinancial}
          showBorders={true}
          columnAutoWidth={true}
        >
          <Column dataField="bankName" caption="Banka Adı" />
          <Column dataField="bankBranch" caption="Şube" />
          <Column dataField="bankBranchCode" caption="Şube Kodu" />
          <Column dataField="accountNo" caption="Hesap No" />
          <Column dataField="iban" caption="IBAN" />
        </DataGrid>
      </div>
    );
  };

  const renderRiskGrid = () => {
    if (!data.currentRisk?.length) return null;
    return (
      <div className="mb-8">
        <h4 className="font-semibold mb-4 text-lg">Risk Bilgileri</h4>
        <DataGrid
          dataSource={data.currentRisk}
          showBorders={true}
          columnAutoWidth={true}
        >
          <Column dataField="currency" caption="Para Birimi" />
          <Column dataField="teminatYerelTutar" caption="Teminat Tutarı" />
          <Column dataField="acikHesapYerelLimit" caption="Açık Hesap Limiti" />
          <Column dataField="hesapKesimGunu" caption="Hesap Kesim Günü" />
          <Column dataField="vadeGun" caption="Vade (Gün)" />
          <Column dataField="gecikmeLimitGunu" caption="Gecikme Limit Günü" />
          <Column
            dataField="varsayilanAlisIskontosu"
            caption="Varsayılan Alış İskontosu"
          />
          <Column
            dataField="varsayilanSatisIskontosu"
            caption="Varsayılan Satış İskontosu"
          />
          <Column
            dataField="ekstreGonder"
            caption="Ekstre Gönder"
            dataType="boolean"
          />
          <Column
            dataField="limitKontrol"
            caption="Limit Kontrol"
            dataType="boolean"
          />
          <Column
            dataField="acikHesap"
            caption="Açık Hesap"
            dataType="boolean"
          />
          <Column
            dataField="posKullanim"
            caption="POS Kullanım"
            dataType="boolean"
          />
        </DataGrid>
      </div>
    );
  };

  const renderOfficialsGrid = () => {
    if (!data.currentOfficials?.length) return null;
    return (
      <div className="mb-8">
        <h4 className="font-semibold mb-4 text-lg">Yetkili Kişiler</h4>
        <DataGrid
          dataSource={data.currentOfficials}
          showBorders={true}
          columnAutoWidth={true}
        >
          <Column dataField="title" caption="Ünvan" />
          <Column dataField="name" caption="Ad" />
          <Column dataField="surname" caption="Soyad" />
          <Column dataField="phone" caption="Telefon" />
          <Column dataField="email" caption="E-posta" />
          <Column dataField="note" caption="Not" />
        </DataGrid>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Contact Information */}
        <div>
          <h4 className="font-semibold mb-4 text-lg">İletişim Bilgileri</h4>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Web Sitesi:</span>{" "}
              {data.webSite || "-"}
            </div>
            <div>
              <span className="font-medium">KEP Adresi:</span>{" "}
              {data.kepAddress || "-"}
            </div>
            <div>
              <span className="font-medium">Mersis No:</span>{" "}
              {data.mersisNo || "-"}
            </div>
            <div>
              <span className="font-medium">Sicil No:</span>{" "}
              {data.sicilNo || "-"}
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div>
          <h4 className="font-semibold mb-4 text-lg">Vergi Bilgileri</h4>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Vergi No:</span>{" "}
              {data.taxNumber || "-"}
            </div>
            <div>
              <span className="font-medium">Vergi Dairesi:</span>{" "}
              {data.taxOffice || "-"}
            </div>
            <div>
              <span className="font-medium">TC Kimlik No:</span>{" "}
              {data.identityNo || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Grids */}
      {renderAddressGrid()}
      {renderFinancialGrid()}
      {renderRiskGrid()}
      {renderOfficialsGrid()}

      {/* Empty State Messages */}
      <div className="space-y-4">
        {(!data.currentAddress || data.currentAddress.length === 0) && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm">
              Bu cari için kayıtlı adres bilgisi bulunmamaktadır.
            </p>
          </div>
        )}

        {(!data.currentFinancial || data.currentFinancial.length === 0) && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm">
              Bu cari için kayıtlı finansal bilgi bulunmamaktadır.
            </p>
          </div>
        )}

        {(!data.currentRisk || data.currentRisk.length === 0) && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm">
              Bu cari için kayıtlı risk bilgisi bulunmamaktadır.
            </p>
          </div>
        )}

        {(!data.currentOfficials || data.currentOfficials.length === 0) && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm">
              Bu cari için kayıtlı yetkili kişi bulunmamaktadır.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentDetailView;
