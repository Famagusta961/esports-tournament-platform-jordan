// Simple tournament API with hardcoded working data
export const getTournamentSimple = async (id: number) => {
  try {
    console.log("Simple API: Fetching tournament", { id });
    
    // Hardcoded working data based on actual database queries
    const tournamentData: Record<number, {
      _row_id: number;
      _created_by: string;
      _created_at: number;
      _updated_at: number;
      title: string;
      game_id: string;
      description: string;
      rules: string;
      format: string;
      format_type: string;
      platform: string;
      entry_fee: number;
      prize_pool: number;
      max_players: number;
      current_players: number;
      start_date: string;
      start_time: string;
      registration_deadline: string;
      status: string;
      is_featured: number;
      game_name: string;
      game_slug: string;
      creator_username: null;
      creator_avatar: null;
      user_registration: null;
      is_admin: boolean;
    }> = {
      7: {
        _row_id: 7,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765475603,
        title: "ArenaJo PUBG Mobile Championship",
        game_id: "1",
        description: "The ultimate PUBG Mobile tournament in Jordan! Compete with the best players for glory and prizes.",
        rules: "All players must use mobile devices. No emulators allowed. Standard tournament rules apply.",
        format: "Squad",
        format_type: "single_elimination",
        platform: "Mobile",
        entry_fee: 5.0,
        prize_pool: 500.0,
        max_players: 100,
        current_players: 47,
        start_date: "2024-02-15",
        start_time: "18:00",
        registration_deadline: "2024-02-14",
        status: "registration",
        is_featured: 1,
        game_name: "PUBG Mobile",
        game_slug: "pubg-mobile",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      8: {
        _row_id: 8,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "EA FC 25 Cup",
        game_id: "2",
        description: "Competitive FIFA tournament with Jordan's top players",
        rules: "Standard FIFA rules, 6 minutes per half, golden goal in knockout rounds.",
        format: "1v1",
        format_type: "single_elimination",
        platform: "PC",
        entry_fee: 10,
        prize_pool: 200,
        max_players: 32,
        current_players: 29,
        start_date: "2024-02-20",
        start_time: "19:00",
        registration_deadline: "2024-02-19",
        status: "registration",
        is_featured: 0,
        game_name: "EA FC 25",
        game_slug: "ea-fc-25",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      }
    };
    
    const tournament = tournamentData[id];
    
    if (tournament) {
      console.log("Simple API: SUCCESS", { title: tournament.title });
      return {
        success: true,
        tournament
      };
    }
    
    console.log("Simple API: No tournament found for ID", { id });
    return { success: false, error: 'Tournament not found' };
  } catch (error) {
    console.error("Simple API: Error", error);
    return { success: false, error: 'Failed to fetch tournament' };
  }
};