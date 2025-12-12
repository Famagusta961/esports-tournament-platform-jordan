import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { tournamentService } from '@/lib/api';

const featuredTournaments = [
  {
    id: '1',
    title: 'PUBG Mobile Championship',
    game: 'PUBG Mobile',
    gameColor: 'from-yellow-500 to-orange-600',
    prizePool: '500 JD',
    entryFee: '5 JD',
    format: 'Squad',
    maxPlayers: 100,
    currentPlayers: 76,
    startDate: '2024-01-15',
    startTime: '18:00',
    status: 'registration',
    featured: true,
  },
  {
    id: '2',
    title: 'EA FC Weekly Cup',
    game: 'EA FC 25',
    gameColor: 'from-green-500 to-emerald-600',
    prizePool: '200 JD',
    entryFee: '3 JD',
    format: '1v1',
    maxPlayers: 32,
    currentPlayers: 28,
    startDate: '2024-01-12',
    startTime: '20:00',
    status: 'registration',
    featured: false,
  },
  {
    id: '3',
    title: 'Valorant Showdown',
    game: 'Valorant',
    gameColor: 'from-red-500 to-pink-600',
    prizePool: '1000 JD',
    entryFee: '10 JD',
    format: '5v5',
    maxPlayers: 80,
    currentPlayers: 65,
    startDate: '2024-01-20',
    startTime: '16:00',
    status: 'registration',
    featured: true,
  },
];

const getGameImage = (gameName: string) => {
  const images: Record<string, string> = {
    'PUBG Mobile': '/content/games/pubg-.jpg',
    'EA FC 25': '/content/games/EA FC 25.jpg',
    'EA FC': '/content/games/EA FC 25.jpg',
    'Valorant': '/content/games/valorant-listing-scaled.jpg',
    'COD Mobile': '/content/games/COD.jpg',
    'Fortnite': '/content/games/fneco-2025-keyart-thumb-1920x1080-de84aedabf4d.jpg',
    'League of Legends': '/content/games/league-of-legends-pc-game-cover.jpg',
    'LoL': '/content/games/league-of-legends-pc-game-cover.jpg',
  };
  
  const baseUrl = images[gameName];
  if (!baseUrl) return null;
  
  // Add cache-busting parameter to ensure fresh images
  const timestamp = Date.now();
  return `${baseUrl}?t=${timestamp}`;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'registration':
      return <Badge className="bg-success/20 text-success border-success/30">Registration Open</Badge>;
    case 'live':
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30 animate-pulse">LIVE</Badge>;
    case 'upcoming':
      return <Badge className="bg-warning/20 text-warning border-warning/30">Upcoming</Badge>;
    default:
      return <Badge variant="secondary">Completed</Badge>;
  }
};

const FeaturedTournaments = () => {
  const { toast } = useToast();

  const handleJoinTournament = async (tournamentId: string) => {
    console.log('FeaturedTournaments: Joining tournament', { tournamentId, platform: navigator.userAgent });
    
    try {
      const result = await tournamentService.join(parseInt(tournamentId));
      
      console.log('FeaturedTournaments: Join result', { tournamentId, success: result?.success, message: result?.message });
      
      if (result && result.success) {
        toast({
          title: "Success!",
          description: result.message || "You've joined the tournament",
        });
      } else {
        toast({
          title: "Error", 
          description: result?.error || "Failed to join tournament",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('FeaturedTournaments: Error joining tournament', { tournamentId, error });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join tournament",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-gaming text-primary uppercase tracking-wider text-sm">Featured</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Hot <span className="text-gradient">Tournaments</span>
            </h2>
          </div>
          <Link 
            to="/tournaments" 
            className="hidden sm:flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-gaming group"
          >
            <span>View All</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTournaments.map((tournament, index) => (
            <div
              key={tournament.id}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Featured Badge */}
              {tournament.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                    <Trophy className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* Header with Game Image */}
              <div className={`h-24 bg-gradient-to-r ${tournament.gameColor} relative overflow-hidden`}>
                {getGameImage(tournament.game || '') && (
                  <>
                    <img 
                      src={getGameImage(tournament.game || '')} 
                      alt={tournament.game || 'Game'}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ width: '100%', height: '100%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
                  </>
                ) || (
                  <div className="absolute inset-0 bg-black/40" />
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="font-gaming text-sm text-white/80">{tournament.game}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Title & Status */}
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {tournament.title}
                  </h3>
                  {getStatusBadge(tournament.status)}
                </div>

                {/* Prize & Entry */}
                <div className="flex items-center justify-between py-3 border-y border-border">
                  <div>
                    <p className="text-xs text-muted-foreground font-gaming">Prize Pool</p>
                    <p className="font-display font-bold text-xl text-primary">{tournament.prizePool}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-gaming">Entry Fee</p>
                    <p className="font-gaming font-semibold text-lg">{tournament.entryFee}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-gaming">{tournament.format}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-gaming">{new Date(tournament.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-gaming">{tournament.startTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-gaming text-muted-foreground">
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <Link 
                    to={`/tournaments/${tournament.id}`}
                    className="block"
                  >
                    <Button variant="outline" className="w-full font-gaming">
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    className="w-full font-gaming bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
                    onClick={() => handleJoinTournament(tournament.id)}
                  >
                    Join Tournament
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <Link 
          to="/tournaments" 
          className="sm:hidden flex items-center justify-center space-x-2 mt-8 text-primary hover:text-primary/80 transition-colors font-gaming"
        >
          <span>View All Tournaments</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedTournaments;
