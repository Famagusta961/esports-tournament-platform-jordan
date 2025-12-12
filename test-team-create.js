// Test script to verify team creation edge function
import { connect } from "npm:@tursodatabase/serverless";

const testCreateTeam = async () => {
  console.log('Testing team creation...');
  
  // Simulate the edge function logic directly
  const conn = connect({
    url: "file://tmp.db",
    authToken: "test"
  });
  
  const userUuid = "test-user-uuid";
  const now = Math.floor(Date.now() / 1000);
  
  try {
    // Test team creation
    const createStmt = conn.prepare(`
      INSERT INTO teams_proper (name, description, tag, captain_user_uuid, invite_code, _created_by, _created_at, _updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const testTeam = {
      name: "Test Team " + Date.now(),
      tag: "TST",
      description: "Test team for verification"
    };
    
    const inviteCode = `TEAM_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    console.log('Executing test team creation...');
    const teamResult = await createStmt.run([
      testTeam.name, 
      testTeam.description, 
      testTeam.tag, 
      userUuid, 
      inviteCode, 
      userUuid, 
      now, 
      now
    ]);
    
    console.log('Team creation successful:', {
      team_id: teamResult.lastInsertRowid,
      name: testTeam.name,
      tag: testTeam.tag,
      invite_code: inviteCode
    });
    
    // Test team member creation
    const memberStmt = conn.prepare(`
      INSERT INTO team_members_proper (team_row_id, user_uuid, role, _created_by, _created_at, _updated_at)
      VALUES (?, ?, 'captain', ?, ?, ?)
    `);
    
    await memberStmt.run([
      teamResult.lastInsertRowid, 
      userUuid, 
      userUuid, 
      now, 
      now
    ]);
    
    console.log('Team member creation successful');
    
    // Verify teams exist
    const verifyStmt = conn.prepare(`
      SELECT t._row_id, t.name, t.tag, t.description, t.captain_user_uuid,
             (SELECT COUNT(*) FROM team_members_proper tm WHERE tm.team_row_id = t._row_id) as member_count
      FROM teams_proper t WHERE t.captain_user_uuid = ?
    `);
    
    const teams = await verifyStmt.all([userUuid]);
    console.log('Teams for user:', teams);
    
    return { success: true, teams };
    
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Run test
testCreateTeam().then(result => {
  console.log('Test result:', result);
}).catch(error => {
  console.error('Test script error:', error);
});