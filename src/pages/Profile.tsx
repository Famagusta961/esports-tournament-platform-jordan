import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Trophy, Gamepad2, Star, Edit, LogOut, Shield, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import auth from '@/lib/shared/kliv-auth.js';
import { profileService, debugProfileService } from '@/lib/api';
import EditProfileModal from '@/components/profile/EditProfileModal';

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
}

const mockStats = {
  totalMatches: 156,
  wins: 89,
  losses: 67,
  winRate: 57,
  totalEarnings: '1,250 JD',
  tournamentsPlayed: 34,
  currentRank: 'Gold',
};

const mockTournamentHistory = [
  { id: '1', name: 'PUBG Mobile Championship', game: 'PUBG Mobile', result: '1st Place', prize: '250 JD', date: '2024-01-10' },
  { id: '2', name: 'EA FC Weekly Cup', game: 'EA FC 25', result: '3rd Place', prize: '50 JD', date: '2024-01-05' },
  { id: '3', name: 'Valorant Showdown', game: 'Valorant', result: '2nd Place', prize: '150 JD', date: '2023-12-28' },
];

const mockGameIds = [
  { game: 'PUBG Mobile', id: '5234567890', platform: 'Mobile' },
  { game: 'EA FC 25', id: 'ProPlayer_JO', platform: 'PS5' },
  { game: 'Valorant', id: 'Phoenix#JOR', platform: 'PC' },
];

