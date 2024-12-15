"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import ProfileForm from "./ProfileForm";

export default function ProfilePage() {
  return (
    <div className="grid-container">
      <Card className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profil Ayarları</h1>
        <ProfileForm />
      </Card>
    </div>
  );
}
