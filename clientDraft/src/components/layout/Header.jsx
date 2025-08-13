import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Sun, Moon, Globe, LogOut, CheckCheck } from 'lucide-react';
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
import { Link } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { theme, setTheme } = useTheme();
  const { language, changeLanguage, t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const { getDaysUntilExpiry, isSubscriptionActive } = useCompany();
  const { notifications, markAsRead, unreadCount, markAllAsRead } = useNotifications();

  const daysLeft = getDaysUntilExpiry();
  const subscriptionActive = isSubscriptionActive();

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
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-foreground">
              {t('dashboard')}
            </h1>
            {!subscriptionActive && (
              <p className="text-sm text-destructive">
                Subscription expires in {daysLeft} days
              </p>
            )}
          </div>
        </div>

        <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full notification-badge"></span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex justify-between items-center px-2 py-1.5">
                <DropdownMenuLabel>{t('notifications')}</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}>
                    <CheckCheck className="h-4 w-4 mr-1" /> {t('readAll')}
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(n => (
                  <DropdownMenuItem key={n.id} onSelect={() => markAsRead(n.id)} className={`flex items-start space-x-2 ${!n.is_read ? 'font-bold' : ''}`}>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{n.text}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                    </div>
                  </DropdownMenuItem>
                )) : <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'theme-default' : 'light')}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => changeLanguage(language === 'en' ? 'ar' : 'en')}>
            <Globe className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3 pl-3 border-l border-border">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url} alt={user?.username} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
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