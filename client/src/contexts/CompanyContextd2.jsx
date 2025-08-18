import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/// Sh8alll
const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

const initialNavItems = [
  { id: 'dashboard', type: 'link', path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', order: 1, roles: ['admin', 'manager'] },
  { id: 'attendance', type: 'link', path: '/attendance', label: 'Shift Attendance', icon: 'ClipboardCheck', order: 2, roles: ['employee', 'admin', 'manager'] },
  { id: 'leave-requests', type: 'link', path: '/leave-requests', label: 'Leave Requests', icon: 'FileText', order: 3, roles: ['employee', 'admin', 'manager'] },
  { id: 'my-reservations', type: 'link', path: '/my-reservations', label: 'My Reservations', icon: 'BookOpen', order: 4, roles: ['employee', 'admin', 'manager'] },
  { id: 'todo', type: 'link', path: '/todo', label: 'To Do List', icon: 'CheckSquare', order: 5, roles: ['employee', 'admin', 'manager'] },
  { id: 'emails', type: 'link', path: '/emails', label: 'Webmail', icon: 'Mail', order: 6, roles: ['employee', 'admin', 'manager'] },

  { id: 'divider-1', type: 'group', label: '', order: 7, roles: ['employee', 'admin', 'manager'], divider: true },

  // ========================= External Links
  { id: 'group-external', type: 'group', label: 'External Links', order: 8, roles: ['employee', 'admin', 'manager'] },
  { id: 'lavida-travel', type: 'external', path: 'https://lavidatravel.com', label: 'Lavida Travel', icon: 'Globe', order: 9, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
  { id: 'respond', type: 'external', path: 'https://respond.io', label: 'Respond', icon: 'MessageSquare', order: 10, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
  { id: 'calls', type: 'external', path: 'https://callsystem.example.com', label: 'Calls', icon: 'Phone', order: 11, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
  { id: 'mails', type: 'external', path: 'https://mail.example.com', label: 'Mails', icon: 'Mails', order: 12, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },
  { id: 'sadad-pay', type: 'external', path: 'https://sadadpay.com', label: 'Sadad Pay', icon: 'CreditCard', order: 13, roles: ['employee', 'admin', 'manager'], groupId: 'group-external', openInNewTab: true },

  // ========================= Bookings Section 
  { id: 'group-bookings', type: 'group', label: 'Bookings Section', order: 14, roles: ['employee', 'admin', 'manager'] },
  { id: 'flight-group', type: 'link', path: '#', label: 'Flight', icon: 'Plane', order: 15, roles: ['employee', 'admin', 'manager'], groupId: 'group-bookings' },
  { id: 'flight-bookings', type: 'link', path: '/flight/bookings', label: 'Bookings', icon: 'BookMarked', order: 16, roles: ['employee', 'admin', 'manager'], groupId: 'flight-group' },
  { id: 'flight-tickets', type: 'link', path: '/flight/tickets', label: 'Tickets', icon: 'Ticket', order: 17, roles: ['employee', 'admin', 'manager'], groupId: 'flight-group' },
  { id: 'hotels-group', type: 'link', path: '#', label: 'Hotels', icon: 'Hotel', order: 18, roles: ['employee', 'admin', 'manager'], groupId: 'group-bookings' },
  { id: 'hotel-bookings', type: 'link', path: '/hotels/bookings', label: 'Bookings', icon: 'BookMarked', order: 19, roles: ['employee', 'admin', 'manager'], groupId: 'hotels-group' },
  { id: 'hotel-checkin', type: 'link', path: '/hotels/checkin', label: 'Check-in', icon: 'ClipboardCheck', order: 20, roles: ['employee', 'admin', 'manager'], groupId: 'hotels-group' },
  { id: 'other-group', type: 'link', path: '#', label: 'Other', icon: 'MoreHorizontal', order: 21, roles: ['employee', 'admin', 'manager'], groupId: 'group-bookings' },
  { id: 'visa', type: 'link', path: '/visa', label: 'Visa', icon: 'FileCheck', order: 22, roles: ['employee', 'admin', 'manager'], groupId: 'other-group' },
  { id: 'insurance', type: 'link', path: '/insurance', label: 'Insurance', icon: 'ShieldCheck', order: 23, roles: ['employee', 'admin', 'manager'], groupId: 'other-group' },
  { id: 'transport', type: 'link', path: '/transport', label: 'Transport', icon: 'Car', order: 24, roles: ['employee', 'admin', 'manager'], groupId: 'other-group' },

  { id: 'divider-2', type: 'group', label: '', order: 25, roles: ['admin', 'manager'], divider: true },
  // ========================= Administration
  { id: 'group-admin', type: 'group', label: 'Administration', order: 26, roles: ['admin', 'manager'] },
  { id: 'financial-accounts', type: 'link', path: '/financial-accounts', label: 'Financial Accounts', icon: 'TrendingUp', order: 27, roles: ['admin', 'accountant'], groupId: 'group-admin' },
  { id: 'user-management', type: 'link', path: '/user-management', label: 'User Management', icon: 'Users', order: 28, roles: ['admin'], groupId: 'group-admin' },
  { id: 'notifications', type: 'link', path: '/notifications', label: 'Notifications', icon: 'Bell', order: 30, roles: ['admin'], groupId: 'group-admin' },
  { id: 'settings', type: 'link', path: '/settings', label: 'Settings', icon: 'Settings', order: 32, roles: ['admin'], groupId: 'group-admin' },
  { id: 'profile', type: 'link', path: '/profile', label: 'Profile', icon: 'UserCircle', order: 33, roles: ['employee', 'admin', 'manager', 'accountant'], groupId: 'group-admin' },
];

const defaultSettings = {
  siteName: 'Company Portal',
  logo: null,
  favicon: null,
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  shiftSettings: {
    defaultShiftHours: 8,
    defaultBreakMinutes: 60,
    autoEndShift: true,
    shiftsPerDay: 1,
  },
  general: {
    timezone: 'UTC+02:00',
    currency: 'EGP',
  },
  smtp: {
    server: '',
    port: '',
    email: '',
    password: '',
  },
  navigation: initialNavItems,
  roles: ['admin', 'employee', 'manager', 'accountant'],
};

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCompany = localStorage.getItem('company');
      const storedSubscription = localStorage.getItem('subscription');

      if (storedCompany && storedSubscription) {
        const parsedCompany = JSON.parse(storedCompany);

        const navigation = parsedCompany.settings.navigation.filter(item => item.id !== 'export');
        parsedCompany.settings.navigation = navigation;

        parsedCompany.settings = {
          ...defaultSettings,
          ...parsedCompany.settings,
          shiftSettings: { ...defaultSettings.shiftSettings, ...parsedCompany.settings.shiftSettings },
          general: { ...defaultSettings.general, ...parsedCompany.settings.general },
          smtp: { ...defaultSettings.smtp, ...parsedCompany.settings.smtp },
        };
        setCompany(parsedCompany);
        setSubscription(JSON.parse(storedSubscription));
      } else {
        const mockCompany = {
          id: 1,
          name: 'test Company',
          subdomain: 'demo',
          settings: {
            ...defaultSettings,
            navigation: defaultSettings.navigation.filter(item => item.id !== 'export')
          }
        };

        const mockSubscription = {
          id: 1,
          company_id: 1,
          plan: 'premium',
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features: {
            max_employees: 50,
            max_bookings: 1000,
            respond_integration: true,
            advanced_reports: true
          }
        };
        setCompany(mockCompany);
        setSubscription(mockSubscription);
        localStorage.setItem('company', JSON.stringify(mockCompany));
        localStorage.setItem('subscription', JSON.stringify(mockSubscription));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      localStorage.removeItem('company');
      localStorage.removeItem('subscription');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompanySettings = useCallback((newSettings) => {
    setCompany(prev => {
      const updatedCompany = {
        ...prev,
        settings: { ...prev.settings, ...newSettings }
      };
      localStorage.setItem('company', JSON.stringify(updatedCompany));
      return updatedCompany;
    });
  }, []);

  const updateNavigation = useCallback((newNav) => {
    setCompany(prev => {
      const updatedCompany = {
        ...prev,
        settings: { ...prev.settings, navigation: newNav }
      };
      localStorage.setItem('company', JSON.stringify(updatedCompany));
      return updatedCompany;
    });
  }, []);

  const isFeatureAvailable = (feature) => {
    if (!subscription) return false;
    return subscription.features[feature] === true;
  };

  const isSubscriptionActive = () => {
    if (!subscription) return false;
    return subscription.status === 'active' && new Date(subscription.expires_at) > new Date();
  };

  const getDaysUntilExpiry = () => {
    if (!subscription) return 0;
    const now = new Date();
    const expiry = new Date(subscription.expires_at);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const value = {
    company,
    subscription,
    updateCompanySettings,
    updateNavigation,
    isFeatureAvailable,
    isSubscriptionActive,
    getDaysUntilExpiry,
    loading
  };

  return (
    <CompanyContext.Provider value={value}>
      {!loading && children}
    </CompanyContext.Provider>
  );
};