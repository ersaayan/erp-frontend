import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { FormSectionProps } from "./types";

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  isValid = false,
  error,
  children,
  className,
}) => {
  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {(isValid || error) && (
            <div className="flex items-center">
              {isValid ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
