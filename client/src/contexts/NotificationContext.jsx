import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);
  const { t } = useLanguage();
  const { supabase } = useSupabase();
  const { user } = useAuth();

  const [readNotificationIds, setReadNotificationIds] = useState(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!supabase || !user) return;
    const { data, error } = await supabase.from('notifications').select('*').or(`user_id.eq.${user.id},role.eq.${user.role},role.is.null`).order('created_at', { ascending: false }).limit(50);
    if (error) { console.error("Error fetching notifications:", error); }
    else {
      const { data: readData } = await supabase.from('read_notifications').select('notification_id').eq('user_id', user.id);
      const readIds = new Set(readData.map(r => r.notification_id));
      setReadNotificationIds(readIds);
      const enhancedNotifications = data.map(n => ({ ...n, is_read: readIds.has(n.id) }));
      setNotifications(enhancedNotifications || []);
    }
  }, [supabase, user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const addNotification = useCallback((notification, fromSubscription = false) => {
    if (fromSubscription) setNotifications(prev => [notification, ...prev]);
    toast({ title: t('notificationReceived'), description: notification.text });
    if (audioRef.current) audioRef.current.play().catch(error => console.error("Audio play failed:", error));
  }, [t]);

  useEffect(() => {
    if (!supabase || !user) return;
    const channel = supabase.channel('public:notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
      const newNotification = payload.new;
      const isForEveryone = !newNotification.user_id && !newNotification.role;
      const isForUserRole = newNotification.role === user?.role;
      const isForSpecificUser = newNotification.user_id === user?.id;
      if (isForEveryone || isForUserRole || isForSpecificUser) addNotification(newNotification, true);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, user, addNotification]);

  const markAsRead = useCallback(async (id) => {
    if (readNotificationIds.has(id)) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setReadNotificationIds(prev => new Set(prev).add(id));
    if (supabase) await supabase.from('read_notifications').insert({ notification_id: id, user_id: user.id });
  }, [supabase, user, readNotificationIds]);

  const markAllAsRead = useCallback(async () => {
    if (supabase && user) {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      if (unreadNotifications.length > 0) {
        const recordsToInsert = unreadNotifications.map(n => ({ notification_id: n.id, user_id: user.id }));
        const { error } = await supabase.from('read_notifications').insert(recordsToInsert);
        if (!error) {
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
          const newReadIds = new Set(readNotificationIds);
          unreadNotifications.forEach(n => newReadIds.add(n.id));
          setReadNotificationIds(newReadIds);
        } else {
          toast({ title: 'Error', description: 'Could not mark all as read.', variant: 'destructive' });
        }
      }
    }
  }, [supabase, user, notifications, readNotificationIds]);

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.is_read).length,
  };

  return (
    <NotificationContext.Provider value={value}>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {children}
    </NotificationContext.Provider>
  );
};