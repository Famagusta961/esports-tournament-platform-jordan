import { useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const playerLeaderboard = [
  { rank: 1, change: 'up', name: 'ShadowHunter', avatar: 'S', points: 2850, wins: 156, matches: 200, winRate: 78, earnings: '3,500 JD' },
  { rank: 2, change: 'up', name: 'NightWolf_JO', avatar: 'N', points: 2720, wins: 142, matches: 190, winRate: 75, earnings: '2,800 JD' },
  { rank: 3, change: 'down', name: 'PhoenixRising', avatar: 'P', points: 2650, wins: 138, matches: 185, winRate: 75, earnings: '2,400 JD' },
  { rank: 4, change: 'same', name: 'DesertStorm', avatar: 'D', points: 2480, wins: 125, matches: 175, winRate: 71, earnings: '1,900 JD' },
  { rank: 5, change: 'up', name: 'CyberKnight', avatar: 'C', points: 2350, wins: 118, matches: 168, winRate: 70, earnings: '1,650 JD' },
  { rank: 6, change: 'down', name: 'ThunderBolt', avatar: 'T', points: 2280, wins: 112, matches: 162, winRate: 69, earnings: '1,400 JD' },
  { rank: 7, change: 'up', name: 'IronFist', avatar: 'I', points: 2150, wins: 105, matches: 155, winRate: 68, earnings: '1,200 JD' },
  { rank: 8, change: 'same', name: 'SilentAssassin', avatar: 'S', points: 2080, wins: 98, matches: 148, winRate: 66, earnings: '980 JD' },
  { rank: 9, change: 'down', name: 'BlazeMaster', avatar: 'B', points: 1950, wins: 92, matches: 142, winRate: 65, earnings: '850 JD' },
  { rank: 10, change: 'up', name: 'VenomStrike', avatar: 'V', points: 1880, wins: 88, matches: 138, winRate: 64, earnings: '720 JD' },
];

const teamLeaderboard = [
  { rank: 1, change: 'same', name: 'Jordan Esports', logo: 'JE', points: 8500, wins: 45, members: 12, tournaments: 28 },
  { rank: 2, change: 'up', name: 'Phoenix Gaming', logo: 'PG', points: 7800, wins: 42, members: 10, tournaments: 25 },
  { rank: 3, change: 'down', name: 'Desert Eagles', logo: 'DE', points: 7200, wins: 38, members: 8, tournaments: 22 },
  { rank: 4, change: 'up', name: 'Cyber Warriors', logo: 'CW', points: 6500, wins: 35, members: 8, tournaments: 20 },
  { rank: 5, change: 'same', name: 'Thunder Squad', logo: 'TS', points: 5900, wins: 32, members: 6, tournaments: 18 },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
  return <span className="font-display font-bold text-lg text-muted-foreground">#{rank}</span>;
};

const getChangeIcon = (change: string) => {
  if (change === 'up') return <ChevronUp className="w-4 h-4 text-success" />;
  if (change === 'down') return <ChevronDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const Leaderboard = () => {
  const [gameFilter, setGameFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground font-gaming text-lg">
              Top players and teams competing for glory
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border font-gaming">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="pubg">PUBG Mobile</SelectItem>
                <SelectItem value="eafc">EA FC 25</SelectItem>
                <SelectItem value="valorant">Valorant</SelectItem>
                <SelectItem value="cod">COD Mobile</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-card border-border font-gaming">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="season">This Season</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="players" className="space-y-6">
            <TabsList className="bg-card border border-border p-1 w-full sm:w-auto">
              <TabsTrigger value="players" className="font-gaming flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Players</span>
              </TabsTrigger>
              <TabsTrigger value="teams" className="font-gaming flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Teams</span>
              </TabsTrigger>
            </TabsList>

            {/* Players Leaderboard */}
            <TabsContent value="players">
              {/* Top 3 Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {playerLeaderboard.slice(0, 3).map((player, index) => (
                  <div 
                    key={player.rank}
                    className={`relative overflow-hidden rounded-2xl p-6 text-center ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 md:order-2 md:-mt-4' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/20 border border-gray-400/30 md:order-1' :
                      'bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-600/30 md:order-3'
                    } animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="mb-3">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className={`w-20 h-20 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      'bg-gradient-to-br from-amber-600 to-amber-700'
                    }`}>
                      <span className="font-display font-bold text-2xl text-white">{player.avatar}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-1">{player.name}</h3>
                    <p className={`font-display font-bold text-2xl ${
                      index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'
                    }`}>{player.points} pts</p>
                    <p className="text-sm text-muted-foreground font-gaming mt-2">
                      {player.wins} wins • {player.winRate}% WR
                    </p>
                  </div>
                ))}
              </div>

              {/* Full Leaderboard Table */}
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-gaming text-sm text-muted-foreground">Rank</th>
                        <th className="px-4 py-3 text-left font-gaming text-sm text-muted-foreground">Player</th>
                        <th className="px-4 py-3 text-center font-gaming text-sm text-muted-foreground">Points</th>
                        <th className="px-4 py-3 text-center font-gaming text-sm text-muted-foreground hidden sm:table-cell">Wins</th>
                        <th className="px-4 py-3 text-center font-gaming text-sm text-muted-foreground hidden md:table-cell">Win Rate</th>
                        <th className="px-4 py-3 text-right font-gaming text-sm text-muted-foreground">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {playerLeaderboard.map((player) => (
                        <tr key={player.rank} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              {getRankIcon(player.rank)}
                              {getChangeIcon(player.change)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <span className="font-display font-bold text-white">{player.avatar}</span>
                              </div>
                              <span className="font-gaming font-semibold">{player.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-display font-bold text-primary">{player.points}</span>
                          </td>
                          <td className="px-4 py-4 text-center hidden sm:table-cell">
                            <span className="font-gaming">{player.wins}</span>
                          </td>
                          <td className="px-4 py-4 text-center hidden md:table-cell">
                            <Badge variant="secondary" className="font-gaming">{player.winRate}%</Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-gaming text-success">{player.earnings}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Teams Leaderboard */}
            <TabsContent value="teams">
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-gaming text-sm text-muted-foreground">Rank</th>
                        <th className="px-4 py-3 text-left font-gaming text-sm text-muted-foreground">Team</th>
                        <th className="px-4 py-3 text-center font-gaming text-sm text-muted-foreground">Points</th>
                        <th className="px-4 py-3 text-center font-gaming text-sm text-muted-foreground hidden sm:table-cell">Wins</th>
                        <th className="px-4 py-3 text-center font-gaming text-sm text-muted-foreground hidden md:table-cell">Members</th>
                        <th className="px-4 py-3 text-right font-gaming text-sm text-muted-foreground">Tournaments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {teamLeaderboard.map((team) => (
                        <tr key={team.rank} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              {getRankIcon(team.rank)}
                              {getChangeIcon(team.change)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-purple-600 flex items-center justify-center">
                                <span className="font-display font-bold text-white text-xs">{team.logo}</span>
                              </div>
                              <span className="font-gaming font-semibold">{team.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-display font-bold text-secondary">{team.points}</span>
                          </td>
                          <td className="px-4 py-4 text-center hidden sm:table-cell">
                            <span className="font-gaming">{team.wins}</span>
                          </td>
                          <td className="px-4 py-4 text-center hidden md:table-cell">
                            <Badge variant="secondary" className="font-gaming">{team.members}</Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-gaming">{team.tournaments}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default Leaderboard;
