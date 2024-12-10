import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  isValid?: boolean;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, error, helperText, isValid, required, className, ...props },
    ref
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            className={cn(
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </Label>
          {(isValid || error) && (
            <div className="flex items-center text-xs">
              {isValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive mr-1" />
              )}
              <span
                className={cn(
                  "text-muted-foreground",
                  error && "text-destructive",
                  isValid && "text-green-500"
                )}
              >
                {error || (isValid ? "Geçerli" : "")}
              </span>
            </div>
          )}
        </div>
        <Input
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            isValid && "border-green-500 focus-visible:ring-green-500",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
