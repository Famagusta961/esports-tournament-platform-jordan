import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { teamService } from '@/lib/api';

type Team = {
  _row_id: number;
  name: string;
  tag: string;
  description?: string;
  captain_id: string;
  captain_username: string;
  logo_url?: string;
  created_at: number;
  member_count: number;
  status: string;
  game_name?: string;
};

type EditTeamModalProps = {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const EditTeamModal: React.FC<EditTeamModalProps> = ({ team, isOpen, onClose, onUpdate }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    description: ''
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        tag: team.tag,
        description: team.description || ''
      });
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!team) return;
    
    if (!formData.name || formData.name.length < 2) {
      toast({
        title: "Validation Error",
        description: "Team name must be at least 2 characters",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.tag || formData.tag.length < 2) {
      toast({
        title: "Validation Error", 
        description: "Team tag must be at least 2 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await teamService.updateTeam(team._row_id, {
        name: formData.name,
        tag: formData.tag,
        description: formData.description
      });
      
      if (result && result.success) {
        toast({
          title: "✅ Team Updated!",
          description: `${formData.name} has been updated successfully`,
          duration: 3000
        });
        
        onUpdate();
        onClose();
      } else {
        throw new Error(result?.error || 'Failed to update team');
      }
    } catch (error) {
      console.error('Update team error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update team",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !team) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit Team</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_team_name">Team Name *</Label>
              <Input
                id="edit_team_name"
                placeholder="Enter team name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_team_tag">Team Tag *</Label>
              <Input
                id="edit_team_tag"
                placeholder="2-4 letter tag"
                maxLength={4}
                value={formData.tag}
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_team_description">Description</Label>
              <Textarea
                id="edit_team_description"
                placeholder="Describe your team..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Team'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTeamModal;