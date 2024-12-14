"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitSectionProps {
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  onSubmit,
  disabled = false,
  loading = false,
}) => {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onSubmit}
        disabled={disabled}
        className="bg-[#84CC16] hover:bg-[#65A30D]"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sayımı Kaydet
      </Button>
    </div>
  );
};

export default SubmitSection;
