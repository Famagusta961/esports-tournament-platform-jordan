import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Crown, UserX, Shield, Settings, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import auth from '@/lib/shared/kliv-auth.js';

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
  _row_id: number;
  team_id: number;
  user_id: string;
  username: string;
  role: 'captain' | 'member' | 'co_captain';
  joined_at: number;
  status: string;
};

const TeamManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState<{ username: string; id: string; email: string } | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    tag: '',
    description: '',
    game: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadUser();
    loadTeams();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await auth.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - replace with real API calls
      const mockTeams: Team[] = [
        {
          _row_id: 1,
          name: 'Jordan Elite',
          tag: 'JDE',
          description: 'Top esports team from Jordan',
          captain_id: '1',
          captain_username: 'captain_jo',
          logo_url: '',
          created_at: Date.now() / 1000 - 86400 * 30,
          member_count: 5,
          status: 'active',
          game_name: 'Valorant'
        },
        {
          _row_id: 2,
          name: 'Arena Warriors',
          tag: 'AWR',
          description: 'Competitive gaming squad',
          captain_id: '2',
          captain_username: 'warrior_123',
          logo_url: '',
          created_at: Date.now() / 1000 - 86400 * 15,
          member_count: 3,
          status: 'active',
          game_name: 'PUBG Mobile'
        }
      ];

      // Mock user teams
      const mockMyTeams: Team[] = [
        {
          _row_id: 3,
          name: 'My Gaming Squad',
          tag: 'MGS',
          description: 'My personal team',
          captain_id: user?.id || '3',
          captain_username: user?.username || 'my_username',
          logo_url: '',
          created_at: Date.now() / 1000 - 86400 * 7,
          member_count: 2,
          status: 'active',
          game_name: 'FIFA'
        }
      ];

      setTeams(mockTeams);
      setMyTeams(mockMyTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: number) => {
    try {
      // Simulate API call - replace with real API call
      const mockMembers: TeamMember[] = [
        {
          _row_id: 1,
          team_id: teamId,
          user_id: '1',
          username: 'captain_jo',
          role: 'captain',
          joined_at: Date.now() / 1000 - 86400 * 30,
          status: 'active'
        },
        {
          _row_id: 2,
          team_id: teamId,
          user_id: '2',
          username: 'player2',
          role: 'member',
          joined_at: Date.now() / 1000 - 86400 * 25,
          status: 'active'
        },
        {
          _row_id: 3,
          team_id: teamId,
          user_id: '3',
          username: 'player3',
          role: 'member',
          joined_at: Date.now() / 1000 - 86400 * 20,
          status: 'active'
        }
      ];

      setTeamMembers(mockMembers);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a team",
        variant: "destructive"
      });
      return;
    }

    if (!createFormData.name || !createFormData.tag) {
      toast({
        title: "Validation Error",
        description: "Please fill in team name and tag",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate API call - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Team Created!",
        description: `${createFormData.name} has been successfully created`,
      });
      
      setShowCreateForm(false);
      setCreateFormData({ name: '', tag: '', description: '', game: '' });
      loadTeams();
    } catch (error) {
      console.error('Create team error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create team",
        variant: "destructive"
      });
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !selectedTeam) {
      toast({
        title: "Validation Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate API call - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invitation Sent!",
        description: `Invitation has been sent to ${inviteEmail}`,
      });
      
      setInviteEmail('');
    } catch (error) {
      console.error('Invite error:', error);
      toast({
        title: "Invitation Failed",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: number, username: string) => {
    if (!confirm(`Are you sure you want to remove ${username} from the team?`)) {
      return;
    }

    try {
      // Simulate API call - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Member Removed",
        description: `${username} has been removed from the team`,
      });
      
      loadTeamMembers(selectedTeam._row_id);
    } catch (error) {
      console.error('Remove member error:', error);
      toast({
        title: "Removal Failed",
        description: "Failed to remove member",
        variant: "destructive"
      });
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

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading teams...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">Team Management</h1>
              <p className="text-muted-foreground font-gaming">
                Create and manage your esports teams
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 font-gaming"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>

          {/* My Teams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Teams Section */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                My Teams
              </h2>
              
              {myTeams.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">No Teams Yet</h3>
                    <p className="text-muted-foreground font-gaming mb-4">
                      Create your first team to start competing together
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      Create Your First Team
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myTeams.map((team) => (
                    <Card key={team._row_id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={team.logo_url} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {team.tag || team.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-display font-semibold">{team.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>[{team.tag}]</span>
                                <span>•</span>
                                <span>{team.member_count} members</span>
                                <span>•</span>
                                <span>{team.game_name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Captain</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedTeam(team);
                                  loadTeamMembers(team._row_id);
                                }}>
                                  <Users className="mr-2 h-4 w-4" />
                                  Manage Team
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/teams/${team._row_id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Team Page
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {/* Edit team */}}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* All Teams Section */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Browse Teams
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {teams.map((team) => (
                  <Card key={team._row_id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={team.logo_url} />
                            <AvatarFallback>
                              {team.tag || team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{team.name}</h4>
                            <div className="text-sm text-muted-foreground">
                              [{team.tag}] • {team.member_count} members • {team.game_name}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Team Management Modal */}
          {selectedTeam && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Manage Team: {selectedTeam.name}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTeam(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Info */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Captain:</span>
                      <div className="font-medium">{selectedTeam.captain_username}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Members:</span>
                      <div className="font-medium">{selectedTeam.member_count}/10</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <div className="font-medium">{formatDate(selectedTeam.created_at)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Game:</span>
                      <div className="font-medium">{selectedTeam.game_name}</div>
                    </div>
                  </div>
                </div>

                {/* Invite Member */}
                <div className="space-y-2">
                  <Label>Invite New Member</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      type="email"
                    />
                    <Button onClick={handleInviteMember}>
                      Send Invite
                    </Button>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div key={member._row_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {member.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.username}</div>
                            <div className="text-xs text-muted-foreground">
                              Joined {formatDate(member.joined_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(member.role)}
                          {member.role !== 'captain' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member._row_id, member.username)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Team Modal */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New Team</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team_name">Team Name *</Label>
                      <Input
                        id="team_name"
                        placeholder="Enter team name"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="team_tag">Team Tag *</Label>
                      <Input
                        id="team_tag"
                        placeholder="3-4 letter tag"
                        maxLength={4}
                        value={createFormData.tag}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="team_description">Description</Label>
                    <Textarea
                      id="team_description"
                      placeholder="Describe your team..."
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90">
                      Create Team
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamManagement;