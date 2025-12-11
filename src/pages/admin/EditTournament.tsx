import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, Users, Wallet, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { tournamentService, gameService } from '@/lib/api';

type Game = {
  _row_id: number;
  slug: string;
  name: string;
  is_active: number;
};

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
  game_slug?: string;
  game_name?: string;
};

const EditTournament = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    game_slug: '',
    description: '',
    rules: '',
    format_type: 'single_elimination',
    match_format: '1v1',
    platform: 'PC',
    entry_fee: 0,
    prize_pool: 0,
    max_players: 16,
    start_date: '',
    start_time: '18:00',
    registration_deadline: '',
    status: 'draft'
  });

  useEffect(() => {
    loadTournament();
    loadGames();
  }, [id]);

  const loadTournament = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Use actual tournament API
      const result = await tournamentService.getById(parseInt(id));
      
      if (result && result.success && result.tournament) {
        const tournamentData = result.tournament;
        setTournament(tournamentData);
        
        // Extract game slug from game_name or use a default
        let gameSlug = '';
        if (tournamentData.game_slug) {
          gameSlug = tournamentData.game_slug;
        } else if (tournamentData.game_name) {
          // Try to find game by name and get slug
          const games = await gameService.list();
          const game = games.find(g => g.name.toLowerCase() === tournamentData.game_name?.toLowerCase());
          gameSlug = game?.slug || '';
        }
        
        setFormData({
          title: tournamentData.title || '',
          game_slug: gameSlug,
          description: tournamentData.description || '',
          rules: tournamentData.rules || '',
          format_type: tournamentData.format_type || 'single_elimination',
          match_format: tournamentData.match_format || '1v1',
          platform: tournamentData.platform || 'PC',
          entry_fee: tournamentData.entry_fee || 0,
          prize_pool: tournamentData.prize_pool || 0,
          max_players: tournamentData.max_players || 16,
          start_date: tournamentData.start_date || '',
          start_time: tournamentData.start_time || '18:00',
          registration_deadline: tournamentData.registration_deadline || '',
          status: tournamentData.status || 'draft'
        });
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
      // Navigate back on error
      navigate('/admin/tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      const gamesData = await gameService.list();
      setGames(gamesData);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.game_slug || !formData.start_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.entry_fee < 0 || formData.prize_pool < 0) {
      toast({
        title: "Validation Error", 
        description: "Fee and prize amounts must be positive",
        variant: "destructive"
      });
      return;
    }

    if (formData.max_players < 2 || formData.max_players > 10000) {
      toast({
        title: "Validation Error",
        description: "Player count must be between 2 and 10,000",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await tournamentService.update(parseInt(id!), {
        title: formData.title,
        description: formData.description,
        rules: formData.rules,
        format_type: formData.format_type,
        match_format: formData.match_format,
        platform: formData.platform,
        entry_fee: formData.entry_fee,
        prize_pool: formData.prize_pool,
        max_players: formData.max_players,
        start_date: formData.start_date,
        start_time: formData.start_time,
        registration_deadline: formData.registration_deadline,
        status: formData.status,
        game_slug: formData.game_slug
      });
      
      if (result && result.success) {
        toast({
          title: "Tournament Updated!",
          description: "Tournament has been successfully updated",
        });
        navigate('/admin/tournaments');
      } else {
        throw new Error(result?.error || 'Failed to update tournament');
      }
    } catch (error) {
      console.error('Update tournament error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update tournament",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await tournamentService.delete(parseInt(id));
      
      if (result && result.success) {
        toast({
          title: "Tournament Deleted",
          description: result.message || "Tournament has been successfully deleted",
        });
        navigate('/admin/tournaments');
      } else {
        throw new Error(result?.error || 'Failed to delete tournament');
      }
    } catch (error) {
      console.error('Delete tournament error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete tournament",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatOptions = [
    { value: 'single_elimination', label: 'Single Elimination' },
    { value: 'double_elimination', label: 'Double Elimination' },
    { value: 'round_robin', label: 'Round Robin' },
    { value: 'group_playoff', label: 'Group + Playoff' }
  ];

  const matchFormatOptions = [
    { value: '1v1', label: '1v1' },
    { value: '2v2', label: '2v2' },
    { value: '3v3', label: '3v3' },
    { value: '5v5', label: '5v5' },
    { value: 'solo', label: 'Solo' },
    { value: 'duo', label: 'Duo' },
    { value: 'squad', label: 'Squad' }
  ];

  const platformOptions = [
    { value: 'PC', label: 'PC' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Console', label: 'Console' },
    { value: 'Cross-platform', label: 'Cross-platform' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'registration', label: 'Registration Open' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Live' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading tournament...</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-gaming mb-4">Tournament not found</p>
        <Button onClick={() => navigate('/admin/tournaments')}>
          Back to Tournaments
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/tournaments')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tournaments</span>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">Edit Tournament</h1>
            <p className="text-muted-foreground font-gaming">
              Modify tournament settings and details
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-display font-bold">{tournament.title}</div>
              <Badge className="mt-2">{tournament.game_name || 'No game'}</Badge>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="font-display font-bold text-lg">{tournament.current_players}/{tournament.max_players}</div>
              <div className="text-sm text-muted-foreground">Players Registered</div>
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
          </div>
        </CardContent>
      </Card>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tournament Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., ArenaJo Championship 2024"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="game">Game *</Label>
                <Select value={formData.game_slug} onValueChange={(value) => handleInputChange('game_slug', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.slug} value={game.slug}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your tournament..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Rules & Regulations</Label>
              <Textarea
                id="rules"
                placeholder="List the rules and tournament format..."
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Format & Platform */}
        <Card>
          <CardHeader>
            <CardTitle>Format & Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format_type">Tournament Format</Label>
                <Select value={formData.format_type} onValueChange={(value) => handleInputChange('format_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="match_format">Match Format</Label>
                <Select value={formData.match_format} onValueChange={(value) => handleInputChange('match_format', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {matchFormatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Status & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_players">Max Players</Label>
                <Input
                  id="max_players"
                  type="number"
                  min="2"
                  max="10000"
                  placeholder="16"
                  value={formData.max_players}
                  onChange={(e) => handleInputChange('max_players', parseInt(e.target.value) || 16)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prize & Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Prize & Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_fee">Entry Fee (JOD)</Label>
                <Input
                  id="entry_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.entry_fee}
                  onChange={(e) => handleInputChange('entry_fee', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize_pool">Prize Pool (JOD)</Label>
                <Input
                  id="prize_pool"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.prize_pool}
                  onChange={(e) => handleInputChange('prize_pool', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                <Input
                  id="registration_deadline"
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/tournaments')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTournament;