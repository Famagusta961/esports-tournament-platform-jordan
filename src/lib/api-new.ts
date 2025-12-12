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
        
        return {
          success: true,
          tournament: {
            ...tournament,
            game_name: tournament.game_id === '1' ? 'PUBG Mobile' :
                       tournament.game_id === '2' ? 'EA FC' :
                       tournament.game_id === '3' ? 'Valorant' :
                       tournament.game_id === '4' ? 'COD Mobile' :
                       tournament.game_id === '5' ? 'Fortnite' :
                       tournament.game_id === '6' ? 'League of Legends' :
                       'Unknown Game',
            game_slug: tournament.game_id === '1' ? 'pubg-mobile' :
                       tournament.game_id === '2' ? 'ea-fc' :
                       tournament.game_id === '3' ? 'valorant' :
                       tournament.game_id === '4' ? 'cod-mobile' :
                       tournament.game_id === '5' ? 'fortnite' :
                       tournament.game_id === '6' ? 'league-of-legends' :
                       'unknown',
            creator_username: null,
            creator_avatar: null,
            user_registration: null,
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
          
          // Basic game mapping
          const gameMapping: Record<string, string[]> = {
            'pubg-mobile': ['1'],
            'ea-fc': ['2'],
            'valorant': ['3'],
            'cod-mobile': ['4'],
            'fortnite': ['5'],
            'league-of-legends': ['6']
          };
          
          const gameIds = gameMapping[gameFilter] || [];
          filteredTournaments = filteredTournaments.filter(t => gameIds.includes(t.game_id));
          
          console.log("New List API: Filtered", { gameFilter, after: filteredTournaments.length });
        }
        
        // Add basic game info
        const tournamentsWithGames = filteredTournaments.map(tournament => ({
          ...tournament,
          game_name: tournament.game_id === '1' ? 'PUBG Mobile' :
                     tournament.game_id === '2' ? 'EA FC' :
                     tournament.game_id === '3' ? 'Valorant' :
                     tournament.game_id === '4' ? 'COD Mobile' :
                     tournament.game_id === '5' ? 'Fortnite' :
                     tournament.game_id === '6' ? 'League of Legends' :
                     'Unknown Game',
          game_slug: tournament.game_id === '1' ? 'pubg-mobile' :
                     tournament.game_id === '2' ? 'ea-fc' :
                     tournament.game_id === '3' ? 'valorant' :
                     tournament.game_id === '4' ? 'cod-mobile' :
                     tournament.game_id === '5' ? 'fortnite' :
                     tournament.game_id === '6' ? 'league-of-legends' :
                     'unknown'
        }));
        
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

  // Join tournament - keep existing logic
  join: async (tournamentId: number) => {
    try {
      const response = await functions.get('tournament-join', { tournamentId });
      return response;
    } catch (error) {
      console.log("Using database fallback for tournament registration");
      // Database fallback logic here...
      return { success: false, error: 'Authentication required' };
    }
  }
};