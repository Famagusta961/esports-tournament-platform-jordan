import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Image, Camera, Trash2, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { content } from '@/lib/shared/kliv-content.js';

const GameImageManager = () => {
  const { toast } = useToast();
  
  // Store original game images
  const [originalGameImages] = useState({
    'EA FC 25': '/content/games/EA FC 25.jpg',
    'PUBG Mobile': '/content/games/pubg-.jpg',
    'Valorant': '/content/games/valorant-listing-scaled.jpg',
    'League of Legends': '/content/games/league-of-legends-pc-game-cover.jpg',
    'Rocket League': '/content/games/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-4c231557ef0a0626fbb97e0bd137d837.jpg',
    'Tekken 8': '/content/games/tekken-7-pc-game-steam-cover.jpg',
    'Fortnite': '/content/games/fneco-2025-keyart-thumb-1920x1080-de84aedabf4d.jpg',
    'COD Mobile': '/content/games/COD.jpg',
  });
  
  // Current game images state (including pending changes)
  const [gameImages, setGameImages] = useState({
    'EA FC 25': '/content/games/EA FC 25.jpg',
    'PUBG Mobile': '/content/games/pubg-.jpg',
    'Valorant': '/content/games/valorant-listing-scaled.jpg',
    'League of Legends': '/content/games/league-of-legends-pc-game-cover.jpg',
    'Rocket League': '/content/games/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-4c231557ef0a0626fbb97e0bd137d837.jpg',
    'Tekken 8': '/content/games/tekken-7-pc-game-steam-cover.jpg',
    'Fortnite': '/content/games/fneco-2025-keyart-thumb-1920x1080-de84aedabf4d.jpg',
    'COD Mobile': '/content/games/COD.jpg',
  });
  
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  // General upload pool for flexible assignment
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, url: string, name: string}>>([]);
  const [showUploadPool, setShowUploadPool] = useState(false);
  const uploadPoolInputRef = useRef<HTMLInputElement>(null);

  // Helper function to compare image URLs (ignoring cache-busting query params)
  const areImagesEqual = (url1: string | undefined, url2: string | undefined) => {
    if (!url1 || !url2) return url1 === url2;
    // Remove cache-busting query parameters for comparison
    const cleanUrl1 = url1.split('?')[0];
    const cleanUrl2 = url2.split('?')[0];
    return cleanUrl1 === cleanUrl2;
  };

