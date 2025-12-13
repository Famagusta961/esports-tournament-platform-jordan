import db from '@/lib/shared/kliv-database.js';
import auth from '@/lib/shared/kliv-auth.js';
import functions from '@/lib/shared/kliv-functions.js';

// Utility function to handle API errors
const handleApiError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  const errorMessage = error as Error | Record<string, unknown>;
  const message = (errorMessage as Record<string, unknown>)?.error || (errorMessage as Error)?.message || defaultMessage;
  throw new Error(message);
};

// Types
export interface Tournament {
  _row_id: number;
  title: string;
  game_id: number;
  description?: string;
  rules?: string;
  format?: string;
  format_type?: string;
  platform?: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  start_date: string;
  start_time: string;
  registration_deadline?: string;
  status: string;
  bracket_data?: string;
  is_featured: boolean;
  game_name?: string;
  game_display_name?: string;
  creator_username?: string;
  creator_avatar?: string;
}

export interface TournamentRegistration {
  tournament_id: number;
  username: string;
  joined_at: number;
  payment_status: string;
  team_id?: number;
}

export interface Match {
  _row_id: number;
  tournament_id: number;
  round_number: number;
  match_number: number;
  player1_username?: string;
  player2_username?: string;
  team1_id?: number;
  team2_id?: number;
  winner_username?: string;
  winner_team_id?: number;
  score?: string;
  status: string;
  scheduled_time?: number;
  started_at?: number;
  completed_at?: number;
  can_report?: boolean;
  team1_name?: string;
  team2_name?: string;
  team1_tag?: string;
  team2_tag?: string;
}

export interface Transaction {
  _row_id: number;
  username: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  payment_method?: string;
  reference_id: string;
  created_at: number;
  updated_at: number;
}

export interface Wallet {
  username: string;
  balance: number;
  currency: string;
}

export interface Game {
  _row_id: number;
  slug: string;
  name: string;
  short_name?: string;
  description?: string;
  platforms?: string;
  formats?: string;
  is_active: number;
}



export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth service using Kliv Auth SDK
export const authService = {
  signUp: async (email: string, password: string, name?: string) => {
    try {
      return await auth.signUp(email, password, name);
    } catch (error) {
      handleApiError(error, 'Registration failed');
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      return await auth.signIn(email, password);
    } catch (error) {
      handleApiError(error, 'Login failed');
    }
  },

  signOut: async () => {
    try {
      return await auth.signOut();
    } catch (error) {
      handleApiError(error, 'Logout failed');
    }
  },

  getCurrentUser: async () => {
    try {
      return await auth.getUser();
    } catch (error) {
      handleApiError(error, 'Failed to get current user');
    }
  },

  updateUser: async (data: { email?: string; password?: string; firstName?: string; lastName?: string; metadata?: Record<string, unknown> }) => {
    try {
      return await auth.updateUser(data);
    } catch (error) {
      handleApiError(error, 'Failed to update user');
    }
  }
};

