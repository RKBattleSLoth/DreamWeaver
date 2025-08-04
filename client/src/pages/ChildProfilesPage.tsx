import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../lib/supabase-auth';
import { 
  useChildProfiles, 
  useCreateChildProfile, 
  useUpdateChildProfile, 
  useDeleteChildProfile,
  useSetActiveChildProfile
} from '../hooks/useChildProfiles';
import ChildProfileCard from '../components/profiles/ChildProfileCard';
import ChildProfileForm from '../components/profiles/ChildProfileForm';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { ChildProfile, CreateChildProfileRequest, UpdateChildProfileRequest } from '../../shared/types';

export default function ChildProfilesPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: profiles = [], isLoading: profilesLoading, error } = useChildProfiles();
  const createMutation = useCreateChildProfile();
  const updateMutation = useUpdateChildProfile();
  const deleteMutation = useDeleteChildProfile();
  const setActiveMutation = useSetActiveChildProfile();

  const handleCreateProfile = async (data: CreateChildProfileRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      // TODO: Show error toast
    }
  };

  const handleUpdateProfile = async (data: UpdateChildProfileRequest) => {
    if (!editingProfile) return;
    
    try {
      await updateMutation.mutateAsync({ id: editingProfile.id, updates: data });
      setEditingProfile(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      // TODO: Show error toast
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error: any) {
      console.error('Failed to delete profile:', error);
      // TODO: Show error toast
    }
  };

  const handleSetActiveProfile = async (id: string) => {
    try {
      await setActiveMutation.mutateAsync(id);
    } catch (error: any) {
      console.error('Failed to set active profile:', error);
      // TODO: Show error toast
    }
  };

  const handleEditProfile = (profile: ChildProfile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProfile(null);
  };

  if (authLoading || profilesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Failed to load child profiles. Please try again.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Child Profiles</h1>
          <p className="text-muted-foreground">
            Create and manage profiles for personalized stories
          </p>
        </div>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Add New Profile
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 flex justify-center">
          <ChildProfileForm
            profile={editingProfile || undefined}
            onSubmit={editingProfile ? handleUpdateProfile : handleCreateProfile}
            onCancel={handleCancelForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {profiles.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Child Profiles Yet</CardTitle>
            <CardDescription>
              Create your first child profile to start generating personalized stories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowForm(true)}>
              Create First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ChildProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.is_active}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
              onSetActive={handleSetActiveProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}