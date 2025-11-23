'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Award,
  CheckCircle,
  Edit,
  Save,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '../dashboard/layout';
import { useAuth } from '@/lib/hooks/useAuth';
import { profileService, reputationService } from '@/lib/api/services';
import type { User as UserType, Reputation } from '@/lib/types';

export default function ProfilePage() {
  const { user: authUser, address, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  const [reputation, setReputation] = useState<Reputation | null>(null);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchProfileData();
    }
  }, [isAuthenticated, authUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profile, rep] = await Promise.all([
        profileService.getMe().catch(() => authUser),
        reputationService.getReputation().catch(() => null),
      ]);

      setProfileData(profile || authUser || {});
      setReputation(rep);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updated = await profileService.update(profileData);
      setProfileData(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const removeItem = (field: 'skills' | 'interests' | 'goals', index: number) => {
    const current = profileData[field] || [];
    updateField(field, current.filter((_, i) => i !== index));
  };

  const reputationBreakdown = reputation ? [
    { category: 'Events Attended', points: reputation.breakdown.events, color: 'bg-blue-500' },
    { category: 'Connections Made', points: reputation.breakdown.connections, color: 'bg-purple-500' },
    { category: 'Workshops', points: reputation.breakdown.workshops, color: 'bg-green-500' },
    { category: 'Credentials', points: reputation.breakdown.credentials, color: 'bg-yellow-500' },
  ] : [];

  const maxPoints = Math.max(...reputationBreakdown.map(item => item.points), 1);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profileData.id) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Failed to load profile</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchProfileData} variant="outline">Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your profile and credentials
            </p>
          </div>
          {!isEditing ? (
            <Button
              variant="gradient"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfileData();
                }}
                disabled={saving}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xl md:text-2xl text-white">
                      {profileData.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Input
                    label="Username"
                    value={profileData.username || ''}
                    disabled={!isEditing}
                    onChange={(e) => updateField('username', e.target.value)}
                    placeholder="Enter username"
                  />
                  <Input
                    label="Email"
                    value={profileData.email || ''}
                    disabled={!isEditing}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>

                <Textarea
                  label="Bio"
                  value={profileData.bio || ''}
                  disabled={!isEditing}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself"
                />
              </CardContent>
            </Card>

            {/* Skills & Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Skills & Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {(profileData.skills || []).map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeItem('skills', idx)}
                            className="ml-2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {profileData.skills?.length === 0 && !isEditing && (
                      <p className="text-sm text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {(profileData.interests || []).map((interest, idx) => (
                      <Badge key={idx} variant="secondary">
                        {interest}
                        {isEditing && (
                          <button
                            onClick={() => removeItem('interests', idx)}
                            className="ml-2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {profileData.interests?.length === 0 && !isEditing && (
                      <p className="text-sm text-muted-foreground">No interests added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Networking Goals</label>
                  <div className="space-y-2">
                    {(profileData.goals || []).map((goal, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-lg border p-3"
                      >
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="flex-1 text-sm">{goal}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeItem('goals', index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {profileData.goals?.length === 0 && !isEditing && (
                      <p className="text-sm text-muted-foreground">No goals added yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { icon: Github, key: 'github', label: 'GitHub' },
                    { icon: Twitter, key: 'twitter', label: 'Twitter' },
                    { icon: Linkedin, key: 'linkedin', label: 'LinkedIn' },
                    { icon: Globe, key: 'website', label: 'Website' },
                  ].map(({ icon: Icon, key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <Input
                        placeholder={`${label} URL`}
                        value={profileData.socialLinks?.[key as keyof typeof profileData.socialLinks] || ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          updateField('socialLinks', {
                            ...profileData.socialLinks,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Reputation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Reputation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-2 text-3xl md:text-4xl font-bold text-primary">
                    {reputation?.totalPoints || profileData.reputationScore || 0}
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    <Award className="mr-1 h-3 w-3" />
                    {reputation?.tier || profileData.tier || 'Bronze'} Tier
                  </Badge>
                  {reputationBreakdown.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {reputationBreakdown.map((item) => (
                        <div key={item.category}>
                          <div className="mb-1 flex justify-between text-xs md:text-sm">
                            <span className="text-muted-foreground truncate">
                              {item.category}
                            </span>
                            <span className="font-medium">{item.points}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{
                                width: `${(item.points / maxPoints) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verified Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Verified Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(profileData.credentials || []).map((credential) => (
                    <div
                      key={credential.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {credential.verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{credential.type}</div>
                          {credential.verifiedAt && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(credential.verifiedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {!credential.verified && (
                        <Button variant="outline" size="sm" className="shrink-0 ml-2">
                          Verify
                        </Button>
                      )}
                    </div>
                  ))}
                  {(!profileData.credentials || profileData.credentials.length === 0) && (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      No credentials verified yet
                    </p>
                  )}
                  <Button variant="outline" className="w-full" size="sm">
                    + Add Credential
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
