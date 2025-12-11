import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Trophy, 
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { tournamentService, gameService } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminTournaments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  game_name?: string;
  game_slug?: string;
};

type Game = {
  _row_id: number;
  slug: string;
  name: string;
  is_active: number;
};

// Fetch tournaments with React Query
  const { data: tournamentsData, isLoading, error } = useQuery({
    queryKey: ['admin-tournaments', statusFilter, gameFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (gameFilter !== 'all') params.game = gameFilter;
      return await tournamentService.list(params);
    }
  });

  // Fetch games for filter
  const { data: games } = useQuery({
    queryKey: ['games'],
    queryFn: gameService.list
  });

  const tournaments = tournamentsData?.tournaments || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
      registration: { label: 'Registration', className: 'bg-success/20 text-success border-success/30' },
      upcoming: { label: 'Upcoming', className: 'bg-warning/20 text-warning border-warning/30' },
      ongoing: { label: 'Live', className: 'bg-destructive/20 text-destructive border-destructive/30 animate-pulse' },
      completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
      cancelled: { label: 'Cancelled', className: 'bg-destructive/20 text-destructive border-destructive/30' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || 'N/A';
  };

  const filteredTournaments = tournaments.filter((tournament: Tournament) => {
    if (searchQuery && !tournament.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-gaming mb-4">Failed to load tournaments</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-tournaments'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Tournaments Management</h1>
          <p className="text-muted-foreground font-gaming">
            Create and manage esports tournaments
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 font-gaming"
          onClick={() => navigate('/admin/tournaments/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-gaming flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {games?.map((game: Game) => (
                  <SelectItem key={game.slug} value={game.slug}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tournaments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-gaming flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Tournaments ({filteredTournaments.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading tournaments...</span>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Tournaments Found</h3>
              <p className="text-muted-foreground font-gaming mb-4">
                {searchQuery || statusFilter !== 'all' || gameFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first tournament to get started'}
              </p>
              <Button 
                onClick={() => navigate('/admin/tournaments/create')}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entry Fee</TableHead>
                    <TableHead>Prize Pool</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTournaments.map((tournament: Tournament) => (
                    <TableRow key={tournament._row_id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium font-gaming">{tournament.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {tournament.format_type || 'Single elimination'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tournament.game_name || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tournament.status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-display font-bold text-primary">
                          {tournament.entry_fee} JD
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-display font-bold text-success">
                          {tournament.prize_pool || 0} JD
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {tournament.current_players}/{tournament.max_players}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ 
                              width: `${Math.min((tournament.current_players / tournament.max_players) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{formatDate(tournament.start_date)}</div>
                          <div className="text-muted-foreground">{formatTime(tournament.start_time)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/tournaments/${tournament._row_id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Public Page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/tournaments/edit/${tournament._row_id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Tournament
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                toast({
                                  title: "Coming Soon",
                                  description: "Delete functionality will be added in the next update",
                                });
                              }}
                            >
                              Delete Tournament
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTournaments;