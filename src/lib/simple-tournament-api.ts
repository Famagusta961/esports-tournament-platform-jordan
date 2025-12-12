// Simple tournament API test
export const getTournamentSimple = async (id: number) => {
  try {
    console.log("Simple API: Fetching tournament", { id });
    
    const response = await fetch(`/api/v2/database/tournaments?_row_id=eq.${id}`);
    const data = await response.json();
    
    console.log("Simple API: Raw response", { status: response.status, data });
    
    if (Array.isArray(data) && data.length > 0) {
      const tournament = data[0];
      console.log("Simple API: SUCCESS", { title: tournament.title });
      
      return {
        success: true,
        tournament: {
          ...tournament,
          game_name: tournament.game_id === '1' ? 'PUBG Mobile' : 'Unknown Game',
          game_slug: tournament.game_id === '1' ? 'pubg-mobile' : 'unknown',
          creator_username: null,
          creator_avatar: null,
          user_registration: null,
          is_admin: false
        }
      };
    }
    
    return { success: false, error: 'Tournament not found' };
  } catch (error) {
    console.error("Simple API: Error", error);
    return { success: false, error: 'Failed to fetch tournament' };
  }
};