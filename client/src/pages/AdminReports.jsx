import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BarChart3, Users, Clock, Plane, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const AdminReports = () => {
  const { t } = useLanguage();

  const handleAction = (action) => {
    toast({
      title: t('featureNotImplemented'),
      description: `${action} feature coming soon!`,
    });
  };

  const reportData = [
    { title: 'Employee Performance', icon: Users },
    { title: 'Attendance Summary', icon: Clock },
    { title: 'Booking Trends', icon: Plane },
  ];

  return (
    <>
      <Helmet>
        <title>{t('adminreports')} - SaaS Management System</title>
      </Helmet>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
              <BarChart3 className="h-8 w-8" />
              <span>{t('adminreports')}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Administrative reports for operational insights.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button onClick={() => handleAction('Filter')} variant="outline">
              <Filter className="h-4 w-4 mr-2" /> {t('filter')}
            </Button>
            <Button onClick={() => handleAction('Export All')}>
              <Download className="h-4 w-4 mr-2" /> {t('export')}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.map((report, index) => {
            const Icon = report.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{report.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center bg-accent/20 rounded-lg mb-4">
                      <p className="text-muted-foreground text-sm">Chart Placeholder</p>
                    </div>
                    <Button onClick={() => handleAction(`View ${report.title}`)} className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>
                This section will allow building custom administrative reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
                <p className="text-muted-foreground">{t('featureNotImplemented')}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AdminReports;