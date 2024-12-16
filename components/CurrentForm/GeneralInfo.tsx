"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENT_TYPES, INSTITUTION_TYPES, PriceList } from "./types";

const GeneralInfo: React.FC<{
  formData: any;
  updateFormData: (data: any) => void;
}> = ({ formData, updateFormData }) => {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);

  useEffect(() => {
    const fetchPriceLists = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/priceLists`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch price lists");
        const data = await response.json();
        setPriceLists(data);
      } catch (error) {
        console.error("Error fetching price lists:", error);
      }
    };

    fetchPriceLists();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cari Kodu</Label>
              <Input
                value={formData.currentCode}
                onChange={(e) =>
                  updateFormData({ currentCode: e.target.value })
                }
                placeholder="Cari kodu giriniz"
              />
            </div>
            <div>
              <Label>Cari Adı</Label>
              <Input
                value={formData.currentName}
                onChange={(e) =>
                  updateFormData({ currentName: e.target.value })
                }
                placeholder="Cari adını giriniz"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ad</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                placeholder="Ad giriniz"
              />
            </div>
            <div>
              <Label>Soyad</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                placeholder="Soyad giriniz"
              />
            </div>
          </div>

          <div>
            <Label>Fiyat Listesi</Label>
            <Select
              value={formData.priceListId}
              onValueChange={(value) => updateFormData({ priceListId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fiyat listesi seçin" />
              </SelectTrigger>
              <SelectContent>
                {priceLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.priceListName} ({list.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cari Tipi</Label>
              <Select
                value={formData.currentType}
                onValueChange={(value) =>
                  updateFormData({ currentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cari tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kurum Tipi</Label>
              <Select
                value={formData.institution}
                onValueChange={(value) =>
                  updateFormData({ institution: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kurum tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>TC Kimlik No</Label>
              <Input
                value={formData.identityNo}
                onChange={(e) => updateFormData({ identityNo: e.target.value })}
                placeholder="TC kimlik no giriniz"
              />
            </div>
            <div>
              <Label>Vergi No</Label>
              <Input
                value={formData.taxNumber}
                onChange={(e) => updateFormData({ taxNumber: e.target.value })}
                placeholder="Vergi no giriniz"
              />
            </div>
          </div>

          <div>
            <Label>Vergi Dairesi</Label>
            <Input
              value={formData.taxOffice}
              onChange={(e) => updateFormData({ taxOffice: e.target.value })}
              placeholder="Vergi dairesi giriniz"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>KEP Adresi</Label>
              <Input
                value={formData.kepAddress}
                onChange={(e) => updateFormData({ kepAddress: e.target.value })}
                placeholder="KEP adresi giriniz"
              />
            </div>
            <div>
              <Label>MERSIS No</Label>
              <Input
                value={formData.mersisNo}
                onChange={(e) => updateFormData({ mersisNo: e.target.value })}
                placeholder="MERSIS no giriniz"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sicil No</Label>
              <Input
                value={formData.sicilNo}
                onChange={(e) => updateFormData({ sicilNo: e.target.value })}
                placeholder="Sicil no giriniz"
              />
            </div>
            <div>
              <Label>Ünvan</Label>
              <Input
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Ünvan giriniz"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Web Sitesi</Label>
              <Input
                value={formData.webSite}
                onChange={(e) => updateFormData({ webSite: e.target.value })}
                placeholder="Web sitesi giriniz"
              />
            </div>
            <div>
              <Label>Doğum Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.birthOfDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthOfDate ? (
                      format(formData.birthOfDate, "PPP")
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.birthOfDate || undefined}
                    onSelect={(date) => updateFormData({ birthOfDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInfo;
