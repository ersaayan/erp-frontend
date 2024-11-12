"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tag, TagInput } from "emblor";
import { Card, CardContent } from "@/components/ui/card";
import {
  RefreshCcw,
  AlertCircle,
  Loader2,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StockProperties from "./StockProperties";
import StockManufacturers from "./StockManufacturers";
import StockUnits from "./StockUnits";
import CategorySelector from "./CategorySelector";
import { Alert, AlertDescription } from "../ui/alert";
import { useWarehouses } from "./hooks/useWarehouses";
import { useBrands } from "./hooks/useBrands";
import { useCategories } from "./hooks/useCategories";
import ImagePreview from "./ImagePreview";
import { useStockForm } from "./hooks/useStockForm";
import Image from "next/image";
import { SelectedProperty, Manufacturer, StockUnit } from "./types";
import { usePriceLists } from "./hooks/usePriceLists";
import { useAttributes } from "./hooks/useAttributes";

const currencies = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

const productTypes = [
  { value: "BasitUrun", label: "Basit Ürün" },
  { value: "VaryasyonluUrun", label: "Varyasyonlu Ürün" },
  { value: "DijitalUrun", label: "Dijital Ürün" },
  { value: "Hizmet", label: "Hizmet" },
];

const units = [
  { value: "Adet", label: "Adet" },
  { value: "Kg", label: "Kg" },
  { value: "Lt", label: "Lt" },
  { value: "M", label: "M" },
  { value: "M2", label: "M2" },
  { value: "M3", label: "M3" },
  { value: "Paket", label: "Paket" },
  { value: "Koli", label: "Koli" },
  { value: "Kutu", label: "Kutu" },
  { value: "Ton", label: "Ton" },
];

interface FormErrors {
  productName?: string;
  productCode?: string;
  unit?: string;
  brandId?: string;
  maliyetFiyat?: string;
  categories?: string;
}

const StockForm: React.FC = () => {
  const { toast } = useToast();
  const [isSerili, setIsSerili] = useState(false);
  const [isYerli, setIsYerli] = useState(false);
  const [barcodes, setBarcodes] = useState<Tag[]>([]);
  const [marketNames, setMarketNames] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const {
    warehouses,
    loading: warehousesLoading,
    error: warehousesError,
  } = useWarehouses();
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const { refreshCategories, loading: categoriesLoading } = useCategories();
  const [activeTab, setActiveTab] = useState("genel");
  const { attributes } = useAttributes();

  const {
    formState,
    loading: saveLoading,
    error: saveError,
    updateStockCard,
    updateBarcodes,
    updateMarketNames,
    updateCategories,
    updateWarehouse,
    updateEFatura,
    updateAttributes,
    updateManufacturers,
    updatePriceListItems,
    saveStockCard,
  } = useStockForm();

  const { priceLists } = usePriceLists();
  const [selectedProperties, setSelectedProperties] = useState([]);

  const memoizedSetSelectedProperties = useCallback(
    (properties) => setSelectedProperties(properties),
    []
  );

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [unitList, setUnitList] = useState<StockUnit[]>([]);
  // Initialize state from formState
  useEffect(() => {
    if (formState.attributes.length > 0 && attributes.length > 0 && selectedProperties.length === 0) {
      const transformedProperties = formState.attributes.reduce((acc, attr) => {
        const attribute = attributes.find((a) => a.id === attr.attributeId);
        if (!attribute) return acc;

        const existingProperty = acc.find(
          (p) => p.propertyName === attribute.attributeName
        );
        if (existingProperty) {
          if (!existingProperty.selectedValues.includes(attr.value)) {
            existingProperty.selectedValues.push(attr.value);
            existingProperty.attributeIds.push(attr.attributeId);
          }
        } else {
          acc.push({
            propertyName: attribute.attributeName,
            selectedValues: [attr.value],
            attributeIds: [attr.attributeId],
          });
        }
        return acc;
      }, [] as SelectedProperty[]);

      setSelectedProperties(transformedProperties);
    }
    if (formState.manufacturers.length > 0) {
      setManufacturers(
        formState.manufacturers.map((m) => ({
          id: m.id?.toString() || '', // Ensure 'id' is a string
          brandName: "",
          brandCode: "",
          currentId: m.currentId,
          stockName: m.productName,
          code: m.productCode,
          barcode: m.barcode,
          brandId: m.brandId,
        }))
      );
    }
    if (formState.priceListItems.length > 0) {
      setUnitList(
        formState.priceListItems.map((item) => {
          const calculatedPriceWithVat = item.price * (1 + (item.vatRate ?? 0) / 100);

          return {
            id: item.id?.toString() || '', // Ensure 'id' is a string
            value: "",
            label: "",
            priceListId: item.priceListId,
            vatRate: item.vatRate,
            price: item.price,
            priceWithVat: parseFloat(calculatedPriceWithVat.toFixed(2)),
            barcode: item.barcode,
          };
        })
      );
    }

    if (formState.barcodes.length > 0) {
      setBarcodes(formState.barcodes.map(b => ({ id: Math.random().toString(), text: b.barcode })));
    }

    if (formState.marketNames.length > 0) {
      setMarketNames(formState.marketNames.map(m => ({ id: Math.random().toString(), text: m.marketName })));
    }

    if (formState.categoryItem.length > 0) {
      setSelectedCategories(formState.categoryItem.map(c => c.categoryId));
    }
  }, [formState.attributes, attributes, formState.manufacturers, formState.priceListItems, formState.barcodes, formState.marketNames, formState.categoryItem]);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formState.stockCard.productName.trim()) {
      errors.productName = "Stok adı zorunludur";
    }

    if (!formState.stockCard.productCode.trim()) {
      errors.productCode = "Stok kodu zorunludur";
    }

    if (!formState.stockCard.unit) {
      errors.unit = "Birim seçimi zorunludur";
    }

    if (!formState.stockCard.brandId) {
      errors.brandId = "Marka seçimi zorunludur";
    }

    if (formState.stockCard.maliyetFiyat < 0) {
      errors.maliyetFiyat = "Maliyet fiyatı 0'dan küçük olamaz";
    }

    if (selectedCategories.length === 0) {
      errors.categories = "En az bir kategori seçilmelidir";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState, selectedCategories]);

  const handleSave = useCallback(async () => {
    console.log("Doğrulama hatası tespit edildi");
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Doğrulama Hatası",
        description: "Lütfen zorunlu alanları doldurun",
      });
      return;
    }

    if (attributes.length === 0) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Özellikler henüz yüklenmedi",
      });
      return;
    }

    try {
      // Yeni değerleri lokal değişkenlerde saklayın
      const updatedMarketNames = marketNames.map((tag) => ({ marketName: tag.text }));
      const updatedMarketNamesState = marketNames.map((tag) => tag.text);

      const updatedCategoryItems = selectedCategories.map((categoryId) => ({ categoryId: categoryId }));
      const updatedCategoryItemsState = selectedCategories;

      const updatedAttributes = selectedProperties.flatMap((prop) => {
        return prop.selectedValues.map((value, index) => ({
          attributeId: prop.attributeIds[index],
          value: value,
        }));
      });

      const updatedManufacturers = manufacturers.map((m) => ({
        id: m.id?.toString() || '', // Ensure 'id' is a string
        productCode: m.code,
        productName: m.stockName,
        barcode: m.barcode,
        brandId: m.brandId,
        currentId: m.currentId,
      }));

      const updatedPriceListItems = unitList.map((unit) => {
        const calculatedPriceWithVat = unit.price * (1 + (unit.vatRate ?? 0) / 100);

        return {
          id: unit.id?.toString() || '', // Ensure 'id' is a string
          priceListId: unit.priceListId,
          price: unit.price,
          vatRate: unit.vatRate,
          priceWithVat: parseFloat(calculatedPriceWithVat.toFixed(2)),
          barcode: unit.barcode,
        };
      });

      const updatedBarcodes = [
        ...barcodes.map((tag) => ({ barcode: tag.text }))
      ];
      const updatedBarcodesState = [
        ...barcodes.map((tag) => tag.text)
      ];

      // State'i güncelleyin (opsiyonel)
      updateAttributes(updatedAttributes);
      updateManufacturers(updatedManufacturers);
      updatePriceListItems(updatedPriceListItems);
      updateBarcodes(updatedBarcodesState);
      updateMarketNames(updatedMarketNamesState);
      updateCategories(updatedCategoryItemsState);

      // Güncel form verisini oluşturun
      const updatedFormState = {
        ...formState,
        marketNames: updatedMarketNames,
        attributes: updatedAttributes,
        manufacturers: updatedManufacturers,
        priceListItems: updatedPriceListItems,
        barcodes: updatedBarcodes,
        categoryItem: updatedCategoryItems,
      };

      await saveStockCard(priceLists, updatedFormState);

      toast({
        variant: "success",
        title: "Başarılı",
        description: "Stok kartı başarıyla kaydedildi",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    }
  }, [
    attributes,
    barcodes,
    formState,
    manufacturers,
    marketNames,
    priceLists,
    selectedCategories,
    selectedProperties,
    unitList,
    updateAttributes,
    updateBarcodes,
    updateCategories,
    updateManufacturers,
    updateMarketNames,
    updatePriceListItems,
    validateForm,
  ]);

  const handleImageUpload = async () => {
    try {
      setImageUploadLoading(true);
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = true;

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          const newImages: string[] = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            await new Promise((resolve) => {
              reader.onload = (e) => {
                if (e.target?.result) {
                  newImages.push(e.target.result as string);
                }
                resolve(null);
              };
              reader.readAsDataURL(file);
            });
          }
          setImages((prev) => [...prev, ...newImages]);
        }
      };

      input.click();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Resimler yüklenirken bir hata oluştu",
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleNavigatePreview = (direction: "prev" | "next") => {
    if (previewImage === null) return;

    if (direction === "prev" && previewImage > 0) {
      setPreviewImage(previewImage - 1);
    } else if (direction === "next" && previewImage < images.length - 1) {
      setPreviewImage(previewImage + 1);
    }
  };
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4 px-4 pt-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Stok Formu</h2>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.stockCard.stockStatus}
              onCheckedChange={(checked) =>
                updateStockCard("stockStatus", checked)
              }
              id="active-status"
            />
            <Label htmlFor="active-status" className="font-medium">
              {formState.stockCard.stockStatus ? "Aktif" : "Pasif"}
            </Label>
          </div>
        </div>
        <Button variant="default" onClick={handleSave} disabled={saveLoading}>
          {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {formState.isUpdateMode ? "Güncelle" : "Kaydet"}
        </Button>
      </div>

      <div className="flex-grow overflow-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-4">
            <TabsTrigger value="genel">Genel</TabsTrigger>
            <TabsTrigger value="diger">Diğer</TabsTrigger>
            <TabsTrigger value="resmi-fatura">Resmi Fatura</TabsTrigger>
            <TabsTrigger value="ozellikler">Özellikler</TabsTrigger>
            <TabsTrigger value="uretciler">Üreticiler</TabsTrigger>
            <TabsTrigger value="birimler">Birimler</TabsTrigger>
          </TabsList>

          <TabsContent value="genel">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Categories Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-lg font-semibold">
                        Kategoriler
                      </Label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={refreshCategories}
                          disabled={categoriesLoading}
                        >
                          <RefreshCcw
                            className={`h-4 w-4 mr-2 ${categoriesLoading ? "animate-spin" : ""
                              }`}
                          />
                          Yenile
                        </Button>
                      </div>
                    </div>
                    <CategorySelector
                      selectedCategories={selectedCategories}
                      onCategoryChange={setSelectedCategories}
                    />
                    {formErrors.categories && (
                      <p className="text-sm text-destructive mt-1">
                        {formErrors.categories}
                      </p>
                    )}
                  </div>

                  {/* Basic Info Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Stok Adı</Label>
                      <Input
                        id="productName"
                        value={formState.stockCard.productName}
                        onChange={(e) =>
                          updateStockCard("productName", e.target.value)
                        }
                        placeholder="Stok adını giriniz"
                        className={
                          formErrors.productName ? "border-destructive" : ""
                        }
                      />
                      {formErrors.productName && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.productName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="productCode">Stok Kodu</Label>
                      <Input
                        id="productCode"
                        value={formState.stockCard.productCode}
                        onChange={(e) =>
                          updateStockCard("productCode", e.target.value)
                        }
                        placeholder="Stok kodunu giriniz"
                        className={
                          formErrors.productCode ? "border-destructive" : ""
                        }
                      />
                      {formErrors.productCode && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.productCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="unit">Birim</Label>
                      <Select
                        value={formState.stockCard.unit}
                        onValueChange={(value) =>
                          updateStockCard("unit", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            formErrors.unit ? "border-destructive" : ""
                          }
                        >
                          <SelectValue placeholder="Birim seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.unit && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.unit}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="brand">Marka</Label>
                      {brandsLoading ? (
                        <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground">
                            Y��kleniyor...
                          </span>
                        </div>
                      ) : brandsError ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{brandsError}</AlertDescription>
                        </Alert>
                      ) : (
                        <Select
                          value={formState.stockCard.brandId}
                          onValueChange={(value) =>
                            updateStockCard("brandId", value)
                          }
                        >
                          <SelectTrigger
                            className={
                              formErrors.brandId ? "border-destructive" : ""
                            }
                          >
                            <SelectValue placeholder="Marka seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.brandName} ({brand.brandCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {formErrors.brandId && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.brandId}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Stok Tipi</Label>
                      <Select
                        value={formState.stockCard.productType}
                        onValueChange={(value) =>
                          updateStockCard("productType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Stok tipi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="maliyetFiyat">Maliyet</Label>
                      <Input
                        id="maliyetFiyat"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formState.stockCard.maliyetFiyat}
                        onChange={(e) =>
                          updateStockCard(
                            "maliyetFiyat",
                            parseFloat(e.target.value)
                          )
                        }
                        className={`text-right ${formErrors.maliyetFiyat ? "border-destructive" : ""
                          }`}
                      />
                      {formErrors.maliyetFiyat && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.maliyetFiyat}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Maliyet Dövizi</Label>
                      <Select
                        value={formState.stockCard.maliyetDoviz}
                        onValueChange={(value) =>
                          updateStockCard("maliyetDoviz", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem
                              key={currency.value}
                              value={currency.value}
                            >
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Depo</Label>
                      {warehousesLoading ? (
                        <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground">
                            Yükleniyor...
                          </span>
                        </div>
                      ) : warehousesError ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{warehousesError}</AlertDescription>
                        </Alert>
                      ) : (
                        <Select
                          value={formState.stockCardWarehouse[0]?.warehouseId}
                          onValueChange={(value) =>
                            updateWarehouse(
                              value,
                              formState.stockCardWarehouse[0]?.quantity || 0
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Depo seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((warehouse) => (
                              <SelectItem
                                key={warehouse.id}
                                value={warehouse.id}
                              >
                                {warehouse.warehouseName} (
                                {warehouse.warehouseCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Stok Miktarı</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formState.stockCardWarehouse[0]?.quantity || 0}
                        onChange={(e) => {
                          const warehouseId =
                            formState.stockCardWarehouse[0]?.warehouseId;
                          if (warehouseId) {
                            updateWarehouse(
                              warehouseId,
                              parseInt(e.target.value)
                            );
                          }
                        }}
                        className="text-right"
                      />
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Resimler</Label>
                    <div className="flex items-start space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleImageUpload}
                        disabled={imageUploadLoading}
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Ekle
                      </Button>
                    </div>
                  </div>

                  {images.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <ImagePlus className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-muted-foreground">
                          Resim yüklemek için yukarıdaki butonları kullanın
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Product ${index + 1}`}
                            width={128}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewImage(index)}
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newImages = [...images];
                              newImages.splice(index, 1);
                              setImages(newImages);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <ImagePreview
                    images={images}
                    currentIndex={previewImage ?? 0}
                    isOpen={previewImage !== null}
                    onClose={() => setPreviewImage(null)}
                    onNavigate={handleNavigatePreview}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diger">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Switches Section */}
                  <div className="flex items-center justify-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formState.stockCard.hasExpirationDate}
                        onCheckedChange={(checked) => {
                          setIsSerili(checked);
                          updateStockCard("hasExpirationDate", checked);
                        }}
                        id="serili"
                      />
                      <Label htmlFor="serili">Serili</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formState.stockCard.allowNegativeStock}
                        onCheckedChange={(checked) => {
                          setIsYerli(checked);
                          updateStockCard("allowNegativeStock", checked);
                        }}
                        id="eksiSeviye"
                      />
                      <Label htmlFor="eksiSeviye">Eksi Seviye Satış</Label>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sıra</Label>
                      <Input
                        value={formState.stockCard.siraNo}
                        onChange={(e) =>
                          updateStockCard("siraNo", e.target.value)
                        }
                        placeholder="Sıra numarası giriniz"
                      />
                    </div>
                    <div>
                      <Label>Raf</Label>
                      <Input
                        value={formState.stockCard.raf}
                        onChange={(e) => updateStockCard("raf", e.target.value)}
                        placeholder="Raf numarası giriniz"
                      />
                    </div>
                  </div>

                  {/* Codes Section */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>Barkodlar</Label>
                      <TagInput
                        tags={barcodes}
                        setTags={setBarcodes}
                        placeholder="Barkod girin ve Enter'a basın"
                        styleClasses={{
                          input: "w-full",
                          tag: { body: "bg-red-500/10 text-red-500" },
                        }}
                        activeTagIndex={activeTagIndex}
                        setActiveTagIndex={setActiveTagIndex}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Piyasa Adları</Label>
                      <TagInput
                        tags={marketNames}
                        setTags={setMarketNames}
                        placeholder="Piyasa adı girin ve Enter'a basın"
                        styleClasses={{
                          input: "w-full",
                          tag: { body: "bg-blue-500/10 text-blue-500" },
                        }}
                        activeTagIndex={activeTagIndex}
                        setActiveTagIndex={setActiveTagIndex}
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>GTIP</Label>
                      <Input
                        value={formState.stockCard.gtip}
                        onChange={(e) =>
                          updateStockCard("gtip", e.target.value)
                        }
                        placeholder="GTIP kodunu giriniz"
                      />
                    </div>
                    <div>
                      <Label>PLU Kodu</Label>
                      <Input
                        value={formState.stockCard.pluCode}
                        onChange={(e) =>
                          updateStockCard("pluCode", e.target.value)
                        }
                        placeholder="PLU kodunu giriniz"
                      />
                    </div>
                    <div>
                      <Label>Kar Marjı (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formState.stockCard.karMarji}
                        onChange={(e) =>
                          updateStockCard(
                            "karMarji",
                            parseFloat(e.target.value)
                          )
                        }
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label>Desi</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formState.stockCard.desi}
                        onChange={(e) =>
                          updateStockCard("desi", parseFloat(e.target.value))
                        }
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label>Adet Böleni</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formState.stockCard.adetBoleni}
                        onChange={(e) =>
                          updateStockCard(
                            "adetBoleni",
                            parseInt(e.target.value)
                          )
                        }
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label>Kritik Seviye Miktar</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formState.stockCard.riskQuantities}
                        onChange={(e) =>
                          updateStockCard(
                            "riskQuantities",
                            parseInt(e.target.value)
                          )
                        }
                        className="text-right"
                      />
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
                    <div>
                      <Label>Kısa Açıklama</Label>
                      <Input
                        value={formState.stockCard.shortDescription}
                        onChange={(e) =>
                          updateStockCard("shortDescription", e.target.value)
                        }
                        placeholder="Kısa açıklama giriniz"
                      />
                    </div>
                    <div>
                      <Label>Açıklama</Label>
                      <Textarea
                        value={formState.stockCard.description}
                        onChange={(e) =>
                          updateStockCard("description", e.target.value)
                        }
                        placeholder="Detaylı açıklama giriniz"
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resmi-fatura">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resmi Fatura</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="eFaturaProductName">Ürün Adı</Label>
                        <Input
                          id="eFaturaProductName"
                          value={formState.eFatura[0]?.productName || ""}
                          onChange={(e) =>
                            updateEFatura(
                              formState.eFatura[0]?.productCode || "",
                              e.target.value,
                            )
                          }
                          placeholder="Ürün adını giriniz"
                        />
                      </div>

                      <div>
                        <Label htmlFor="eFaturaProductCode">Ürün Kodu</Label>
                        <Input
                          id="eFaturaProductCode"
                          value={formState.eFatura[0]?.productCode || ""}
                          onChange={(e) =>
                            updateEFatura(
                              e.target.value,
                              formState.eFatura[0]?.productName || "",
                            )
                          }
                          placeholder="Ürün kodunu giriniz"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ozellikler">
            <StockProperties
              selectedProperties={selectedProperties}
              setSelectedProperties={memoizedSetSelectedProperties}
            />
          </TabsContent>

          <TabsContent value="uretciler">
            <StockManufacturers
              manufacturers={manufacturers}
              setManufacturers={setManufacturers}
            />
          </TabsContent>

          <TabsContent value="birimler">
            <StockUnits units={unitList} setUnits={setUnitList} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StockForm;
