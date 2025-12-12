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
    const { tournament_id } = body;

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

    // Check if tournament allows unregistration (only during registration phase)
    if (tournament.status !== 'registration' && tournament.status !== 'draft') {
      return Response.json({ 
        error: "Cannot unregister after registration period has ended" 
      }, { status: 400 });
    }

    // Check if user is actually registered
    const existingRegQuery = `
      SELECT _row_id, joined_at FROM tournament_players 
      WHERE tournament_row_id = ? AND user_uuid = ?
    `;
    const existingRegStmt = conn.prepare(existingRegQuery);
    const existingReg = await existingRegStmt.get([tournament_id, userUuid]);

    if (!existingReg) {
      return Response.json({ 
        error: "You are not registered for this tournament" 
      }, { status: 400 });
    }

    // Check for abuse prevention - prevent unregistering if just registered (cooldown period)
    const cooldownResult = existingReg; // We already have the joined_at
    
    if (cooldownResult) {
      const joinedAt = cooldownResult.joined_at;
      const now = Math.floor(Date.now() / 1000);
      const timeSinceJoin = now - joinedAt;
      
      // 5 minute cooldown period (300 seconds)
      const COOLDOWN_PERIOD = 300;
      
      if (timeSinceJoin < COOLDOWN_PERIOD) {
        const remainingCooldown = Math.ceil((COOLDOWN_PERIOD - timeSinceJoin) / 60);
        return Response.json({ 
          error: `Please wait ${remainingCooldown} minutes before unregistering to prevent abuse` 
        }, { status: 400 });
      }
    }

    // Get entry fee for refund
    const entryFee = tournament.entry_fee || 0;

    // Remove registration
    const deleteQuery = `
      DELETE FROM tournament_players 
      WHERE tournament_row_id = ? AND user_uuid = ?
    `;
    const deleteStmt = conn.prepare(deleteQuery);
    await deleteStmt.run([tournament_id, userUuid]);

    // Update tournament player count
    const updateQuery = "UPDATE tournaments SET current_players = current_players - 1 WHERE _row_id = ?";
    const updateStmt = conn.prepare(updateQuery);
    await updateStmt.run([tournament_id]);

    // Refund entry fee to wallet if there was one
    let refundMessage = "";
    if (entryFee > 0) {
      // Check if user has a wallet record
      const walletQuery = "SELECT balance FROM wallets WHERE user_uuid = ?";
      const walletStmt = conn.prepare(walletQuery);
      const wallet = await walletStmt.get([userUuid]);

      if (wallet) {
        // Update existing wallet
        const updateWalletQuery = `
          UPDATE wallets SET balance = balance + ?, updated_at = ? 
          WHERE user_uuid = ?
        `;
        const updateWalletStmt = conn.prepare(updateWalletQuery);
        await updateWalletStmt.run([entryFee, Math.floor(Date.now() / 1000), userUuid]);
      } else {
        // Create new wallet record
        const createWalletQuery = `
          INSERT INTO wallets (user_uuid, balance, created_at, updated_at) 
          VALUES (?, ?, ?, ?)
        `;
        const createWalletStmt = conn.prepare(createWalletQuery);
        await createWalletStmt.run([userUuid, entryFee, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)]);
      }

      // Create transaction record for the refund
      const transactionQuery = `
        INSERT INTO wallet_transactions (
          user_uuid, amount, type, description, reference_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const transactionStmt = conn.prepare(transactionQuery);
      await transactionStmt.run([
        userUuid,
        entryFee,
        'refund',
        `Tournament unregistration refund: ${tournament.title}`,
        tournament_id,
        Math.floor(Date.now() / 1000)
      ]);

      refundMessage = ` ${entryFee} JD refunded to your wallet`;
    }

    return Response.json({
      success: true,
      message: `Successfully unregistered from tournament${refundMessage}`,
      refund_amount: entryFee > 0 ? entryFee : null
    });

  } catch (error) {
    console.error('Tournament unregister error:', error);
    return Response.json({ 
      success: false, 
      error: "Failed to unregister from tournament" 
    }, { status: 500 });
  }
}