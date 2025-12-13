import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, CreditCard, Download, Plus, Minus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { walletService } from '@/lib/api';
import auth from '@/lib/shared/kliv-auth.js';

interface Transaction {
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

interface User {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

const Wallet = () => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const currentUser = await auth.getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        // Load wallet balance
        const walletBalance = await walletService.getBalance();
        setBalance(walletBalance?.balance || 0);

        // Load transactions
        const transactionHistory = await walletService.getTransactions();
        setTransactions(transactionHistory || []);
      } catch (error) {
        console.error('Failed to load wallet data:', error);
        toast({
          title: "Error",
          description: "Failed to load wallet information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadWalletData();
  }, [navigate, toast]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'withdraw':
        return <Minus className="w-4 h-4 text-red-500" />;
      case 'tournament_entry':
        return <Minus className="w-4 h-4 text-orange-500" />;
      case 'tournament_prize':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Wallet className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'tournament_prize':
        return 'text-green-500';
      case 'withdraw':
      case 'tournament_entry':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground font-gaming">Loading wallet...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">My Wallet</h1>
            <p className="text-muted-foreground font-gaming">
              Manage your funds and track tournament earnings
            </p>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-border mb-8 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Current Balance</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-muted-foreground"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex items-baseline space-x-2">
                <span className="font-display text-3xl sm:text-4xl font-bold">
                  {showBalance ? `${balance.toFixed(2)}` : '••••'}
                </span>
                <span className="text-lg sm:text-xl text-muted-foreground font-gaming">
                  {showBalance ? 'JOD' : ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button className="font-gaming text-sm sm:text-base px-4 sm:px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Deposit Funds
                </Button>
                <Button variant="outline" className="font-gaming text-sm sm:text-base px-4 sm:px-6">
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-card border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-gaming">Total Winnings</p>
                  <p className="font-display font-semibold text-green-500">450.00 JOD</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-gaming">Total Deposits</p>
                  <p className="font-display font-semibold text-blue-500">750.00 JOD</p>
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-gaming">Tournament Fees</p>
                  <p className="font-display font-semibold text-orange-500">300.00 JOD</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border">
              <h3 className="font-display text-lg sm:text-xl font-semibold">Transaction History</h3>
            </div>
            
            <Tabs defaultValue="all" className="p-4 sm:p-6">
              <TabsList className="bg-muted p-1 mb-6 w-full overflow-x-auto flex flex-nowrap">
                <TabsTrigger value="all" className="font-gaming flex-shrink-0">All</TabsTrigger>
                <TabsTrigger value="deposits" className="font-gaming flex-shrink-0">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals" className="font-gaming flex-shrink-0">Withdrawals</TabsTrigger>
                <TabsTrigger value="tournaments" className="font-gaming flex-shrink-0">Tournaments</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction._row_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-gaming font-semibold">
                            {transaction.type.replace('_', ' ').charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </p>
                          <p className="text-sm text-muted-foreground font-gaming">
                            {transaction.description || transaction.payment_method || 'No description'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="sm:text-right">
                        <p className={`font-display font-semibold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'deposit' || transaction.type === 'tournament_prize' ? '+' : '-'}
                          {Math.abs(transaction.amount).toFixed(2)} JOD
                        </p>
                        <p className="text-xs text-muted-foreground font-gaming">
                          {formatDate(transaction.created_at)}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="deposits">
                <div className="text-center py-8 text-muted-foreground">
                  No deposit transactions
                </div>
              </TabsContent>

              <TabsContent value="withdrawals">
                <div className="text-center py-8 text-muted-foreground">
                  No withdrawal transactions
                </div>
              </TabsContent>

              <TabsContent value="tournaments">
                <div className="text-center py-8 text-muted-foreground">
                  No tournament transactions
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;