import React, { useState, useRef } from 'react';
import { Plus, X, Upload, Image as ImageIcon, Trash2, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { storage } from '../../lib/supabase';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 5,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, maxImages - images.length);
    if (newFiles.length === 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = newFiles.map(async (file) => {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 10MB`);
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);

        try {
          // Upload to Supabase Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { data, error } = await storage.uploadFile('product-images', filePath, file);
          
          if (error) {
            throw new Error(error.message || 'Upload failed');
          }

          const { data: urlData } = storage.getPublicUrl('product-images', filePath);
          
          if (!urlData?.publicUrl) {
            throw new Error('Failed to get public URL');
          }

          // Clean up preview URL
          URL.revokeObjectURL(previewUrl);
          
          return urlData.publicUrl;
        } catch (uploadError) {
          console.error('Upload failed, using preview:', uploadError);
          // Return preview URL as fallback
          return previewUrl;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== dropIndex) {
      handleReorderImages(fromIndex, dropIndex);
    }
  };

  const handleDragOverContainer = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDropContainer = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOverContainer}
        onDragLeave={handleDragLeave}
        onDrop={handleDropContainer}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Upload Product Images'}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop images here, or click to select
            </p>
            <p className="text-xs text-gray-400">
              {images.length}/{maxImages} images uploaded
            </p>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Images
          </Button>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReorderImages(index, index - 1)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Image Number Badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Maximum {maxImages} images allowed</p>
        <p>• Supported formats: JPG, PNG, GIF, WebP</p>
        <p>• Maximum file size: 10MB per image</p>
        <p>• Drag images to reorder them</p>
        <p>• First image will be used as the main product image</p>
      </div>
    </div>
  );
};
