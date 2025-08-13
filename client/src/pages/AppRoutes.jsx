import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Route, Link } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const AppRoutes = () => {
  const { t } = useLanguage();

  const routes = [
    { path: '/dashboard', description: 'Main admin dashboard with key metrics.' },
    { path: '/attendance', description: 'Employee shift attendance and calendar.' },
    { path: '/leave-requests', description: 'Manage employee leave requests.' },
    { path: '/bookings', description: 'View and manage all bookings.' },
    { path: '/flight-bookings', description: 'Manage flight-specific bookings.' },
    { path: '/hotel-bookings', description: 'Manage hotel-specific bookings.' },
    { path: '/other-bookings', description: 'Manage other types of bookings.' },
    { path: '/todo', description: 'Personal to-do list for employees.' },
    { path: '/emails', description: 'Internal webmail client.' },
    { path: '/calls', description: 'Call logs and related integrations.' },
    { path: '/mails', description: 'Mail logs and related integrations.' },
    { path: '/respond-integration', description: 'Manage Respond.io integration.' },
    { path: '/customers', description: 'Customer relationship management.' },
    { path: '/financial-accounts', description: 'Company financial accounts overview.' },
    { path: '/admin-reports', description: 'General administrative reports.' },
    { path: '/reports', description: 'Advanced business intelligence reports.' },
    { path: '/users', description: 'Manage system users.' },
    { path: '/roles', description: 'Manage user roles and permissions.' },
    { path: '/settings', description: 'Configure system and company settings.' },
    { path: '/profile', description: 'User\'s personal profile page.' },
    { path: '/super-admin', description: 'Super admin dashboard for managing companies.' },
    { path: '/login', description: 'Application login page.' },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: `Path: ${text}`,
    });
  };

  return (
    <>
      <Helmet>
        <title>App Routes - SaaS Management System</title>
      </Helmet>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
              <Route className="h-8 w-8" />
              <span>Application Routes</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              A list of all available pages and their paths.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Page Links</CardTitle>
              <CardDescription>
                Use these paths for navigation menus and links within the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routes.map((route, index) => (
                  <motion.div
                    key={route.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="font-mono font-semibold text-primary">{route.path}</p>
                      <p className="text-sm text-muted-foreground mt-1">{route.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(route.path)}>
                      <Link className="h-3 w-3 mr-2" />
                      Copy Path
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AppRoutes;