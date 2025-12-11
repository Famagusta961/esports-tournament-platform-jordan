import { useState, useEffect } from 'react';
import { Settings, Save, Globe, Shield, Bell, Palette, CreditCard, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { settingsService } from '@/lib/api';

const AdminSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ArenaJo',
    siteDescription: 'Premier Esports Tournament Platform for Jordan and MENA',
    contactEmail: 'info@arenajo.com',
    timezone: 'Asia/Amman',
    currency: 'JOD',
    language: 'en'
  });

  // Tournament Settings
  const [tournamentSettings, setTournamentSettings] = useState({
    defaultEntryFee: 5.00,
    platformFeePercentage: 10,
    minPlayersPerTournament: 2,
    maxPlayersPerTournament: 1000,
    defaultRegistrationDeadline: 24, // hours before tournament
    autoApproveResults: false,
    requireScreenshotForResults: true,
    allowSelfRegistration: true
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    enableDeposits: true,
    enableWithdrawals: true,
    minWithdrawalAmount: 10.00,
    maxWithdrawalAmount: 5000.00,
    pendingWithdrawalPeriod: 48, // hours
    platformFee: 0.50, // fixed fee per withdrawal
    enableCreditCard: true,
    enableBankTransfer: true,
    enableMobileWallets: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    tournamentReminders: true,
    resultNotifications: true,
    paymentNotifications: true,
    welcomeEmail: true
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.arenajo.com',
    smtpPort: 587,
    smtpUsername: 'noreply@arenajo.com',
    smtpPassword: '********',
    emailFromName: 'ArenaJo Team',
    emailFromAddress: 'noreply@arenajo.com'
  });

  const loadSettings = async () => {
    try {
      // Load settings for each category
      const categories = ['general', 'payments', 'notifications', 'email'] as const;
      
      for (const category of categories) {
        const result = await settingsService.getSettings(category);
        
        if (result && result.success && result.settings) {
          const settings = result.settings as Record<string, unknown>;
          
          switch (category) {
            case 'general':
              setGeneralSettings({
                siteName: (settings.site_name as string) || 'ArenaJo',
                siteDescription: (settings.site_description as string) || 'Premier Esports Tournament Platform for Jordan and MENA',
                contactEmail: (settings.contact_email as string) || 'info@arenajo.com',
                timezone: (settings.timezone as string) || 'Asia/Amman',
                currency: (settings.currency as string) || 'JOD',
                language: (settings.language as string) || 'en'
              });
              break;
              
            case 'payments':
              setPaymentSettings({
                enableDeposits: (settings.enable_deposits as boolean) ?? true,
                enableWithdrawals: (settings.enable_withdrawals as boolean) ?? true,
                minWithdrawalAmount: (settings.min_withdrawal_amount as number) || 10.00,
                maxWithdrawalAmount: (settings.max_withdrawal_amount as number) || 5000.00,
                pendingWithdrawalPeriod: (settings.withdrawal_pending_days as number) || 48,
                platformFee: (settings.platform_fee_percentage as number) || 0.50,
                enableCreditCard: ((settings.payment_methods as string[]) || []).includes('credit_card'),
                enableBankTransfer: ((settings.payment_methods as string[]) || []).includes('bank_transfer'),
                enableMobileWallets: ((settings.payment_methods as string[]) || []).includes('mobile_wallets')
              });
              break;
              
            case 'notifications':
              setNotificationSettings({
                emailNotifications: (settings.email_notifications as boolean) ?? true,
                smsNotifications: (settings.sms_notifications as boolean) ?? false,
                tournamentReminders: (settings.tournament_reminders as boolean) ?? true,
                resultNotifications: (settings.match_notifications as boolean) ?? true,
                paymentNotifications: (settings.wallet_notifications as boolean) ?? true,
                welcomeEmail: (settings.welcome_email as boolean) ?? true
              });
              break;
              
            case 'email':
              setEmailSettings({
                smtpHost: (settings.smtp_host as string) || 'smtp.arenajo.com',
                smtpPort: (settings.smtp_port as number) || 587,
                smtpUsername: (settings.smtp_username as string) || 'noreply@arenajo.com',
                smtpPassword: (settings.smtp_password as string) || '********',
                emailFromName: (settings.from_name as string) || 'ArenaJo Team',
                emailFromAddress: (settings.from_email as string) || 'noreply@arenajo.com'
              });
              break;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (section: string, settings: Record<string, unknown>) => {
    setIsLoading(true);
    
    try {
      let category: 'general' | 'payments' | 'notifications' | 'email' = 'general';
      
      switch (section) {
        case 'General':
          category = 'general';
          break;
        case 'Tournament':
        case 'Payment':
          category = 'payments';
          break;
        case 'Notification':
          category = 'notifications';
          break;
        case 'Email':
          category = 'email';
          break;
      }
      
      const result = await settingsService.updateSettings(category, settings);
      
      if (result && result.success) {
        toast({
          title: "Settings Saved",
          description: `${section} settings have been updated successfully`,
        });
      } else {
        throw new Error(result?.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="font-display text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground font-gaming">
            Configure platform-wide settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Tournaments</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Payments</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Email</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Amman">Asia/Amman (GMT+3)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JOD">JOD - Jordanian Dinar</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings('General', generalSettings)}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tournament Settings */}
        <TabsContent value="tournaments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Tournament Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultEntryFee">Default Entry Fee (JOD)</Label>
                  <Input
                    id="defaultEntryFee"
                    type="number"
                    step="0.01"
                    value={tournamentSettings.defaultEntryFee}
                    onChange={(e) => setTournamentSettings(prev => ({ ...prev, defaultEntryFee: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
                  <Input
                    id="platformFeePercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={tournamentSettings.platformFeePercentage}
                    onChange={(e) => setTournamentSettings(prev => ({ ...prev, platformFeePercentage: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minPlayersPerTournament">Minimum Players</Label>
                  <Input
                    id="minPlayersPerTournament"
                    type="number"
                    min="2"
                    value={tournamentSettings.minPlayersPerTournament}
                    onChange={(e) => setTournamentSettings(prev => ({ ...prev, minPlayersPerTournament: parseInt(e.target.value) || 2 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxPlayersPerTournament">Maximum Players</Label>
                  <Input
                    id="maxPlayersPerTournament"
                    type="number"
                    min="2"
                    value={tournamentSettings.maxPlayersPerTournament}
                    onChange={(e) => setTournamentSettings(prev => ({ ...prev, maxPlayersPerTournament: parseInt(e.target.value) || 1000 }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve Match Results</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve match results without admin review</p>
                  </div>
                  <Switch
                    checked={tournamentSettings.autoApproveResults}
                    onCheckedChange={(checked) => setTournamentSettings(prev => ({ ...prev, autoApproveResults: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Screenshots for Results</Label>
                    <p className="text-sm text-muted-foreground">Players must upload screenshots when submitting match results</p>
                  </div>
                  <Switch
                    checked={tournamentSettings.requireScreenshotForResults}
                    onCheckedChange={(checked) => setTournamentSettings(prev => ({ ...prev, requireScreenshotForResults: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Self-Registration</Label>
                    <p className="text-sm text-muted-foreground">Players can register themselves for tournaments</p>
                  </div>
                  <Switch
                    checked={tournamentSettings.allowSelfRegistration}
                    onCheckedChange={(checked) => setTournamentSettings(prev => ({ ...prev, allowSelfRegistration: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('Tournament', tournamentSettings)}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Tournament Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minWithdrawalAmount">Minimum Withdrawal (JOD)</Label>
                  <Input
                    id="minWithdrawalAmount"
                    type="number"
                    step="0.01"
                    value={paymentSettings.minWithdrawalAmount}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, minWithdrawalAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxWithdrawalAmount">Maximum Withdrawal (JOD)</Label>
                  <Input
                    id="maxWithdrawalAmount"
                    type="number"
                    step="0.01"
                    value={paymentSettings.maxWithdrawalAmount}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, maxWithdrawalAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pendingWithdrawalPeriod">Pending Period (hours)</Label>
                  <Input
                    id="pendingWithdrawalPeriod"
                    type="number"
                    value={paymentSettings.pendingWithdrawalPeriod}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, pendingWithdrawalPeriod: parseInt(e.target.value) || 48 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee per Withdrawal (JOD)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    step="0.01"
                    value={paymentSettings.platformFee}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, platformFee: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Deposits</Label>
                    <p className="text-sm text-muted-foreground">Allow users to add funds to their wallet</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableDeposits}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableDeposits: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Withdrawals</Label>
                    <p className="text-sm text-muted-foreground">Allow users to withdraw funds from their wallet</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableWithdrawals}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableWithdrawals: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Credit Card</Label>
                    <p className="text-sm text-muted-foreground">Accept credit card payments</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableCreditCard}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableCreditCard: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Bank Transfer</Label>
                    <p className="text-sm text-muted-foreground">Accept bank transfers</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableBankTransfer}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableBankTransfer: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Mobile Wallets</Label>
                    <p className="text-sm text-muted-foreground">Accept mobile wallet payments (Zain Cash, Orange Money, etc.)</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableMobileWallets}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableMobileWallets: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('Payment', paymentSettings)}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS notifications (requires SMS provider setup)</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tournament Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind users about upcoming tournaments</p>
                  </div>
                  <Switch
                    checked={notificationSettings.tournamentReminders}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, tournamentReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Result Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify users of match results and approvals</p>
                  </div>
                  <Switch
                    checked={notificationSettings.resultNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, resultNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify users of deposits, withdrawals, and transactions</p>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">Send welcome email to new users</p>
                  </div>
                  <Switch
                    checked={notificationSettings.welcomeEmail}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, welcomeEmail: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('Notification', notificationSettings)}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailFromName">From Name</Label>
                  <Input
                    id="emailFromName"
                    value={emailSettings.emailFromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, emailFromName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">From Email Address</Label>
                  <Input
                    id="emailFromAddress"
                    type="email"
                    value={emailSettings.emailFromAddress}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, emailFromAddress: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('Email', emailSettings)}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;