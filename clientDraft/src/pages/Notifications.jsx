import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Bell, Send, Mail, Users, Eye, Volume2, MailCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

const NotificationsPage = () => {
  const { t } = useLanguage();
  const { supabase } = useSupabase();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendTo, setSendTo] = useState('all');
  const [role, setRole] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('inApp');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);

  const handleSendNotification = async () => {
    if (!message) {
      toast({ title: "Message is required", variant: "destructive" });
      return;
    }
    if (!supabase) return;

    const notificationData = {
      text: `${title ? `**${title}**\n` : ''}${message}`,
      role: sendTo === 'specific' ? role : null,
    };
    
    let emailPromise;
    if (deliveryMethod === 'email' || deliveryMethod === 'both') {
       emailPromise = supabase.functions.invoke('send-email-notification', {
        body: { role: notificationData.role, text: notificationData.text },
      });
    }

    let inAppPromise;
    if (deliveryMethod === 'inApp' || deliveryMethod === 'both') {
       inAppPromise = supabase.from('notifications').insert([notificationData]);
    }

    const [emailResult, inAppResult] = await Promise.all([emailPromise, inAppPromise]);
    
    if (emailResult?.error || inAppResult?.error) {
      const errorMsg = emailResult?.error?.message || inAppResult?.error?.message;
      toast({ title: "Failed to send notification", description: errorMsg, variant: "destructive" });
    } else {
      toast({ title: t('notificationSent') });
      setTitle('');
      setMessage('');
    }
  };
  
  useEffect(() => {
    const storedSoundPref = localStorage.getItem('notification_sound_enabled');
    if (storedSoundPref !== null) {
      setSoundEnabled(JSON.parse(storedSoundPref));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = !soundEnabled;
    }
    localStorage.setItem('notification_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  return (
    <>
      <Helmet><title>{t('notifications')} - SaaS Management System</title></Helmet>
       <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Bell className="h-8 w-8" /><span>{t('notifications')}</span></h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Compose Notification</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>{t('notificationTitle')}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional title" /></div>
                <div><Label>{t('notificationMessage')}</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message here..." /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('sendTo')}</Label>
                    <Select value={sendTo} onValueChange={setSendTo}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all"><Users className="h-4 w-4 mr-2 inline-block" />{t('allEmployees')}</SelectItem>
                        <SelectItem value="specific"><Users className="h-4 w-4 mr-2 inline-block" />{t('specificRoles')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {sendTo === 'specific' && (
                    <div>
                      <Label>Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div>
                  <Label>{t('deliveryMethod')}</Label>
                  <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inApp"><Bell className="h-4 w-4 mr-2 inline-block" />{t('inApp')}</SelectItem>
                      <SelectItem value="email"><Mail className="h-4 w-4 mr-2 inline-block" />Email</SelectItem>
                      <SelectItem value="both"><MailCheck className="h-4 w-4 mr-2 inline-block" />{t('emailAndInApp')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendNotification} className="w-full"><Send className="h-4 w-4 mr-2" />{t('send')}</Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Eye className="h-5 w-5 mr-2" />{t('preview')}</CardTitle></CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-accent min-h-[150px]">
                  {title && <p className="font-bold">{title}</p>}
                  <p className="text-sm whitespace-pre-wrap">{message || "Your message preview will appear here."}</p>
                </div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="sound-switch" className="flex items-center gap-2 text-lg"><Volume2 className="h-5 w-5"/> {t('sound')}</Label>
                    <Switch id="sound-switch" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;