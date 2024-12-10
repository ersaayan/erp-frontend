import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FormProgressProps {
  steps: {
    label: string;
    isCompleted: boolean;
    isActive: boolean;
  }[];
}

export const FormProgress: React.FC<FormProgressProps> = ({ steps }) => {
  const completedSteps = steps.filter((step) => step.isCompleted).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col items-center text-xs",
              step.isActive && "text-primary font-medium",
              step.isCompleted && "text-green-500",
              !step.isActive && !step.isCompleted && "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center mb-1",
                step.isActive && "bg-primary text-primary-foreground",
                step.isCompleted && "bg-green-500 text-white",
                !step.isActive && !step.isCompleted && "bg-muted"
              )}
            >
              {index + 1}
            </div>
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
