'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCampaignDialog } from './useCampaignDialog';
import { Checkbox } from "@/components/ui/checkbox";

const CampaignDialog: React.FC = () => {
    const { isOpen, closeDialog } = useCampaignDialog();

    return (
        <Dialog open={isOpen} onOpenChange={closeDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle>Kampanya Formu - Yeni Kayıt</DialogTitle>
                </DialogHeader>

                <ScrollArea className="px-6 pb-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <div className="grid gap-6">
                        {/* Campaign Details */}
                        <div className="grid gap-4 p-4 border rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Kampanya Adı</Label>
                                    <Input placeholder="Kampanya Adını Giriniz" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="status" />
                                    <Label htmlFor="status">Aktif</Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label>Kampanya Sayısı</Label>
                                    <div className="flex gap-2">
                                        <Input type="number" defaultValue={1} />
                                        <Button variant="outline">Sınırsız</Button>
                                    </div>
                                </div>
                                <div>
                                    <Label>Tekrar Kullanım</Label>
                                    <div className="flex gap-2">
                                        <Input type="number" defaultValue={1} />
                                        <Button variant="outline">Sınırsız</Button>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label>Şube Seçiniz</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="HAZARDAĞLI" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hazardagli">HAZARDAĞLI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid gap-4 p-4 border rounded-lg">
                            <h3 className="font-medium">Hangi tarihlerde geçerli olacak ?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Başlangıç Tarihi</Label>
                                    <Input type="datetime-local" />
                                </div>
                                <div>
                                    <Label>Bitiş Tarihi</Label>
                                    <Input type="datetime-local" />
                                </div>
                            </div>
                        </div>

                        {/* Customer Selection */}
                        <div className="grid gap-4 p-4 border rounded-lg">
                            <h3 className="font-medium">Hangi Cari, Cari Grubunu veya Kuponları kapsayacak ?</h3>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="allCustomers" />
                                <Label htmlFor="allCustomers">Tüm carileri kapsar</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Tip Seçiniz</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kupon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="coupon">Kupon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Kupon Kodu Giriniz</Label>
                                    <Input placeholder="..." />
                                </div>
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div className="grid gap-4 p-4 border rounded-lg">
                            <h3 className="font-medium">Hangi ürünler satıldığında ?</h3>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="allProducts" />
                                <Label htmlFor="allProducts">Tüm ürünler</Label>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Tip Seçiniz</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Stok" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stock">Stok</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Label>Stok Seçiniz</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="Seç..." />
                                        <Button>Seç</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="allSold" />
                                <Label htmlFor="allSold">Hepsi Satıldığında</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                (İşaretlendiğinde, seçili ürün/kategorilerin hepsinden satılması gereklidir.)
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Değer Giriniz</Label>
                                    <Input type="number" defaultValue={0} />
                                </div>
                                <div>
                                    <Label>Birim</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Adet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="piece">Adet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Discount Application */}
                        <div className="grid gap-4 p-4 border rounded-lg">
                            <h3 className="font-medium">Hangi ürünlere uygulanacak ?</h3>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="allApplyProducts" />
                                <Label htmlFor="allApplyProducts">Hepsi</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                (İşaretlendiğinde, seçili ürün/kategorilerin hepsinden veya herhangi birinden)
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Değer Giriniz</Label>
                                    <Input type="number" defaultValue={0} />
                                </div>
                                <div>
                                    <Label>Birim</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Adet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="piece">Adet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={closeDialog}>
                                İptal
                            </Button>
                            <Button variant="default" className="bg-[#84CC16] hover:bg-[#65A30D]">
                                Kaydet
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default CampaignDialog;