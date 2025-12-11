import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Shield,
  Edit,
  Eye,
  MoreHorizontal,
  Filter,
  UserX,
  UserCheck,
  Ban
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { userManagementService } from '@/lib/api';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type User = {
    _row_id: number;
    id: string; // UUID
    email: string;
    username?: string;
    role: string;
    created_at: number;
    last_login?: number;
    status?: string;
    avatar_url?: string;
  };

  // Load users from database
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', roleFilter, statusFilter],
    queryFn: async () => {
      // For now, we'll use a basic approach - this would need a proper users API endpoint
      // Since we don't have a users list endpoint, we'll return empty for now
      // In a real implementation, you'd create a users-list edge function
      return {
        users: [] // Empty until proper users API is implemented
      };
    }
  });

  const users = usersData?.users || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-success/20 text-success border-success/30' },
      inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
      banned: { label: 'Banned', className: 'bg-destructive/20 text-destructive border-destructive/30' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      player: { label: 'Player', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      moderator: { label: 'Moderator', className: 'bg-green-100 text-green-800 border-green-200' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.player;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'dd MMM yyyy');
  };

  const filteredUsers = users.filter((user: User) => {
    if (searchQuery && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleBanUser = async (userId: string, userEmail: string) => {
    try {
      const result = await userManagementService.banUser(userId, "Banned by admin");
      
      if (result && result.success) {
        toast({
          title: "User Banned",
          description: `${userEmail} has been banned successfully`,
        });
        refetch();
      } else {
        throw new Error(result?.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Ban user error:', error);
      toast({
        title: "Ban Failed",
        description: error instanceof Error ? error.message : "Failed to ban user",
        variant: "destructive"
      });
    }
  };

  const handleUnbanUser = async (userId: string, userEmail: string) => {
    try {
      const result = await userManagementService.unbanUser(userId);
      
      if (result && result.success) {
        toast({
          title: "User Unbanned",
          description: `${userEmail} has been unbanned successfully`,
        });
        refetch();
      } else {
        throw new Error(result?.error || 'Failed to unban user');
      }
    } catch (error) {
      console.error('Unban user error:', error);
      toast({
        title: "Unban Failed",
        description: error instanceof Error ? error.message : "Failed to unban user",
        variant: "destructive"
      });
    }
  };

  const handleMakeAdmin = async (userId: string, userEmail: string) => {
    try {
      const result = await userManagementService.makeAdmin(userId);
      
      if (result && result.success) {
        toast({
          title: "Admin Role Assigned",
          description: `${userEmail} has been promoted to admin`,
        });
        refetch();
      } else {
        throw new Error(result?.error || 'Failed to promote user to admin');
      }
    } catch (error) {
      console.error('Make admin error:', error);
      toast({
        title: "Promotion Failed",
        description: error instanceof Error ? error.message : "Failed to promote user to admin",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAdmin = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove admin role from ${userEmail}?`)) {
      return;
    }
    
    try {
      const result = await userManagementService.removeAdmin(userId);
      
      if (result && result.success) {
        toast({
          title: "Admin Role Removed",
          description: `${userEmail} admin role has been removed`,
        });
        refetch();
      } else {
        throw new Error(result?.error || 'Failed to remove admin role');
      }
    } catch (error) {
      console.error('Remove admin error:', error);
      toast({
        title: "Role Removal Failed",
        description: error instanceof Error ? error.message : "Failed to remove admin role",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-gaming mb-4">Failed to load users</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}>
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
          <h1 className="font-display text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground font-gaming">
            Manage platform users and permissions
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 font-gaming">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.status === 'banned').length}
                </p>
                <p className="text-sm text-muted-foreground">Banned</p>
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-gaming flex items-center justify-between">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Users ({filteredUsers.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground font-gaming mb-4">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No users registered yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: User) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.username || user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium font-gaming">{user.username || user.email}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status || 'active')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.last_login ? formatDate(user.last_login) : 'Never'}
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
                            <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/users/edit/${user.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.role === 'admin' ? (
                              <DropdownMenuItem onClick={() => handleRemoveAdmin(user.id, user.email)}>
                                <UserX className="mr-2 h-4 w-4" />
                                Remove Admin Role
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleMakeAdmin(user.id, user.email)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.status === 'banned' ? (
                              <DropdownMenuItem onClick={() => handleUnbanUser(user.id, user.email)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleBanUser(user.id, user.email)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
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

export default AdminUsers;