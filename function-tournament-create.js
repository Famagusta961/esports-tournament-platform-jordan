export default async function(req: Request): Promise<Response> {
  try {
    const { connect } = await import("npm:@tursodatabase/serverless");
    
    // Get database connection info from headers
    const dbUrl = req.headers.get("x-database-url");
    const dbToken = req.headers.get("x-database-token");
    const userUuid = req.headers.get("x-user-uuid");

    if (!dbUrl || !dbToken || !userUuid) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const conn = connect({
      url: dbUrl,
      authToken: dbToken
    });

    // Check if user is admin
    const adminQuery = "SELECT role FROM users WHERE id = ?";
    const adminStmt = conn.prepare(adminQuery);
    const adminResult = await adminStmt.get([userUuid]);

    if (!adminResult || adminResult.role !== 'admin') {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    
    const {
      title,
      game_slug,
      description,
      rules,
      format_type,
      match_format,
      platform,
      entry_fee,
      prize_pool,
      max_players,
      start_date,
      start_time,
      registration_deadline
    } = body;

    // Validate required fields
    if (!title || !game_slug || !max_players || !start_date) {
      return Response.json({ 
        error: "Missing required fields: title, game_slug, max_players, start_date" 
      }, { status: 400 });
    }

    // Get game ID
    const gameQuery = "SELECT _row_id FROM games WHERE slug = ? AND is_active = 1";
    const gameStmt = conn.prepare(gameQuery);
    const game = await gameStmt.get([game_slug]);

    if (!game) {
      return Response.json({ error: "Invalid game" }, { status: 400 });
    }

    // Create tournament
    const insertQuery = `
      INSERT INTO tournaments (
        title, game_id, description, rules, format_type, match_format,
        platform, entry_fee, prize_pool, max_players, start_date, start_time,
        registration_deadline, status, current_players, is_featured,
        _created_by, _created_at, _updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, 0, ?, ?, ?)
    `;

    const now = Math.floor(Date.now() / 1000);
    const stmt = conn.prepare(insertQuery);
    const result = await stmt.run([
      title,
      game._row_id,
      description || null,
      rules || null,
      format_type || 'single_elimination',
      match_format || '1v1',
      platform || 'PC',
      entry_fee || 0,
      prize_pool || 0,
      max_players,
      start_date,
      start_time || '18:00',
      registration_deadline || start_date,
      userUuid, // creator
      now,
      now
    ]);

    // Get created tournament
    const createdQuery = `
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
        g.name as game_name,
        g.slug as game_slug
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g._row_id
      WHERE t._row_id = ?
    `;

    const createdStmt = conn.prepare(createdQuery);
    const tournament = await createdStmt.get([result.lastInsertRowid]);

    return Response.json({
      success: true,
      message: "Tournament created successfully",
      tournament
    });

  } catch (error) {
    console.error('Tournament create error:', error);
    return Response.json({ 
      success: false, 
      error: "Failed to create tournament" 
    }, { status: 500 });
  }
}