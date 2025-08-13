import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const FlightTickets = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Flight Tickets - SaaS Management System</title>
      </Helmet>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
              <Ticket className="h-8 w-8" />
              <span>Flight Tickets</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage all your flight tickets.
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
              <CardTitle>Flight Tickets Overview</CardTitle>
              <CardDescription>
                This section will contain flight ticket details and management tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-accent/20 rounded-lg">
                <p className="text-muted-foreground">{t('featureNotImplemented')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default FlightTickets;