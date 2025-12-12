// Simple tournament list API with game filtering
export const getTournamentsSimple = async (params: Record<string, string | number> = {}) => {
  try {
    console.log("Simple List API: Fetching tournaments", { params });
    
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
    
    console.log("Simple List API: Raw response", { status: response.status, count: data?.length });
    
    if (Array.isArray(data)) {
      // Apply game filter after getting tournaments
      let filteredTournaments = data;
      const gameFilter = params.game;
      
      if (gameFilter && gameFilter !== 'all') {
        console.log("Simple List API: Filtering by game", { gameFilter, before: filteredTournaments.length });
        
        // Basic game mapping - can be enhanced later
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
        
        console.log("Simple List API: Filtered", { gameFilter, after: filteredTournaments.length });
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
      
      console.log("Simple List API: SUCCESS", { count: tournamentsWithGames.length });
      
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
    console.error("Simple List API: Error", error);
    return { success: false, error: 'Failed to fetch tournaments', tournaments: [] };
  }
};