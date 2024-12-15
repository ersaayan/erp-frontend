"use client";

import React, { useEffect } from "react";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useProfile } from "./useProfile";
import { useCompanies } from "@/hooks/use-companies";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";
import { FormItem } from "devextreme-react/cjs/data-grid";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormControl, FormMessage } from "../ui/form";
import { ProfileFormData } from "./types";

// Form validation schema
const formSchema = z.object({
  username: z.string(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  firstName: z.string().min(1, "Ad zorunludur"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  phone: z
    .string()
    .regex(/^[0-9\s+()-]+$/, "Geçerli bir telefon numarası giriniz"),
  address: z.string().optional(),
  companyCode: z.string().min(1, "Firma seçimi zorunludur"),
});

type FormData = z.infer<typeof formSchema>;

const ProfileForm: React.FC = () => {
  const { loading, fetchProfile, updateProfile } = useProfile();
  const { companies } = useCompanies();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      companyCode: "",
    },
  });

  // Fetch user data and set form values
  useEffect(() => {
    const fetchData = async () => {
      const userData = await fetchProfile();
      if (userData) {
        form.reset({
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || "",
          address: userData.address || "",
          companyCode: userData.companyCode,
        });
      }
    };

    fetchData();
  }, [form, fetchProfile]);

  const onSubmit = async (values: FormData) => {
    const { username, ...updateData } = values;
    await updateProfile(updateData as ProfileFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <FormControl>
                <Input {...field} disabled />
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
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soyad</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firma</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Firma seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.companyCode}>
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#84CC16] hover:bg-[#65A30D]"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Kaydet
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
