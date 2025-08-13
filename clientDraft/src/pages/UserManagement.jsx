
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Users as UsersIcon, Shield, Plus, Search, Edit, Trash2, KeyRound, Check, X, Calendar, Loader, User, Mail, Phone, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/components/ui/use-toast';
import { allPermissions } from '@/lib/permissions';
import { format } from 'date-fns';

const UserManagement = () => {
  const { t } = useLanguage();
  const { supabase } = useSupabase();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null, context: null });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsersAndRoles = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase.from('user_profiles').select('*, roles(*)');
      if (usersError) throw usersError;
      setUsers(usersData || []);

      const { data: rolesData, error: rolesError } = await supabase.from('roles').select('*');
      if (rolesError) throw rolesError;
      setRoles(rolesData || []);
    } catch (error) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const filteredUsers = useMemo(() => users.filter(user =>
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [users, searchTerm]);

  const handleOpenModal = (type, data = null, context) => {
    let defaultData = {};
    if (context === 'user') {
      defaultData = data
        ? { ...data }
        : { id: null, username: '', email: '', password: '', role_id: roles.find(r => r.name === 'employee')?.id, status: 'active', first_name: '', last_name: '', phone: '', bio: '' };
    } else {
      defaultData = data
        ? { ...data }
        : { id: null, name: '', description: '', permissions: [], is_system: false, can_add_items: false, default_route: '/attendance' };
    }
    setModal({ isOpen: true, type, data: defaultData, context });
  };

  const handleSave = async (data, context) => {
    if (!supabase) return;
    try {
      if (context === 'user') {
        if (modal.type === 'add') {
          const { data: response, error } = await supabase.rpc('create_new_user', {
            p_email: data.email,
            p_password: data.password,
            p_username: data.username,
            p_first_name: data.first_name,
            p_last_name: data.last_name,
            p_role_id: data.role_id,
            p_phone: data.phone,
            p_bio: data.bio
          });
          if (error) throw error;
          toast({ title: "User created successfully" });
        } else if (modal.type === 'edit') {
          const { id, role, roles, created_at, updated_at, ...updateData } = data;
          const { error } = await supabase.from('user_profiles').update(updateData).eq('id', id);
          if (error) throw error;
          toast({ title: "User updated" });
        }
      } else {
        const { id, ...roleData } = data;
        let error;
        if (modal.type === 'add') ({ error } = await supabase.from('roles').insert([roleData]).select());
        else ({ error } = await supabase.from('roles').update(roleData).eq('id', id).select());
        if (error) throw error;
        toast({ title: `Role ${modal.type === 'add' ? 'added' : 'updated'}` });
      }
      fetchUsersAndRoles();
    } catch (error) {
      toast({ title: `Error ${modal.type === 'add' ? 'adding' : 'updating'} ${context}`, description: error.message, variant: "destructive" });
    }
    setModal({ isOpen: false, type: null, data: null });
  };

  const handleDelete = async (id, context) => {
    if (!supabase) return;
    try {
      if (context === 'role') {
        const { data, error } = await supabase.rpc('delete_role_and_reassign_users', { role_id_to_delete: id });
        if (error) throw error;
        toast({ title: "Role deleted" });
      } else {
        const { error } = await supabase.rpc('delete_user_by_id', { p_user_id: id });
        if (error) throw error;
        toast({ title: "User deleted" });
      }
      fetchUsersAndRoles();
    } catch (error) {
      toast({ title: `Error deleting ${context}`, description: error.message, variant: "destructive" });
    }
    setModal({ isOpen: false, type: null, data: null });
  };

  return (
    <>
      <Helmet><title>{t('usermanagement')} - SaaS Management System</title></Helmet>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><UsersIcon className="h-8 w-8" /><span>{t('usermanagement')}</span></h1>
        </motion.div>

        {isLoading ? (<div className="flex justify-center items-center h-64"><Loader className="h-12 w-12 animate-spin text-primary" /></div>) : (
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users"><UsersIcon className="h-4 w-4 mr-2" />Users</TabsTrigger>
              <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-2" />Roles</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <Card><CardHeader><div className="flex justify-between items-center"><CardTitle>Users List</CardTitle><Button onClick={() => handleOpenModal('add', null, 'user')}><Plus className="h-4 w-4 mr-2" />Add User</Button></div><div className="relative pt-4"><Search className="absolute left-3 top-1/2 transform -translate-y-[-50%] h-4 w-4 text-muted-foreground" /><Input placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardHeader><CardContent><div className="space-y-2">{filteredUsers.map(user => (<div key={user.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-accent/50"><div className="flex items-center space-x-3"><img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt={user.username} className="h-10 w-10 rounded-full" /><div><p className="font-medium">{user.username}</p><p className="text-sm text-muted-foreground">{user.email}</p></div></div><div className="flex items-center space-x-2">{user.created_at && (<div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /><span>{format(new Date(user.created_at), 'dd/MM/yyyy')}</span></div>)}<span className={`capitalize text-xs px-2 py-1 rounded-full flex items-center gap-1 ${user.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{user.status === 'active' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{t(user.status)}</span><span className="capitalize text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">{user.roles?.name || 'N/A'}</span><Button size="icon" variant="ghost" onClick={() => handleOpenModal('password', user, 'user')}><KeyRound className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => handleOpenModal('edit', user, 'user')}><Edit className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleOpenModal('delete', user, 'user')}><Trash2 className="h-4 w-4" /></Button></div></div>))}</div></CardContent></Card>
            </TabsContent>
            <TabsContent value="roles">
              <Card><CardHeader><div className="flex justify-between items-center"><CardTitle>Roles List</CardTitle><Button onClick={() => handleOpenModal('add', null, 'role')}><Plus className="h-4 w-4 mr-2" />Add Role</Button></div><CardDescription>Define roles and their permissions.</CardDescription></CardHeader><CardContent><div className="space-y-2">{roles.map(role => (<div key={role.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-accent/50"><div><p className="font-medium capitalize">{role.name}</p><p className="text-sm text-muted-foreground">{role.description}</p></div>{!role.is_system && (<div className="flex items-center space-x-2"><Button size="icon" variant="ghost" onClick={() => handleOpenModal('edit', role, 'role')}><Edit className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleOpenModal('delete', role, 'role')}><Trash2 className="h-4 w-4" /></Button></div>)}</div>))}</div></CardContent></Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <AnimatePresence>{modal.isOpen && (<ManagementModal modal={modal} onClose={() => setModal({ isOpen: false, type: null, data: null })} onSave={handleSave} onDelete={handleDelete} roles={roles} t={t} />)}</AnimatePresence>
    </>
  );
};
const ManagementModal = ({ modal, onClose, onSave, onDelete, roles, t }) => {
  const [data, setData] = useState(modal.data);
  const handleChange = (field, value) => { setData(prev => ({ ...prev, [field]: value })); };
  const handlePermissionChange = (permissionId, checked) => { setData(prev => { const currentPermissions = prev.permissions || []; const newPermissions = checked ? [...currentPermissions, permissionId] : currentPermissions.filter(p => p !== permissionId); return { ...prev, permissions: newPermissions }; }); };

  if (!modal.isOpen) return null;

  const renderUserForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" value={data.email || ''} onChange={e => handleChange('email', e.target.value)} disabled={modal.type === 'edit'} /></div>
        {modal.type === 'add' && <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={data.password || ''} onChange={e => handleChange('password', e.target.value)} /></div>}
        <div><Label htmlFor="username">Username</Label><Input id="username" value={data.username || ''} onChange={e => handleChange('username', e.target.value)} /></div>
        <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={data.first_name || ''} onChange={e => handleChange('first_name', e.target.value)} /></div>
        <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={data.last_name || ''} onChange={e => handleChange('last_name', e.target.value)} /></div>
        <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={data.phone || ''} onChange={e => handleChange('phone', e.target.value)} /></div>
      </div>
      <div><Label htmlFor="bio">Bio</Label><textarea id="bio" rows={3} value={data.bio || ''} onChange={e => handleChange('bio', e.target.value)} className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none" placeholder="Tell us about the user..." /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Role</Label>
          <Select value={String(data.role_id)} onValueChange={val => handleChange('role_id', parseInt(val))}>
            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
            <SelectContent>{roles.map(r => <SelectItem key={r.id} value={String(r.id)} className="capitalize">{r.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Switch id="user-status" checked={data.status === 'active'} onCheckedChange={checked => handleChange('status', checked ? 'active' : 'deactivated')} />
            <Label htmlFor="user-status">{t('userStatus')}: <span className={data.status === 'active' ? 'text-green-600' : 'text-red-600'}>{t(data.status)}</span></Label>
          </div>
        </div>
      </div>
    </>
  );

  const renderRoleForm = () => (
    <>
      <div><Label>Role Name</Label><Input value={data.name} onChange={e => handleChange('name', e.target.value)} /></div>
      <div><Label>Description</Label><Input value={data.description} onChange={e => handleChange('description', e.target.value)} /></div>
      <div><Label>Default Route</Label><Input value={data.default_route} onChange={e => handleChange('default_route', e.target.value)} placeholder="/attendance" /></div>
      <div className="flex items-center space-x-2"><Checkbox id="can_add_items" checked={data.can_add_items} onCheckedChange={checked => handleChange('can_add_items', checked)} /><label htmlFor="can_add_items">Allow users to add their own items</label></div>
      <div><Label>Permissions</Label><div className="space-y-2 mt-2 max-h-48 overflow-y-auto">{allPermissions.map(p => (<div key={p.id} className="flex items-center space-x-2"><Checkbox id={p.id} checked={data.permissions?.includes(p.id)} onCheckedChange={(checked) => handlePermissionChange(p.id, checked)} /><label htmlFor={p.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{p.name}</label></div>))}</div></div>
    </>
  );

  const renderContent = () => {
    switch (modal.type) {
      case 'delete': return (<><DialogHeader><DialogTitle>{t('confirmDelete')}</DialogTitle></DialogHeader><DialogDescription>{t('deleteDescription')}</DialogDescription><DialogFooter><Button variant="outline" onClick={onClose}>{t('cancel')}</Button><Button variant="destructive" onClick={() => onDelete(data.id, modal.context)}>{t('delete')}</Button></DialogFooter></>);
      case 'password': return <PasswordModalContent data={data} onClose={onClose} t={t} />;
      case 'add':
      case 'edit': return (<><DialogHeader><DialogTitle>{modal.type === 'add' ? 'Add' : 'Edit'} {modal.context}</DialogTitle></DialogHeader><div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">{modal.context === 'user' ? renderUserForm() : renderRoleForm()}</div><DialogFooter><Button variant="outline" onClick={onClose}>{t('cancel')}</Button><Button onClick={() => onSave(data, modal.context)}>{t('save')}</Button></DialogFooter></>);
      default: return null;
    }
  };
  return (<Dialog open={modal.isOpen} onOpenChange={onClose}><DialogContent className="max-w-xl">{renderContent()}</DialogContent></Dialog>);
};

const PasswordModalContent = ({ data, onClose, t }) => {
  const { supabase } = useSupabase();
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const handlePasswordChange = async () => {
    if (!newPassword) { toast({ title: "Password cannot be empty", variant: 'destructive' }); return; }
    if (!supabase) return;
    setIsSaving(true);
    const { error } = await supabase.rpc('update_user_password', { p_user_id: data.id, p_new_password: newPassword });
    setIsSaving(false);
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: 'destructive' });
    } else { toast({ title: "Password updated successfully" }); onClose(); }
  };
  return (<><DialogHeader><DialogTitle>{t('changePassword')} for {data.username}</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div><Label>{t('newPassword')}</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" /></div></div><DialogFooter><Button variant="outline" onClick={onClose}>{t('cancel')}</Button><Button onClick={handlePasswordChange} disabled={isSaving}>{isSaving ? <Loader className="animate-spin h-4 w-4" /> : t('save')}</Button></DialogFooter></>);
};
export default UserManagement;