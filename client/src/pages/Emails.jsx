import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Mail, Plus, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const Emails = () => {
  const { t } = useLanguage();
  const { company } = useCompany();
  const { user, token } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  const emailProviders = useMemo(() => [
    { name: 'Google Workspace', server: 'smtp.gmail.com', port: 587 },
    { name: 'Microsoft 365', server: 'smtp.office365.com', port: 587 },
    { name: 'Hostinger Mail', server: 'smtp.hostinger.com', port: 465 },
    { name: 'Zoho Mail', server: 'smtp.zoho.com', port: 587 },
    { name: 'Custom', server: '', port: '' },
  ], []);

  const defaultProviderName = company?.settings?.smtp?.defaultProvider || 'Google Workspace';
  const defaultProvider = emailProviders.find(p => p.name === defaultProviderName) || emailProviders[0];

  const [newAccount, setNewAccount] = useState({
    address: '',
    provider: defaultProvider.name,
    server: defaultProvider.server,
    port: defaultProvider.port,
    password_encrypted: ''
  });

  const API_BASE_URL = 'http://travel-server.test/api';

  // Unified API call function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      ...options,
    };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const fetchAccounts = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const data = await apiCall('/email-accounts');
      setAccounts(data.data || []);
    } catch (error) {
      toast({
        title: 'Error fetching accounts',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = useCallback(async () => {
    if (!newAccount.address || !newAccount.provider || !newAccount.password_encrypted) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      await apiCall('/email-accounts', {
        method: 'POST',
        body: {
          email_address: newAccount.address,
          provider: newAccount.provider,
          smtp_server: newAccount.server,
          smtp_port: newAccount.port,
          password_encrypted: newAccount.password_encrypted,
        },
      });
      toast({ title: "Account added successfully" });
      fetchAccounts();
      setIsAdding(false);
      setNewAccount({
        address: '',
        provider: defaultProvider.name,
        server: defaultProvider.server,
        port: defaultProvider.port,
        password_encrypted: ''
      });
    } catch (error) {
      toast({
        title: "Error adding account",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [newAccount, fetchAccounts]);

  const handleDeleteAccount = async (id) => {
    setLoading(true);
    try {
      await apiCall(`/email-accounts/${id}`, { method: 'DELETE' });
      toast({ title: "Account deleted" });
      fetchAccounts();
      if (selectedAccount?.id === id) setSelectedAccount(null);
    } catch (error) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (providerName) => {
    const provider = emailProviders.find(p => p.name === providerName);
    setNewAccount(prev => ({
      ...prev,
      provider: providerName,
      server: provider?.server || '',
      port: provider?.port || ''
    }));
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !selectedAccount) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      await apiCall('/emails/send', {
        method: 'POST',
        body: {
          account_id: selectedAccount.id,
          to: composeData.to,
          subject: composeData.subject,
          body: composeData.body,
        },
      });
      toast({ title: "Email sent successfully" });
      setIsComposing(false);
      setComposeData({ to: '', subject: '', body: '' });
    } catch (error) {
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
          <Mail className="h-8 w-8" />
          <span>{t('webmail')}</span>
        </h1>
        <Button onClick={() => setIsAdding(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addEmailAccount')}
        </Button>
      </div>

      {isAdding && (
        <div>
          <Card>
            <CardHeader><CardTitle>{t('addEmailAccount')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('emailAddress')}</Label>
                  <Input
                    value={newAccount.address}
                    onChange={e => setNewAccount(p => ({ ...p, address: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>{t('emailProvider')}</Label>
                  <Select value={newAccount.provider} onValueChange={handleProviderChange} disabled={loading}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {emailProviders.map(p => (
                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newAccount.provider === 'Custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Server</Label>
                    <Input
                      value={newAccount.server}
                      onChange={e => setNewAccount(p => ({ ...p, server: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={newAccount.port}
                      onChange={e => setNewAccount(p => ({ ...p, port: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>{t('password_encrypted')}</Label>
                <Input
                  type="password"
                  value={newAccount.password_encrypted}
                  onChange={e => setNewAccount(p => ({ ...p, password_encrypted: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddAccount} disabled={loading}>
                  {loading ? 'Connecting...' : t('connectAccount')}
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)} disabled={loading}>
                  {t('cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Accounts</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {loading && accounts.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">Loading...</p>
                ) : accounts.length > 0 ? accounts.map(acc => (
                  <div key={acc.id} className={`flex items-center justify-between p-4 hover:bg-accent transition-colors ${selectedAccount?.id === acc.id ? 'bg-accent' : ''}`}>
                    <button onClick={() => setSelectedAccount(acc)} className="flex-1 text-left">
                      <p className="font-medium truncate">{acc.email_address}</p>
                      <p className="text-sm text-muted-foreground">{acc.provider}</p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteAccount(acc.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )) : (
                  <p className="p-4 text-sm text-muted-foreground text-center">No accounts added.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  {selectedAccount ? `Inbox: ${selectedAccount.email_address}` : 'Select an account'}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsComposing(true)}
                  disabled={!selectedAccount || loading}
                >
                  Compose
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isComposing ? (
                <div className="space-y-4">
                  <Input
                    placeholder="To:"
                    value={composeData.to}
                    onChange={e => setComposeData(p => ({ ...p, to: e.target.value }))}
                    disabled={loading}
                  />
                  <Input
                    placeholder="Subject:"
                    value={composeData.subject}
                    onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))}
                    disabled={loading}
                  />
                  <Textarea
                    placeholder="Your message..."
                    rows={10}
                    value={composeData.body}
                    onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))}
                    disabled={loading}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleSendEmail} disabled={loading}>
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? 'Sending...' : 'Send'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsComposing(false)} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-accent/20 rounded-lg">
                  <p className="text-muted-foreground">Select an account to view emails.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Emails;