// Check for changes
  const checkForChanges = (newImages: typeof gameImages) => {
    const changes = Object.keys(newImages).some(
      game => {
        const newImage = newImages[game as keyof typeof newImages];
        const originalImage = originalGameImages[game as keyof typeof originalGameImages];
        const hasChanged = !areImagesEqual(newImage, originalImage);
        console.log(`Game: ${game}, New: ${newImage}, Original: ${originalImage}, Changed: ${hasChanged}`);
        return hasChanged;
      }
    );
    console.log('=== CHANGE DETECTION ===');
    console.log('Has changes:', changes);
    Object.entries(newImages).forEach(([game, img]) => {
      const orig = originalGameImages[game as keyof typeof originalGameImages];
      console.log(`${game}: ${!areImagesEqual(img, orig) ? '✓ CHANGED' : '○ same'}`);
    });
    console.log('===================');
    setHasChanges(changes);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, gameName: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(prev => ({ ...prev, [gameName]: true }));
    
    try {
      console.log(`Uploading image for ${gameName}:`, file.name);
      
      // Generate temporary filename from game name with timestamp to avoid caching
      const sanitizedGameName = gameName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const tempFileName = `${sanitizedGameName}_temp_${timestamp}.${fileExtension}`;
      
      console.log(`Uploading temporary file: ${tempFileName}`);
      const result = await content.uploadFile(file, '/content/games/', tempFileName);
      
      // Update the game image mapping with temp file URL (pending change)
      const tempImageUrl = `/content/games/${tempFileName}`;
      const newImages = {
        ...gameImages,
        [gameName]: tempImageUrl
      };
      setGameImages(newImages);
      
      // Check for changes
      checkForChanges(newImages);
      
      toast({
        title: "Image uploaded!",
        description: `${gameName} image has been uploaded. Click "Save Changes" to apply changes to tournament pages.`,
      });
      
      console.log(`Image uploaded successfully for ${gameName}: ${tempImageUrl}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [gameName]: false }));
      // Clear the file input
      if (fileInputRefs.current[gameName]) {
        fileInputRefs.current[gameName].value = '';
      }
    }
  };

  const handleDeleteImage = async (gameName: string) => {
    const currentImage = gameImages[gameName];
    if (!currentImage) return;

    try {
      // Remove from game images mapping (pending change)
      const newImages = { ...gameImages };
      delete newImages[gameName as keyof typeof newImages];
      setGameImages(newImages);
      
      // Check for changes
      checkForChanges(newImages);
      
      toast({
        title: "Image removed",
        description: `${gameName} image has been removed. Click "Save Changes" to apply.`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive"
      });
    }
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

  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    
    try {
      const updatedImages: typeof gameImages = {};
      
      // Process each game's image changes
      for (const [gameName, currentImage] of Object.entries(gameImages)) {
        const originalImage = originalGameImages[gameName as keyof typeof originalGameImages];
        const standardFilename = getStandardFilename(gameName);
        const standardPath = `/content/games/${standardFilename}`;
        
        console.log(`Processing ${gameName}: current=${currentImage}, original=${originalImage}`);
        
        if (currentImage && !areImagesEqual(currentImage, originalImage)) {
          // New image uploaded - need to move/rename it to standard filename
          try {
            // Extract the temporary uploaded filename
            const uploadedFileUrl = currentImage.split('?')[0]; // Remove cache-busting
            const urlParts = uploadedFileUrl.split('/');
            const tempFilename = urlParts[urlParts.length - 1];
            const tempPath = `/content/games/${tempFilename}`;
            
            console.log(`Moving ${tempFilename} to ${standardFilename}`);
            
            // Use moveFile to rename the uploaded file to the standard filename
            await content.moveFile(tempPath, standardPath);
            
            // Update the image path to the standard filename (with cache-busting)
            updatedImages[gameName as keyof typeof updatedImages] = `${standardPath}?t=${Date.now()}`;
            
            console.log(`Successfully moved ${tempFilename} to ${standardFilename}`);
            
          } catch (moveError) {
            console.error(`Failed to move image for ${gameName}:`, moveError);
            // Fall back to keeping the original if move fails
            updatedImages[gameName as keyof typeof updatedImages] = originalImage;
          }
        } else if (!currentImage && originalImage) {
          // Image was deleted - remove the standard file
          try {
            const urlParts = originalImage.split('/');
            const oldFileName = urlParts[urlParts.length - 1];
            if (oldFileName) {
              console.log(`Deleting standard file: ${oldFileName}`);
              await content.deleteFile(`/content/games/${oldFileName}`);
            }
          } catch (deleteError) {
            console.warn('Could not delete standard image:', deleteError);
          }
          // Don't add to updatedImages (it was deleted)
        } else {
          // No change - keep the original
          updatedImages[gameName as keyof typeof updatedImages] = originalImage;
        }
      }
      
      // Update both original and current state with the new standard filenames
      Object.assign(originalGameImages, updatedImages);
      setGameImages(updatedImages);
      setHasChanges(false);
      
      toast({
        title: "Changes saved!",
        description: "All image changes have been applied successfully. Images are now available on tournament pages.",
      });
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setGameImages({ ...originalGameImages });
    setHasChanges(false);
    
    toast({
      title: "Changes discarded",
      description: "All pending changes have been reverted.",
    });
  };

  // Upload image to general pool
  const handleUploadToPool = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(prev => ({ ...prev, pool: true }));
    
    try {
      console.log(`Uploading to pool:`, file.name);
      
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
      setUploading(prev => ({ ...prev, pool: false }));
      if (uploadPoolInputRef.current) {
        uploadPoolInputRef.current.value = '';
      }
    }
  };

  // Assign pool image to specific game
  const handleAssignPoolImage = (poolImageId: string, gameName: string) => {
    const poolImage = uploadedImages.find(img => img.id === poolImageId);
    if (!poolImage) return;
    
    const newImages = {
      ...gameImages,
      [gameName]: poolImage.url
    };
    setGameImages(newImages);
    checkForChanges(newImages);
    
    toast({
      title: "Image assigned!",
      description: `${poolImage.name} assigned to ${gameName}. Click "Save Changes" to apply.`,
    });
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
        title: "Image deleted from pool",
        description: "Image removed from upload pool.",
      });
    } catch (error) {
      console.error('Pool delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image from pool",
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
                Manage which games have images assigned to them. Images are automatically displayed on tournament pages and game cards.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                💡 Click any game image to upload or replace it. Hover and click the red button to delete.
              </p>
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                <p>Has changes: {hasChanges ? 'YES' : 'NO'}</p>
                <p>Saving: {saving ? 'YES' : 'NO'}</p>
                <p>Pool images: {uploadedImages.length}</p>
                <p>Pool showing: {showUploadPool ? 'YES' : 'NO'}</p>
              </div>
              {hasChanges && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ You have unsaved changes. Click "Save Changes" to apply them or "Discard" to revert.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {hasChanges && (
                <>
                  <Button 
                    onClick={handleSaveChanges} 
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDiscardChanges}
                    disabled={saving}
                  >
                    Discard Changes
                  </Button>
                </>
              )}
              {/* Debug button - always show for testing */}
              {!hasChanges && (
                <Button 
                  onClick={() => setHasChanges(true)}
                  variant="outline"
                  className="text-xs"
                >
                  🔧 Test Save UI
                </Button>
              )}
              <Button 
                variant="outline" 
                disabled={saving}
                onClick={() => {
                  alert('Upload Pool button clicked!');
                  console.log('Upload Pool button clicked, current state:', showUploadPool);
                  setShowUploadPool(!showUploadPool);
                  console.log('Upload Pool state changed to:', !showUploadPool);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Pool ({uploadedImages.length})
              </Button>
            </div>
          </div>
        </div>

          {/* Game Images Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Current Game Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(gameImages).map(([game, imagePath]) => {
                  const isUploading = uploading[game];
                  
                  return (
                    <div key={game} className="text-center p-4 rounded-lg border border-border relative group">
                      {/* Hidden file input */}
                      <input
                        ref={el => fileInputRefs.current[game] = el}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, game)}
                        className="hidden"
                        disabled={isUploading}
                      />
                      
                      {/* Image Container - Clickable */}
                      <div 
                        className="relative mb-3 cursor-pointer transition-all duration-200 hover:opacity-80"
                        onClick={() => fileInputRefs.current[game]?.click()}
                      >
                        {imagePath ? (
                          <>
                            <img 
                              src={imagePath} 
                              alt={game}
                              className="w-full h-20 object-cover rounded"
                              style={{ width: '100%', height: '80px' }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              {isUploading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Camera className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="absolute top-1 right-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full" />
                            </div>
                            
                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(game);
                              }}
                              className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                              title="Delete image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
                              {isUploading ? (
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Image className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <Camera className="w-6 h-6 text-primary" />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Game Info */}
                      <p className="font-gaming text-sm font-medium mb-1">{game}</p>
                      
                      {/* Status badge with pending indicator */}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Badge 
                          variant={imagePath ? "secondary" : "outline"} 
                          className={imagePath ? "" : "text-muted-foreground"}
                        >
                          {imagePath ? "Available" : "Click to upload"}
                        </Badge>
                        {hasChanges && !areImagesEqual(imagePath, originalGameImages[game as keyof typeof originalGameImages]) && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="Pending changes" />
                        )}
                      </div>
                      
                      {/* Upload hint */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {hasChanges && !areImagesEqual(imagePath, originalGameImages[game as keyof typeof originalGameImages]) 
                          ? "Pending: Save changes to apply" 
                          : (imagePath ? "Click to replace" : "Click to upload image")
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upload Pool Section */}
          {showUploadPool && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Image Upload Pool
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload images here first, then assign them to any game below.
                </p>
              </CardHeader>
              <CardContent>
                {/* Upload button */}
                <div className="mb-4">
                  <input
                    ref={uploadPoolInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadToPool}
                    className="hidden"
                    disabled={uploading.pool}
                  />
                  <Button 
                    onClick={() => {
                      console.log('Upload to Pool button clicked');
                      uploadPoolInputRef.current?.click();
                    }}
                    disabled={uploading.pool}
                  >
                    {uploading.pool ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload to Pool
                      </>
                    )}
                  </Button>
                </div>

                {/* Uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="text-center p-3 rounded-lg border border-border relative group">
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                        <p className="text-xs font-medium truncate mb-2">{image.name}</p>
                        
                        {/* Assign dropdown */}
                        <div className="mb-2">
                          <Select onValueChange={(gameName) => handleAssignPoolImage(image.id, gameName)}>
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
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {uploadedImages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No images in pool yet. Upload some images to assign to games.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default GameImageManager;