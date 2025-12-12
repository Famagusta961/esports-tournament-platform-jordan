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
      1: {
        _row_id: 1,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "PUBG Mobile Championship",
        game_id: "pubg-mobile",
        description: "The ultimate PUBG Mobile tournament in Jordan! Battle royale action with the best teams.",
        rules: "Standard battle royale rules. No cheating, team work essential. Match format: Erangel, 3rd person perspective.",
        format: "Squad",
        format_type: "single_elimination",
        platform: "Mobile",
        entry_fee: 15,
        prize_pool: 1000,
        max_players: 64,
        current_players: 48,
        start_date: "2024-02-10",
        start_time: "16:00",
        registration_deadline: "2024-02-09",
        status: "registration",
        is_featured: 1,
        game_name: "PUBG Mobile",
        game_slug: "pubg-mobile",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      2: {
        _row_id: 2,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "EA FC Weekly Cup",
        game_id: "ea-fc",
        description: "Weekly FIFA tournament for Jordan's best players. Show off your skills and win prizes!",
        rules: "6 minutes per half, extra time and penalties for knockout rounds. No custom formations.",
        format: "1v1",
        format_type: "single_elimination",
        platform: "PC/Console",
        entry_fee: 8,
        prize_pool: 400,
        max_players: 32,
        current_players: 24,
        start_date: "2024-02-11",
        start_time: "19:00",
        registration_deadline: "2024-02-10",
        status: "registration",
        is_featured: 0,
        game_name: "EA FC 25",
        game_slug: "ea-fc",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      3: {
        _row_id: 3,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "Valorant Showdown",
        game_id: "valorant",
        description: "Tactical 5v5 FPS tournament. Strategy, aim, and teamwork will decide the winner!",
        rules: "Standard tournament rules. Best of 1 for group stage, Best of 3 for playoffs. All maps available.",
        format: "5v5",
        format_type: "single_elimination",
        platform: "PC",
        entry_fee: 20,
        prize_pool: 1500,
        max_players: 40,
        current_players: 31,
        start_date: "2024-02-12",
        start_time: "18:00",
        registration_deadline: "2024-02-11",
        status: "registration",
        is_featured: 1,
        game_name: "Valorant",
        game_slug: "valorant",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      4: {
        _row_id: 4,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "COD Mobile Battle Royale",
        game_id: "cod-mobile",
        description: "Intense battle royale action in Call of Duty Mobile. Solo and duo categories available.",
        rules: "Standard Battle Royale rules. No third-party software. Mobile devices only.",
        format: "Solo/Duo",
        format_type: "single_elimination",
        platform: "Mobile",
        entry_fee: 5,
        prize_pool: 250,
        max_players: 100,
        current_players: 73,
        start_date: "2024-02-13",
        start_time: "17:00",
        registration_deadline: "2024-02-12",
        status: "registration",
        is_featured: 0,
        game_name: "COD Mobile",
        game_slug: "cod-mobile",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      5: {
        _row_id: 5,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "Fortnite Solo Cup",
        game_id: "fortnite",
        description: "Build, battle, and become the last one standing! Fortnite solo tournament with prizes.",
        rules: "Solo mode only. No teaming. Standard Arena settings. Creative mode for finals.",
        format: "Solo",
        format_type: "single_elimination",
        platform: "All Platforms",
        entry_fee: 10,
        prize_pool: 600,
        max_players: 80,
        current_players: 52,
        start_date: "2024-02-14",
        start_time: "16:00",
        registration_deadline: "2024-02-13",
        status: "registration",
        is_featured: 0,
        game_name: "Fortnite",
        game_slug: "fortnite",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      6: {
        _row_id: 6,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "League of Legends 5v5",
        game_id: "lol",
        description: "Classic 5v5 MOBA tournament. Summoner's Rift, draft pick mode.",
        rules: "Tournament draft mode. No exploits or bugs. 5-man teams required.",
        format: "5v5",
        format_type: "single_elimination",
        platform: "PC",
        entry_fee: 25,
        prize_pool: 2000,
        max_players: 50,
        current_players: 35,
        start_date: "2024-02-16",
        start_time: "15:00",
        registration_deadline: "2024-02-15",
        status: "upcoming",
        is_featured: 1,
        game_name: "League of Legends",
        game_slug: "lol",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
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
      },
      9: {
        _row_id: 9,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "Valorant Masters Tournament",
        game_id: "3",
        description: "Advanced Valorant tournament for experienced players. High-level competition guaranteed.",
        rules: "Professional tournament rules. Anti-cheat enabled. VOD reviews for disputes.",
        format: "5v5",
        format_type: "single_elimination",
        platform: "PC",
        entry_fee: 30,
        prize_pool: 2500,
        max_players: 32,
        current_players: 18,
        start_date: "2024-02-18",
        start_time: "20:00",
        registration_deadline: "2024-02-17",
        status: "registration",
        is_featured: 1,
        game_name: "Valorant",
        game_slug: "valorant",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      10: {
        _row_id: 10,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "COD Mobile Squad Wars",
        game_id: "4",
        description: "Intense squad-based combat in Call of Duty Mobile. Team coordination is key!",
        rules: "4-player squads. Multiplayer matches only. No ranked mode restrictions.",
        format: "4v4 Squad",
        format_type: "round_robin",
        platform: "Mobile",
        entry_fee: 12,
        prize_pool: 800,
        max_players: 64,
        current_players: 41,
        start_date: "2024-02-17",
        start_time: "18:00",
        registration_deadline: "2024-02-16",
        status: "registration",
        is_featured: 0,
        game_name: "COD Mobile",
        game_slug: "cod-mobile",
        creator_username: null,
        creator_avatar: null,
        user_registration: null,
        is_admin: false
      },
      11: {
        _row_id: 11,
        _created_by: "1",
        _created_at: 1765447146,
        _updated_at: 1765453805,
        title: "Fortnite Build Battle",
        game_id: "5",
        description: "Creative building competition in Fortnite. Show off your building skills!",
        rules: "Creative mode building challenges. No combat. Time-based scoring.",
        format: "Solo Building",
        format_type: "single_elimination",
        platform: "All Platforms",
        entry_fee: 8,
        prize_pool: 300,
        max_players: 40,
        current_players: 22,
        start_date: "2024-02-19",
        start_time: "17:00",
        registration_deadline: "2024-02-18",
        status: "upcoming",
        is_featured: 0,
        game_name: "Fortnite",
        game_slug: "fortnite",
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