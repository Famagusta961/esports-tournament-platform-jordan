import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image, Gamepad2, Check, X, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layout/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { content } from '@/lib/shared/kliv-content.js';
import db from '@/lib/shared/kliv-database.js';

interface Tournament {
  _row_id: number;
  title: string;
  game_name: string;
  status: string;
}

const GameImageManager = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const { data } = await db.query('tournaments', { 
        _row_id: 'gte.1',
        limit: 50,
        orderBy: 'start_date.desc'
      });
      setTournaments(data || []);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getGameImage = (gameName: string) => {
    return gameImages[gameName as keyof typeof gameImages] || null;
  };

  const hasGameImage = (gameName: string) => {
    return !!getGameImage(gameName);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, gameName: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(prev => ({ ...prev, [gameName]: true }));
    
    try {
      // Delete old image if it exists
      const currentImage = getGameImage(gameName);
      if (currentImage && currentImage !== gameImages[gameName as keyof typeof gameImages]) {
        try {
          const urlParts = currentImage.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          if (oldFileName) {
            await content.deleteFile(`/content/games/${oldFileName}`);
          }
        } catch (deleteError) {
          console.warn('Could not delete old image:', deleteError);
        }
      }
      
      // Generate filename from game name with timestamp to avoid caching
      const sanitizedGameName = gameName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${sanitizedGameName}_${timestamp}.${fileExtension}`;
      
      const result = await content.uploadFile(file, '/content/games/', fileName);
      
      // Update the game image mapping with cache-busting
      const imageUrlWithTimestamp = result.contentUrl + `?t=${timestamp}`;
      setGameImages(prev => ({
        ...prev,
        [gameName]: imageUrlWithTimestamp
      }));
      
      toast({
        title: "Image updated!",
        description: `${gameName} image has been updated successfully`,
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
    const currentImage = getGameImage(gameName);
    if (!currentImage) return;

    try {
      // Extract filename from URL
      const urlParts = currentImage.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName) {
        await content.deleteFile(`/content/games/${fileName}`);
      }
      
      // Remove from game images mapping
      setGameImages(prev => {
        const newImages = { ...prev };
        delete newImages[gameName as keyof typeof newImages];
        return newImages;
      });
      
      toast({
        title: "Image deleted",
        description: `${gameName} image has been removed`,
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8">Loading tournaments...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Game Image Manager</h1>
              <p className="text-muted-foreground">
                Manage which games have images assigned to them. Images are automatically displayed on tournament pages and game cards.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                💡 Click any game image to upload or replace it. Hover and click the red button to delete.
              </p>
            </div>
            
            <Link to="/image-test">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Images
              </Button>
            </Link>
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
                      <Badge 
                        variant={imagePath ? "secondary" : "outline"} 
                        className={imagePath ? "" : "text-muted-foreground"}
                      >
                        {imagePath ? "Available" : "Click to upload"}
                      </Badge>
                      
                      {/* Upload hint */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {imagePath ? "Click to replace" : "Click to upload image"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tournaments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Tournament Image Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tournaments.map((tournament) => {
                  const hasImage = hasGameImage(tournament.game_name);
                  const gameImage = getGameImage(tournament.game_name);
                  
                  return (
                    <div key={tournament._row_id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        {/* Game Image Preview */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {gameImage ? (
                            <img 
                              src={gameImage} 
                              alt={tournament.game_name}
                              className="w-full h-full object-cover"
                              style={{ width: '64px', height: '64px' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Tournament Info */}
                        <div>
                          <h3 className="font-gaming font-semibold">{tournament.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Game: {tournament.game_name} • {tournament.status}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        {hasImage ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-green-600">Image Available</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <span className="text-sm text-orange-600">No Image</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
      </div>
    </AdminLayout>
  );
};

export default GameImageManager;