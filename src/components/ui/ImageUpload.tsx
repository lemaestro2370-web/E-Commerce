import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera, Link } from 'lucide-react';
import { Button } from './Button';
import { storage } from '../../lib/supabase';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  multiple?: boolean;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  disabled = false,
  multiple = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }
      
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      
      try {
        // First, create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        onChange(previewUrl);
        
        // Then upload to Supabase Storage in the background
        const fileExt = file.name.split('.').pop();
        const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { data, error } = await storage.uploadFile('product-images', filePath, file);
        
        if (error) {
          console.error('Upload error:', error);
          // Keep the preview URL if upload fails
          console.warn('Upload failed, keeping preview URL');
          return;
        }
        
        // Get the public URL
        const { data: urlData } = storage.getPublicUrl('product-images', filePath);
        
        if (urlData?.publicUrl) {
          // Replace preview URL with actual uploaded URL
          onChange(urlData.publicUrl);
          // Clean up the preview URL
          URL.revokeObjectURL(previewUrl);
        } else {
          console.warn('Failed to get public URL, keeping preview');
        }
        
      } catch (uploadError) {
        console.error('Upload failed, keeping preview:', uploadError);
        // Keep the preview URL as fallback
      } finally {
        // Clean up the temporary preview URL after a delay
        setTimeout(() => {
          if (tempUrl) {
            URL.revokeObjectURL(tempUrl);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUrlInput = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      // Validate URL format
      try {
        new URL(url);
        onChange(url.trim());
      } catch {
        alert('Please enter a valid URL');
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        multiple={multiple}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?w=400&h=400&fit=crop';
              }}
            />
            
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`
            w-full h-48 border-2 border-dashed border-gray-300 rounded-lg
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${!disabled && !isUploading ? 'hover:border-green-500 hover:bg-green-50' : 'cursor-not-allowed opacity-50'}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-gray-100 rounded-full mb-3">
                <ImageIcon className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Click to upload image
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>
      )}

      {!disabled && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Upload File</span>
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={handleUrlInput}
            disabled={isUploading}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Link className="w-4 h-4" />
            <span>Add URL</span>
          </Button>
        </div>
      )}
    </div>
  );
}