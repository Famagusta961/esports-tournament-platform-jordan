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

    const body = await req.json();
    const { tournament_id, team_id } = body;

    if (!tournament_id) {
      return Response.json({ error: "Tournament ID is required" }, { status: 400 });
    }

    // Get user info
    const userQuery = "SELECT username, role FROM users WHERE id = ?";
    const userStmt = conn.prepare(userQuery);
    const user = await userStmt.get([userUuid]);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get tournament info
    const tournamentQuery = "SELECT * FROM tournaments WHERE _row_id = ?";
    const tournamentStmt = conn.prepare(tournamentQuery);
    const tournament = await tournamentStmt.get([tournament_id]);

    if (!tournament) {
      return Response.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Check if tournament allows registration
    if (tournament.status !== 'registration' && tournament.status !== 'draft') {
      return Response.json({ error: "Tournament is not accepting registrations" }, { status: 400 });
    }

    // Check if tournament is full
    if (tournament.current_players >= tournament.max_players) {
      return Response.json({ error: "Tournament is full" }, { status: 400 });
    }

    // Check if already registered
    const existingRegQuery = `
      SELECT _row_id FROM tournament_players 
      WHERE tournament_row_id = ? AND user_uuid = ?
    `;
    const existingRegStmt = conn.prepare(existingRegQuery);
    const existingReg = await existingRegStmt.get([tournament_id, userUuid]);

    if (existingReg) {
      return Response.json({ error: "Already registered for this tournament" }, { status: 400 });
    }

    // Register for tournament
    const now = Math.floor(Date.now() / 1000);
    const insertQuery = `
      INSERT INTO tournament_players (
        tournament_row_id, user_uuid, status, joined_at
      ) VALUES (?, ?, ?, ?)
    `;

    const stmt = conn.prepare(insertQuery);
    await stmt.run([
      tournament_id,
      userUuid,
      'registered',
      now
    ]);

    // Update tournament player count
    const updateQuery = "UPDATE tournaments SET current_players = current_players + 1 WHERE _row_id = ?";
    const updateStmt = conn.prepare(updateQuery);
    await updateStmt.run([tournament_id]);

    return Response.json({
      success: true,
      message: "Successfully registered for tournament"
    });

  } catch (error) {
    console.error('Tournament join error:', error);
    return Response.json({ 
      success: false, 
      error: "Failed to register for tournament" 
    }, { status: 500 });
  }
}