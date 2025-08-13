// UserManagement.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
  Users as UsersIcon,
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  KeyRound,
  Check,
  X,
  Calendar,
  Loader,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const API_BASE = 'http://travel-server.test/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null, context: null });
  const [isLoading, setIsLoading] = useState(true);

  // Utility: ensure server response.data becomes array
  const toArray = (maybe) => {
    if (Array.isArray(maybe)) return maybe;
    if (maybe == null) return [];
    return [maybe];
  };

  // Fetch users and roles
  const fetchUsersAndRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resUsers, resRoles] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers: { Accept: 'application/json' } }),
        fetch(`${API_BASE}/roles`, { headers: { Accept: 'application/json' } }),
      ]);

      const usersText = await resUsers.text();
      const rolesText = await resRoles.text();

      let usersResp, rolesResp;
      try {
        usersResp = JSON.parse(usersText);
      } catch {
        usersResp = { status: false, data: [] };
      }
      try {
        rolesResp = JSON.parse(rolesText);
      } catch {
        rolesResp = { status: false, data: [] };
      }

      if (usersResp.status) {
        setUsers(toArray(usersResp.data));
      } else {
        setUsers([]);
        toast({ title: 'Error: Invalid users data format', variant: 'destructive' });
      }

      if (rolesResp.status) {
        setRoles(toArray(rolesResp.data));
      } else {
        setRoles([]);
        toast({ title: 'Error: Invalid roles data format', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error fetching data', description: err.message, variant: 'destructive' });
      setUsers([]);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.user_name && u.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [users, searchTerm]
  );

  // Open modal - prepare defaultData matching backend fields
  const handleOpenModal = (type, data = null, context) => {
    let defaultData = {};
    if (context === 'user') {
      defaultData = data
        ? {
          ...data,
          avatar_url: data.avatar_url || '', // reset file input; keep existing avatar in string at data.avatar_url (original) if needed
        }
        : {
          id: null,
          first_name: '',
          last_name: '',
          name: '',
          user_name: '',
          phone: '',
          address: '',
          bio: '',
          date_of_birth: '',
          email: '',
          role_id: roles.find((r) => r.name === 'employee')?.id || '',
          password: '',
          status: 'active',
          avatar_url: '', // File or null
        };
    } else {
      defaultData = data
        ? { ...data }
        : { id: null, name: '', description: '', permissions: [], is_system: false, can_add_items: false, default_route: '/attendance' };
    }
    setModal({ isOpen: true, type, data: defaultData, context });
  };

  const handleChange = (field, value) => {
    setModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  // Prepare body: FormData if there's an avatar file, else JSON
  const prepareRequestBody = (data) => {
    if (data?.avatar_url instanceof File) {
      const fd = new FormData();
      Object.keys(data).forEach((k) => {
        const val = data[k];
        if (val === null || val === undefined) return;
        // For boolean false, we still append
        if (k === 'avatar_url') {
          fd.append('avatar_url', val);
        } else if (Array.isArray(val) || typeof val === 'object') {
          fd.append(k, JSON.stringify(val));
        } else {
          fd.append(k, val);
        }
      });
      return { body: fd, isFormData: true };
    } else {
      // don't include avatar_url if it's null (we don't want to overwrite existing unless file sent)
      const clean = { ...data };
      if (!clean.avatar_url) delete clean.avatar_url;
      return { body: JSON.stringify(clean), isFormData: false };
    }
  };

  // Save handler
  const handleSave = async () => {
    const data = modal.data;
    const context = modal.context;

    try {
      // ✅ حل مشكلة عنصر واحد في permissions
      if (context === 'role' && !Array.isArray(data.permissions)) {
        data.permissions = data.permissions ? [data.permissions] : [];
      }
      let url = `${API_BASE}/users`;
      let method = 'POST';

      if (context === 'user' && data.id) {
        url = `${API_BASE}/users/${data.id}`;
        method = 'PUT';
      } else if (context === 'role' && data.id) {
        url = `${API_BASE}/roles/${data.id}`;
        method = 'PUT';
      } else if (context === 'role') {
        url = `${API_BASE}/roles`;
        method = 'POST';
      }

      const { body, isFormData } = prepareRequestBody(data);

      const headers = {};
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
      } else {
        // Let browser set Content-Type for FormData (with boundary)
        headers['Accept'] = 'application/json';
      }

      const res = await fetch(url, {
        method,
        headers,
        body,
      });

      const text = await res.text();
      let response;
      try {
        response = text ? JSON.parse(text) : { status: false, message: 'Empty response' };
      } catch (e) {
        console.error('Failed to parse server response:', text);
        toast({
          title: 'Invalid response from server',
          description: 'لم يتمكن التطبيق من قراءة رد السيرفر بشكل صحيح.',
          variant: 'destructive',
        });
        return;
      }

      // Normalize response.data to array
      const respDataArray = toArray(response.data);

      if (response.status) {
        toast({ title: `${context === 'user' ? 'User' : 'Role'} saved successfully` });

        // Option A: if backend returns updated/created resource(s) we can merge, but simplest is to re-fetch
        await fetchUsersAndRoles();
        setModal({ isOpen: false, type: null, data: null });
      } else {
        // Show detailed errors if any
        const desc =
          response.errors
            ? JSON.stringify(response.errors)
            : response.message || 'Unknown error';

        toast({
          title: 'Error saving data',
          description: desc,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({ title: 'Request failed', description: err.message, variant: 'destructive' });
    }
  };

  // Delete handler
  const handleDelete = async (id, context) => {
    try {
      const url = `${API_BASE}/${context === 'user' ? 'users' : 'roles'}/${id}`;
      const res = await fetch(url, { method: 'DELETE', headers: { Accept: 'application/json' } });
      const text = await res.text();
      let response;
      try {
        response = text ? JSON.parse(text) : { status: false, message: 'Empty response' };
      } catch {
        toast({ title: 'Invalid response from server', variant: 'destructive' });
        return;
      }

      if (response.status) {
        toast({ title: `${context === 'user' ? 'User' : 'Role'} Deleted`, variant: 'destructive' });
        await fetchUsersAndRoles();
        setModal({ isOpen: false, type: null, data: null });
      } else {
        toast({ title: response.message || 'Error deleting', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error deleting', description: err.message, variant: 'destructive' });
    }
  };

  //******************************** */ Render User form***********************************************************
  const renderUserForm = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={modal.data?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={modal.type === 'edit'}
          />
        </div>

        {modal.type === 'add' && (
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={modal.data?.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>
        )}
        <div>
          <Label htmlFor="password_confirmation">Confirm Password *</Label>
          <Input
            id="password_confirmation"
            type="password"
            value={modal.data.password_confirmation || ''}
            onChange={(e) => handleChange('password_confirmation', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="user_name">Username</Label>
          <Input id="user_name" value={modal.data?.user_name || ''} onChange={(e) => handleChange('user_name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" value={modal.data?.first_name || ''} onChange={(e) => handleChange('first_name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" value={modal.data?.last_name || ''} onChange={(e) => handleChange('last_name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={modal.data?.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={modal.data?.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={modal.data?.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input id="date_of_birth" type="date" value={modal.data?.date_of_birth || ''} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          rows={3}
          value={modal.data?.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground resize-none"
          placeholder="Tell us about the user..."
        />
      </div>

      <div>
        <Label htmlFor="avatar_url">Avatar</Label>
        <Input
          id="avatar_url"
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleChange('avatar_url', e.target.files[0]);
          }}
        />

        {/* show existing avatar from backend if editing and no new file selected */}
        {modal.data?.avatar_url && typeof modal.data.avatar_url === 'string' && (
          < img src={`http://travel-server.test/uploads/users/${modal.data.avatar_url}`} alt="Avatar" className="h-16 w-16 rounded-full mt-2 object-cover" />
        )}
        {modal.data?.avatar_url instanceof File && <p className="mt-2 text-sm">Image selected: {modal.data.avatar_url.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label>Role</Label>
          <Select value={String(modal.data?.role_id || '')} onValueChange={(val) => handleChange('role_id', parseInt(val))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={String(r.id)} className="capitalize">
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Switch id="user-status" checked={modal.data?.status === 'active'} onCheckedChange={(checked) => handleChange('status', checked ? 'active' : 'deactivated')} />
            <Label htmlFor="user-status">
              Status: <span className={modal.data?.status === 'active' ? 'text-green-600' : 'text-red-600'}>{modal.data?.status}</span>
            </Label>
          </div>
        </div>
      </div>
    </>
  );
  //******************************** */ Render Role form***********************************************************

  const renderRoleForm = () => (
    <>
      <div>
        <Label>Role Name</Label>
        <Input value={modal.data?.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={modal.data?.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
      </div>
      <div>
        <Label>Default Route</Label>
        <Input value={modal.data?.default_route || ''} onChange={(e) => handleChange('default_route', e.target.value)} placeholder="/attendance" />
      </div>
      {/* permissions UI simplified */}
      {/* Permissions Selector */}
      <label className="block mb-2 font-medium">Permissions</label>
      <Select
        value={modal.data?.permissions?.[0] || ''} // لو عايز تسمح بأكتر من قيمة، نعدلها
        onValueChange={(val) => {
          // نخزنها كمصفوفة حتى لو عنصر واحد
          const current = Array.isArray(modal.data.permissions)
            ? [...modal.data.permissions]
            : [];

          if (!current.includes(val)) {
            handleChange('permissions', [...current, val]);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select permissions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="view_dashboard">View Dashboard</SelectItem>
          <SelectItem value="view_all_attendance">View All Attendance</SelectItem>
          <SelectItem value="manage_all_leave_requests">Manage All Leave Requests</SelectItem>
          <SelectItem value="manage_users">Manage Users</SelectItem>
          <SelectItem value="manage_roles">Manage Roles</SelectItem>
          <SelectItem value="manage_settings">Manage Settings</SelectItem>
          <SelectItem value="send_notifications">Send Notifications</SelectItem>
          <SelectItem value="view_reports">View Reports</SelectItem>
          <SelectItem value="view_customers">View Customers</SelectItem>
        </SelectContent>
      </Select>

      {/*ShowSelected Permissions*/}
      <div className="mt-2 flex flex-wrap gap-2">
        {modal.data.permissions?.map((perm) => (
          <span
            key={perm}
            className="px-2 py-1 bg-gray-800 rounded-full text-sm cursor-pointer"
            onClick={() => {
              handleChange(
                'permissions',
                modal.data.permissions.filter((p) => p !== perm)
              );
            }}
          >
            {perm} ✕
          </span>
        ))}
      </div>

      {/* <div className="mt-2">
        <Label>Permissions (IDs as array)</Label>
        <Input

          type="text"
          value={modal.data.permissions.join(', ')}
          onChange={(e) =>
            handleChange('permissions', e.target.value.split(',').map(p => p.trim()))
          }
        />

      </div> */}
    </>
  );

  const renderContent = () => {
    if (!modal.isOpen) return null;
    switch (modal.type) {
      case 'delete':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <DialogDescription>Are you sure you want to delete this {modal.context}?</DialogDescription>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModal({ isOpen: false, type: null, data: null })}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(modal.data.id, modal.context)}>Delete</Button>
            </DialogFooter>
          </>
        );
      case 'add':
      case 'edit':
        return (
          <>
            <DialogHeader>
              <DialogTitle>{modal.type === 'add' ? 'Add' : 'Edit'} {modal.context}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {modal.context === 'user' ? renderUserForm() : renderRoleForm()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModal({ isOpen: false, type: null, data: null })}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet><title>User Management - SaaS Management System</title></Helmet>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
            <UsersIcon className="h-8 w-8" />
            <span>User Management</span>
          </h1>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader className="h-12 w-12 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users"><UsersIcon className="h-4 w-4 mr-2" />Users</TabsTrigger>
              <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-2" />Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Users List</CardTitle>
                    <Button onClick={() => handleOpenModal('add', null, 'user')}><Plus className="h-4 w-4 mr-2" />Add User</Button>
                  </div>
                  <div className="relative pt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {filteredUsers.length === 0 && <p className="text-center text-muted-foreground">No users found.</p>}
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-accent/50">
                        <div className="flex items-center space-x-3">
                          <img src={u.avatar_url ? `http://travel-server.test/uploads/users/${u.avatar_url}` : `https://ui-avatars.com/api/?name=${u.user_name}&background=random`} alt={u.user_name} className="h-10 w-10 rounded-full object-cover" />

                          <div>
                            <p className="font-medium">{u.user_name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {u.created_at && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /><span>{format(new Date(u.created_at), 'dd/MM/yyyy')}</span></div>}
                          <span className={`capitalize text-xs px-2 py-1 rounded-full flex items-center gap-1 ${u.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                            {u.status === 'active' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}{u.status}
                          </span>
                          <span className="capitalize text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">{u.role?.name || 'N/A'}</span>
                          <Button size="icon" variant="ghost" onClick={() => handleOpenModal('edit', u, 'user')}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleOpenModal('delete', u, 'user')}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center"><CardTitle>Roles List</CardTitle><Button onClick={() => handleOpenModal('add', null, 'role')}><Plus className="h-4 w-4 mr-2" />Add Role</Button></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {roles.length === 0 && <p className="text-center text-muted-foreground">No roles found.</p>}
                    {roles.map((r) => (
                      <div key={r.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-accent/50">
                        <div><p className="font-medium capitalize">{r.name}</p><p className="text-sm text-muted-foreground">{r.description}</p></div>
                        {!r.is_system && <div className="flex items-center space-x-2"><Button size="icon" variant="ghost" onClick={() => handleOpenModal('edit', r, 'role')}><Edit className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleOpenModal('delete', r, 'role')}><Trash2 className="h-4 w-4" /></Button></div>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <AnimatePresence>
        {modal.isOpen && (
          <Dialog open={modal.isOpen} onOpenChange={() => setModal({ isOpen: false, type: null, data: null })}>
            <DialogContent className="max-w-xl">
              {renderContent()}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserManagement;
