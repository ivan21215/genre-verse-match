import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
  maxFileSize?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImageUrl,
  bucketName = "venue-images",
  maxFileSize = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxFileSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onImageUploaded(publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Venue Image</Label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload an image for your venue
          </p>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <Label htmlFor="image-upload">
            <Button type="button" variant="outline" disabled={uploading}>
              {uploading ? "Uploading..." : "Choose Image"}
            </Button>
          </Label>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG, WebP. Max size: {maxFileSize}MB
      </p>
    </div>
  );
};

export default ImageUpload;