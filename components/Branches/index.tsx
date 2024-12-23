"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import BranchesToolbar from "./BranchesToolbar";
import BranchesGrid from "./BranchesGrid";
import BranchDialog from "./BranchDialog";

const Branches: React.FC = () => {
    return (
        <div className="grid-container">
            <BranchesToolbar />
            <Card className="mt-4">
                <BranchesGrid />
            </Card>
            <BranchDialog />
        </div>
    );
};

export default Branches;