import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const games = [
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    shortName: 'PUBGM',
    color: 'from-yellow-500 to-orange-600',
    activeTournaments: 8,
    players: '5.2K',
  },
  {
    id: 'ea-fc',
    name: 'EA FC 25',
    shortName: 'EA FC',
    color: 'from-green-500 to-emerald-600',
    activeTournaments: 12,
    players: '3.8K',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'VAL',
    color: 'from-red-500 to-pink-600',
    activeTournaments: 5,
    players: '2.1K',
  },
  {
    id: 'cod-mobile',
    name: 'COD Mobile',
    shortName: 'CODM',
    color: 'from-orange-500 to-red-600',
    activeTournaments: 6,
    players: '4.5K',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    shortName: 'FN',
    color: 'from-purple-500 to-blue-600',
    activeTournaments: 4,
    players: '1.8K',
  },
  {
    id: 'lol',
    name: 'League of Legends',
    shortName: 'LoL',
    color: 'from-blue-500 to-cyan-600',
    activeTournaments: 3,
    players: '1.2K',
  },
];

const GameCategories = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Popular <span className="text-gradient">Games</span>
            </h2>
            <p className="text-muted-foreground font-gaming">
              Choose your battlefield and start competing
            </p>
          </div>
          <Link 
            to="/games" 
            className="hidden sm:flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-gaming group"
          >
            <span>View All Games</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {games.map((game, index) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              {/* Content */}
              <div className="relative p-4 sm:p-6 text-center">
                {/* Game Icon Placeholder */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg`}>
                  <span className="font-display font-bold text-white text-lg sm:text-xl">
                    {game.shortName}
                  </span>
                </div>
                
                {/* Game Name */}
                <h3 className="font-gaming font-semibold text-sm sm:text-base mb-2 group-hover:text-primary transition-colors">
                  {game.name}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {game.activeTournaments} Active
                  </span>
                </div>
              </div>

              {/* Hover Border Glow */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${game.color} blur-xl opacity-20`} />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Link */}
        <Link 
          to="/games" 
          className="sm:hidden flex items-center justify-center space-x-2 mt-8 text-primary hover:text-primary/80 transition-colors font-gaming"
        >
          <span>View All Games</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
};

export default GameCategories;
