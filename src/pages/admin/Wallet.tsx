import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Search, 
  Calendar, 
  Users, 
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const AdminWallet = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type Transaction = {
    _row_id: number;
    username: string;
    email: string;
    amount: number;
    type: string;
    status: string;
    description?: string;
    payment_method?: string;
    reference_id: string;
    created_at: number;
    updated_at: number;
  };

  type WalletStats = {
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalPrizePayouts: number;
    platformRevenue: number;
    pendingWithdrawals: number;
  };

  // Mock data for now - will be replaced with real API call
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['admin-wallet-transactions', statusFilter, typeFilter],
    queryFn: async () => {
      // Simulate API call
      return {
        transactions: [
          {
            _row_id: 1,
            username: 'testplayer',
            email: 'test@user.com',
            amount: 50.00,
            type: 'deposit',
            status: 'completed',
            description: 'Initial deposit',
            payment_method: 'credit_card',
            reference_id: 'TXN_001',
            created_at: Date.now() / 1000 - 3600,
            updated_at: Date.now() / 1000 - 3600
          },
          {
            _row_id: 2,
            username: 'testplayer',
            email: 'test@user.com',
            amount: 25.00,
            type: 'tournament_entry',
            status: 'completed',
            description: 'ArenaJo Championship entry',
            payment_method: 'wallet',
            reference_id: 'TXN_002',
            created_at: Date.now() / 1000 - 1800,
            updated_at: Date.now() / 1000 - 1800
          },
          {
            _row_id: 3,
            username: 'winner123',
            email: 'winner@example.com',
            amount: 100.00,
            type: 'tournament_prize',
            status: 'completed',
            description: 'Tournament winnings',
            payment_method: 'wallet',
            reference_id: 'TXN_003',
            created_at: Date.now() / 1000 - 900,
            updated_at: Date.now() / 1000 - 900
          },
          {
            _row_id: 4,
            username: 'cashout_user',
            email: 'cashout@example.com',
            amount: 75.00,
            type: 'withdraw',
            status: 'pending',
            description: 'Withdrawal request',
            payment_method: 'bank_transfer',
            reference_id: 'TXN_004',
            created_at: Date.now() / 1000 - 600,
            updated_at: Date.now() / 1000 - 600
          }
        ]
      };
    }
  });

  // Mock stats data
  const { data: stats } = useQuery({
    queryKey: ['admin-wallet-stats'],
    queryFn: async () => {
      return {
        totalTransactions: 4,
        totalDeposits: 50.00,
        totalWithdrawals: 75.00,
        totalPrizePayouts: 100.00,
        platformRevenue: 5.00,
        pendingWithdrawals: 75.00
      } as WalletStats;
    }
  });

  const transactions = transactionsData?.transactions || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-warning/20 text-warning border-warning/30', icon: Clock },
      completed: { label: 'Completed', className: 'bg-success/20 text-success border-success/30', icon: CheckCircle },
      failed: { label: 'Failed', className: 'bg-destructive/20 text-destructive border-destructive/30', icon: XCircle },
      cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      deposit: { label: 'Deposit', className: 'bg-green-100 text-green-800 border-green-200' },
      withdraw: { label: 'Withdraw', className: 'bg-red-100 text-red-800 border-red-200' },
      tournament_entry: { label: 'Tournament Entry', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      tournament_prize: { label: 'Prize Payout', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      refund: { label: 'Refund', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.deposit;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatAmount = (amount: number, type: string) => {
    const isPositive = type === 'deposit' || type === 'tournament_prize' || type === 'refund';
    return (
      <span className={`font-display font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? '+' : '-'}{Math.abs(amount).toFixed(2)} JOD
      </span>
    );
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'dd MMM yyyy HH:mm');
  };

  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    if (searchQuery && 
        !transaction.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transaction.reference_id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleApproveWithdrawal = (transactionId: number, amount: number) => {
    toast({
      title: "Withdrawal Approved",
      description: `Withdrawal of ${amount.toFixed(2)} JOD has been approved and processed`,
    });
    queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-wallet-stats'] });
  };

  const handleRejectWithdrawal = (transactionId: number, amount: number) => {
    toast({
      title: "Withdrawal Rejected",
      description: `Withdrawal of ${amount.toFixed(2)} JOD has been rejected`,
      variant: "destructive"
    });
    queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-wallet-stats'] });
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-gaming mb-4">Failed to load wallet data</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-wallet-transactions'] })}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground font-gaming">
            Manage wallet transactions and platform finances
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 font-gaming">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalTransactions || 0}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{(stats?.totalDeposits || 0).toFixed(2)} JOD</p>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{(stats?.totalWithdrawals || 0).toFixed(2)} JOD</p>
                <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{(stats?.pendingWithdrawals || 0).toFixed(2)} JOD</p>
                <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{(stats?.totalPrizePayouts || 0).toFixed(2)} JOD</p>
                <p className="text-sm text-muted-foreground">Prize Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{(stats?.platformRevenue || 0).toFixed(2)} JOD</p>
                <p className="text-sm text-muted-foreground">Platform Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-cyan-500" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(transactions.map(t => t.email)).size}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-gaming flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdraw">Withdrawals</SelectItem>
                <SelectItem value="tournament_entry">Tournament Entries</SelectItem>
                <SelectItem value="tournament_prize">Prize Payouts</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-gaming flex items-center justify-between">
            <span className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Transactions ({filteredTransactions.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20">
              <Wallet className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground font-gaming mb-4">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No transactions have been recorded yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: Transaction) => (
                    <TableRow key={transaction._row_id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium font-gaming">{transaction.username}</div>
                          <div className="text-sm text-muted-foreground">{transaction.email}</div>
                          <div className="text-xs text-muted-foreground">Ref: {transaction.reference_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(transaction.type)}
                      </TableCell>
                      <TableCell>
                        {formatAmount(transaction.amount, transaction.type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {transaction.payment_method ? 
                            transaction.payment_method.replace('_', ' ').charAt(0).toUpperCase() + 
                            transaction.payment_method.slice(1) 
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(transaction.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/profile/${transaction.username}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View User Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {transaction.type === 'withdraw' && transaction.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  className="text-success"
                                  onClick={() => handleApproveWithdrawal(transaction._row_id, transaction.amount)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve Withdrawal
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleRejectWithdrawal(transaction._row_id, transaction.amount)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject Withdrawal
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWallet;