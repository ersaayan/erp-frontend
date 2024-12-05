"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import UsersToolbar from "@/components/users/UsersToolbar";
import UsersGrid from "@/components/users/UsersGrid";
import UserDialog from "@/components/users/UserDialog";

export default function UsersPage() {
  return (
    <div className="grid-container">
      <UsersToolbar />
      <Card className="mt-4">
        <UsersGrid />
      </Card>
      <UserDialog />
    </div>
  );
}