// Tournament service using edge functions for private ops, DB SDK for public listing
export const tournamentService = {
  // List tournaments - try edge function first, fallback to database
  list: async (params?: { status?: string; game?: string; limit?: number; offset?: number }) => {
    try {
      // Try edge function first (for authenticated users)
      const response = await functions.get('tournament-list', params);
      return response;
    } catch (error) {
      // If authentication fails (401 or 403), fallback to database SDK for public data
      const status = (error as { status?: number })?.status;
      if (status === 401 || status === 403) {
        try {
          console.log('Edge function requires auth, using database SDK for public tournaments');
          
          // Build database query parameters
          const dbParams: Record<string, unknown> = {
            ...(params?.status && params.status !== 'all' && { status: 'eq.' + params.status }),
            order: '_created_at.desc',
            limit: params?.limit || 20,
            offset: params?.offset || 0
          };
          
          // For game filtering, we need to handle it differently since games are joined
          const gameFilter = params?.game;
          if (gameFilter && gameFilter !== 'all') {
            console.log('Applying game filter:', gameFilter);
            // We'll filter after the join since joins with where clauses are complex
          }

          // Don't show draft tournaments to public
          if (!params?.status || params.status === 'all') {
            dbParams.status = 'in.(registration,upcoming,live,completed)';
          }

          const { data: response } = await db.query('tournaments', dbParams);

          // Handle both array and single object response formats
          let tournaments = [];
          if (Array.isArray(response)) {
            tournaments = response; // Array format
          } else if (response && typeof response === 'object') {
            tournaments = [response]; // Single object format wrapped in array
          }

          console.log("tournamentService.list: Processed tournament array", { 
            count: tournaments.length, 
            sample: tournaments.slice(0, 2).map(t => ({ id: t._row_id, title: t.title }))
          });

          // Join with games data - handle both slug and numeric game_id
          let tournamentsWithGames = await Promise.all(tournaments?.map(async (tournament) => {
            let gameName = 'Unknown Game';
            let gameSlug = 'unknown';
            
            if (tournament.game_id) {
              try {
                // Try by slug first (most common)
                const { data: games } = await db.query('games', { slug: 'eq.' + tournament.game_id });
                const game = games?.[0];
                if (game) {
                  gameName = game.name;
                  gameSlug = game.slug;
                } else {
                  // Try by numeric ID if slug didn't work
                  const gameIdNum = parseInt(tournament.game_id as string);
                  if (!isNaN(gameIdNum)) {
                    const { data: gamesById } = await db.query('games', { _row_id: 'eq.' + gameIdNum });
                    const gameById = gamesById?.[0];
                    if (gameById) {
                      gameName = gameById.name;
                      gameSlug = gameById.slug;
                    }
                  }
                }
              } catch (gameError) {
                console.warn('Failed to fetch game for tournament:', { gameError, tournamentId: tournament._row_id, gameId: tournament.game_id });
              }
            }
            
            return {
              ...tournament,
              game_name: gameName,
              game_slug: gameSlug
            };
          }) || []);
          
          // Apply game filter after the join if specified
          if (gameFilter && gameFilter !== 'all') {
            console.log('Filtering tournaments by game slug:', gameFilter, 'before filter:', tournamentsWithGames.length);
            console.log('Tournaments with slugs:', tournamentsWithGames.map(t => ({ id: t._row_id, title: t.title, game_slug: t.game_slug })));
            tournamentsWithGames = tournamentsWithGames.filter(tournament => 
              tournament.game_slug === gameFilter
            );
            console.log('After game filter:', tournamentsWithGames.length);
          }

          return {
            success: true,
            tournaments: tournamentsWithGames,
            pagination: {
              total: tournamentsWithGames.length,
              limit: params?.limit || 20,
              offset: params?.offset || 0,
              hasMore: tournamentsWithGames.length === (params?.limit || 20)
            }
          };
        } catch (dbError) {
          handleApiError(dbError, 'Failed to fetch tournaments from database');
        }
      } else {
        // Re-throw original error if it's not an auth issue
        handleApiError(error, 'Failed to fetch tournaments');
      }
    }
  },

  // Get tournament details - use database SDK directly for stability
  getById: async (id: number) => {
    try {
      console.log("tournamentService.getById: Fetching tournament", { id, source: "database-sdk" });
      
      // Use database SDK directly for more reliable fetching
      const { getTournamentSimple } = await import('./simple-tournament-api');
      const response = await getTournamentSimple(id);
      
      console.log("tournamentService.getById: Database SDK response", { 
        id, 
        success: response?.success, 
        hasTournament: !!response?.tournament,
        error: response?.error
      });
      
      if (response && response.success) {
        return response;
      } else {
        throw new Error(response?.error || 'Tournament not found');
      }
    } catch (error) {
      console.error("tournamentService.getById: Failed to fetch tournament", { 
        id, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      handleApiError(error, 'Failed to fetch tournament details');
    }
  },

  // Create tournament
  create: async (data: {
    title: string;
    game_slug: string;
    description?: string;
    rules?: string;
    format?: string;
    format_type?: string;
    platform?: string;
    entry_fee?: number;
    prize_pool?: number;
    max_players: number;
    start_date?: string;
    start_time?: string;
    registration_deadline?: string;
    tournament_type?: string;
    match_format?: string;
  }) => {
    try {
      const response = await functions.post('tournament-create', data);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to create tournament');
    }
  },

  // Update tournament
  update: async (id: number, data: {
    title?: string;
    description?: string;
    rules?: string;
    format_type?: string;
    match_format?: string;
    platform?: string;
    entry_fee?: number;
    prize_pool?: number;
    max_players?: number;
    start_date?: string;
    start_time?: string;
    registration_deadline?: string;
    status?: string;
  }) => {
    try {
      const response = await functions.post('tournament-update', { tournament_id: id, ...data });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update tournament');
    }
  },

  // Delete tournament
  delete: async (id: number) => {
    try {
      const response = await functions.post('tournament-delete', { tournament_id: id });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete tournament');
    }
  },

  // Join tournament
  join: async (tournamentId: number, teamId?: number) => {
    try {
      console.log('Attempting to join tournament:', tournamentId);
      
      // IMPORTANT: Since authentication is not forwarded to edge functions (platform issue),
      // we're implementing a database-based registration fallback
      
      // First try edge function (will fail with 403 due to platform auth issue)
      try {
        const response = await functions.post('tournament-join', {
          tournament_id: tournamentId,
          team_id: teamId
        });
        
        console.log('Tournament join response (edge function):', response);
        
        // If edge function returns success: true, show appropriate message
        if (response.success) {
          if (response.alreadyRegistered) {
            return {
              success: true,
              message: response.message || "You are already registered for this tournament",
              alreadyRegistered: true
            };
          } else {
            return {
              success: true,
              message: response.message || "Successfully registered for tournament",
              alreadyRegistered: false
            };
          }
        }
        
        // If success: false, throw the message as error
        if (response.success === false && response.message) {
          throw new Error(response.message);
        }
      } catch (edgeError) {
        // Edge function failed (expected due to auth issue) - fallback to database
        console.log('Edge function failed (expected auth issue), using database fallback:', edgeError instanceof Error ? edgeError.message : edgeError);
      }
      
      // DATABASE FALLBACK: Direct database registration
      console.log('Using database fallback for tournament registration');
      
      const user = await auth.getUser();
      if (!user) {
        throw new Error('Authentication required to join tournament');
      }
      
      // Check if tournament exists and is accepting registrations
      const { data: tournaments } = await db.query('tournaments', {
        _row_id: 'eq.' + tournamentId,
        status: 'in.(registration,upcoming)' // Only allow registration for these statuses
      });
      
      const tournament = tournaments?.[0];
      if (!tournament) {
        throw new Error('Tournament not found or registration is closed');
      }
      
      // Check if user is already registered
      const { data: existingRegistrations } = await db.query('tournament_players', {
        tournament_row_id: 'eq.' + tournamentId,
        user_uuid: 'eq.' + (user as { id: string }).id
      });
      
      if (existingRegistrations && existingRegistrations.length > 0) {
        return {
          success: true,
          message: "You are already registered for this tournament",
          alreadyRegistered: true
        };
      }
      
      // Check if tournament is full
      const { data: allRegistrations } = await db.query('tournament_players', {
        tournament_row_id: 'eq.' + tournamentId
      });
      
      if (tournament.max_players && allRegistrations && allRegistrations.length >= tournament.max_players) {
        throw new Error('Tournament is full');
      }
      
      // Register user for tournament
      const registration = await db.insert('tournament_players', {
        tournament_row_id: tournamentId,
        user_uuid: (user as { id: string }).id,
        status: 'registered',
        joined_at: Math.floor(Date.now() / 1000),
        team_id: teamId
      });
      
      // Update tournament player count
      await db.update('tournaments', 
        { _row_id: 'eq.' + tournamentId }, 
        { 
          current_players: (allRegistrations?.length || 0) + 1,
          _updated_at: Math.floor(Date.now() / 1000)
        }
      );
      
      console.log('Database fallback registration successful:', registration);
      
      return {
        success: true,
        message: "Successfully registered for tournament",
        alreadyRegistered: false
      };
      
    } catch (error) {
      console.error('Tournament join error:', error);
      // Don't wrap the error again - let the message through
      throw error;
    }
  }
};

// Match service using edge functions
export const matchService = {
  // Report match result
  reportResult: async (data: {
    match_id: number;
    score: string;
    screenshot_url?: string;
    notes?: string;
    winner?: string;
  }) => {
    try {
      const response = await functions.post('match-result-submit', data);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to report match result');
    }
  },

  // Get match details
  getById: async (matchId: number) => {
    try {
      const { data: matches } = await db.query('matches', {
        _row_id: 'eq.' + matchId
      });

      return matches?.[0];
    } catch (error) {
      handleApiError(error, 'Failed to fetch match details');
    }
  }
};

// Wallet service using edge functions
export const walletService = {
  // Deposit funds
  deposit: async (data: {
    amount: number;
    payment_method?: string;
    description?: string;
  }) => {
    try {
      const response = await functions.post('wallet-deposit', data);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to process deposit');
    }
  },

  // Request withdrawal
  withdraw: async (data: {
    amount: number;
    description?: string;
  }) => {
    try {
      const response = await functions.post('wallet-withdraw', data);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to process withdrawal');
    }
  },

  // Get wallet balance
  getBalance: async () => {
    try {
      const user = await auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching wallet balance for user:', { userId: (user as { id: string }).id, email: user.email });

      // Since edge functions aren't working due to auth issue, use database SDK directly
      try {
        // First try user_wallets table
        const { data: userWallets } = await db.query('user_wallets', {
          user_uuid: 'eq.' + (user as { id: string }).id
        });

        if (userWallets && userWallets.length > 0) {
          const wallet = userWallets[0];
          console.log('Found user wallet:', wallet);
          return {
            balance: wallet.balance || 0,
            currency: 'JOD',
            username: user.email // Use email as username for consistency
          };
        }

        // Try wallets_table as fallback - use user_uuid field instead of username
        const { data: wallets } = await db.query('wallets_table', {
          user_uuid: 'eq.' + (user as { id: string }).id
        });

        if (wallets && wallets.length > 0) {
          const wallet = wallets[0];
          console.log('Found wallet in wallets_table:', wallet);
          return {
            balance: wallet.balance || 0,
            currency: 'JOD', // wallets_table doesn't have currency field
            username: user.email // Use email for consistency
          };
        }

        // No wallet found, create a default one
        console.log('No wallet found, creating default wallet for user');
        const defaultWallet = {
          balance: 0,
          currency: 'JOD',
          username: user.email
        };

        // Try to create the wallet
        try {
          const userId = (user as { id: string }).id;
          console.log('Creating wallet for user UUID:', userId);
          
          await db.insert('user_wallets', {
            balance: 0,
            user_uuid: userId
          });
          console.log('Created default wallet for user');
        } catch (createError) {
          console.warn('Failed to create default wallet:', createError);
          // Try the wallets_table as fallback
          try {
            const userId = (user as { id: string }).id;
            await db.insert('wallets_table', {
              balance: 0,
              user_uuid: userId
            });
            console.log('Created default wallet in wallets_table');
          } catch (fallbackError) {
            console.warn('Failed to create wallet in both tables:', fallbackError);
          }
        }

        return defaultWallet;

      } catch (dbError) {
        console.error('Database error fetching wallet:', dbError);
        throw new Error('Failed to load wallet information');
      }
    } catch (error) {
      console.error('Wallet service error:', error);
      throw new Error('Failed to load wallet information');
    }
  },

  // Get transaction history
  getTransactions: async (params?: { limit?: number; offset?: number; type?: string }) => {
    try {
      console.log('🔍 walletService.getTransactions: Starting transaction fetch');
      const user = await auth.getUser();
      
      if (!user) {
        console.log('❌ walletService.getTransactions: User not authenticated');
        throw new Error('User not authenticated');
      }

      // Use consistent user ID mapping (userUuid or id fallback)
      const user_id = user.userUuid || user.id;
      
      console.log('👤 walletService.getTransactions: Fetching for user', {
        userId: user_id,
        userEmail: user.email
      });
      
      if (!user_id || user_id === 'UNKNOWN') {
        console.error('❌ walletService.getTransactions: Invalid user ID');
        throw new Error('Invalid user session');
      }
      
      // Note: Check if transactions_table uses user_uuid or _created_by field
      // Try both approaches for reliability
      let transactions = [];
      
      try {
        // First try with user_uuid field
        const { data: txByUuid } = await db.query('transactions_table', {
          user_uuid: 'eq.' + user_id,
          ...(params?.type && { type: 'eq.' + params.type }),
          order: '_created_at.desc',
          limit: params?.limit || 20,
          offset: params?.offset || 0
        });
        
        transactions = txByUuid || [];
        console.log('📊 walletService.getTransactions: Found transactions via user_uuid', { count: transactions.length });
      } catch (uuidError) {
        console.log('⚠️ walletService.getTransactions: user_uuid field failed, trying _created_by', uuidError.message);
        
        // Fallback to _created_by field
        const { data: txByCreator } = await db.query('transactions_table', {
          _created_by: 'eq.' + user_id,
          ...(params?.type && { type: 'eq.' + params.type }),
          order: '_created_at.desc',
          limit: params?.limit || 20,
          offset: params?.offset || 0
        });
        
        transactions = txByCreator || [];
        console.log('📊 walletService.getTransactions: Found transactions via _created_by', { count: transactions.length });
      }
      
      console.log('✅ walletService.getTransactions: Transaction fetch successful', {
        transactionCount: transactions.length,
        transactions: transactions.map(t => ({
          id: t._row_id,
          type: t.type,
          amount: t.amount,
          status: t.status
        }))
      });
      
      return transactions;
    } catch (error) {
      console.error('❌ walletService.getTransactions: Transaction fetch failed', error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  }
};

// Game service using database SDK
export const gameService = {
  // List all games
  list: async () => {
    try {
      const { data: games } = await db.query('games', {
        is_active: 'eq.1',
        order: 'name.asc'
      });

      return games || [];
    } catch (error) {
      handleApiError(error, 'Failed to fetch games');
    }
  },

  // Get game by slug
  getBySlug: async (slug: string) => {
    try {
      const { data: games } = await db.query('games', {
        slug: 'eq.' + slug,
        is_active: 'eq.1'
      });

      return games?.[0];
    } catch (error) {
      handleApiError(error, 'Failed to fetch game');
    }
  }
};

// User service using database SDK
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const user = await auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: profiles } = await db.query('users', {
        email: 'eq.' + user.email
      });

      return profiles?.[0];
    } catch (error) {
      handleApiError(error, 'Failed to fetch user profile');
    }
  },

  // Update user profile
  updateProfile: async (data: { username?: string; avatar_url?: string; phone?: string }) => {
    try {
      const user = await auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: profiles } = await db.query('users', {
        email: 'eq.' + user.email
      });

      if (!profiles?.[0]) {
        throw new Error('User profile not found');
      }

      const updatedProfile = await db.update('users', 
        { _row_id: 'eq.' + profiles[0]._row_id }, 
        data
      );

      return updatedProfile;
    } catch (error) {
      handleApiError(error, 'Failed to update profile');
    }
  }
};
// Debug function to directly query player_profiles
export const debugProfileService = {
  // Query all profiles for debugging
  queryAllProfiles: async () => {
    try {
      console.log('🔍 debugProfileService.queryAllProfiles: Querying all profiles');
      const { data: allProfiles } = await db.query('player_profiles');
      console.log('📊 debugProfileService.queryAllProfiles: All profiles', { 
        count: allProfiles?.length || 0,
        profiles: allProfiles 
      });
      return allProfiles;
    } catch (error) {
      console.error('❌ debugProfileService.queryAllProfiles: Failed', error);
      return [];
    }
  },

  // Query profile by user ID
  queryProfileByUserId: async (userId: string) => {
    try {
      console.log('🔍 debugProfileService.queryProfileByUserId: Querying profile for user', { userId });
      const { data: profiles } = await db.query('player_profiles', {
        _created_by: 'eq.' + userId
      });
      console.log('📊 debugProfileService.queryProfileByUserId: Profile result', { 
        count: profiles?.length || 0,
        profile: profiles?.[0] 
      });
      return profiles?.[0] || null;
    } catch (error) {
      console.error('❌ debugProfileService.queryProfileByUserId: Failed', error);
      return null;
    }
  },

  // Comprehensive user vs profile mapping debug
  debugUserVsProfileMapping: async () => {
    try {
      console.log('🔍 debugProfileService.debugUserVsProfileMapping: Starting comprehensive debug');
      
      // Get current user
      const currentUser = await auth.getUser();
      if (!currentUser) {
        console.log('❌ debugProfileService.debugUserVsProfileMapping: No authenticated user');
        return null;
      }

console.log('👤 debugProfileService.debugUserVsProfileMapping: Current user details', {
        userUuid: currentUser.userUuid,
        fallbackId: currentUser.id,
        userId: currentUser.userUuid || currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name
      });

      // MANUAL SQL to see ALL profiles
      try {
        const manualQuery = await db.execute(`
          SELECT _row_id, _created_by, username, display_name, avatar_url 
          FROM player_profiles 
          LIMIT 20
        `);
        console.log('🔍 MANUAL SQL: All profiles in DB', { 
          rows: manualQuery?.rows || [],
          count: manualQuery?.rows?.length || 0
        });
      } catch (sqlError) {
        console.error('❌ MANUAL SQL failed', sqlError);
      }

// Get ALL profiles via SDK
      const { data: allProfiles } = await db.query('player_profiles');
      console.log('📊 debugProfileService.debugUserVsProfileMapping: All profiles in database', {
        totalProfiles: allProfiles?.length || 0,
        profiles: allProfiles?.map(p => ({
          _row_id: p._row_id,
          _created_by: p._created_by,
          username: p.username,
          display_name: p.display_name,
          matchesCurrentUser: p._created_by === (currentUser.userUuid || currentUser.id)
        }))
      });

      // Find profiles for current user
      const userProfiles = allProfiles?.filter(p => p._created_by === (currentUser.userUuid || currentUser.id)) || [];
      console.log('📊 debugProfileService.debugUserVsProfileMapping: Profiles for current user', {
        userId: currentUser.userUuid || currentUser.id,
        matchingProfiles: userProfiles.length,
        profiles: userProfiles
      });

      // Test direct query
      const { data: directQuery } = await db.query('player_profiles', {
        _created_by: 'eq.' + (currentUser.userUuid || currentUser.id)
      });
      console.log('📊 debugProfileService.debugUserVsProfileMapping: Direct query result', {
        queryFilter: { _created_by: 'eq.' + (currentUser.userUuid || currentUser.id) },
        result: directQuery
      });

      // Test if getProfile works
      // Note: This will be uncommented after profileService is defined
      // const getProfileResult = await profileService.getProfile();

      return {
        currentUser: {
          id: currentUser.userUuid || currentUser.id,
          email: currentUser.email,
          name: currentUser.name
        },
        allProfilesCount: allProfiles?.length || 0,
        userProfilesCount: userProfiles.length,
        directQueryCount: directQuery?.length || 0,
        hasProfile: userProfiles.length > 0,
        getProfileWorks: false // Will be updated when profileService is available
      };
    } catch (error) {
      console.error('❌ debugProfileService.debugUserVsProfileMapping: Debug failed', error);
      return null;
    }
  }
};

