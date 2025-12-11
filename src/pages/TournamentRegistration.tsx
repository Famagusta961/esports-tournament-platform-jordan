import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Wallet, Calendar, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { tournamentService } from '@/lib/api';
import auth from '@/lib/shared/kliv-auth.js';
import Layout from '@/components/layout/Layout';

type Tournament = {
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
  game_slug?: string;
};

const TournamentRegistration = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [user, setUser] = useState<{ username: string; id: string; email: string } | null>(null);

  useEffect(() => {
    loadTournament();
    loadUser();
  }, [id]);

  const loadTournament = async () => {
    if (!id) return;
    
    try {
      // Use actual tournament API
      const result = await tournamentService.getById(parseInt(id));
      
      if (result && result.success && result.tournament) {
        setTournament(result.tournament);
      } else {
        throw new Error(result?.error || 'Tournament not found');
      }
    } catch (error) {
      console.error('Failed to load tournament:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load tournament details",
        variant: "destructive"
      });
      // Navigate back to tournaments list on error
      navigate('/tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await auth.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleRegistration = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to register for this tournament",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!tournament) return;

    setIsRegistering(true);
    
    try {
      // Use actual tournament join API
      const result = await tournamentService.join(tournament._row_id);
      
      if (result && result.success) {
        toast({
          title: result.alreadyRegistered ? "Already Registered" : "Registration Successful!",
          description: result.message || `You have been registered for ${tournament.title}`,
        });
        
        // Navigate to tournament details with a slight delay to show success message
        setTimeout(() => {
          navigate(`/tournaments/${tournament._row_id}`);
        }, 1500);
      } else {
        throw new Error(result?.error || 'Failed to register for tournament');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register for tournament",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString ? new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }) : 'TBD';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading tournament...</span>
        </div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-destructive font-gaming mb-4">Tournament not found</p>
          <Button onClick={() => navigate('/tournaments')}>
            Back to Tournaments
          </Button>
        </div>
      </Layout>
    );
  }

  const isRegistrationOpen = tournament.status === 'registration';
  const isTournamentFull = tournament.current_players >= tournament.max_players;
  const registrationDeadline = tournament.registration_deadline ? new Date(tournament.registration_deadline) > new Date() : true;

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/tournaments/${tournament._row_id}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tournament</span>
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold">Tournament Registration</h1>
              <p className="text-muted-foreground font-gaming">
                Complete your registration for {tournament.title}
              </p>
            </div>
          </div>

          {/* Tournament Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Tournament Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="font-display font-bold">{tournament.game_name}</div>
                  <Badge className="mt-2">{tournament.format_type?.replace('_', ' ')}</Badge>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Wallet className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="font-display font-bold text-lg">{tournament.entry_fee} JOD</div>
                  <div className="text-sm text-muted-foreground">Entry Fee</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="font-display font-bold text-lg">{tournament.prize_pool} JOD</div>
                  <div className="text-sm text-muted-foreground">Prize Pool</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-display font-bold text-lg">{tournament.current_players}/{tournament.max_players}</div>
                  <div className="text-sm text-muted-foreground">Players Registered</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2">Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Registration Deadline:</span>
                    <div className="font-medium">
                      {tournament.registration_deadline ? formatDate(tournament.registration_deadline) : 'No deadline'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tournament Date:</span>
                    <div className="font-medium">{formatDate(tournament.start_date)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start Time:</span>
                    <div className="font-medium">{formatTime(tournament.start_time)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Registration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isRegistrationOpen && (
                <div className="text-center py-8">
                  <div className="text-orange-500 mb-4">
                    <Shield className="w-12 h-12 mx-auto mb-2" />
                    <h3 className="font-display text-xl font-semibold">Registration Not Open</h3>
                    <p className="text-muted-foreground">
                      Tournament registration is currently closed. Status: {tournament.status}
                    </p>
                  </div>
                </div>
              )}
              
              {isRegistrationOpen && isTournamentFull && (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4">
                    <Users className="w-12 h-12 mx-auto mb-2" />
                    <h3 className="font-display text-xl font-semibold">Tournament Full</h3>
                    <p className="text-muted-foreground">
                      This tournament has reached its maximum capacity of {tournament.max_players} players.
                    </p>
                  </div>
                </div>
              )}
              
              {isRegistrationOpen && !registrationDeadline && (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <h3 className="font-display text-xl font-semibold">Registration Closed</h3>
                    <p className="text-muted-foreground">
                      Registration deadline has passed.
                    </p>
                  </div>
                </div>
              )}
              
              {isRegistrationOpen && !isTournamentFull && registrationDeadline && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <h3 className="font-display text-xl font-semibold">Registration Open</h3>
                    <p className="text-muted-foreground">
                      {tournament.max_players - tournament.current_players} spots remaining
                    </p>
                  </div>
                  
                  {!user && (
                    <div className="text-center py-4 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground mb-4">
                        You need to be logged in to register for this tournament
                      </p>
                      <Button onClick={() => navigate('/login')}>
                        Sign In to Register
                      </Button>
                    </div>
                  )}
                  
                  {user && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Ready to Register</h4>
                        <p className="text-green-700 text-sm mb-3">
                          You are about to register for {tournament.title}. The entry fee of {tournament.entry_fee} JOD will be deducted from your wallet.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Tournament Rules</h4>
                        <p className="text-blue-700 text-sm whitespace-pre-line">
                          {tournament.rules || 'Standard tournament rules apply. No cheating, no exploits. Sportsmanship required.'}
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleRegistration}
                        disabled={isRegistering}
                        className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 font-gaming text-lg py-6"
                      >
                        {isRegistering ? 'Processing Registration...' : `Register for ${tournament.entry_fee} JOD`}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TournamentRegistration;