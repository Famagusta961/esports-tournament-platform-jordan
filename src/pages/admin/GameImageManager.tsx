import React, { useState, useRef } from 'react';
import { Upload, Image, Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { content } from '@/lib/shared/kliv-content.js';

const GameImageManager = () => {
  const { toast } = useToast();
  
  // Standard game image mapping
  const gameImages = {
    'EA FC 25': '/content/games/EA FC 25.jpg',
    'PUBG Mobile': '/content/games/pubg-.jpg',
    'Valorant': '/content/games/valorant-listing-scaled.jpg',
    'League of Legends': '/content/games/league-of-legends-pc-game-cover.jpg',
    'Rocket League': '/content/games/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-4c231557ef0a0626fbb97e0bd137d837.jpg',
    'Tekken 8': '/content/games/tekken-7-pc-game-steam-cover.jpg',
    'Fortnite': '/content/games/fneco-2025-keyart-thumb-1920x1080-de84aedabf4d.jpg',
    'COD Mobile': '/content/games/COD.jpg',
  };
  
  // Mapping from game names to their expected standard filenames
  const getStandardFilename = (gameName: string): string => {
    const filenameMap: Record<string, string> = {
      'EA FC 25': 'EA FC 25.jpg',
      'PUBG Mobile': 'pubg-.jpg',
      'Valorant': 'valorant-listing-scaled.jpg',
      'League of Legends': 'league-of-legends-pc-game-cover.jpg',
      'Rocket League': 'EGS_RocketLeague_PsyonixLLC_S1_2560x1440-4c231557ef0a0626fbb97e0bd137d837.jpg',
      'Tekken 8': 'tekken-7-pc-game-steam-cover.jpg',
      'Fortnite': 'fneco-2025-keyart-thumb-1920x1080-de84aedabf4d.jpg',
      'COD Mobile': 'COD.jpg',
    };
    return filenameMap[gameName] || `${gameName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
  };

  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, url: string, name: string}>>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const uploadPoolInputRef = useRef<HTMLInputElement>(null);

  // Upload image to pool
  const handleUploadToPool = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    
    try {
      console.log('Uploading to pool:', file.name);
      
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const poolFileName = `pool_${timestamp}.${fileExtension}`;
      
      const result = await content.uploadFile(file, '/content/games/', poolFileName);
      
      const newPoolItem = {
        id: poolFileName,
        url: result.contentUrl,
        name: file.name
      };
      
      setUploadedImages(prev => [...prev, newPoolItem]);
      
      toast({
        title: "Image uploaded to pool!",
        description: "You can now assign this image to any game.",
      });
      
    } catch (error) {
      console.error('Pool upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (uploadPoolInputRef.current) {
        uploadPoolInputRef.current.value = '';
      }
    }
  };

  // Assign pool image to specific game
  const handleAssignPoolImage = async (poolImageId: string, gameName: string) => {
    const poolImage = uploadedImages.find(img => img.id === poolImageId);
    if (!poolImage) return;
    
    setSaving(true);
    
    try {
      const standardFilename = getStandardFilename(gameName);
      const standardPath = `/content/games/${standardFilename}`;
      
      // Move/rename the uploaded file to the standard filename
      const currentPath = `/content/games/${poolImageId}`;
      await content.moveFile(currentPath, standardPath);
      
      // Update the image in the pool with the new standard path
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === poolImageId 
            ? { ...img, id: standardFilename, url: `${standardPath}?t=${Date.now()}` }
            : img
        )
      );
      
      toast({
        title: "Image assigned successfully!",
        description: `${poolImage.name} is now assigned to ${gameName} and will appear on tournament pages.`,
      });
      
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "Failed to assign image",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete image from pool
  const handleDeletePoolImage = async (poolImageId: string) => {
    try {
      const image = uploadedImages.find(img => img.id === poolImageId);
      if (!image) return;
      
      const filePath = `/content/games/${poolImageId}`;
      await content.deleteFile(filePath);
      
      setUploadedImages(prev => prev.filter(img => img.id !== poolImageId));
      
      toast({
        title: "Image deleted",
        description: "Image removed from upload pool.",
      });
    } catch (error) {
      console.error('Pool delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="font-display text-3xl font-bold mb-2">Game Image Manager</h1>
                <p className="text-muted-foreground">
                  Upload and assign game images. Images are automatically displayed on tournament pages and game cards.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  💡 <strong>How it works:</strong><br/>
                  1. Upload images using the Upload Pool below<br/>
                  2. Assign uploaded images to specific games<br/>
                  3. Images will replace the standard game images automatically
                </p>
              </div>
              
              <Button 
                onClick={() => {
                  document.getElementById('pool-upload-trigger')?.click();
                }}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Current Game Images (Read-only display) */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Current Game Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(gameImages).map(([game, imagePath]) => (
                  <div key={game} className="text-center p-4 rounded-lg border border-border">
                    <div className="relative mb-3">
                      {imagePath ? (
                        <img 
                          src={imagePath} 
                          alt={game}
                          className="w-full h-20 object-cover rounded"
                          style={{ width: '100%', height: '80px' }}
                        />
                      ) : (
                        <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {imagePath && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full" title="Active" />
                        </div>
                      )}
                    </div>
                    
                    <p className="font-gaming text-sm font-medium mb-1">{game}</p>
                    <p className="text-xs text-muted-foreground">
                      {imagePath ? "Active" : "No image"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload Pool Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Image Upload Pool
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload images here, then assign them to games below. Currently {uploadedImages.length} image(s) in pool.
              </p>
            </CardHeader>
            <CardContent>
              {/* Hidden file input */}
              <input
                id="pool-upload-trigger"
                ref={uploadPoolInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadToPool}
                className="hidden"
                disabled={uploading}
              />

              {/* Upload area */}
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors mb-6"
                onClick={() => {
                  document.getElementById('pool-upload-trigger')?.click();
                }}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Click to upload images</p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, GIF files. Images will be uploaded to the pool where you can assign them to games.
                </p>
              </div>

              {/* Uploaded images */}
              {uploadedImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Uploaded Images ({uploadedImages.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="text-center p-3 rounded-lg border border-border relative group">
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                        <p className="text-xs font-medium truncate mb-2">{image.name}</p>
                        
                        {/* Assign dropdown */}
                        <div className="mb-2">
                          <Select onValueChange={(gameName) => handleAssignPoolImage(image.id, gameName)} disabled={saving}>
                            <SelectTrigger size="sm">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(gameImages).map(gameName => (
                                <SelectItem key={gameName} value={gameName}>
                                  {gameName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeletePoolImage(image.id)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          title="Delete from pool"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploadedImages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No images in pool yet. Upload some images above to assign to games.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default GameImageManager;