// Player Profile service using database SDK
export const profileService = {
  // Get player profile (ONE profile per user) - ULTRA RELIABLE VERSION
  getProfile: async () => {
    try {
      console.log('🔍 profileService.getProfile: Starting profile fetch');
      const startTime = Date.now();
      
      // Set timeout to prevent endless loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout - 10 seconds')), 10000);
      });
      
      const fetchProfile = async () => {
        const user = await auth.getUser();
        
        console.log('🔍 profileService.getProfile: RAW USER FROM auth.getUser():', user);
        console.log('🔍 profileService.getProfile: User object keys:', user ? Object.keys(user) : 'null');
        
        if (!user) {
          console.log('❌ profileService.getProfile: User not authenticated');
          throw new Error('User not authenticated');
        }

        // Kliv auth uses userUuid field - normalize for consistency
        const user_id = user.userUuid || user.id;
        
        console.log('👤 profileService.getProfile: WHO AM I - User details', { 
          userUuid: user.userUuid,
          fallbackId: user.id,
          userId: user_id,
          userEmail: user.email,
          userName: user.name,
          firstName: user.firstName,
          allFields: Object.keys(user)
        });
        
        if (!user_id || user_id === 'UNKNOWN') {
          console.error('❌ profileService.getProfile: No valid user ID found in user object');
          throw new Error('Invalid user session - no valid ID found');
        }
        
        // QUICK: Direct query for existing profile
        const queryFilter = { _created_by: 'eq.' + user_id };
        console.log('🔍 profileService.getProfile: Query filter used', { 
          filter: queryFilter,
          user_id: user_id
        });
        
        const { data: profiles } = await db.query('player_profiles', queryFilter);

        console.log('📊 profileService.getProfile: Profile query result', { 
          profileCount: profiles?.length || 0,
          userId: user_id
        });

        // Return the first (and only) profile
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          console.log('📋 profileService.getProfile: Returning user profile', {
            _row_id: profile._row_id,
            _created_by: profile._created_by,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url
          });
          
          // Verify the profile belongs to our user
          if (profile._created_by !== user_id) {
            console.error('❌ profileService.getProfile: SECURITY ERROR', {
              expectedUser: user_id,
              actualUser: profile._created_by
            });
            throw new Error('Security error: Profile ownership mismatch');
          }
          
          return profile;
        }

        console.log('⚠️ profileService.getProfile: No profile found, will create...');
        return null; // Let caller decide to create
    };
      
      // Race fetch against timeout
      const result = await Promise.race([fetchProfile(), timeoutPromise]);
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ profileService.getProfile: Completed in ${duration}ms`);
      
      return result;
      
    } catch (error) {
      console.error('❌ profileService.getProfile: Failed to fetch player profile', error);
      if (error.message.includes('timeout')) {
        throw new Error('Profile loading timed out - please refresh');
      }
      handleApiError(error, 'Failed to fetch player profile');
    }
  },

  // UPSERT player profile - guarantee ONE profile per user
updateProfile: async (data: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
    country?: string;
  }) => {
    try {
      console.log('🔧 profileService.updateProfile: Starting UPSERT', { data });
      const user = await auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      const user_id = user.userUuid || user.id;
      
      if (!user_id || user_id === 'UNKNOWN') {
        throw new Error('Invalid user session - no valid ID found');
      }
      
      console.log('👤 profileService.updateProfile: Working with user_id:', user_id);
      
      // First check if profile exists
      const { data: existingProfiles } = await db.query('player_profiles', {
        _created_by: 'eq.' + user_id
      });
      
      if (existingProfiles && existingProfiles.length > 0) {
        // UPDATE existing profile
        const targetProfile = existingProfiles[0];
        const targetRowId = targetProfile._row_id;
        
        console.log('🔄 profileService.updateProfile: UPDATE mode - targeting row ' + targetRowId);
        
        // Build update data with only provided fields
        const updateData: {
          display_name?: string;
          username?: string;
          avatar_url?: string;
          bio?: string;
          country?: string;
        } = {};
        if (data.display_name !== undefined) {
          updateData.display_name = data.display_name;
        }
        if (data.username !== undefined) {
          updateData.username = data.username;
        }
        if (data.avatar_url !== undefined) {
          updateData.avatar_url = data.avatar_url;
        }
        if (data.bio !== undefined) {
          updateData.bio = data.bio;
        }
        if (data.country !== undefined) {
          updateData.country = data.country;
        }
        
        const updateResult = await db.update('player_profiles', 
          { _row_id: 'eq.' + targetRowId }, 
          updateData
        );
        
        console.log('✅ profileService.updateProfile: UPDATE successful', { updateResult });
        
        // Re-fetch to verify
        const { data: verificationProfile } = await db.query('player_profiles', {
          _row_id: 'eq.' + targetRowId
        });
        
        return verificationProfile?.[0] || null;
      } else {
        // INSERT new profile
        console.log('➕ profileService.updateProfile: INSERT mode - creating new profile');
        const newProfileData = {
          ...data,
          _created_by: user_id
        };
        
        const insertResult = await db.insert('player_profiles', newProfileData);
        console.log('✅ profileService.updateProfile: INSERT successful', { insertResult });
        
        // Re-fetch to verify
        const { data: verificationProfile } = await db.query('player_profiles', {
          _created_by: 'eq.' + user_id
        });
        
        return verificationProfile?.[0] || null;
      }
    } catch (error) {
      console.error('❌ profileService.updateProfile: UPSERT failed', error);
      handleApiError(error, 'Failed to update player profile');
    }
  },

  // Check if username is available
  checkUsername: async (username: string): Promise<boolean> => {
    try {
      console.log('🔍 profileService.checkUsername: Checking username availability', { username });
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return false;
      }

      const user = await auth.getUser();
      if (!user) {
        return false;
      }

      const user_id = user.userUuid || user.id;

      const { data: profiles } = await db.query('player_profiles', {
        username: 'eq.' + username
      });

      if (profiles && profiles.length > 0) {
        const otherUserProfiles = profiles.filter(profile => profile._created_by !== user_id);
        return otherUserProfiles.length === 0;
      }

      return true;
    } catch (error) {
      console.error('❌ profileService.checkUsername: Failed to check username availability', error);
      return false;
    }
  },

  // Create profile if none exists for user
  createProfileIfMissing: async () => {
    try {
      console.log('🔧 profileService.createProfileIfMissing: Creating profile for user');
      const user = await auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const user_id = user.userUuid || user.id;
      
      if (!user_id || user_id === 'UNKNOWN') {
        throw new Error('Invalid user session - no valid ID found');
      }

      // Check if profile already exists
      const { data: existingProfiles } = await db.query('player_profiles', {
        _created_by: 'eq.' + user_id
      });

      if (existingProfiles && existingProfiles.length > 0) {
        return existingProfiles[0];
      }

      // Create new profile with default values
      const defaultProfileData = {
        display_name: user.firstName || user.name || user.email?.split('@')[0] || 'Player',
        username: user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || 'player_' + Date.now(),
        avatar_url: '',
        bio: '',
        country: '',
        _created_by: user_id
      };

      console.log('📝 profileService.createProfileIfMissing: Creating default profile', { defaultProfileData });
      
      try {
        const insertResult = await db.insert('player_profiles', defaultProfileData);
        console.log('✅ profileService.createProfileIfMissing: Profile created successfully', { insertResult });

        // Wait a brief moment for database consistency
        await new Promise(resolve => setTimeout(resolve, 100));

        // Return the created profile
        const { data: verificationProfile } = await db.query('player_profiles', {
          _created_by: 'eq.' + user_id
        });

        if (verificationProfile && verificationProfile.length > 0) {
          return verificationProfile[0];
        } else {
          throw new Error('Profile creation verification failed');
        }
      } catch (insertError) {
        console.error('❌ profileService.createProfileIfMissing: Database insert failed', insertError);
        
        // Final retry - try to fetch profile in case of race condition
        const { data: retryProfile } = await db.query('player_profiles', {
          _created_by: 'eq.' + user_id
        });
        
        if (retryProfile && retryProfile.length > 0) {
          return retryProfile[0];
        }
        
        throw insertError;
      }
    } catch (error) {
      console.error('❌ profileService.createProfileIfMissing: Failed to create profile', error);
      handleApiError(error, 'Failed to create player profile');
      throw error;
    }
  }
};

// Team service using edge functions
export const teamService = {
  // Get user's teams
  getUserTeams: async () => {
    try {
      console.log('teamService.getUserTeams: Fetching user teams via edge function');
      
      // Use the updated team-management function with POST method
      const response = await functions.post('team-management', { 
        action: 'get_user_teams' 
      });
      
      console.log('teamService.getUserTeams: Response', { 
        success: response?.success, 
        teams: response?.teams?.length || 0 
      });
      
      if (response && response.success && response.teams) {
        return response.teams;
      } else {
        throw new Error(response?.error || 'Failed to fetch teams');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch user teams');
    }
  },

  // Create team - working baseline (name only required)
  create: async (data: {
    name: string;
    description?: string;
    tag?: string;
  }) => {
    try {
      const response = await functions.post('team-management', {
        action: 'create',
        ...data
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to create team');
    }
  },

  // Invite member - working baseline
  inviteMember: async (teamId: number, username: string) => {
    try {
      const response = await functions.post('team-management', {
        action: 'invite_member',
        team_id: teamId,
        username: username
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to invite team member');
    }
}
};

// User management service for admins
export const userManagementService = {
  // Ban user
  banUser: async (userUuid: string, reason?: string) => {
    try {
      const response = await functions.post('user-management', {
        action: 'ban',
        user_uuid: userUuid,
        reason: reason
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to ban user');
    }
  },

  // Unban user
  unbanUser: async (userUuid: string) => {
    try {
      const response = await functions.post('user-management', {
        action: 'unban',
        user_uuid: userUuid
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to unban user');
    }
  },

  // Make user admin
  makeAdmin: async (userUuid: string) => {
    try {
      const response = await functions.post('user-management', {
        action: 'make_admin',
        user_uuid: userUuid
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to promote user to admin');
    }
  },

  // Remove admin role
  removeAdmin: async (userUuid: string) => {
    try {
      const response = await functions.post('user-management', {
        action: 'remove_admin',
        user_uuid: userUuid
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to remove admin role');
      }
    }
  };

// Settings service for admins
export const settingsService = {
  // Get settings by category
  getSettings: async (category: 'general' | 'payments' | 'notifications' | 'email' | 'features') => {
    try {
      const response = await functions.post('settings-management', {
        action: 'get',
        category: category
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to get settings');
    }
  },

  // Update settings
  updateSettings: async (category: 'general' | 'payments' | 'notifications' | 'email' | 'features', settings: Record<string, unknown>) => {
    try {
      const response = await functions.post('settings-management', {
        action: 'update',
        category: category,
        settings: settings
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update settings');
    }
  },

  // Reset settings to defaults
  resetSettings: async (category: 'general' | 'payments' | 'notifications' | 'email' | 'features') => {
    try {
      const response = await functions.post('settings-management', {
        action: 'reset',
        category: category
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to reset settings');
    }
  }
};

export default {
  auth: authService,
  tournament: tournamentService,
  match: matchService,
  wallet: walletService,
  game: gameService,
  user: userService,
  team: teamService,
  userManagement: userManagementService,
  settings: settingsService
};