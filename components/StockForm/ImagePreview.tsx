'use client';

import React from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
    images: string[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNavigate,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                <div className="relative">
                    <Image
                        src={images[currentIndex]}
                        alt={`Preview ${currentIndex + 1}`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                    />

                    {images.length > 1 && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                                onClick={() => onNavigate('prev')}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                                onClick={() => onNavigate('next')}
                                disabled={currentIndex === images.length - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreview;