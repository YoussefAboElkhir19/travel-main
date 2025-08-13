import React, { useState, useEffect, useCallback, useRef } from 'react';
    import { motion } from 'framer-motion';
    import { Helmet } from 'react-helmet';
    import { User, Save, Upload, Mail, Phone, Shield } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useAuth } from '@/contexts/AuthContext';
    import { useSupabase } from '@/contexts/SupabaseContext';
    import { toast } from '@/components/ui/use-toast';

    const Profile = () => {
      const { t } = useLanguage();
      const { user, loading } = useAuth();
      const { supabase } = useSupabase();
      const fileInputRef = useRef(null);
      
      const [profile, setProfile] = useState({
        username: '', email: '', first_name: '', last_name: '', phone: '', address: '', dateOfBirth: '', bio: '', avatar_url: ''
      });
      const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
      const [uploading, setUploading] = useState(false);

      const fetchProfile = useCallback(async () => {
        if (user && supabase) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (error) {
            toast({ title: "Error fetching profile", description: error.message, variant: "destructive" });
          } else if (data) {
            setProfile(data);
          }
        }
      }, [user, supabase]);

      useEffect(() => {
        fetchProfile();
      }, [fetchProfile]);

      useEffect(() => {
        if (!supabase || !user) return;
        const channel = supabase.channel('public:user_profiles')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles', filter: `id=eq.${user.id}` }, (payload) => {
            setProfile(payload.new);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }, [supabase, user]);

      const handleProfileChange = (field, value) => {
        setProfile(prev => ({...prev, [field]: value}));
      };

      const handleSaveProfile = async () => {
        const { role_id, created_at, updated_at, ...updateData } = profile;
        const { error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', user.id);
        
        if (error) {
            toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Profile Updated" });
        }
      };

      const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast({ title: "Password Mismatch", variant: "destructive" });
          return;
        }
        if (!passwordData.newPassword) {
            toast({ title: "Password cannot be empty", variant: "destructive" });
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
        
        if (error) {
            toast({ title: "Failed to change password", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Password Changed" });
            setPasswordData({ newPassword: '', confirmPassword: '' });
        }
      };

      const handleUploadAvatar = async (event) => {
        try {
          setUploading(true);
          if (!event.target.files || event.target.files.length === 0) {
            throw new Error('You must select an image to upload.');
          }

          const file = event.target.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}.${fileExt}`;
          const filePath = `${fileName}`;

          let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

          if (uploadError) {
            throw uploadError;
          }

          const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
          const publicUrl = data.publicUrl;

          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

          if (updateError) {
            throw updateError;
          }
          
          toast({ title: "Avatar updated successfully!" });
        } catch (error) {
          toast({ title: "Error uploading avatar", description: error.message, variant: "destructive" });
        } finally {
          setUploading(false);
        }
      };

      if (loading || !profile) {
        return <div>Loading...</div>;
      }

      return (
        <>
          <Helmet><title>User Profile - SaaS Management System</title></Helmet>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><User className="h-8 w-8" /><span>{t('profile')}</span></h1>
                <p className="text-muted-foreground mt-2">Manage your personal information and account settings</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader><CardTitle>Profile Picture</CardTitle></CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-muted flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{profile.first_name} {profile.last_name}</h3>
                      <p className="text-muted-foreground">{profile.username}</p>
                    </div>
                    <Button onClick={() => fileInputRef.current.click()} disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadAvatar} disabled={uploading} />
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader><CardTitle className="flex items-center space-x-2"><Shield className="h-5 w-5" /><span>Account Information</span></CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Role</span><span className="text-sm font-medium text-foreground capitalize">{user?.role}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Join Date</span><span className="text-sm font-medium text-foreground">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Status</span><span className={`text-sm font-medium ${profile.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>{profile.status}</span></div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={profile.first_name || ''} onChange={(e) => handleProfileChange('first_name', e.target.value)} /></div>
                      <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={profile.last_name || ''} onChange={(e) => handleProfileChange('last_name', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div><Label htmlFor="username">Username</Label><Input id="username" value={profile.username || ''} onChange={(e) => handleProfileChange('username', e.target.value)} /></div>
                       <div><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" value={profile.email || ''} disabled className="pl-10" /></div></div>
                    </div>
                     <div><Label htmlFor="phone">Phone</Label><div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="phone" value={profile.phone || ''} onChange={(e) => handleProfileChange('phone', e.target.value)} className="pl-10" /></div></div>
                     <div><Label htmlFor="bio">Bio</Label><textarea id="bio" rows={3} value={profile.bio || ''} onChange={(e) => handleProfileChange('bio', e.target.value)} className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none" placeholder="Tell us about yourself..." /></div>
                    <Button onClick={handleSaveProfile}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))} placeholder="Enter new password" /></div>
                      <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))} placeholder="Confirm new password" /></div>
                    </div>
                    <Button onClick={handleChangePassword}><Save className="h-4 w-4 mr-2" />Change Password</Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      );
    };

    export default Profile;