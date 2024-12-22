"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuthService } from "@/lib/services/auth";

const formSchema = z.object({
  companyCode: z.string().min(1, "Firma kodu zorunludur"),
  companyName: z.string().min(1, "Firma adı zorunludur"),
  name: z.string().min(1, "İletişim kişisi adı zorunludur"),
  surname: z.string().min(1, "İletişim kişisi soyadı zorunludur"),
  taxNumber: z.string().min(1, "Vergi numarası zorunludur"),
  taxOffice: z.string().min(1, "Vergi dairesi zorunludur"),
  kepAddress: z.string().email("Geçerli bir KEP adresi giriniz"),
  mersisNo: z.string().optional(),
  sicilNo: z.string().optional(),
  address: z.string().min(1, "Adres zorunludur"),
  countryCode: z.string().min(1, "Ülke kodu zorunludur"),
  city: z.string().min(1, "Şehir zorunludur"),
  district: z.string().min(1, "İlçe zorunludur"),
  postalCode: z.string().optional(),
  phone: z.string().min(1, "Telefon zorunludur"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  website: z.string().url("Geçerli bir website adresi giriniz").optional(),
});

const CompanyForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasExistingCompany, setHasExistingCompany] = useState(false);
  const { toast } = useToast();
  const { getAuthToken } = useAuthService();

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyCode: "",
      companyName: "",
      name: "",
      surname: "",
      taxNumber: "",
      taxOffice: "",
      kepAddress: "",
      mersisNo: "",
      sicilNo: "",
      address: "",
      countryCode: "",
      city: "",
      district: "",
      postalCode: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!mounted) return;

        setLoading(true);
        const response = await fetch(`${process.env.BASE_URL}/companies/`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch company data");
        }

        const data = await response.json();

        if (data && data.length > 0) {
          setHasExistingCompany(true);
          const company = data[0]; // Get first company
          form.reset({
            companyCode: company.companyCode,
            companyName: company.companyName,
            name: company.name,
            surname: company.surname,
            taxNumber: company.taxNumber,
            taxOffice: company.taxOffice,
            kepAddress: company.kepAddress,
            mersisNo: company.mersisNo,
            sicilNo: company.sicilNo,
            address: company.address,
            countryCode: company.countryCode,
            city: company.city,
            district: company.district,
            postalCode: company.postalCode,
            phone: company.phone,
            email: company.email,
            website: company.website,
          });
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [form, mounted, getAuthToken]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.BASE_URL}/companies/${values.companyCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          credentials: "include",
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update company",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Firma Bilgileri</h3>
                <FormField
                  control={form.control}
                  name="companyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firma Kodu*</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={hasExistingCompany} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firma Adı*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Person */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">İletişim Kişisi</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vergi Bilgileri</h3>
                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi No*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxOffice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi Dairesi*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Official Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resmi Bilgiler</h3>
                <FormField
                  control={form.control}
                  name="kepAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KEP Adresi*</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mersisNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MERSİS No</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sicilNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sicil No</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold">Adres Bilgileri</h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ülke Kodu*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şehir*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İlçe*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posta Kodu</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon*</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta*</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#84CC16] hover:bg-[#65A30D]"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CompanyForm;
