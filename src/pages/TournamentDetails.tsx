import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock, MapPin, Share2, ArrowLeft, CheckCircle, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { UnregisterConfirmDialog } from '@/components/ui/unregister-confirm-dialog';
import { tournamentService } from '@/lib/api-new';
import auth from '@/lib/shared/kliv-auth.js';

type TournamentDetail = {
  _row_id: number;
  title: string;
  description?: string;
  rules?: string;
  format_type?: string;
  match_format?: string;
  platform?: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  start_date: string;
  start_time: string;
  registration_deadline?: string;
  status: string;
  game_name?: string;
  user_registration?: unknown;
  registered_players?: unknown[];
  is_admin?: boolean;
};

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const tournamentId = parseInt(id);
      if (tournamentId && tournamentId > 0) {
        loadTournament(tournamentId);
      } else {
        setError('Invalid tournament ID');
        setLoading(false);
      }
    }
  }, [id]);

  const loadTournament = async (tournamentId: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log('TournamentDetails: Loading tournament', { tournamentId });
      
      const result = await tournamentService.getById(tournamentId);
      
      console.log('TournamentDetails: API result', { 
        tournamentId, 
        success: result?.success, 
        hasTournament: !!result?.tournament,
        userRegistration: result?.tournament?.user_registration,
        error: result?.error
      });
      
      if (result && result.success && result.tournament) {
        console.log('TournamentDetails: Setting tournament data', { 
          title: result.tournament.title,
          game_name: result.tournament.game_name,
          user_registered: result.tournament.user_registration?.registered
        });
        setTournament(result.tournament);
      } else {
        console.error('TournamentDetails: API returned error', { tournamentId, error: result?.error });
        setError(result?.error || 'Failed to load tournament');
      }
    } catch (error) {
      console.error('TournamentDetails: Exception in loadTournament', { tournamentId, error });
      setError('Failed to load tournament');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    if (!tournament) return;
    
    console.log(`JOIN: Clicked tournament ${tournament._row_id} from details page`);
    
    // Check authentication first
    try {
      const user = await auth.getUser();
      if (!user) {
        console.log(`NOT AUTH → redirecting to login (no API call) for tournament ${tournament._row_id}`);
        // Store the tournament they were trying to join
        sessionStorage.setItem('redirectAfterLogin', `/tournaments/${tournament._row_id}`);
        sessionStorage.setItem('joinTournamentAfterLogin', tournament._row_id.toString());
        
        // Redirect to login immediately without showing any toast
        navigate('/login');
        return;
      }
    } catch (error) {
      console.log(`NOT AUTH → redirecting to login (no API call) for tournament ${tournament._row_id} (caught error)`);
      // User is not authenticated
      sessionStorage.setItem('redirectAfterLogin', `/tournaments/${tournament._row_id}`);
      sessionStorage.setItem('joinTournamentAfterLogin', tournament._row_id.toString());
      navigate('/login');
      return;
    }
    
    console.log(`AUTH → calling join API for tournament ${tournament._row_id}`);
    
    // User is authenticated, proceed with tournament join
    try {
      setJoining(true);
      const result = await tournamentService.join(tournament._row_id);
      
      if (result && result.success) {
        toast({
          title: "Registration successful!",
          description: result.message || "You have been registered for the tournament",
        });
        // Reload tournament data to update player count
        loadTournament(tournament._row_id);
      } else {
        throw new Error(result?.error || 'Failed to join tournament');
      }
    } catch (error) {
      console.error('Join tournament error:', error);
      
      // Only show toast for non-authentication errors
      if (error instanceof Error && 
          !error.message.includes('Authentication required') && 
          !error.message.includes('Unauthorized') &&
          (error as { status?: number }).status !== 401 && (error as { status?: number }).status !== 403) {
        toast({
          title: "Registration failed",
          description: error.message || "Failed to join tournament",
          variant: "destructive"
        });
      }
      
      // If we get here with an auth error, redirect to login
      if (error instanceof Error && 
          (error.message.includes('Authentication required') || 
           error.message.includes('Unauthorized') ||
           (error as { status?: number }).status === 401 || (error as { status?: number }).status === 403)) {
        sessionStorage.setItem('redirectAfterLogin', `/tournaments/${tournament._row_id}`);
        sessionStorage.setItem('joinTournamentAfterLogin', tournament._row_id.toString());
        navigate('/login');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleUnregisterTournament = async () => {
    if (!tournament) return;
    
    console.log(`UNREGISTER: tournament ${tournament._row_id} from details page`);
    
    // Check authentication first
    try {
      const user = await auth.getUser();
      if (!user) {
        console.log(`NOT AUTH → redirecting to login (no API call) for unregister tournament ${tournament._row_id}`);
        navigate('/login');
        return;
      }
    } catch (error) {
      console.log(`NOT AUTH → redirecting to login (no API call) for unregister tournament ${tournament._row_id} (caught error)`);
      navigate('/login');
      return;
    }
    
    console.log(`AUTH → calling unregister API for tournament ${tournament._row_id}`);
    
    // User is authenticated, proceed with tournament unregister
    try {
      setUnregistering(true);
      const result = await tournamentService.unregister(tournament._row_id);
      
      if (result && result.success) {
        const message = result.message || "You have been unregistered from the tournament";
        toast({
          title: "Successfully unregistered!",
          description: message,
        });
        // Reload tournament data to update player count and registration status
        loadTournament(tournament._row_id);
        setShowUnregisterDialog(false);
      } else {
        throw new Error(result?.error || 'Failed to unregister from tournament');
      }
    } catch (error) {
      console.error('Unregister tournament error:', error);
      
      // Show toast for all errors (including auth errors)
      if (error instanceof Error) {
        toast({
          title: "Unregister failed",
          description: error.message || "Failed to unregister from tournament",
          variant: "destructive"
        });
      }
      
      // If it's an auth error, redirect to login
      if (error instanceof Error && 
          (error.message.includes('Authentication required') || 
           error.message.includes('Unauthorized') ||
           (error as { status?: number }).status === 401 || (error as { status?: number }).status === 403)) {
        navigate('/login');
      }
    } finally {
      setUnregistering(false);
    }
  };

  const openUnregisterDialog = () => {
    setShowUnregisterDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registration':
        return <Badge className="bg-success/20 text-success border-success/30 text-base px-4 py-1">Registration Open</Badge>;
      case 'live':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-base px-4 py-1 animate-pulse">LIVE</Badge>;
      case 'upcoming':
        return <Badge className="bg-warning/20 text-warning border-warning/30 text-base px-4 py-1">Upcoming</Badge>;
      default:
        return <Badge variant="secondary" className="text-base px-4 py-1">Completed</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-gaming text-muted-foreground">Loading tournament...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !tournament) {
    return (
      <Layout>
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-center">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Tournament Not Found</h3>
              <p className="text-muted-foreground font-gaming mb-4">{error || 'This tournament does not exist'}</p>
              <Link to="/tournaments">
                <Button className="font-gaming">Browse Tournaments</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Get game color
  const getGameColor = (gameName: string) => {
    const colors: Record<string, string> = {
      'PUBG Mobile': 'from-yellow-500 to-orange-600',
      'EA FC 25': 'from-green-500 to-emerald-600',
      'EA FC': 'from-green-500 to-emerald-600',
      'Valorant': 'from-red-500 to-pink-600',
      'COD Mobile': 'from-orange-500 to-red-600',
      'Fortnite': 'from-purple-500 to-blue-600',
      'League of Legends': 'from-blue-500 to-cyan-600',
      'LoL': 'from-blue-500 to-cyan-600',
    };
    return colors[gameName] || 'from-gray-500 to-gray-600';
  };


  const currentUserRegistered = tournament.user_registration?.registered || false;
  const canJoin = (tournament.status === 'registration' || tournament.status === 'draft') && 
                   tournament.current_players < tournament.max_players && 
                   !currentUserRegistered;
  
  const canUnregister = (tournament.status === 'registration' || tournament.status === 'draft') && 
                        currentUserRegistered;

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link to="/tournaments" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 font-gaming transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tournaments</span>
          </Link>

          {/* Header Card */}
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border mb-8">
            {/* Gradient Header */}
            <div className={`h-32 sm:h-40 bg-gradient-to-r ${getGameColor(tournament.game_name || 'Unknown')} relative`}>
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-6 flex items-center space-x-3">
                <Badge variant="secondary" className="bg-black/50 text-white border-0">
                  {tournament.game_name || 'Unknown'}
                </Badge>
                <Badge variant="secondary" className="bg-black/50 text-white border-0">
                  {tournament.platform || 'PC'}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold">{tournament.title}</h1>
                    {getStatusBadge(tournament.status)}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-gaming">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{tournament.start_date ? new Date(tournament.start_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{tournament.start_time || 'TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{tournament.format_type || 'Solo'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/50 border border-border min-w-[120px]">
                    <p className="text-xs text-muted-foreground font-gaming mb-1">Prize Pool</p>
                    <p className="font-display font-bold text-2xl text-primary">{tournament.prize_pool || 0} JD</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50 border border-border min-w-[120px]">
                    <p className="text-xs text-muted-foreground font-gaming mb-1">Entry Fee</p>
                    <p className="font-display font-bold text-2xl">{tournament.entry_fee || 0} JD</p>
                  </div>
                </div>
              </div>

              {/* Registration Progress */}
              <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-gaming text-sm text-muted-foreground">Registration Progress</span>
                  <span className="font-gaming text-sm">
                    <span className="text-primary">{tournament.current_players || 0}</span>
                    <span className="text-muted-foreground">/{tournament.max_players} players</span>
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${((tournament.current_players || 0) / tournament.max_players) * 100}%` }}
                  />
                </div>
              </div>

              {/* Join/Unregister Button */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {currentUserRegistered || (tournament.user_registration && tournament.user_registration.registered) ? (
                  <>
                    <Button 
                      size="lg" 
                      className="flex-1 font-gaming text-lg bg-success hover:bg-success/90"
                      onClick={openUnregisterDialog}
                      disabled={!canUnregister || unregistering}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      {unregistering ? 'Unregistering...' : canUnregister ? 'Unregister' : 'Cannot Unregister'}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      disabled
                      className="flex-1 font-gaming border-border text-muted-foreground"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Registered
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="lg" 
                    className="flex-1 font-gaming text-lg bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 glow-cyan"
                    disabled={!canJoin || joining}
                    onClick={handleJoinTournament}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    {joining ? 'Joining...' : canJoin ? 'Join Tournament' : 'Registration Closed'}
                  </Button>
                )}
                
                {!currentUserRegistered && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="font-gaming border-border hover:border-primary/50"
                    onClick={() => {
                      console.log('Create Team clicked for tournament', tournament._row_id);
                      
                      if (currentUserRegistered) {
                        toast({
                          title: "Already Registered",
                          description: "You're already registered for this tournament.",
                          variant: "default"
                        });
                      } else if (canJoin) {
                        // Store tournament context so we can show relevant message after team creation
                        sessionStorage.setItem('tournamentContext', JSON.stringify({
                          id: tournament._row_id,
                          title: tournament.title,
                          game_name: tournament.game_name
                        }));
                        sessionStorage.setItem('redirectToTournamentAfterTeamCreation', `/tournaments/${tournament._row_id}`);
                        
                        toast({
                          title: "👥 Team Creation",
                          description: "Opening team creation page...",
                          duration: 2000
                        });
                        
                        // Navigate to team management page which has team creation functionality
                        setTimeout(() => {
                          navigate('/teams');
                        }, 500);
                      } else {
                        toast({
                          title: "Registration Closed", 
                          description: "Team registration is not available for this tournament.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Create Team
                  </Button>
                )}
              </div>
              
              {/* Unregister Confirmation Dialog */}
              <UnregisterConfirmDialog
                open={showUnregisterDialog}
                onOpenChange={setShowUnregisterDialog}
                onConfirm={handleUnregisterTournament}
                tournamentTitle={tournament.title}
                entryFee={tournament.entry_fee || 0}
                isUnregistering={unregistering}
              />
            </div>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-card border border-border p-1 w-full sm:w-auto">
              <TabsTrigger value="overview" className="font-gaming">Overview</TabsTrigger>
              <TabsTrigger value="rules" className="font-gaming">Rules</TabsTrigger>
              <TabsTrigger value="participants" className="font-gaming">Participants</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="rounded-xl bg-card border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">About This Tournament</h3>
                <p className="text-muted-foreground font-gaming leading-relaxed">
                  {tournament.description || 'No description available'}
                </p>
              </div>

              <div className="rounded-xl bg-card border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Tournament Format</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl mb-1">🎮</p>
                    <p className="font-gaming text-sm text-muted-foreground">Format</p>
                    <p className="font-gaming font-semibold">{tournament.format_type || 'Solo'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl mb-1">🎯</p>
                    <p className="font-gaming text-sm text-muted-foreground">Match Type</p>
                    <p className="font-gaming font-semibold">{tournament.match_format || '1v1'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl mb-1">📱</p>
                    <p className="font-gaming text-sm text-muted-foreground">Platform</p>
                    <p className="font-gaming font-semibold">{tournament.platform || 'PC'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl mb-1">👥</p>
                    <p className="font-gaming text-sm text-muted-foreground">Max Players</p>
                    <p className="font-gaming font-semibold">{tournament.max_players}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <div className="rounded-xl bg-card border border-border p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Tournament Rules</h3>
                <div className="text-muted-foreground font-gaming leading-relaxed whitespace-pre-line">
                  {tournament.rules || 'No rules specified'}
                </div>
              </div>

              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-gaming font-semibold text-destructive mb-2">Important Notice</h4>
                    <p className="font-gaming text-sm text-destructive/80">
                      Violation of any rules may result in immediate disqualification and potential ban from future tournaments.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-6">
              <div className="rounded-xl bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-semibold">Registered Players</h3>
                  <Badge variant="secondary" className="font-gaming">
                    {tournament.current_players || 0}/{tournament.max_players}
                  </Badge>
                </div>
                
                {tournament.is_admin && tournament.registered_players && Array.isArray(tournament.registered_players) && tournament.registered_players.length > 0 ? (
                  <div className="space-y-3">
                    {tournament.registered_players.map((player: unknown) => {
                      const playerData = player as Record<string, unknown>;
                      return (
                        <div 
                          key={playerData._row_id as number}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                              <span className="font-display font-bold text-sm text-white">
                                {(playerData.username as string || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-gaming font-semibold">{playerData.username as string || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground font-gaming">
                                {playerData.team_name ? `Team: ${playerData.team_name as string}` : 'Individual'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={playerData.payment_status === 'paid' ? 'default' : 'secondary'}>
                              {playerData.payment_status as string || 'free'}
                            </Badge>
                            <p className="text-xs text-muted-foreground font-gaming mt-1">
                              Joined {new Date((playerData.joined_at as number) * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-gaming text-muted-foreground">
                      {tournament.is_admin ? 'No players registered yet' : 'Participant list available to admins only'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default TournamentDetails;
