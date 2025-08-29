import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Sun, Moon, Globe, LogOut, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header = ({ onMenuClick }) => {
  const { theme, setTheme } = useTheme();
  const { language, changeLanguage, t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const { getDaysUntilExpiry, isSubscriptionActive } = useCompany();
  const { 
    notifications, 
    markAsRead, 
    unreadCount, 
    markAllAsRead, 
    isLoading,
    refreshNotifications 
  } = useNotifications();

  const [display , setDisplay ] = useState();


  const daysLeft = getDaysUntilExpiry();
  const subscriptionActive = isSubscriptionActive();

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
      refreshNotifications();

    }
  };

  const handleMarkAllAsRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead();
  };

  const handleRefreshNotifications = (e) => {
    e.preventDefault();
    e.stopPropagation();
    refreshNotifications();
  };

  return (
    <motion.header
      className="bg-card border-b border-border px-4 lg:px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title Dashboard And Subscription Days  */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-foreground">
              {t('dashboard')}
            </h1>
            {/* {subscriptionActive && (
              <p className="text-sm text-destructive">
                Subscription expires in {daysLeft} days
              </p>
            )} */}
          </div>
        </div>

        {/* Notification Dropdown  */}
        <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex justify-between items-center px-2 py-1.5">
                <DropdownMenuLabel className="flex items-center gap-2">
                  {t('notifications')}
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                </DropdownMenuLabel>
                <div className="flex gap-1">
                  {/* Refresh Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefreshNotifications}
                    disabled={isLoading}
                    className="h-6 w-6 p-0"
                  >
                    <Bell className="h-3 w-3" />
                  </Button>
                  {/* Mark All as Read Button */}
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleMarkAllAsRead}
                      className="h-6 text-xs px-2"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" /> {t('readAll') || 'Mark All Read'}
                    </Button>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {isLoading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading notifications...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map(notification => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      onSelect={() => handleNotificationClick(notification)}
                      className={`flex items-start space-x-3 p-3 cursor-pointer hover:bg-accent/50 ${
                        !notification.is_read ? 'bg-accent/20 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      {/* Unread indicator dot */}
                      <div className="flex-shrink-0 pt-1">
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Title if available */}
                        {notification.title && (
                          <p className={`text-sm font-medium text-foreground mb-1 ${
                            !notification.is_read ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </p>
                        )}
                        
                        {/* Message */}
                        <p className={`text-sm text-muted-foreground whitespace-pre-wrap break-words ${
                          !notification.is_read ? 'font-medium text-foreground' : ''
                        }`}>
                          {notification.text || notification.message}
                        </p>
                        
                        {/* Timestamp and delivery method */}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                          {notification.deliveryMethod && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                              {notification.deliveryMethod}
                            </span>
                          )}
                        </div>
                        
                        {/* Role indicator if sent to specific role */}
                        {notification.sendTo === 'role' && notification.role && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent text-accent-foreground">
                              Role: {notification.role.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-center py-4">
                    <div className="flex flex-col items-center text-muted-foreground w-full">
                      <Bell className="h-8 w-8 mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  </DropdownMenuItem>
                )}
              </div>
            </DropdownMenuContent>
           </DropdownMenu> 

          {/* Dark And Light Mode  */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'theme-default' : 'light')}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Languages Arabic And English  */}
          <Button variant="ghost" size="icon" onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}>
            <Globe className="h-5 w-5" />
          </Button>

          {/* Photo About User Login  */}
          <div className="flex items-center space-x-3 pl-3 border-l border-border">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`http://travel-server.test/uploads/users/${user?.avatar_url}`} alt={user?.user_name} />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">{user?.user_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role?.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-destructive hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;