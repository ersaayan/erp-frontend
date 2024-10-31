'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Download } from 'lucide-react';

const GeneralInfo: React.FC = () => {
    const [isKdvDahil, setIsKdvDahil] = useState(false);
    const [kdv, setKdv] = useState('0');
    const [satisFiyat, setSatisFiyat] = useState('0,00');

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="flex-grow">
                            <Label htmlFor="kategori">Kategori</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="- Seçiniz -" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="category1">Kategori 1</SelectItem>
                                    <SelectItem value="category2">Kategori 2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button size="icon" variant="outline" className="self-end">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div>
                        <Label htmlFor="stokAdi">Stok Adı</Label>
                        <Input id="stokAdi" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="barkod">Barkod</Label>
                            <Input id="barkod" />
                        </div>
                        <div>
                            <Label htmlFor="stokKodu">Stok Kodu</Label>
                            <Input id="stokKodu" />
                        </div>
                        <div>
                            <Label htmlFor="birim">Birim</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Adet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="adet">Adet</SelectItem>
                                    <SelectItem value="kg">Kg</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <Label>Satış Fiyatı</Label>
                            <Input
                                value={satisFiyat}
                                onChange={(e) => setSatisFiyat(e.target.value)}
                                className="text-right"
                            />
                        </div>
                        <div>
                            <Label>Döviz</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="₺" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="try">₺</SelectItem>
                                    <SelectItem value="usd">$</SelectItem>
                                    <SelectItem value="eur">€</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>KDV</Label>
                            <Input
                                value={kdv}
                                onChange={(e) => setKdv(e.target.value)}
                                className="text-right"
                            />
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                            <Switch
                                checked={isKdvDahil}
                                onCheckedChange={setIsKdvDahil}
                            />
                            <Label>KDV Dahil: {isKdvDahil ? 'Evet' : 'Hayır'}</Label>
                        </div>
                    </div>

                    <div>
                        <Label>Kısa Açıklama</Label>
                        <Input />
                    </div>

                    <div>
                        <Label>Açıklama</Label>
                        <Textarea className="min-h-[100px]" />
                    </div>

                    <div>
                        <Label>Resimler</Label>
                        <div className="flex items-center space-x-2 mt-2">
                            <div className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <p className="text-muted-foreground">Resim yüklemek için (+) butonuna tıklayınız.</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button size="icon" variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GeneralInfo;