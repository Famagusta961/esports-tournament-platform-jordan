import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { content } from '@/lib/shared/kliv-content.js';

const ImageUploadTest = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await content.uploadFile(file, '/content/games/');
        return result.contentUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      
      toast({
        title: "Upload successful!",
        description: `${files.length} image(s) uploaded to /content/games/`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          EA FC 25 Image Upload Test
        </CardTitle>
        <CardDescription>
          Upload your EA FC 25 game images here to test how they look on the platform.
          Images will be stored in /content/games/ and accessible via CDN URLs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drop images here or click to browse</p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports JPG, PNG, WebP formats
          </p>
          
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          
          <Button 
            asChild
            disabled={uploading}
            className="font-gaming"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? 'Uploading...' : 'Choose Files'}
            </label>
          </Button>
        </div>

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Uploaded Images:</h3>
            <div className="grid grid-cols-2 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="space-y-2">
                  <img 
                    src={url} 
                    alt={`EA FC 25 Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                    style={{ width: '100%' }}
                  />
                  <div className="text-xs text-muted-foreground break-all">
                    {url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadTest;