import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { profileService } from '@/lib/api';
import { User, Upload, X, Check, AlertCircle } from 'lucide-react';
import { content } from '@/lib/shared/kliv-content.js';

interface PlayerProfile {
  _row_id?: number;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  country?: string;
  current_rank?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: PlayerProfile | null;
  onProfileUpdate?: () => void;
}

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

export default function EditProfileModal({ isOpen, onClose, currentProfile, onProfileUpdate }: EditProfileModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    country: 'JO',
    avatar_url: ''
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens or current profile changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        display_name: currentProfile?.display_name || '',
        username: currentProfile?.username || '',
        bio: currentProfile?.bio || '',
        country: currentProfile?.country || 'JO',
        avatar_url: currentProfile?.avatar_url || ''
      });
      setValidationErrors({});
      setUsernameStatus('idle');
    }
  }, [isOpen, currentProfile]);

  // Validate username format
  const validateUsername = (username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be 20 characters or less';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    const error = validateUsername(username);
    if (error) {
      setValidationErrors(prev => ({ ...prev, username: error }));
      setUsernameStatus('idle');
      return;
    }

    // If username is the same as current, it's available
    if (currentProfile?.username === username) {
      setUsernameStatus('available');
      setValidationErrors(prev => ({ ...prev, username: '' }));
      return;
    }

    setUsernameStatus('checking');
    try {
      const isAvailable = await profileService.checkUsername(username);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
      setValidationErrors(prev => ({ 
        ...prev, 
        username: isAvailable ? '' : 'Username is already taken' 
      }));
    } catch (error) {
      setUsernameStatus('idle');
      setValidationErrors(prev => ({ 
        ...prev, 
        username: 'Failed to check username availability' 
      }));
    }
  };

  // Handle username change with debounced checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username && formData.username !== currentProfile?.username) {
        checkUsernameAvailability(formData.username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, currentProfile?.username]);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await content.uploadFile(file, '/content/avatars/');
      setFormData(prev => ({ ...prev, avatar_url: result.contentUrl }));
      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔧 EditProfileModal: Submit started', { formData });
    
    // Validate all fields
    const errors: Record<string, string> = {};
    
    if (!formData.display_name.trim()) {
      errors.display_name = 'Display name is required';
    } else if (formData.display_name.length > 50) {
      errors.display_name = 'Display name must be 50 characters or less';
    }

    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      errors.username = usernameError;
    }

    if (formData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

    if (Object.keys(errors).length > 0) {
      console.log('🛑 EditProfileModal: Validation failed', { errors });
      setValidationErrors(errors);
      return;
    }

    if (usernameStatus !== 'available' && formData.username !== currentProfile?.username) {
      console.log('🛑 EditProfileModal: Username validation pending', { 
        usernameStatus, 
        currentUsername: currentProfile?.username,
        newUsername: formData.username 
      });
      setValidationErrors(prev => ({ ...prev, username: 'Please wait for username validation or choose a different username' }));
      return;
    }

    console.log('✅ EditProfileModal: All validation passed, calling profileService.updateProfile');
    setLoading(true);
    try {
      const updateData = {
        display_name: formData.display_name,
        username: formData.username,
        bio: formData.bio,
        country: formData.country,
        avatar_url: formData.avatar_url
      };
      console.log('📤 EditProfileModal: Sending update data', updateData);
      
      await profileService.updateProfile(updateData);
      
      console.log('✅ EditProfileModal: profileService.updateProfile succeeded');
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      console.log('🔄 EditProfileModal: Calling onProfileUpdate callback');
      onProfileUpdate?.();
      
      console.log('🚪 EditProfileModal: Closing modal');
      onClose();
    } catch (error) {
      console.error('❌ EditProfileModal: Update failed', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      console.log('💬 EditProfileModal: Showing error toast', { errorMessage });
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'taken':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Avatar</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {formData.display_name?.[0]?.toUpperCase() || 'P'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploadingAvatar}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Enter your display name"
              maxLength={50}
              className={validationErrors.display_name ? 'border-red-500' : ''}
            />
            {validationErrors.display_name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.display_name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.display_name.length}/50 characters
            </p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, username: e.target.value }));
                  setUsernameStatus('idle');
                }}
                placeholder="Enter username"
                maxLength={20}
                className={`pr-10 ${validationErrors.username ? 'border-red-500' : ''}`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getUsernameStatusIcon()}
              </div>
            </div>
            {validationErrors.username && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.username}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={500}
              className={validationErrors.bio ? 'border-red-500' : ''}
            />
            {validationErrors.bio && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.bio}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || usernameStatus === 'checking' || uploadingAvatar}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}