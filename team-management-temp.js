export default async function(req: Request): Promise<Response> {
  const userUuid = req.headers.get("x-user-uuid");
  const dbUrl = req.headers.get("x-database-url");
  const dbToken = req.headers.get("x-database-token");

  if (!userUuid || userUuid === 'anonymous' || !dbUrl || !dbToken) {
    return Response.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const { connect } = await import("npm:@tursodatabase/serverless");
    const conn = connect({ url: dbUrl, authToken: dbToken });
    const body = await req.json();

    if (body.action === 'get_team_by_id') {
      const teamId = Number(body.team_id);
      if (!Number.isFinite(teamId) || teamId <= 0) {
        return Response.json({ success: false, error: "Valid Team ID required" }, { status: 400 });
      }

      const team = await conn.prepare(`
        SELECT t._row_id, t.name, t.tag, t.description, t.logo_url, t.captain_user_uuid,
               t.game_id, g.name as game_name,
               (SELECT COUNT(*) FROM team_members_proper tm WHERE tm.team_row_id = t._row_id) as member_count
        FROM teams_proper t
        LEFT JOIN games g ON t.game_id = g._row_id
        WHERE t._row_id = ?
      `).get([teamId]);
      
      if (!team) {
        return Response.json({ success: false, error: "Team not found" }, { status: 404 });
      }

      const members = await conn.prepare(`
        SELECT tm.user_uuid, tm.role, tm._created_at as joined_at
        FROM team_members_proper tm 
        WHERE tm.team_row_id = ?
        ORDER BY tm._created_at ASC
      `).all([teamId]);

      const response = {
        success: true, 
        team: {
          _row_id: team._row_id,
          name: team.name,
          tag: team.tag || '',
          description: team.description || '',
          logo_url: team.logo_url,
          captain_id: team.captain_user_uuid,
          captain_username: 'Team Captain',
          created_at: team._created_at,
          member_count: team.member_count || 0,
          status: 'active',
          game_name: team.game_name || 'Unknown Game'
        },
        members: members || []
      };
      
      return Response.json(response);
    }

    return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: "Operation failed" }, { status: 500 });
  }
}