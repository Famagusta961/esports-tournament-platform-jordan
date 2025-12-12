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

      console.log('TEAM-MGMT-RESTORED:', { teamId, game_name: response.team.game_name, member_count: response.members.length });
      return Response.json(response);
    }

    if (body.action === 'get_user_teams') {
      const userUuid = body.user_uuid;
      if (!userUuid) {
        return Response.json({ error: "User UUID required" }, { status: 400 });
      }

      // Get teams where user is captain
      const captainQuery = `
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
        WHERE t.captain_user_uuid = ?
        ORDER BY t._created_at DESC
      `;

      const captainStmt = conn.prepare(captainQuery);
      const captainTeams = await captainStmt.all([userUuid]);

      const response = {
        success: true,
        teams: captainTeams.map(team => ({
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
          game_name: team.game_name || 'Unknown Game',
          game_id: team.game_id
        }))
      };

      return Response.json(response);
    }

    if (body.action === 'create') {
      const { name, tag, description, game_id, captain_user_uuid } = body;
      
      if (!name || !game_id || !captain_user_uuid) {
        return Response.json({ error: "Name, game ID, and captain UUID required" }, { status: 400 });
      }

      // Generate unique invite code
      const inviteCode = 'TEAM_' + Math.random().toString(36).substring(2, 12).toUpperCase();

      const insertQuery = `
        INSERT INTO teams_proper (name, tag, description, game_id, captain_user_uuid, invite_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const insertStmt = conn.prepare(insertQuery);
      const result = await insertStmt.run([name, tag || '', description || '', game_id, captain_user_uuid, inviteCode]);

      if (!result.lastInsertRowid) {
        return Response.json({ error: "Failed to create team" }, { status: 500 });
      }

      // Add captain as team member
      const memberQuery = `
        INSERT INTO team_members_proper (team_row_id, user_uuid, role)
        VALUES (?, ?, 'captain')
      `;

      const memberStmt = conn.prepare(memberQuery);
      await memberStmt.run([result.lastInsertRowid, captain_user_uuid]);

      return Response.json({
        success: true,
        team: {
          _row_id: result.lastInsertRowid,
          name,
          tag: tag || '',
          description: description || '',
          game_id,
          captain_user_uuid,
          invite_code: inviteCode,
          created_at: Math.floor(Date.now() / 1000)
        }
      });
    }

    if (body.action === 'update_team') {
      const { team_id, name, tag, description } = body;
      
      if (!team_id) {
        return Response.json({ error: "Team ID required" }, { status: 400 });
      }

      const updateQuery = `
        UPDATE teams_proper 
        SET name = ?, tag = ?, description = ?
        WHERE _row_id = ?
      `;

      const updateStmt = conn.prepare(updateQuery);
      await updateStmt.run([name, tag || '', description || '', team_id]);

      return Response.json({ success: true });
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