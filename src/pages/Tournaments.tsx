import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Users, Trophy, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { tournamentService, gameService } from '@/lib/api-new';
import auth from '@/lib/shared/kliv-auth.js';

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

const getGameColor = (gameName: string) => {
  const colors: Record<string, string> = {
    'PUBG Mobile': 'from-yellow-500 to-orange-600',
    'EA FC': 'from-green-500 to-emerald-600',
    'Valorant': 'from-red-500 to-pink-600',
    'COD Mobile': 'from-orange-500 to-red-600',
    'Fortnite': 'from-purple-500 to-blue-600',
    'League of Legends': 'from-blue-500 to-cyan-600',
  };
  return colors[gameName] || 'from-gray-500 to-gray-600';
};

type Tournament = {
  _row_id: number;
  title: string;
  description?: string;
  rules?: string;
  format_type?: string;
  platform?: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  start_date: string;
  start_time: string;
  registration_deadline?: string;
  status: string;
  is_featured: boolean;
  game_name?: string;
  game_slug?: string;
  game_id?: number;
};

type Game = {
  _row_id: number;
  slug: string;
  name: string;
  is_active: number;
};

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningTournament, setJoiningTournament] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Define loadTournaments BEFORE useEffect that calls it
  const loadTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (gameFilter !== 'all') params.game = gameFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const result = await tournamentService.list(params);
      
      if (result && result.tournaments) {
        setTournaments(result.tournaments);
      } else {
        setTournaments([]);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  }, [gameFilter, statusFilter]);

  useEffect(() => {
    loadGames();
  }, []);

  

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const loadGames = async () => {
    try {
      const result = await gameService.list();
      setGames(result);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleJoinTournament = async (tournamentId: number) => {
    console.log(`JOIN: Clicked tournament ${tournamentId}`);
    
    // Check authentication first
    try {
      const user = await auth.getUser();
      if (!user) {
        console.log(`NOT AUTH → redirecting to login (no API call) for tournament ${tournamentId}`);
        // Store the tournament they were trying to join
        sessionStorage.setItem('redirectAfterLogin', `/tournaments/${tournamentId}`);
        sessionStorage.setItem('joinTournamentAfterLogin', tournamentId.toString());
        
        // Redirect to login immediately without showing any toast
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.log(`NOT AUTH → redirecting to login (no API call) for tournament ${tournamentId} (caught error)`);
      // User is not authenticated
      sessionStorage.setItem('redirectAfterLogin', `/tournaments/${tournamentId}`);
      sessionStorage.setItem('joinTournamentAfterLogin', tournamentId.toString());
      window.location.href = '/login';
      return;
    }
    
    console.log(`AUTH → calling join API for tournament ${tournamentId}`);
    
    // User is authenticated, proceed with tournament join
    try {
      setJoiningTournament(tournamentId);
      const result = await tournamentService.join(tournamentId);
      
      if (result && result.success) {
        toast({
          title: "Success!",
          description: result.message || "You've joined the tournament",
        });
        loadTournaments(); // Refresh the list
      } else {
        throw new Error(result?.error || 'Failed to join tournament');
      }
    } catch (error) {
      console.error('Join tournament error:', error);
      
      // Only show toast for non-authentication errors
      if (error instanceof Error && 
          !error.message.includes('Authentication required') && 
          !error.message.includes('Unauthorized') &&
          error.status !== 401 && error.status !== 403) {
        toast({
          title: "Error",
          description: error.message || "Failed to join tournament",
          variant: "destructive",
        });
      }
      
      // If we get here with an auth error, redirect to login
      if (error instanceof Error && 
          (error.message.includes('Authentication required') || 
           error.message.includes('Unauthorized') ||
           error.status === 401 || error.status === 403)) {
        sessionStorage.setItem('redirectAfterLogin', `/tournaments/${tournamentId}`);
        sessionStorage.setItem('joinTournamentAfterLogin', tournamentId.toString());
        window.location.href = '/login';
      }
    } finally {
      setJoiningTournament(null);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tournament.game_name && tournament.game_name.toLowerCase().includes(searchQuery.toLowerCase()));
    // Game and status filtering is handled by the API, but keep for search-only filtering
    const matchesGame = gameFilter === 'all' || tournament.game_slug === gameFilter;
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesGame && matchesStatus;
  });

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Tournaments</span>
            </h1>
            <p className="text-muted-foreground font-gaming text-lg">
              Find your next competition and claim victory
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border font-gaming"
              />
            </div>
            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border font-gaming">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Games</SelectItem>
                {games.map((game) => (
                  <SelectItem key={game._row_id} value={game.slug}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border font-gaming">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registration">Registration Open</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
              <span className="font-gaming text-muted-foreground">Loading tournaments...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive font-gaming mb-4">{error}</p>
              <Button onClick={loadTournaments} className="font-gaming">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament, index) => (
                <div
                  key={tournament._row_id}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`h-20 bg-gradient-to-r ${getGameColor(tournament.game_name || 'Unknown')} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-3 left-4 flex items-center space-x-2">
                      <span className="font-gaming text-sm text-white/90">{tournament.game_name || 'Unknown'}</span>
                      <Badge variant="secondary" className="text-xs bg-black/30 text-white border-0">
                        {tournament.platform || 'PC'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {tournament.title}
                      </h3>
                      {getStatusBadge(tournament.status)}
                    </div>

                    <div className="flex items-center justify-between py-3 border-y border-border">
                      <div>
                        <p className="text-xs text-muted-foreground font-gaming">Entry Fee</p>
                        <p className="font-display font-bold text-lg text-primary">{tournament.entry_fee} JD</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-gaming">Players</p>
                        <p className="font-gaming font-semibold">{tournament.current_players}/{tournament.max_players}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="font-gaming">{tournament.format_type || tournament.format || 'Solo'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-gaming">{new Date(tournament.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-gaming">{tournament.start_time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            style={{ width: `${(tournament.current_players / tournament.max_players) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link to={`/tournaments/${tournament._row_id}`}>
                        <Button variant="outline" className="w-full font-gaming">
                          View Details
                        </Button>
                      </Link>
                      {(tournament.status === 'registration' || tournament.status === 'draft') && tournament.current_players < tournament.max_players && (
                        <Button 
                          className="w-full font-gaming bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
                          onClick={() => handleJoinTournament(tournament._row_id)}
                          disabled={joiningTournament === tournament._row_id}
                        >
                          {joiningTournament === tournament._row_id ? 'Joining...' : 'Join Tournament'}
                        </Button>
                      )}
                      {tournament.status === 'registration' && tournament.current_players >= tournament.max_players && (
                        <Button 
                          className="w-full font-gaming bg-muted text-muted-foreground"
                          disabled
                        >
                          Tournament Full
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredTournaments.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Tournaments Found</h3>
              <p className="text-muted-foreground font-gaming">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tournaments;