export default async function(req: Request): Promise<Response> {
  try {
    const { connect } = await import("npm:@tursodatabase/serverless");
    const { search } = new URL(req.url);
    
    // Get database connection info from headers
    const dbUrl = req.headers.get("x-database-url");
    const dbToken = req.headers.get("x-database-token");
    const userUuid = req.headers.get("x-user-uuid");

    if (!dbUrl || !dbToken) {
      return Response.json({ error: "Database configuration missing" }, { status: 500 });
    }

    // Get tournament ID from query
    const params = new URLSearchParams(search);
    const tournamentId = params.get('id');

    if (!tournamentId) {
      return Response.json({ error: "Tournament ID is required" }, { status: 400 });
    }

    const conn = connect({
      url: dbUrl,
      authToken: dbToken
    });

    // Get tournament details
    const tournamentQuery = `
      SELECT 
        t._row_id,
        t.title,
        t.description,
        t.rules,
        t.format_type,
        t.match_format,
        t.platform,
        t.entry_fee,
        t.prize_pool,
        t.max_players,
        t.current_players,
        t.start_date,
        t.start_time,
        t.registration_deadline,
        t.status,
        t.is_featured,
        g.name as game_name,
        g.slug as game_slug,
        u.username as creator_username,
        u.avatar_url as creator_avatar,
        u.role as creator_role
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g._row_id
      LEFT JOIN users u ON t._created_by = u.id
      WHERE t._row_id = ?
    `;

    const stmt = conn.prepare(tournamentQuery);
    const tournament = await stmt.get([parseInt(tournamentId)]);

    if (!tournament) {
      return Response.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Get user registration status if logged in
    let userRegistration = null;
    let isAdmin = false;

    if (userUuid) {
      // Check if user is admin
      const adminQuery = "SELECT role FROM users WHERE id = ?";
      const adminStmt = conn.prepare(adminQuery);
      const adminResult = await adminStmt.get([userUuid]);
      isAdmin = adminResult?.role === 'admin';

      // Check if user is registered
      const regQuery = `
        SELECT _row_id, payment_status, team_id, joined_at
        FROM tournament_players 
        WHERE tournament_id = ? AND username = (SELECT username FROM users WHERE id = ?)
      `;
      const regStmt = conn.prepare(regQuery);
      userRegistration = await regStmt.get([parseInt(tournamentId), userUuid]);
    }

    // Get registered players for admin users
    let registeredPlayers = [];
    if (isAdmin) {
      const playersQuery = `
        SELECT tp.*, u.avatar_url, u.username
        FROM tournament_players tp
        LEFT JOIN users u ON tp.username = u.username
        WHERE tp.tournament_id = ?
        ORDER BY tp.joined_at ASC
      `;
      const playersStmt = conn.prepare(playersQuery);
      registeredPlayers = await playersStmt.all([parseInt(tournamentId)]);
    }

    const result = {
      ...tournament,
      user_registration: userRegistration,
      is_admin: isAdmin,
      registered_players: registeredPlayers
    };

    return Response.json({
      success: true,
      tournament: result
    });

  } catch (error) {
    console.error('Tournament details error:', error);
    return Response.json({ 
      success: false, 
      error: "Failed to fetch tournament details" 
    }, { status: 500 });
  }
}