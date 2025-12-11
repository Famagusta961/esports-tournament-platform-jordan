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

    const conn = connect({
      url: dbUrl,
      authToken: dbToken
    });

    // Parse query parameters
    const params = new URLSearchParams(search);
    const status = params.get('status');
    const gameFilter = params.get('game');
    const limitParam = params.get('limit');
    const offsetParam = params.get('offset');

    const limit = limitParam ? parseInt(limitParam) : 20;
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    // Build WHERE clause
    const whereConditions = [];
    const whereParams = [];

    if (status && status !== 'all') {
      whereConditions.push("t.status = ?");
      whereParams.push(status);
    }

    if (gameFilter && gameFilter !== 'all') {
      whereConditions.push("g.slug = ?");
      whereParams.push(gameFilter);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query tournaments with game info
    const query = `
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
        u.avatar_url as creator_avatar
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g._row_id
      LEFT JOIN users u ON t._created_by = u.id
      ${whereClause}
      ORDER BY t._created_at DESC
      LIMIT ? OFFSET ?
    `;

    const stmt = conn.prepare(query);
    const rows = await stmt.all([...whereParams, limit, offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g._row_id
      ${whereClause}
    `;

    const countStmt = conn.prepare(countQuery);
    const countResult = await countStmt.get(whereParams);
    const total = countResult?.total || 0;

    const tournaments = rows.map(tournament => ({
      ...tournament,
      registration_deadline: tournament.registration_deadline || null
    }));

    return Response.json({
      success: true,
      tournaments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Tournament list error:', error);
    return Response.json({ 
      success: false, 
      error: "Failed to fetch tournaments" 
    }, { status: 500 });
  }
}