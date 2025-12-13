import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { walletService } from '@/lib/api';

interface WalletBalance {
  current_balance: number;
  total_won: number;
  pending_withdrawals: number;
  total_withdrawn: number;
}

interface WalletTransaction {
  _row_id: number;
  type: string;
  amount: number;
  description?: string;
  status: string;
  _created_at: number;
  payment_method?: string;
  reference_type?: string;
  reference_id?: number;
}

export default function Wallet() {
  console.count("Wallet render");
  
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<WalletBalance>({
    current_balance: 0,
    total_won: 0,
    pending_withdrawals: 0,
    total_withdrawn: 0
  });
  
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // C3: Throttled toast refs - separate for balance and transactions
  const balanceErrorShownRef = useRef(false);
  const transactionsErrorShownRef = useRef(false);

  // Only fetch balance when user.uuid is available
  useEffect(() => {
    let aborted = false;
    const didLoadRef = { current: false };

    const fetchBalance = async () => {
      try {
        console.log(" WALLET: Starting balance fetch");
        
        if (didLoadRef.current) {
          console.log(" WALLET: Already loading balance - skipping");
          return;
        }
        didLoadRef.current = true;

        const data = await walletService.getBalance();
        console.log(" WALLET: Balance data:", data);

        if (!aborted && data) {
          setBalance({
            current_balance: data.balance || 0,
            total_won: 0, // Not available in current service
            pending_withdrawals: data.pending_withdrawal || 0, // From user_wallets table
            total_withdrawn: 0 // Not available in current service
          });
        }
      } catch (err) {
        if (aborted) return;
        console.error(" WALLET: Balance fetch error:", err);
        
        // C3: Throttled toast for balance errors
        if (!balanceErrorShownRef.current) {
          balanceErrorShownRef.current = true;
          toast({
            title: "Balance Error",
            description: "Failed to load balance. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (!aborted) {
          setLoading(false);
          console.log(" WALLET: Balance fetch complete, loading=false");
        }
      }
    };

    // 10-second timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Balance fetch timeout')), 10000);
    });

    (async () => {
      try {
        await Promise.race([fetchBalance(), timeoutPromise]);
      } catch (err) {
        if (!aborted) {
          console.error(" WALLET: Balance fetch failed or timed out:", err);
          
          // C3: Throttled toast for timeout errors
          if (!balanceErrorShownRef.current) {
            balanceErrorShownRef.current = true;
            toast({
              title: "Balance Error", 
              description: "Balance request timed out. Please refresh.",
              variant: "destructive",
            });
          }
          
          setLoading(false);
        }
      }
    })();

    return () => {
      aborted = true;
      console.log(" WALLET: Balance effect cleanup");
    };
  }, []); // Dependency array is empty - effect runs once
  
  // Separate effect for transactions - C2
  useEffect(() => {
    let aborted = false;
    const didLoadRef = { current: false };

    const fetchTransactions = async () => {
      try {
        console.log(" WALLET: Starting transactions fetch");
        
        if (didLoadRef.current) {
          console.log(" WALLET: Already loading transactions - skipping");
          return;
        }
        didLoadRef.current = true;

        const data = await walletService.getTransactions();
        console.log(" WALLET: Transactions data:", data);

        if (!aborted && Array.isArray(data)) {
          setTransactions(data);
        }
      } catch (err) {
        if (aborted) return;
        console.error(" WALLET: Transactions fetch error:", err);
        
        // C3: Throttled toast for transactions errors
        if (!transactionsErrorShownRef.current) {
          transactionsErrorShownRef.current = true;
          toast({
            title: "Transactions Error",
            description: "Failed to load transaction history. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        if (!aborted) {
          setTransactionsLoading(false);
          console.log(" WALLET: Transactions fetch complete, loading=false");
        }
      }
    };

    // 10-second timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Transactions fetch timeout')), 10000);
    });

    (async () => {
      try {
        await Promise.race([fetchTransactions(), timeoutPromise]);
      } catch (err) {
        if (!aborted) {
          console.error(" WALLET: Transactions fetch failed or timed out:", err);
          
          // C3: Throttled toast for timeout errors
          if (!transactionsErrorShownRef.current) {
            transactionsErrorShownRef.current = true;
            toast({
              title: "Transactions Error",
              description: "Transaction request timed out. Please refresh.",
              variant: "destructive",
            });
          }
          
          setTransactionsLoading(false);
        }
      }
    })();

    return () => {
      aborted = true;
      console.log(" WALLET: Transactions effect cleanup");
    };
  }, []); // Separate empty dependency array - effect runs once independently
  
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your tournament winnings and transactions</p>
        </div>

        {/* Balance Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              {loading ? (
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 mt-1">JD {balance.current_balance.toFixed(2)}</p>
              )}
            </div>
            <div className="text-green-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"/>
              </svg>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Won</div>
            {loading ? (
              <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-semibold text-gray-900">JD {balance.total_won.toFixed(2)}</div>
            )}
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending</div>
            {loading ? (
              <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-semibold text-yellow-600">JD {balance.pending_withdrawals.toFixed(2)}</div>
            )}
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Withdrawn</div>
            {loading ? (
              <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-semibold text-gray-900">JD {balance.total_withdrawn.toFixed(2)}</div>
            )}
          </Card>
        </div>

        {/* Transaction History with Tabs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
          
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">All transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction._row_id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'tournament' ? 'bg-purple-100' :
                          transaction.type === 'deposit' ? 'bg-green-100' :
                          transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {transaction.type === 'tournament' && (
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                            </svg>
                          )}
                          {transaction.type === 'deposit' && (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                          {transaction.type === 'withdrawal' && (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description || 'Transaction'}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction._created_at * 1000).toLocaleDateString()} • {transaction.status}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}JD {Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="deposits" className="mt-4">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              ) : transactions.filter(tx => tx.type === 'deposit').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p>No deposits yet</p>
                  <p className="text-sm mt-1">Deposits will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(tx => tx.type === 'deposit').map((transaction) => (
                    <div key={transaction._row_id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description || 'Deposit'}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction._created_at * 1000).toLocaleDateString()} • {transaction.status}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-green-600">
                        +JD {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-4">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              ) : transactions.filter(tx => tx.type === 'withdrawal').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <p>No withdrawals yet</p>
                  <p className="text-sm mt-1">Withdrawals will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(tx => tx.type === 'withdrawal').map((transaction) => (
                    <div key={transaction._row_id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description || 'Withdrawal'}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction._created_at * 1000).toLocaleDateString()} • {transaction.status}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-red-600">
                        -JD {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tournaments" className="mt-4">
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              ) : transactions.filter(tx => tx.type === 'tournament').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <p>No tournament winnings yet</p>
                  <p className="text-sm mt-1">Tournament prizes will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(tx => tx.type === 'tournament').map((transaction) => (
                    <div key={transaction._row_id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description || 'Tournament Prize'}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction._created_at * 1000).toLocaleDateString()} • {transaction.status}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-green-600">
                        +JD {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}