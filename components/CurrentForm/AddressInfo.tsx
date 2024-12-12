"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ADDRESS_TYPES, AddressInfo as AddressInfoType } from "./types";
import { useCurrentForm } from "./hooks/useCurrentForm";

const AddressInfo: React.FC = () => {
  const { formData, updateFormData } = useCurrentForm();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const addNewAddress = () => {
    const newAddress: AddressInfoType = {
      addressName: "",
      addressType: "Invoice",
      address: "",
      province: "",
      district: "",
      countryCode: "",
      postalCode: "",
      phone: "",
      phone2: "",
      email: "",
      email2: "",
    };

    updateFormData({
      addresses: [...formData.addresses, newAddress],
    });
  };

  const updateAddress = (
    index: number,
    field: keyof AddressInfoType,
    value: string
  ) => {
    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value,
    };
    updateFormData({ addresses: updatedAddresses });
  };

  const handleDeleteAddress = (index: number) => {
    setAddressToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAddress = () => {
    if (addressToDelete !== null) {
      const updatedAddresses = formData.addresses.filter(
        (_, i) => i !== addressToDelete
      );
      updateFormData({ addresses: updatedAddresses });
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Adres Bilgileri</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addNewAddress}
            className="bg-[#84CC16] hover:bg-[#65A30D] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Adres Ekle
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          {formData.addresses.map((address, index) => (
            <div key={index} className="mb-6">
              {index > 0 && <Separator className="my-6" />}
              <div className="grid gap-4">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <Label>Adres Adı</Label>
                      <Input
                        value={address.addressName}
                        onChange={(e) =>
                          updateAddress(index, "addressName", e.target.value)
                        }
                        placeholder="Adres adını giriniz"
                      />
                    </div>
                    <div>
                      <Label>Adres Tipi</Label>
                      <Select
                        value={address.addressType}
                        onValueChange={(value) =>
                          updateAddress(index, "addressType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Adres tipi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {ADDRESS_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAddress(index)}
                    className="ml-2 text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>Adres</Label>
                  <Input
                    value={address.address}
                    onChange={(e) =>
                      updateAddress(index, "address", e.target.value)
                    }
                    placeholder="Adresi giriniz"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>İl</Label>
                    <Input
                      value={address.province}
                      onChange={(e) =>
                        updateAddress(index, "province", e.target.value)
                      }
                      placeholder="İl giriniz"
                    />
                  </div>
                  <div>
                    <Label>İlçe</Label>
                    <Input
                      value={address.district}
                      onChange={(e) =>
                        updateAddress(index, "district", e.target.value)
                      }
                      placeholder="İlçe giriniz"
                    />
                  </div>
                  <div>
                    <Label>Posta Kodu</Label>
                    <Input
                      value={address.postalCode}
                      onChange={(e) =>
                        updateAddress(index, "postalCode", e.target.value)
                      }
                      placeholder="Posta kodu giriniz"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      value={address.phone}
                      onChange={(e) =>
                        updateAddress(index, "phone", e.target.value)
                      }
                      placeholder="Telefon giriniz"
                    />
                  </div>
                  <div>
                    <Label>Telefon 2</Label>
                    <Input
                      value={address.phone2}
                      onChange={(e) =>
                        updateAddress(index, "phone2", e.target.value)
                      }
                      placeholder="Alternatif telefon giriniz"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-posta</Label>
                    <Input
                      type="email"
                      value={address.email}
                      onChange={(e) =>
                        updateAddress(index, "email", e.target.value)
                      }
                      placeholder="E-posta giriniz"
                    />
                  </div>
                  <div>
                    <Label>E-posta 2</Label>
                    <Input
                      type="email"
                      value={address.email2}
                      onChange={(e) =>
                        updateAddress(index, "email2", e.target.value)
                      }
                      placeholder="Alternatif e-posta giriniz"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adresi Sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri
                alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAddress}
                className="bg-red-500 hover:bg-red-600"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default AddressInfo;
