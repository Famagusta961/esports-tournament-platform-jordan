import { Link } from 'react-router-dom';
import { Trophy, Users, Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const games = [
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    description: 'Battle Royale shooter where 100 players fight to be the last one standing.',
    color: 'from-yellow-500 to-orange-600',
    image: '/content/games/pubg-.jpg',
    activeTournaments: 8,
    totalPlayers: '5,200',
    platforms: ['Mobile'],
    formats: ['Solo', 'Duo', 'Squad'],
  },
  {
    id: 'ea-fc',
    name: 'EA FC 25',
    description: 'The world\'s most popular football simulation game.',
    color: 'from-green-500 to-emerald-600',
    image: '/content/games/EA FC 25.jpg',
    activeTournaments: 12,
    totalPlayers: '3,800',
    platforms: ['PS5', 'Xbox', 'PC'],
    formats: ['1v1', '2v2'],
  },
  {
    id: 'valorant',
    name: 'Valorant',
    description: 'Tactical 5v5 character-based shooter with unique agent abilities.',
    color: 'from-red-500 to-pink-600',
    image: '/content/games/valorant-listing-scaled.jpg',
    activeTournaments: 5,
    totalPlayers: '2,100',
    platforms: ['PC'],
    formats: ['5v5'],
  },
  {
    id: 'cod-mobile',
    name: 'COD Mobile',
    description: 'Fast-paced mobile FPS with multiple game modes including Battle Royale.',
    color: 'from-orange-500 to-red-600',
    image: '/content/games/COD.jpg',
    activeTournaments: 6,
    totalPlayers: '4,500',
    platforms: ['Mobile'],
    formats: ['Solo', 'Duo', 'Squad', '5v5'],
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    description: 'Build, battle, and survive in this popular Battle Royale game.',
    color: 'from-purple-500 to-blue-600',
    image: '/content/games/fneco-2025-keyart-thumb-1920x1080-de84aedabf4d.jpg',
    activeTournaments: 4,
    totalPlayers: '1,800',
    platforms: ['PC', 'Console', 'Mobile'],
    formats: ['Solo', 'Duo', 'Squad'],
  },
  {
    id: 'lol',
    name: 'League of Legends',
    description: 'Strategic 5v5 MOBA where teamwork leads to victory.',
    color: 'from-blue-500 to-cyan-600',
    image: '/content/games/league-of-legends-pc-game-cover.jpg',
    activeTournaments: 3,
    totalPlayers: '1,200',
    platforms: ['PC'],
    formats: ['5v5'],
  },
  {
    id: 'rocket-league',
    name: 'Rocket League',
    description: 'High-octane soccer with rocket-powered cars.',
    color: 'from-sky-500 to-blue-600',
    image: '/content/games/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-4c231557ef0a0626fbb97e0bd137d837.jpg',
    activeTournaments: 2,
    totalPlayers: '800',
    platforms: ['PC', 'Console'],
    formats: ['1v1', '2v2', '3v3'],
  },
  {
    id: 'tekken-8',
    name: 'Tekken 8',
    description: 'Premier 3D fighting game featuring intense combat.',
    color: 'from-red-600 to-rose-600',
    image: '/content/games/tekken-7-pc-game-steam-cover.jpg',
    activeTournaments: 3,
    totalPlayers: '950',
    platforms: ['PS5', 'Xbox', 'PC'],
    formats: ['1v1'],
  },
];

const Games = () => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-gradient">Game Categories</span>
            </h1>
            <p className="text-muted-foreground font-gaming text-lg max-w-2xl mx-auto">
              Choose your battlefield. We host tournaments for the most popular games in Jordan and the MENA region.
            </p>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <Link
                key={game.id}
                to={`/tournaments?game=${game.id}`}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Game Image or Gradient Header */}
                <div className={`h-32 bg-gradient-to-br ${game.color} relative overflow-hidden`}>
                  {game.image ? (
                    <>
                      <img 
                        src={`${game.image}?t=${Date.now()}`} 
                        alt={game.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display font-bold text-4xl text-white/90">
                          {game.name.split(' ')[0]}
                        </span>
                      </div>
                    </>
                  )}
                  {/* Active Tournaments Badge */}
                  <Badge className="absolute top-3 right-3 bg-black/50 text-white border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    {game.activeTournaments} Active
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-gaming line-clamp-2 mt-1">
                      {game.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-gaming">{game.totalPlayers}</span>
                    </div>
                    <div className="flex gap-1">
                      {game.platforms.slice(0, 2).map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                      {game.platforms.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{game.platforms.length - 2}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Formats */}
                  <div className="flex flex-wrap gap-1">
                    {game.formats.map((format) => (
                      <span key={format} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-gaming">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} blur-xl opacity-10`} />
                </div>
              </Link>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-4">
              <Gamepad2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-gaming text-sm text-muted-foreground">More games coming soon!</span>
            </div>
            <p className="text-muted-foreground font-gaming">
              Have a game you want to see? Let us know on our Discord!
            </p>
          </div>
        </div>
      </div>
  );
};

export default Games;
