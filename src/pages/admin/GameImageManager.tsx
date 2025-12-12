import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image, Gamepad2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">Loading tournaments...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/admin" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold mb-2">Game Image Manager</h1>
                <p className="text-muted-foreground">
                  Manage which games have images assigned to them. Images are automatically displayed on tournament pages and game cards.
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
                {Object.entries(gameImages).map(([game, imagePath]) => (
                  <div key={game} className="text-center p-4 rounded-lg border border-border">
                    {imagePath ? (
                      <>
                        <div className="relative mb-3">
                          <img 
                            src={imagePath} 
                            alt={game}
                            className="w-full h-20 object-cover rounded"
                            style={{ width: '100%', height: '80px' }}
                          />
                          <div className="absolute top-1 right-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                          </div>
                        </div>
                        <p className="font-gaming text-sm font-medium">{game}</p>
                        <Badge variant="secondary" className="mt-1">Available</Badge>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-3">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-gaming text-sm font-medium">{game}</p>
                        <Badge variant="outline" className="mt-1">Missing</Badge>
                      </>
                    )}
                  </div>
                ))}
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
      </div>
    </Layout>
  );
};

export default GameImageManager;