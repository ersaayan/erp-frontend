"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import CurrentCategoriesToolbar from "./CurrentCategoriesToolbar";
import CurrentCategoriesTreeList from "./CurrentCategoriesTreeList";
import CurrentCategoryDialog from "./CurrentCategoryDialog";

const CurrentCategories: React.FC = () => {
  return (
    <div className="grid-container">
      <CurrentCategoriesToolbar />
      <Card className="mt-4">
        <CurrentCategoriesTreeList />
      </Card>
      <CurrentCategoryDialog />
    </div>
  );
};

export default CurrentCategories;
