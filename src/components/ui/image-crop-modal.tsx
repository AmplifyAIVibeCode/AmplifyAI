"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSource: string | null;
  onCropComplete: (croppedImageUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSource,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropAreaChange = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSaveCrop = async () => {
    if (!imageSource || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const image = new Image();
      image.src = imageSource;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
        onCropComplete(croppedImage);
        setIsProcessing(false);
        onClose();
      };

      image.onerror = () => {
        setIsProcessing(false);
      };
    } catch (error) {
      console.error("Crop error:", error);
      setIsProcessing(false);
    }
  };

  if (!imageSource) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop your image">
      <div className="space-y-4">
        <div className="relative w-full h-96 bg-zinc-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSource}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropAreaChange={onCropAreaChange}
            onZoomChange={setZoom}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 block mb-2">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveCrop} disabled={isProcessing}>
            {isProcessing ? "Cropping…" : "Apply crop"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
