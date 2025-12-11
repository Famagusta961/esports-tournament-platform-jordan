import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trophy, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import auth from '@/lib/shared/kliv-auth.js';

type Match = {
  _row_id: number;
  tournament_id: number;
  tournament_title: string;
  round: string;
  player1: string;
  player2: string;
  player1_score?: number;
  player2_score?: number;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
};

const MatchSubmission = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [user, setUser] = useState<{ username: string; id: string; email: string } | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    player_score: '',
    opponent_score: '',
    match_notes: ''
  });

  useEffect(() => {
    loadMatch();
    loadUser();
  }, [id]);

  const loadMatch = async () => {
    if (!id) return;
    
    try {
      // Simulate API call - replace with real API call
      const mockMatch: Match = {
        _row_id: parseInt(id),
        tournament_id: 1,
        tournament_title: 'ArenaJo Championship 2024',
        round: 'Quarterfinals',
        player1: 'GamerPro',
        player2: 'Opponent123',
        status: 'scheduled',
        scheduled_date: '2024-12-20',
        scheduled_time: '18:00'
      };
      
      setMatch(mockMatch);
    } catch (error) {
      console.error('Failed to load match:', error);
      toast({
        title: "Error",
        description: "Failed to load match details",
        variant: "destructive"
      });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (should be an image)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setScreenshot(file);
    }
  };

  const validateForm = () => {
    if (!formData.player_score || !formData.opponent_score) {
      toast({
        title: "Missing Scores",
        description: "Please enter both player and opponent scores",
        variant: "destructive"
      });
      return false;
    }

    const playerScore = parseInt(formData.player_score);
    const opponentScore = parseInt(formData.opponent_score);
    
    if (isNaN(playerScore) || isNaN(opponentScore) || playerScore < 0 || opponentScore < 0) {
      toast({
        title: "Invalid Scores",
        description: "Please enter valid scores (non-negative numbers)",
        variant: "destructive"
      });
      return false;
    }

    if (!screenshot) {
      toast({
        title: "Screenshot Required",
        description: "Please upload a screenshot of the match result",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit match results",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Match Result Submitted!",
        description: "Your match result has been submitted for review. It will be verified by tournament administrators.",
      });
      
      navigate(`/tournaments/${match?.tournament_id}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit match result",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          <span className="ml-2 text-muted-foreground">Loading match...</span>
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-destructive font-gaming mb-4">Match not found</p>
          <Button onClick={() => navigate('/tournaments')}>
            Back to Tournaments
          </Button>
        </div>
      </Layout>
    );
  }

  const isUserPlayer1 = user?.username === match.player1;
  const isUserPlayer2 = user?.username === match.player2;
  const canSubmit = isUserPlayer1 || isUserPlayer2;

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/tournaments/${match.tournament_id}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tournament</span>
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold">Submit Match Result</h1>
              <p className="text-muted-foreground font-gaming">
                Report the outcome of your match
              </p>
            </div>
          </div>

          {/* Match Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Match Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{match.tournament_title}</h3>
                  <Badge className="mb-4">{match.round}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-display font-bold">{match.player1}</div>
                    <div className="text-sm text-muted-foreground">Player 1</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-display font-bold text-lg">VS</div>
                    <div className="text-sm text-muted-foreground">Match</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="font-display font-bold">{match.player2}</div>
                    <div className="text-sm text-muted-foreground">Player 2</div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <strong>Scheduled:</strong> {formatDate(match.scheduled_date)} at {formatTime(match.scheduled_time)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permission Check */}
          {!canSubmit && user && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">Access Restricted</h4>
                    <p className="text-sm">Only match participants can submit results. You are not listed as a player in this match.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {canSubmit && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      You are submitting results as <strong>{user.username}</strong> 
                      {isUserPlayer1 ? ` (Player 1: ${match.player1})` : ` (Player 2: ${match.player2})`}
                    </p>
                  </div>

                  {/* Score Input */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="player_score">Your Score</Label>
                      <Input
                        id="player_score"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.player_score}
                        onChange={(e) => handleInputChange('player_score', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opponent_score">Opponent Score</Label>
                      <Input
                        id="opponent_score"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.opponent_score}
                        onChange={(e) => handleInputChange('opponent_score', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="screenshot">Match Screenshot *</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {screenshot ? (
                        <div className="space-y-2">
                          <div className="text-sm text-green-600 font-medium">
                            ✓ {screenshot.name} ({(screenshot.size / 1024 / 1024).toFixed(1)} MB)
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setScreenshot(null)}
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload match screenshot
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('screenshot')?.click()}
                          >
                            Choose File
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPG, PNG, GIF (max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="match_notes">Match Notes (Optional)</Label>
                    <Textarea
                      id="match_notes"
                      placeholder="Add any additional notes about the match..."
                      value={formData.match_notes}
                      onChange={(e) => handleInputChange('match_notes', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertTriangle className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold">Important Notice</h4>
                        <p className="text-sm">
                          Submitting false match results may result in disqualification from tournaments and potential account suspension. 
                          Please ensure all submitted information is accurate and supported by evidence.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 font-gaming text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Match Result'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MatchSubmission;