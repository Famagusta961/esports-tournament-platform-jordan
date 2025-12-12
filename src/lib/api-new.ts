// NEW WORKING API - Simple and reliable

import db from '@/lib/shared/kliv-database.js';
import auth from '@/lib/shared/kliv-auth.js';
import functions from '@/lib/shared/kliv-functions.js';

// Error handling
const handleApiError = (error: unknown, message: string) => {
  console.error(message, error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  throw new Error(`${message}: ${errorMessage}`);
};

// Games service
export const gameService = {
  list: async () => {
    try {
      console.log("GameService: Loading games...");
      
      // Try direct database fetch first
      const response = await fetch('/api/v2/database/games?is_active=eq.1&order=name.asc');
      
      console.log("GameService: Raw response", { status: response.status });
      
      if (response.ok) {
        const data = await response.json();
        console.log("GameService: Games loaded", { count: data?.length, data });
        
        if (Array.isArray(data)) {
          return data;
        }
      }
      
      // Fallback to Kliv database query
      const { data } = await db.query('games', { is_active: 'eq.1', order: 'name.asc' });
      console.log("GameService: Fallback query result", { count: data?.length });
      return data || [];
    } catch (error) {
      console.error('Failed to fetch games:', error);
      return [];
    }
  }
};

// Simple tournament APIs that actually work
export const tournamentService = {
  // Get tournament by ID - working version
  getById: async (id: number) => {
    try {
      console.log("New API: Fetching tournament", { id });
      
      const response = await fetch(`/api/v2/database/tournaments?_row_id=eq.${id}`);
      const data = await response.json();
      
      console.log("New API: Raw response", { status: response.status, data });
      
      if (Array.isArray(data) && data.length > 0) {
        const tournament = data[0];
        console.log("New API: SUCCESS", { title: tournament.title });
        
        // Game mapping for both slug and numeric formats
        const gameMapping = {
          '1': { name: 'PUBG Mobile', slug: 'pubg-mobile' },
          '2': { name: 'EA FC 25', slug: 'ea-fc' },
          '3': { name: 'Valorant', slug: 'valorant' },
          '4': { name: 'COD Mobile', slug: 'cod-mobile' },
          '5': { name: 'Fortnite', slug: 'fortnite' },
          '6': { name: 'League of Legends', slug: 'lol' },
          'pubg-mobile': { name: 'PUBG Mobile', slug: 'pubg-mobile' },
          'ea-fc': { name: 'EA FC 25', slug: 'ea-fc' },
          'valorant': { name: 'Valorant', slug: 'valorant' },
          'cod-mobile': { name: 'COD Mobile', slug: 'cod-mobile' },
          'fortnite': { name: 'Fortnite', slug: 'fortnite' },
          'lol': { name: 'League of Legends', slug: 'lol' }
        };
        
        const gameInfo = gameMapping[tournament.game_id] || { name: 'Unknown Game', slug: 'unknown' };
        
        // Check if user is registered for this tournament
        let userRegistration = null;
        try {
          const user = await auth.getUser();
          if (user) {
            const registrationData = await db.query('tournament_players', {
              tournament_id: `eq.${id}`,
              username: `eq.${user.username}`,
              limit: 1
            });
            
            if (registrationData.data && registrationData.data.length > 0) {
              userRegistration = {
                registered: true,
                joined_at: registrationData.data[0].joined_at,
                payment_status: registrationData.data[0].payment_status,
                team_id: registrationData.data[0].team_id
              };
            } else {
              userRegistration = {
                registered: false
              };
            }
          }
        } catch (error) {
          console.log("Could not check user registration status:", error);
          userRegistration = { registered: false };
        }
        
        return {
          success: true,
          tournament: {
            ...tournament,
            game_name: gameInfo.name,
            game_slug: gameInfo.slug,
            creator_username: null,
            creator_avatar: null,
            user_registration: userRegistration,
            is_admin: false
          }
        };
      }
      
      return { success: false, error: 'Tournament not found' };
    } catch (error) {
      console.error("New API: Error", error);
      return { success: false, error: 'Failed to fetch tournament' };
    }
  },

  // List tournaments with game filtering - working version
  list: async (params: Record<string, string | number> = {}) => {
    try {
      console.log("New List API: Fetching tournaments", { params });
      
      // Build database query parameters
      const dbParams = new URLSearchParams();
      
      if (params.status && params.status !== 'all') {
        dbParams.append('status', `eq.${params.status}`);
      } else {
        dbParams.append('status', 'in.(registration,upcoming,live,completed)');
      }
      
      dbParams.append('order', '_created_at.desc');
      if (params.limit) dbParams.append('limit', String(params.limit));
      if (params.offset) dbParams.append('offset', String(params.offset));
      
      const response = await fetch(`/api/v2/database/tournaments?${dbParams.toString()}`);
      const data = await response.json();
      
      console.log("New List API: Raw response", { status: response.status, count: data?.length });
      
      if (Array.isArray(data)) {
        // Apply game filter after getting tournaments
        let filteredTournaments = data;
        const gameFilter = params.game;
        
        if (gameFilter && gameFilter !== 'all') {
          console.log("New List API: Filtering by game", { gameFilter, before: filteredTournaments.length });
          
          // Comprehensive game mapping for both slug and numeric formats
          const gameMapping: Record<string, string[]> = {
            'pubg-mobile': ['1', 'pubg-mobile'],
            'ea-fc': ['2', 'ea-fc'],
            'valorant': ['3', 'valorant'],
            'cod-mobile': ['4', 'cod-mobile'],
            'fortnite': ['5', 'fortnite'],
            'lol': ['6', 'lol']
          };
          
          const gameIds = gameMapping[gameFilter] || [];
          filteredTournaments = filteredTournaments.filter(t => gameIds.includes(t.game_id));
          
          console.log("New List API: Filtered", { gameFilter, after: filteredTournaments.length });
        }
        
        // Add basic game info and user registration status
        const tournamentsWithGames = await Promise.all(
          filteredTournaments.map(async (tournament) => {
            const gameId = tournament.game_id;
            
            // Mapping for both slug and numeric formats
            const gameInfo = {
              '1': { name: 'PUBG Mobile', slug: 'pubg-mobile' },
              '2': { name: 'EA FC 25', slug: 'ea-fc' },
              '3': { name: 'Valorant', slug: 'valorant' },
              '4': { name: 'COD Mobile', slug: 'cod-mobile' },
              '5': { name: 'Fortnite', slug: 'fortnite' },
              '6': { name: 'League of Legends', slug: 'lol' },
              'pubg-mobile': { name: 'PUBG Mobile', slug: 'pubg-mobile' },
              'ea-fc': { name: 'EA FC 25', slug: 'ea-fc' },
              'valorant': { name: 'Valorant', slug: 'valorant' },
              'cod-mobile': { name: 'COD Mobile', slug: 'cod-mobile' },
              'fortnite': { name: 'Fortnite', slug: 'fortnite' },
              'lol': { name: 'League of Legends', slug: 'lol' }
            }[gameId] || { name: 'Unknown Game', slug: 'unknown' };
            
            // Check if user is registered for this tournament
            let userRegistered = false;
            try {
              const user = await auth.getUser();
              if (user) {
                const registrationData = await db.query('tournament_players', {
                  tournament_id: `eq.${tournament._row_id}`,
                  username: `eq.${user.username}`,
                  limit: 1
                });
                
                userRegistered = registrationData.data && registrationData.data.length > 0;
              }
            } catch (error) {
              console.log(`Could not check registration for tournament ${tournament._row_id}:`, error);
              userRegistered = false;
            }
            
            return {
              ...tournament,
              game_name: gameInfo.name,
              game_slug: gameInfo.slug,
              user_registered: userRegistered
            };
          })
        );
        
        console.log("New List API: SUCCESS", { count: tournamentsWithGames.length });
        
        return {
          success: true,
          tournaments: tournamentsWithGames,
          pagination: {
            total: tournamentsWithGames.length,
            limit: params.limit || 20,
            offset: params.offset || 0,
            hasMore: tournamentsWithGames.length === (params.limit || 20)
          }
        };
      }
      
      return { success: true, tournaments: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } };
    } catch (error) {
      console.error("New List API: Error", error);
      return { success: false, error: 'Failed to fetch tournaments', tournaments: [] };
    }
  },

  // Join tournament - using POST for edge function
  join: async (tournamentId: number) => {
    try {
      console.log("TournamentJoin: Calling edge function", { tournamentId });
      
      const response = await functions.post('tournament-join', { 
        tournament_id: tournamentId 
      });
      
      console.log("TournamentJoin: Response", { response });
      return response;
    } catch (error) {
      console.error("TournamentJoin: Error calling edge function", error);
      return { success: false, error: 'Authentication required' };
    }
  },

  // Unregister from tournament - using POST for edge function
  unregister: async (tournamentId: number) => {
    try {
      console.log("TournamentUnregister: Calling edge function", { tournamentId });
      
      const response = await functions.post('tournament-unregister', { 
        tournament_id: tournamentId 
      });
      
      console.log("TournamentUnregister: Response", { response });
      return response;
    } catch (error) {
      console.error("TournamentUnregister: Error calling edge function", error);
      return { success: false, error: 'Failed to unregister from tournament' };
    }
  }
};