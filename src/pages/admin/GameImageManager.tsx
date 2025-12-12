import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Image, Camera, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Helper function to compare image URLs (ignoring cache-busting query params)
  const areImagesEqual = (url1: string | undefined, url2: string | undefined) => {
    if (!url1 || !url2) return url1 === url2;
    // Remove cache-busting query parameters for comparison
    const cleanUrl1 = url1.split('?')[0];
    const cleanUrl2 = url2.split('?')[0];
    return cleanUrl1 === cleanUrl2;
  };

  // Check if there are any pending changes
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
    console.log('Has changes:', changes);
    setHasChanges(changes);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, gameName: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(prev => ({ ...prev, [gameName]: true }));
    
    try {
      // Generate filename from game name with timestamp to avoid caching
      const sanitizedGameName = gameName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${sanitizedGameName}_${timestamp}.${fileExtension}`;
      
      const result = await content.uploadFile(file, '/content/games/', fileName);
      
      // Update the game image mapping with cache-busting (pending change)
      const imageUrlWithTimestamp = result.contentUrl + `?t=${timestamp}`;
      const newImages = {
        ...gameImages,
        [gameName]: imageUrlWithTimestamp
      };
      setGameImages(newImages);
      
      // Check for changes
      checkForChanges(newImages);
      
      toast({
        title: "Image uploaded!",
        description: `${gameName} image has been uploaded. Click "Save Changes" to apply.`,
      });
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

  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    
    try {
      // Find and delete old images that have been replaced or removed
      for (const [gameName, currentImage] of Object.entries(gameImages)) {
        const originalImage = originalGameImages[gameName as keyof typeof originalGameImages];
        
        // If image was replaced or removed, delete the old file
        if (originalImage && originalImage !== currentImage) {
          try {
            const urlParts = originalImage.split('/');
            const oldFileName = urlParts[urlParts.length - 1];
            if (oldFileName) {
              await content.deleteFile(`/content/games/${oldFileName}`);
            }
          } catch (deleteError) {
            console.warn('Could not delete old image:', deleteError);
          }
        }
      }
      
      toast({
        title: "Changes saved!",
        description: "All image changes have been applied successfully.",
      });
      
      // Update the original images to match the current state
      Object.assign(originalGameImages, gameImages);
      setHasChanges(false);
      
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
              <Link to="/image-test">
                <Button variant="outline" disabled={saving}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Images
                </Button>
              </Link>
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

  
        </div>
      </div>
    </Layout>
  );
};

export default GameImageManager;