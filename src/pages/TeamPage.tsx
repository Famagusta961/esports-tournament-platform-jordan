import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Shield, Calendar, Crown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import auth from '@/lib/shared/kliv-auth.js';
import { teamService } from '@/lib/api';

type Team = {
  _row_id: number;
  name: string;
  tag: string;
  description?: string;
  captain_id: string;
  captain_username: string;
  logo_url?: string;
  created_at: number;
  member_count: number;
  status: string;
  game_name?: string;
};

type TeamMember = {
  user_uuid: string;
  role: 'captain' | 'member' | 'co_captain';
  joined_at: number;
  username?: string;
};

const TeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [user, setUser] = useState<{ username: string; id: string; email: string } | null>(null);

  useEffect(() => {
    console.log('TeamPage v2: teamId param', id);
    if (id) {
      console.log('TeamPage: useEffect triggered with teamId:', id);
      loadTeamData(parseInt(id));
    } else {
      console.log('TeamPage: useEffect triggered but no teamId found');
      setIsLoading(false);
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const currentUser = await auth.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  // Load user immediately
  useEffect(() => {
    loadUser();
  }, []);

  const loadTeamData = async (id: number) => {
    console.log('TeamPage.loadTeamData: Starting to load team', id);
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error('TeamPage.loadTeamData: Timeout reached - failed to load team');
      toast({
        title: "Error", 
        description: "Failed to load team - request timeout",
        variant: "destructive"
      });
      setIsLoading(false);
      setTeam(null);
      setMembers([]);
    }, 10000); // 10 second timeout
    
    setIsLoading(true);
    try {
      console.log('TeamPage.loadTeamData: Loading team', id);
      console.log('TeamPage.loadTeamData: Calling teamService.getTeamById with payload:', { action: 'get_team_by_id', team_id: id });
      console.log("TeamPage: calling getTeamById with", id);
      
      const result = await teamService.getTeamById(id);
      
      clearTimeout(timeout);
      console.log('TeamPage.loadTeamData: API result', result);
      
      if (result && result.team) {
        console.log('TeamPage.loadTeamData: Team loaded successfully', result.team.name);
        // Ensure required fields have defaults to prevent undefined errors
        const safeTeam = {
          ...result.team,
          name: result.team.name || 'Unknown Team',
          tag: result.team.tag || '',
          captain_username: result.team.captain_username || 'Unknown Captain',
          member_count: result.team.member_count || 0,
          created_at: result.team.created_at || Date.now() / 1000,
          game_name: result.team.game_name || 'Unknown Game',
          description: result.team.description || ''
        };
        setTeam(safeTeam);
        setMembers(result.members || []);
      } else {
        console.log('TeamPage.loadTeamData: No team data found in result');
        throw new Error('Team data not found');
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error('TeamPage.loadTeamData: Failed to load team data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load team data",
        variant: "destructive"
      });
      setTeam(null);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      captain: { label: 'Captain', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      co_captain: { label: 'Co-Captain', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      member: { label: 'Member', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleJoinTeam = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Team joining requests will be available soon",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading team...</span>
        </div>
      </Layout>
    );
  }

  if (!team) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
            <Button onClick={() => navigate('/teams')}>
              Back to Teams
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/teams')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teams
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={team.logo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {team.tag || (team.name?.substring(0, 2).toUpperCase() || 'T')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-display text-3xl font-bold">{team.name}</h1>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    {team.tag && (
                      <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                        [{team.tag}]
                      </span>
                    )}
                    <span>•</span>
                    <span>{team.game_name || 'Unknown Game'}</span>
                    <span>•</span>
                    <span>{members.length} members</span>
                  </div>
                </div>
              </div>
            </div>
            
            {user && user.id && team.captain_id && user.id !== team.captain_id && (
              <Button 
                onClick={handleJoinTeam}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 font-gaming"
              >
                Request to Join
              </Button>
            )}
          </div>

          {/* Team Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Captain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {(team.captain_username?.substring(0, 2).toUpperCase() || 'CA')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{team.captain_username}</div>
                    <div className="text-sm text-muted-foreground">Team Leader</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Team Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {members.length}/10
                </div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {formatDate(team.created_at)}
                </div>
                <div className="text-sm text-muted-foreground">Established</div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {team.description && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {team.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No members found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div key={member.user_uuid} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {(member.username?.substring(0, 2).toUpperCase() || member.user_uuid?.substring(0, 6).toUpperCase() || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.username || 'Team Member'}</div>
                          <div className="text-xs text-muted-foreground">
                            {(member.user_uuid?.substring(0, 8) || 'UUID')}... • Joined {formatDate(member.joined_at)}
                          </div>
                        </div>
                      </div>
                      {getRoleBadge(member.role)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Team Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Tournaments</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">0</div>
                  <div className="text-sm text-muted-foreground">Losses</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">0%</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TeamPage;