import db from './src/lib/shared/kliv-database.js';
import auth from './src/lib/shared/kliv-auth.js';

async function testProfileQuery() {
  try {
    console.log('🔐 Getting current user...');
    const user = await auth.getUser();
    console.log('👤 Current user:', user);
    console.log('🔍 userUuid:', user?.userUuid);
    console.log('🔍 id:', user?.id);
    
    console.log('📊 Querying all profiles...');
    const { data: profiles } = await db.query('player_profiles');
    console.log('📋 All profiles:', profiles);
    
    if (user?.userUuid) {
      console.log('🔍 Querying for current user profile...');
      const { data: userProfile } = await db.query('player_profiles', {
        _created_by: 'eq.' + user.userUuid
      });
      console.log('👤 User profile:', userProfile);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfileQuery();