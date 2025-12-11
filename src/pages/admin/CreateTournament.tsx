import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Calendar, Users, Wallet } from 'lucide-react';
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

const CreateTournament = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
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
    registration_deadline: ''
  });

  useEffect(() => {
    loadGames();
    // Set default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    setFormData(prev => ({
      ...prev,
      start_date: tomorrow.toISOString().split('T')[0],
      registration_deadline: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setIsLoading(true);
    
    try {
      const result = await tournamentService.create(formData);
      
      if (result && result.success) {
        toast({
          title: "Tournament Created!",
          description: "Your tournament has been successfully created",
        });
        navigate('/admin/tournaments');
      } else {
        throw new Error(result?.error || 'Failed to create tournament');
      }
    } catch (error) {
      console.error('Create tournament error:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create tournament",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="font-display text-3xl font-bold">Create Tournament</h1>
          <p className="text-muted-foreground font-gaming">
            Set up a new esports competition
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Prize & Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Prize & Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Tournament Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-display font-bold">{formData.title || 'Untitled Tournament'}</div>
                <Badge className="mt-2">{games.find(g => g.slug === formData.game_slug)?.name || 'No game selected'}</Badge>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-success" />
                <div className="font-display font-bold text-lg">{formData.entry_fee} JD</div>
                <div className="text-sm text-muted-foreground">Entry Fee</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-warning" />
                <div className="font-display font-bold text-lg">{formData.prize_pool} JD</div>
                <div className="text-sm text-muted-foreground">Prize Pool</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-display font-bold text-lg">{formData.max_players}</div>
                <div className="text-sm text-muted-foreground">Max Players</div>
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Tournament'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;