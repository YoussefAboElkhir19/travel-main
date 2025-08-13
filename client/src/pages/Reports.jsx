import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BarChart3, Download, Calendar, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const Reports = () => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const reportTypes = [
    {
      id: 'bookings',
      title: 'Bookings Report',
      description: 'Detailed analysis of all bookings',
      icon: Calendar,
      color: 'text-blue-500',
      data: { total: 1234, growth: '+12%' }
    },
    {
      id: 'revenue',
      title: 'Revenue Report',
      description: 'Financial performance overview',
      icon: DollarSign,
      color: 'text-green-500',
      data: { total: '$45,678', growth: '+18%' }
    },
    {
      id: 'customers',
      title: 'Customer Report',
      description: 'Customer analytics and insights',
      icon: Users,
      color: 'text-purple-500',
      data: { total: 567, growth: '+8%' }
    },
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Team and operational metrics',
      icon: TrendingUp,
      color: 'text-orange-500',
      data: { total: '94%', growth: '+3%' }
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Monthly Bookings Analysis',
      type: 'Bookings',
      generatedAt: '2025-07-15 10:30',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Q1 Revenue Summary',
      type: 'Revenue',
      generatedAt: '2025-07-10 14:20',
      size: '1.8 MB',
      format: 'Excel'
    },
    {
      id: 3,
      name: 'Customer Satisfaction Report',
      type: 'Customer',
      generatedAt: '2025-07-08 09:15',
      size: '3.1 MB',
      format: 'PDF'
    }
  ];

  const handleGenerateReport = (reportType) => {
    toast({
      title: "Report Generation Started",
      description: `Generating ${reportType} report. You'll be notified when it's ready.`,
    });
  };

  const handleDownloadReport = (report) => {
    toast({
      title: t('featureNotImplemented'),
      description: `Download ${report.name} feature coming soon!`,
    });
  };

  const handleAction = (action) => {
    toast({
      title: t('featureNotImplemented'),
      description: `${action} feature coming soon!`,
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('reports')} - SaaS Management System</title>
        <meta name="description" content="Generate and view business reports and analytics" />
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
              <BarChart3 className="h-8 w-8" />
              <span>{t('reports')}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate insights and analytics for your business
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button onClick={() => handleAction('Custom Report')}>
              <FileText className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="card-hover cursor-pointer" onClick={() => handleGenerateReport(report.title)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-accent ${report.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">{report.data.total}</span>
                      <span className={`text-sm font-medium ${report.data.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {report.data.growth}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
              <CardDescription>
                Key metrics for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                  { label: 'Total Revenue', value: '$45,678', change: '+18%', positive: true },
                  { label: 'New Bookings', value: '234', change: '+12%', positive: true },
                  { label: 'Active Users', value: '1,456', change: '+8%', positive: true },
                  { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', positive: true },
                  { label: 'Avg. Order Value', value: '$195', change: '-2%', positive: false },
                  { label: 'Customer Satisfaction', value: '4.8/5', change: '+0.2', positive: true }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-xs font-medium ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Previously generated reports available for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{report.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.generatedAt}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <span>{report.format}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Monthly revenue performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive charts coming soon!</p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => handleAction('View Chart')}
                  >
                    View Detailed Chart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};