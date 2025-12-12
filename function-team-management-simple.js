export default async function(req: Request): Promise<Response> {
  try {
    const { connect } = await import("npm:@tursodatabase/serverless");
    
    // Get database connection info from headers
    const dbUrl = req.headers.get("x-database-url");
    const dbToken = req.headers.get("x-database-token");

    if (!dbUrl || !dbToken) {
      return Response.json({ error: "Database configuration missing" }, { status: 500 });
    }

    const conn = connect({
      url: dbUrl,
      authToken: dbToken
    });

    const body = await req.json();

    if (body.action === 'get_team_by_id') {
      const teamId = parseInt(body.team_id, 10);
      if (!teamId || teamId <= 0) {
        return Response.json({ error: "Valid team ID required" }, { status: 400 });
      }

      // Get team details with game name
      const teamQuery = `
        SELECT 
          t._row_id,
          t.name,
          t.tag,
          t.description,
          t.logo_url,
          t.captain_user_uuid,
          t.game_id,
          t._created_at,
          g.name as game_name,
          (SELECT COUNT(*) FROM team_members_proper tm WHERE tm.team_row_id = t._row_id) as member_count
        FROM teams_proper t
        LEFT JOIN games g ON t.game_id = g._row_id
        WHERE t._row_id = ?
      `;

      const stmt = conn.prepare(teamQuery);
      const team = await stmt.get([teamId]);
      
      if (!team) {
        return Response.json({ error: "Team not found" }, { status: 404 });
      }

      // Get team members
      const membersQuery = `
        SELECT 
          tm.user_uuid,
          tm.role,
          tm._created_at as joined_at
        FROM team_members_proper tm 
        WHERE tm.team_row_id = ?
        ORDER BY tm._created_at ASC
      `;

      const membersStmt = conn.prepare(membersQuery);
      const members = await membersStmt.all([teamId]);

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
        members: members.map(member => ({
          user_uuid: member.user_uuid,
          role: member.role,
          joined_at: member.joined_at,
          username: 'Team Member'
        }))
      };

      console.log('TEAM-MGMT-SIMPLE:', { teamId, game_name: response.team.game_name, member_count: response.members.length });
      return Response.json(response);
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Team management error:', error);
    return Response.json({ 
      success: false, 
      error: "Operation failed" 
    }, { status: 500 });
  }
}