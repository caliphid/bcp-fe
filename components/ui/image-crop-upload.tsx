"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Modal } from "./modal";
import { Button } from "./button";
import { X, Upload } from "lucide-react";

interface ImageCropUploadProps {
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
  quality?: number; // 0 to 1
  previewUrl?: string; // initial preview
}

// Helper to center the crop initially
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropUpload({ onFileSelect, maxSizeMB = 5, quality = 0.7, previewUrl: initialPreview }: ImageCropUploadProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preview, setPreview] = useState(initialPreview || "");
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // We only crop images. If PDF, just pass it through directly
      if (file.type === "application/pdf") {
        setPreview("");
        onFileSelect(file);
        return;
      }
      
      setCrop(undefined); // Makes crop preview update between images
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setIsModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio by default, can be flexible
  };

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Calculate scaling
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedPreview = URL.createObjectURL(blob);
        setPreview(croppedPreview);
        
        // Convert Blob to File
        const file = new File([blob], "cropped_image.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        
        onFileSelect(file);
        setIsModalOpen(false);
      },
      "image/jpeg",
      quality
    );
  };

  const handleClear = () => {
    setPreview("");
    setImgSrc("");
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onSelectFile}
      />
      
      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer"
        >
          <Upload className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">Click to upload file</p>
          <p className="text-xs opacity-70">JPG, PNG, PDF (max {maxSizeMB}MB)</p>
        </div>
      ) : (
        <div className="relative inline-block w-full border border-slate-200 rounded-xl p-2 bg-slate-50">
          <div className="flex items-center gap-4">
            {preview.startsWith("blob:") || preview.match(/\\.(jpeg|jpg|gif|png)$/i) || preview.startsWith("http") ? (
               <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
            ) : (
              <div className="h-20 w-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
                Document
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Attachment Ready</p>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-500 hover:text-red-700 font-medium mt-1 inline-flex items-center"
              >
                <X className="h-3 w-3 mr-1" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crop Image"
        className="max-w-xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Drag the edges to crop your image. It will be compressed to save space.
          </p>
          
          <div className="bg-slate-100 flex items-center justify-center rounded-xl overflow-hidden max-h-[50vh]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: "50vh", objectFit: "contain" }}
              />
            </ReactCrop>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateCroppedImage}>
              Crop & Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