const COUNTRIES = [
  { code: 'JO', name: 'Jordan' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'EG', name: 'Egypt' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'QA', name: 'Qatar' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'OM', name: 'Oman' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'SY', name: 'Syria' },
  { code: 'PS', name: 'Palestine' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IR', name: 'Iran' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

interface PlayerProfile {
  _row_id?: number;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  country?: string;
  current_rank?: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug state to show required values
  const [debugInfo, setDebugInfo] = useState<{
    userId?: string;
    profileRowId?: number;
    profileCreatedBy?: string;
    profileDisplayName?: string;
    profileAvatarUrl?: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Profile page: Starting data load');
        const currentUser = await auth.getUser();
        if (!currentUser) {
          console.log('❌ Profile page: User not authenticated, redirecting to login');
          navigate('/login');
          return;
        }
        console.log('👤 Profile page: User authenticated', { userId: currentUser.id });
        setUser(currentUser);

        // Load player profile (ONE profile per user)
        console.log('🔍 Profile page: Loading player profile');
        const playerProfile = await profileService.getProfile();
        console.log('📊 Profile page: Profile loaded', { profile: playerProfile });
        setProfile(playerProfile);

        // Update debug info
        if (playerProfile && currentUser) {
          const debug = {
            userId: currentUser.id,
            profileRowId: playerProfile._row_id,
            profileCreatedBy: playerProfile._created_by,
            profileDisplayName: playerProfile.display_name,
            profileAvatarUrl: playerProfile.avatar_url
          };
          console.log('🔍 DEBUG INFO UPDATE:', debug);
          setDebugInfo(debug);
        }

        console.log('✅ Profile page: Data load complete');
        setLoading(false);
      } catch (error) {
        console.error('❌ Profile page: Failed to load profile data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleEditProfile = () => {
    console.log('✏️ Profile page: Opening edit profile modal');
    setEditModalOpen(true);
  };

  const handleProfileUpdate = async () => {
    console.log('🔄 Profile page: Handling profile update callback');
    try {
      // Reload profile data after update (ONE profile per user)
      console.log('🔍 Profile page: Reloading profile data after save');
      const playerProfile = await profileService.getProfile();
      console.log('📊 Profile page: Updated profile loaded', { 
        profile: playerProfile,
        display_name: playerProfile?.display_name,
        avatar_url: playerProfile?.avatar_url,
        bio: playerProfile?.bio,
        country: playerProfile?.country
      });
      
      if (playerProfile) {
        // Update debug info first
        const currentUser = await auth.getUser();
        if (currentUser) {
          const debug = {
            userId: currentUser.id,
            profileRowId: playerProfile._row_id,
            profileCreatedBy: playerProfile._created_by,
            profileDisplayName: playerProfile.display_name,
            profileAvatarUrl: playerProfile.avatar_url
          };
          console.log('🔍 UPDATED DEBUG INFO:', debug);
          setDebugInfo(debug);
        }
        
        // Update state and verify the change
        console.log('📋 Profile page: Setting profile state with updated data');
        setProfile(playerProfile);
        
        console.log('✅ Profile page: Profile state updated successfully');
        
        // Close modal only after state update
        setEditModalOpen(false);
        
        // Show success confirmation
        toast({
          title: "Profile updated successfully",
          description: "Your changes have been saved and are now visible.",
        });
      } else {
        console.log('⚠️ Profile page: No profile returned after update');
        toast({
          title: "Update failed",
          description: "Profile save failed. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Profile page: Failed to reload profile after update:', error);
      toast({
        title: "Update failed",
        description: "Failed to save profile changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Debug function to test database directly
  const handleDebugDatabase = async () => {
    try {
      console.log('🔍 DEBUG: Testing database connection and profile data');
      
      // Test current avatar accessibility
      if (profile?.avatar_url) {
        console.log('🔍 DEBUG: Testing avatar URL accessibility', { avatarUrl: profile.avatar_url });
        try {
          const response = await fetch(profile.avatar_url, { method: 'HEAD' });
          console.log('📊 DEBUG: Avatar accessibility result', {
            url: profile.avatar_url,
            status: response.status,
            accessible: response.ok,
            contentType: response.headers.get('content-type')
          });
        } catch (fetchError) {
          console.log('❌ DEBUG: Avatar not accessible', { url: profile.avatar_url, error: fetchError.message });
        }
      }
      
      // Comprehensive user vs profile mapping debug
      const debugResult = await debugProfileService.debugUserVsProfileMapping();
      console.log('🎯 DEBUG: Comprehensive result', { debugResult });
      
      const currentUser = await auth.getUser();
      if (currentUser) {
        const userProfile = await debugProfileService.queryProfileByUserId(currentUser.id);
        console.log('👤 DEBUG: Current user profile', { userProfile });
        
        // Test ONE profile per user logic
        const singleProfile = await profileService.getProfile();
        console.log('👤 DEBUG: Single profile for user', { 
          profile: singleProfile 
        });
      }
    } catch (error) {
      console.error('❌ DEBUG: Database test failed', error);
      toast({
        title: "Debug error",
        description: "Check console for details",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been signed out successfully.",
    });
    navigate('/');
  };

  const handleChangePassword = () => {
    console.log('🔐 Change Password button clicked');
    toast({
      title: "Password Change",
      description: "Password reset functionality would be implemented here. For now, check console logs.",
    });
    // TODO: Implement password change modal or redirect
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground font-gaming">Loading...</div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border mb-8">
            {/* Banner */}
            <div className="h-32 sm:h-40 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            </div>

            {/* Profile Content */}
            <div className="px-6 sm:px-8 pb-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-card shadow-xl overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-bold text-4xl sm:text-5xl text-white">
                      {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'P'}
                    </span>
                  )}
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                  onClick={handleEditProfile}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {/* Info */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  {/* Required debug output - MANDATORY */}
                  <div className="text-xs text-red-500 font-mono bg-red-50 border border-red-200 p-2 rounded mb-2">
                    DEBUG OUTPUT (REQUIRED):<br/>
                    auth.user.id: {debugInfo.userId?.slice(0,8) || 'null'}...<br/>
                    profile._row_id: {debugInfo.profileRowId || 'null'}<br/>
                    profile._created_by: {debugInfo.profileCreatedBy?.slice(0,8) || 'null'}...<br/>
                    profile.display_name: {debugInfo.profileDisplayName || 'null'}<br/>
                    profile.avatar_url: {debugInfo.profileAvatarUrl || 'null'}<br/>
                    UI Source: {profile?.display_name ? '✅ player_profiles.display_name' : '❌ FALLBACK (NOT ALLOWED)'}
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
                    {profile?.display_name || 'No Profile Found'} 
                  </h1>
                  {profile?.username && (
                    <p className="text-muted-foreground font-gaming flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>@{profile.username}</span>
                    </p>
                  )}
                  <p className="text-muted-foreground font-gaming flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </p>
                  {profile?.bio && (
                    <p className="text-muted-foreground font-gaming mt-2 text-sm">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      {profile?.current_rank || mockStats.currentRank}
                    </Badge>
                    {user?.emailVerified && (
                      <Badge variant="secondary">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {profile?.country && (
                      <Badge variant="outline">
                        {COUNTRIES.find(c => c.code === profile.country)?.name || profile.country}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" className="font-gaming" onClick={handleEditProfile}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" className="font-gaming" onClick={handleDebugDatabase}>
                    Debug DB
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="font-gaming text-destructive hover:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl bg-card border border-border p-4 text-center hover-lift">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-display text-2xl font-bold text-primary">{mockStats.wins}</p>
              <p className="text-xs text-muted-foreground font-gaming">Wins</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 text-center hover-lift">
              <Gamepad2 className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="font-display text-2xl font-bold">{mockStats.totalMatches}</p>
              <p className="text-xs text-muted-foreground font-gaming">Matches</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 text-center hover-lift">
              <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="font-display text-2xl font-bold text-success">{mockStats.winRate}%</p>
              <p className="text-xs text-muted-foreground font-gaming">Win Rate</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 text-center hover-lift">
              <Star className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="font-display text-2xl font-bold text-success">{mockStats.totalEarnings}</p>
              <p className="text-xs text-muted-foreground font-gaming">Earnings</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="bg-card border border-border p-1">
              <TabsTrigger value="history" className="font-gaming">Tournament History</TabsTrigger>
              <TabsTrigger value="gameids" className="font-gaming">Game IDs</TabsTrigger>
              <TabsTrigger value="settings" className="font-gaming">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-display font-semibold">Recent Tournaments</h3>
                </div>
                <div className="divide-y divide-border">
                  {mockTournamentHistory.map((tournament) => (
                    <div key={tournament.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-gaming font-semibold">{tournament.name}</p>
                          <p className="text-xs text-muted-foreground font-gaming">{tournament.game} • {tournament.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          tournament.result.includes('1st') ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                          tournament.result.includes('2nd') ? 'bg-gray-400/20 text-gray-400 border-gray-400/30' :
                          'bg-amber-600/20 text-amber-600 border-amber-600/30'
                        }>
                          {tournament.result}
                        </Badge>
                        <p className="text-sm text-success font-gaming mt-1">{tournament.prize}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gameids" className="space-y-4">
              <div className="rounded-xl bg-card border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-semibold">Connected Game Accounts</h3>
                  <Button variant="outline" size="sm" className="font-gaming">
                    + Add Game ID
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {mockGameIds.map((game, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Gamepad2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-gaming font-semibold">{game.game}</p>
                          <p className="text-sm text-muted-foreground font-gaming">{game.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <code className="px-3 py-1 rounded bg-muted text-sm font-mono">{game.id}</code>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

          <TabsContent value="settings" className="space-y-4">
              <div className="rounded-xl bg-card border border-border p-6">
                <h3 className="font-display font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start font-gaming" onClick={handleEditProfile}>
                    <User className="w-4 h-4 mr-2" />
                    Update Profile Information
                  </Button>
                  <Button variant="outline" className="w-full justify-start font-gaming" onClick={handleChangePassword}>
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start font-gaming">
                    <Clock className="w-4 h-4 mr-2" />
                    Notification Preferences
                  </Button>
                </div>
              </div>
          </TabsContent>
          </Tabs>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            currentProfile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Profile;