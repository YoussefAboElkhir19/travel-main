import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// API helper functions
const apiRequest = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('token'); // Adjust based on how you store auth token
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  };

  const API_BASE = 'http://travel-server.test/api';
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsLoading(true);
      const response = await apiRequest('/notifications/user');
      
      if (response.status) {
        // Ensure each notification has both text and message fields for compatibility
        const enhancedNotifications = response.data.map(notification => ({
          ...notification,
          text: notification.message || notification.text, // Ensure text field exists
        }));
        setNotifications(enhancedNotifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Don't show toast on initial load failure to avoid spam
      if (notifications.length > 0) {
        toast({ 
          title: t('error') || 'Error', 
          description: t('failedToFetchNotifications') || 'Failed to fetch notifications',
          variant: 'destructive' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, t, notifications.length]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling for new notifications (since we don't have real-time subscriptions)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Poll every 30 seconds for new notifications
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isAuthenticated, user, fetchNotifications]);

  // Add notification manually (for when creating notifications)
  const addNotification = useCallback((notification, showToast = true) => {
    const enhancedNotification = {
      ...notification,
      text: notification.message || notification.text, // Ensure text field exists
      is_read: false
    };
    
    setNotifications(prev => [enhancedNotification, ...prev]);
    
    if (showToast) {
      toast({ 
        title: t('notificationReceived') || 'New Notification', 
        description: enhancedNotification.text
      });
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(error => 
          console.error("Audio play failed:", error)
        );
      }
    }
  }, [t]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    // Check if already read
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.is_read) return;

    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    try {
      await apiRequest(`/notifications/${id}/mark-read`, {
        method: 'POST'
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      
      // Revert optimistic update on error
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: false } : n)
      );
      
      toast({ 
        title: t('error') || 'Error', 
        description: t('failedToMarkAsRead') || 'Failed to mark notification as read',
        variant: 'destructive' 
      });
    }
  }, [notifications, t]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    if (unreadNotifications.length === 0) {
      return; // Nothing to mark
    }

    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    try {
      await apiRequest('/notifications/mark-all-read', {
        method: 'POST'
      });
      
      toast({ 
        title: t('success') || 'Success', 
        description: t('allNotificationsMarkedAsRead') || 'All notifications marked as read' 
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      
      // Revert optimistic update on error
      fetchNotifications(); // Re-fetch to get correct state
      
      toast({ 
        title: t('error') || 'Error', 
        description: t('failedToMarkAllAsRead') || 'Failed to mark all notifications as read',
        variant: 'destructive' 
      });
    }
  }, [notifications, fetchNotifications, t]);

  // Create new notification (used by your notification form)
  const createNotification = useCallback(async (notificationData) => {
    try {
      // Ensure we're sending the correct field names for your schema
      const dataToSend = {
        title: notificationData.title || '',
        message: notificationData.message || notificationData.text || '', // Support both field names
        role_id: notificationData.sendTo === 'specific' ? notificationData.role_id : null,
        sendTo: notificationData.sendTo === 'specific' ? 'role' : 'all', // Convert to your schema
        deliveryMethod: notificationData.deliveryMethod || 'inApp'
      };

      const response = await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify(dataToSend)
      });

      if (response.status) {
        toast({ 
          title: t('success') || 'Success', 
          description: t('notificationSent') || 'Notification sent successfully' 
        });
        
        // Add the new notification to the list
        if (response.data) {
          addNotification(response.data, false); // Don't show toast again
        }
        
        // Refresh notifications to get the latest state
        setTimeout(() => fetchNotifications(), 1000);
        
        return response.data;
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({ 
        title: t('error') || 'Error', 
        description: 'Failed to send notification',
        variant: 'destructive' 
      });
      throw error;
    }
  }, [fetchNotifications, addNotification, t]);

  // Get roles for notification form
  const getRoles = useCallback(async () => {
    try {
      const response = await apiRequest('/roles-notifications');
      return response.data || [];
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({ 
        title: t('error') || 'Error', 
        description: t('failedToFetchRoles') || 'Failed to fetch roles',
        variant: 'destructive' 
      });
      return [];
    }
  }, [t]);

  // Refresh notifications manually
  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value = {
    notifications,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    createNotification,
    getRoles,
    refreshNotifications,
    unreadCount: notifications.filter(n => !n.is_read).length,
  };

  return (
    <NotificationContext.Provider value={value}>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {children}
    </NotificationContext.Provider>
  );
};