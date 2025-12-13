import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const games = [
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    shortName: 'PUBGM',
    color: 'from-yellow-500 to-orange-600',
    activeTournaments: 8,
    players: '5.2K',
    image: '/content/games/pubg-.jpg',
  },
  {
    id: 'ea-fc',
    name: 'EA FC 25',
    shortName: 'EA FC',
    color: 'from-green-500 to-emerald-600',
    activeTournaments: 12,
    players: '3.8K',
    image: '/content/games/EA FC 25.jpg',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'VAL',
    color: 'from-red-500 to-pink-600',
    activeTournaments: 5,
    players: '2.1K',
    image: '/content/games/valorant-listing-scaled.jpg',
  },
  {
    id: 'cod-mobile',
    name: 'COD Mobile',
    shortName: 'CODM',
    color: 'from-orange-500 to-red-600',
    activeTournaments: 6,
    players: '4.5K',
    image: '/content/games/COD.jpg',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    shortName: 'FN',
    color: 'from-purple-500 to-blue-600',
    activeTournaments: 4,
    players: '1.8K',
    image: '/content/games/fneco-2025-keyart-thumb-1920x1080-de84aedabf4d.jpg',
  },
  {
    id: 'lol',
    name: 'League of Legends',
    shortName: 'LoL',
    color: 'from-blue-500 to-cyan-600',
    activeTournaments: 3,
    players: '1.2K',
    image: '/content/games/league-of-legends-pc-game-cover.jpg',
  },
  {
    id: 'rocket-league',
    name: 'Rocket League',
    shortName: 'RL',
    color: 'from-sky-500 to-blue-600',
    activeTournaments: 2,
    players: '800',
    image: '/content/games/EGS_RocketLeague_PsyonixLLC_S1_2560x1440-4c231557ef0a0626fbb97e0bd137d837.jpg',
  },
  {
    id: 'tekken-8',
    name: 'Tekken 8',
    shortName: 'TK8',
    color: 'from-red-600 to-rose-600',
    activeTournaments: 3,
    players: '950',
    image: '/content/games/tekken-7-pc-game-steam-cover.jpg',
  },
];

const GameCategories = () => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const cards = container.querySelectorAll('[data-game-card]');
    if (cards[index]) {
      // Calculate exact scroll position to center the card within its container only
      const card = cards[index] as HTMLElement;
      const cardWidth = card.offsetWidth + 24; // card width + gap (reduced from 32 for 4 cards layout)
      const containerWidth = container.offsetWidth;
      const targetScrollLeft = (card.offsetLeft - (containerWidth / 2) + (card.offsetWidth / 2)) - 16; // -16 for container padding
      
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      });
      
      console.log('Carousel scrolling to index:', index, 'container scrollLeft:', targetScrollLeft);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(games.length - 1, currentIndex + 1);
    
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const checkScrollButtons = () => {
    setCanScrollLeft(currentIndex > 0);
    setCanScrollRight(currentIndex < games.length - 1);
  };

  useEffect(() => {
    // Initialize with first game centered - BUT only scroll the carousel, not the page
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (container) {
        // Use direct container scroll instead of scrollIntoView to avoid page scroll
        container.scrollLeft = 0;
        console.log('GameCategories initialized - carousel scrolled to start, not page');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    checkScrollButtons();
  }, [currentIndex]);

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

        {/* Horizontal Scroll Container */}
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-background hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-full p-2 shadow-lg hover:bg-background hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          )}

          {/* Games Horizontal Scroll */}
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide py-2 px-2 snap-x snap-mandatory"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth'
            }}
          >
            {games.map((game, index) => (
              <div
                key={game.id}
                data-game-card
                className="flex-none w-96 sm:w-80 md:w-88 lg:w-96 animate-slide-up snap-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link
                  to={`/tournaments?game=${game.id}`}
                  className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover-lift h-full"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  
                  {/* Content */}
                  <div className="relative p-10 text-center">
                    {/* Game Image */}
                    <div className="w-36 h-36 sm:w-32 sm:h-32 md:w-34 md:h-34 lg:w-36 lg:h-36 mx-auto mb-10 rounded-xl overflow-hidden bg-muted flex items-center justify-center shadow-lg">
                      {game.image ? (
                        <img 
                          src={game.image} 
                          alt={game.name}
                          className="w-full h-full object-cover"
                          style={{ width: '100%', height: '100%' }}
                        />
                      ) : (
                        <ImageIcon className="w-16 h-16 sm:w-14 sm:h-14 md:w-15 md:h-15 lg:w-16 lg:h-16 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Game Name */}
                    <h3 className="font-gaming font-semibold text-2xl md:text-xl lg:text-2xl xl:text-3xl mb-5 group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-center space-x-2 text-xl md:text-lg lg:text-xl text-muted-foreground">
                      <span className="px-6 py-3 rounded-full bg-primary/10 text-primary font-medium text-lg md:text-base lg:text-lg">
                        {game.activeTournaments} Active
                      </span>
                    </div>
                  </div>

                  {/* Hover Border Glow */}
                  <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${game.color} blur-xl opacity-20`} />
                  </div>
                </Link>
              </div>
            ))}
          </div>
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