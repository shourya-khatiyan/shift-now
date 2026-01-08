import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, User, Star, MapPin, Phone, Mail, Camera, Shield, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    bio: profile?.bio || '',
  });

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          bio: formData.bio,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft size={18} />
            Back
          </Button>

          {/* Profile Header */}
          <div className="bg-card rounded-3xl p-6 shadow-md mb-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Camera size={16} className="text-primary-foreground" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">{profile.full_name}</h1>
                  {profile.is_verified && (
                    <Shield size={18} className="text-primary fill-primary/20" />
                  )}
                </div>
                <Badge variant="secondary" className="mb-2">
                  {profile.role === 'worker' ? '👷 Worker' : '💼 Employer'}
                </Badge>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-secondary fill-secondary" />
                    {profile.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {profile.total_jobs} jobs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-card rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Profile Details</h2>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <User size={14} />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-muted-foreground mt-1">{profile.full_name}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Phone size={14} />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Add your phone number"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-muted-foreground mt-1">
                    {profile.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <MapPin size={14} />
                  City
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Your city"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-muted-foreground mt-1">
                    {profile.city || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <Label>Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell employers about yourself..."
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground mt-1">
                    {profile.bio || 'No bio added yet'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-card rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-primary">{profile.total_jobs}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-secondary">{profile.rating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-success">
                {profile.is_verified ? '✓' : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
