import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { TrendingUp, DollarSign, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const FinancialAccounts = () => {
  const { t } = useLanguage();

  const handleAction = (action) => {
    toast({
      title: t('featureNotImplemented'),
      description: `${action} feature coming soon!`,
    });
  };

  const financialData = [
    { title: 'Total Revenue', value: '$250,650', change: '+15.2%', isPositive: true },
    { title: 'Total Expenses', value: '$180,200', change: '+12.8%', isPositive: false },
    { title: 'Net Profit', value: '$70,450', change: '+21.5%', isPositive: true },
    { title: 'Profit Margin', value: '28.1%', change: '+2.1%', isPositive: true },
  ];

  return (
    <>
      <Helmet>
        <title>{t('financialaccounts')} - SaaS Management System</title>
      </Helmet>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
              <TrendingUp className="h-8 w-8" />
              <span>{t('financialaccounts')}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Overview of your company's financial performance.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button onClick={() => handleAction('Filter')} variant="outline">
              <Filter className="h-4 w-4 mr-2" /> {t('filter')}
            </Button>
            <Button onClick={() => handleAction('Export')}>
              <Download className="h-4 w-4 mr-2" /> {t('export')}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Card className="card-hover">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Detailed View</CardTitle>
              <CardDescription>
                This section will contain detailed financial charts and tables.
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

export default FinancialAccounts;