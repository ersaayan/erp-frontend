"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { useUserDialog } from "./useUserDialog";
import { userService } from "@/lib/services/user";
import { Company, Role } from "./types";

const UserDialog: React.FC = () => {
  const { isOpen, closeDialog, editingUser } = useUserDialog();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    companyCode: "",
    roleName: "",
    permissions: ["_stockcards_createStockCard"],
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        ...editingUser,
        roleName: editingUser.role[0].roleName,
        address: editingUser.address ?? "", // Ensure address is a string
        permissions: ["_stockcards_createStockCard"],
        password: "", // Don't populate password field when editing
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        companyCode: "",
        roleName: "",
        permissions: ["_stockcards_createStockCard"],
      });
    }
  }, [editingUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companiesData, rolesData] = await Promise.all([
          userService.getCompanies(),
          userService.getRoles(),
        ]);
        setCompanies(companiesData);
        setRoles(rolesData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (
        !formData.username ||
        !formData.email ||
        !formData.firstName ||
        !formData.lastName
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      if (!editingUser && !formData.password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Password is required for new users",
        });
        return;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
      } else {
        await userService.createUser(formData);
      }

      toast({
        title: "Success",
        description: `User ${editingUser ? "updated" : "created"} successfully`,
      });
      closeDialog();

      // Trigger refresh
      window.dispatchEvent(new CustomEvent("refreshUsers"));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);
      await userService.deleteUser(editingUser.id);

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setDeleteDialogOpen(false);
      closeDialog();

      // Trigger refresh
      window.dispatchEvent(new CustomEvent("refreshUsers"));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete user",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editingUser) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
            </DialogTitle>
          </DialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kullanıcı Adı</Label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!!editingUser}
                  />
                </div>
                <div>
                  <Label>E-posta</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <Label>Şifre</Label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ad</Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Soyad</Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label>Telefon</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Adres</Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Firma</Label>
                <Select
                  value={formData.companyCode}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, companyCode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Firma seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.companyCode}>
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rol</Label>
                <Select
                  value={formData.roleName}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, roleName: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.roleName}>
                        {role.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            {editingUser && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Sil
              </Button>
            )}
            <Button variant="outline" onClick={closeDialog}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#84CC16] hover:bg-[#65A30D]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingUser ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserDialog;
