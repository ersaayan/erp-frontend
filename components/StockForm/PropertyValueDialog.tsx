import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PropertyValueDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    values: Array<{ id: string; value: string; }>;
    selectedValues: string[];
    onValueChange: (value: string) => void;
}

const PropertyValueDialog: React.FC<PropertyValueDialogProps> = ({
    open,
    onClose,
    title,
    values,
    selectedValues,
    onValueChange,
}) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title} Değerleri</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-2">
                        {values.map(({ id, value }) => (
                            <Button
                                key={id}
                                variant={selectedValues.includes(value) ? "default" : "outline"}
                                onClick={() => onValueChange(value)}
                                className="justify-start"
                            >
                                <Check className={`mr-2 h-4 w-4 ${
                                    selectedValues.includes(value) ? "opacity-100" : "opacity-0"
                                }`} />
                                {value}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

export default PropertyValueDialog;