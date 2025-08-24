import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// WebSocket hook for notifications
export const useWebSocket = (onNotificationReceived) => {
  const wsRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      // For Laravel WebSockets with Pusher protocol
      // You can also use native WebSocket or Socket.IO depending on your setup
      const wsUrl = `ws://127.0.0.1:6001/app/your-app-key?protocol=7&client=js&version=7.0.3&flash=false`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        
        // Subscribe to channels based on user role
        const subscribeMessage = {
          event: 'pusher:subscribe',
          data: {
            auth: `Bearer ${token}`,
            channel: 'notifications'
          }
        };
        
        wsRef.current.send(JSON.stringify(subscribeMessage));

        // Subscribe to role-specific channel if user has a role
        if (user.role_id) {
          const roleSubscribeMessage = {
            event: 'pusher:subscribe',
            data: {
              auth: `Bearer ${token}`,
              channel: `notifications.role.${user.role_id}`
            }
          };
          wsRef.current.send(JSON.stringify(roleSubscribeMessage));
        }

        // Subscribe to user-specific private channel
        const privateSubscribeMessage = {
          event: 'pusher:subscribe',
          data: {
            auth: `Bearer ${token}`,
            channel: `private-notifications.user.${user.id}`
          }
        };
        wsRef.current.send(JSON.stringify(privateSubscribeMessage));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle notification events
          if (data.event === 'notification.sent') {
            console.log('Notification received:', data.data);
            if (onNotificationReceived && data.data.notification) {
              onNotificationReceived(data.data.notification);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [isAuthenticated, user, onNotificationReceived]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
    disconnect
  };
};

// Alternative: Pusher client hook (if using pusher-js library)
export const usePusherWebSocket = (onNotificationReceived) => {
  const pusherRef = useRef(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initialize Pusher (you need to install pusher-js: npm install pusher-js)
    // import Pusher from 'pusher-js';
    
    try {
      // Uncomment and configure if using Pusher
      /*
      pusherRef.current = new Pusher('your-app-key', {
        cluster: 'your-cluster',
        wsHost: '127.0.0.1',
        wsPort: 6001,
        wssPort: 6001,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: 'http://travel-server.test/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      });

      // Subscribe to public channels
      const publicChannel = pusherRef.current.subscribe('notifications');
      publicChannel.bind('notification.sent', (data) => {
        console.log('Public notification received:', data);
        if (onNotificationReceived && data.notification) {
          onNotificationReceived(data.notification);
        }
      });

      // Subscribe to role-specific channel
      if (user.role_id) {
        const roleChannel = pusherRef.current.subscribe(`notifications.role.${user.role_id}`);
        roleChannel.bind('notification.sent', (data) => {
          console.log('Role notification received:', data);
          if (onNotificationReceived && data.notification) {
            onNotificationReceived(data.notification);
          }
        });
      }

      // Subscribe to user-specific private channel
      const privateChannel = pusherRef.current.subscribe(`private-notifications.user.${user.id}`);
      privateChannel.bind('notification.sent', (data) => {
        console.log('Private notification received:', data);
        if (onNotificationReceived && data.notification) {
          onNotificationReceived(data.notification);
        }
      });
      */

    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
    }

    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [isAuthenticated, user, onNotificationReceived]);

  return {
    pusher: pusherRef.current,
    isConnected: pusherRef.current?.connection.state === 'connected'
  };
};