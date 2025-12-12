import { connect } from "npm:@tursodatabase/serverless";

export default async function(req: Request): Promise<Response> {
  const userUuid = req.headers.get("x-user-uuid");
  const userName = req.headers.get("x-user-name");
  const dbUrl = req.headers.get("x-database-url");
  const dbToken = req.headers.get("x-database-token");

  if (!userUuid || userUuid === 'anonymous' || !userName || !dbUrl || !dbToken) {
    return Response.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const conn = connect({ url: dbUrl, authToken: dbToken });
    const body = await req.json();
    const now = Math.floor(Date.now() / 1000);

    switch (body.action) {
      case 'get_user_teams':
        const stmt = conn.prepare(`
          SELECT t._row_id, t.name, t.tag, t.description, t.logo_url,
                 (SELECT COUNT(*) FROM team_members_proper tm WHERE tm.team_row_id = t._row_id) as member_count
          FROM teams_proper t WHERE t.captain_user_uuid = ?
        `);
        const result = await stmt.all([userUuid]);
        const teams = (result || []).map(team => ({
          _row_id: team._row_id,
          name: team.name,
          tag: team.tag || '',
          description: team.description || '',
          captain_id: userUuid,
          captain_username: userName,
          logo_url: team.logo_url,
          created_at: now,
          member_count: team.member_count || 0,
          status: 'active',
          game_name: 'Multi-game'
        }));
        return Response.json({ success: true, teams });

      case 'get_team_by_id':
        if (!body.team_id || typeof body.team_id !== 'number' || body.team_id <= 0) {
          return Response.json({ success: false, error: "Valid Team ID required" }, { status: 400 });
        }

        // Get team details with captain username and member count
        const teamStmt = conn.prepare(`
          SELECT t._row_id, t.name, t.tag, t.description, t.logo_url, t.captain_user_uuid,
                 t.invite_code, t._created_at, t.game_id,
                 (SELECT COUNT(*) FROM team_members_proper tm WHERE tm.team_row_id = t._row_id) as member_count
          FROM teams_proper t
          WHERE t._row_id = ?
        `);
        const team = await teamStmt.get([body.team_id]);
        
        if (!team) {
          return Response.json({ success: false, error: "Team not found" }, { status: 404 });
        }

        // Check if user is captain or member of this team
        const membershipCheck = conn.prepare(`
          SELECT role FROM team_members_proper 
          WHERE team_row_id = ? AND user_uuid = ?
        `);
        const membership = await membershipCheck.get([body.team_id, userUuid]);
        
        // Allow access if user is captain or member
        if (team.captain_user_uuid !== userUuid && !membership) {
          return Response.json({ success: false, error: "Access denied" }, { status: 403 });
        }

        // Get team members (username mapping not available due to schema)
        const membersStmt = conn.prepare(`
          SELECT tm.user_uuid, tm.role, tm._created_at as joined_at
          FROM team_members_proper tm 
          WHERE tm.team_row_id = ?
          ORDER BY tm._created_at ASC
        `);
        const members = await membersStmt.all([body.team_id]);

        const response = {
          success: true, 
          team: {
            _row_id: team._row_id,
            name: team.name,
            tag: team.tag || '',
            description: team.description || '',
            logo_url: team.logo_url,
            captain_id: team.captain_user_uuid,
            captain_username: 'Team Captain', // Fallback due to schema limitations
            created_at: team._created_at,
            member_count: team.member_count || 0,
            status: 'active',
            game_name: team.game_id ? 'Unknown Game' : 'Not Set' // Will be updated below
          },
          members: (members || []).map(member => ({
            user_uuid: member.user_uuid,
            role: member.role,
            joined_at: member.joined_at,
            username: 'Team Member' // Fallback due to schema limitations
          }))
        };
        
        // Get actual game name if game_id is available
        if (team.game_id) {
          const gameStmt = conn.prepare("SELECT name FROM games WHERE _row_id = ?");
          const game = await gameStmt.get([team.game_id]);
          response.team.game_name = game ? game.name : 'Unknown Game';
        }
        
        console.log('get_team_by_id response:', JSON.stringify(response, null, 2));
        return Response.json(response);

      case 'create':
        if (!body.name || body.name.length < 2) {
          return Response.json({ success: false, error: "Team name required" }, { status: 400 });
        }
        
        if (!body.game_id || typeof body.game_id !== 'number' || body.game_id <= 0) {
          return Response.json({ success: false, error: "Game selection required" }, { status: 400 });
        }

        // Check if team name already exists
        const nameCheck = conn.prepare("SELECT _row_id FROM teams_proper WHERE name = ?");
        const existingTeam = await nameCheck.get([body.name]);
        if (existingTeam) {
          return Response.json({ success: false, error: "Team name exists" }, { status: 400 });
        }

        // Generate invite code
        const inviteCode = `TEAM_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Use transaction for atomic team + captain creation
        const createTeamStmt = conn.prepare(`
          INSERT INTO teams_proper (name, description, tag, captain_user_uuid, invite_code, game_id, _created_by, _created_at, _updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const createMemberStmt = conn.prepare(`
          INSERT INTO team_members_proper (team_row_id, user_uuid, role, _created_by, _created_at, _updated_at)
          VALUES (?, ?, 'captain', ?, ?, ?)
        `);

        // Execute within transaction
        const teamId = conn.transaction(() => {
          const teamResult = createTeamStmt.run([
            body.name, 
            body.description || null, 
            body.tag || null, 
            userUuid, 
            inviteCode,
            body.game_id,
            userUuid, 
            now, 
            now
          ]);

          createMemberStmt.run([
            teamResult.lastInsertRowid, 
            userUuid, 
            userUuid, 
            now, 
            now
          ]);

          return teamResult.lastInsertRowid;
        })();

        return Response.json({ 
          success: true, 
          message: "Team created successfully",
          team_id: Number(teamId)
        });

      case 'update_team':
        if (!body.team_id || typeof body.team_id !== 'number' || body.team_id <= 0) {
          return Response.json({ success: false, error: "Valid Team ID required" }, { status: 400 });
        }
        
        if (!body.name || body.name.length < 2) {
          return Response.json({ success: false, error: "Team name required" }, { status: 400 });
        }

        // Check if user is the team captain
        const captainCheck = conn.prepare("SELECT captain_user_uuid FROM teams_proper WHERE _row_id = ?");
        const teamToCheck = await captainCheck.get([body.team_id]);
        
        if (!teamToCheck) {
          return Response.json({ success: false, error: "Team not found" }, { status: 404 });
        }
        
        if (teamToCheck.captain_user_uuid !== userUuid) {
          return Response.json({ success: false, error: "Only team captains can edit teams" }, { status: 403 });
        }

        // Check if name is being changed and if it conflicts with existing teams
        if (body.name) {
          const duplicateNameCheck = conn.prepare("SELECT _row_id FROM teams_proper WHERE name = ? AND _row_id != ?");
          const duplicateTeam = await duplicateNameCheck.get([body.name, body.team_id]);
          if (duplicateTeam) {
            return Response.json({ success: false, error: "Team name already exists" }, { status: 400 });
          }
        }

        // Update team
        const updateStmt = conn.prepare(`
          UPDATE teams_proper 
          SET name = ?, description = ?, tag = ?, game_id = ?, _updated_at = ?
          WHERE _row_id = ? AND captain_user_uuid = ?
        `);
        await updateStmt.run([
          body.name, 
          body.description || null, 
          body.tag || null,
          body.game_id || null,
          now, 
          body.team_id, 
          userUuid
        ]);

        return Response.json({ 
          success: true, 
          message: "Team updated successfully"
        });

      default:
        return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error('Team management error:', error);
    return Response.json({ 
      success: false, 
      error: "Database operation failed"
    }, { status: 500 });
  }
}