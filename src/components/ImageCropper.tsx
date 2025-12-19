import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    open: boolean;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel, open }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return '';
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return canvas.toDataURL('image/jpeg');
    };

    const handleSave = async () => {
        if (croppedAreaPixels) {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
            <DialogContent className="sm:max-w-[500px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Edit Profile Picture</DialogTitle>
                </DialogHeader>

                <div className="relative h-[300px] w-full bg-muted rounded-lg overflow-hidden mt-4">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4 px-2">
                        <ZoomOut className="h-4 w-4 text-muted-foreground" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="flex-1"
                        />
                        <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onCancel} className="flex-1 sm:flex-none">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} gradient className="flex-1 sm:flex-none">
                        Set Picture
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
