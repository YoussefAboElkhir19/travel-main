import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UploadCloud, FileArchive, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const ExportPage = () => {
  const { t } = useLanguage();

  const handleExportWebsite = () => {
    toast({
      title: t('exportWebsite'),
      description: "Please use the 'Hostinger Horizons' dropdown menu in the top-left corner and select 'Export Project' to download your website.",
      duration: 10000,
    });
  };

  const handleExportDatabase = () => {
    toast({
      title: t('exportDB'),
      description: "Database export functionality will be available after connecting to a Supabase project.",
      variant: 'destructive',
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('exportdata')} - SaaS Management System</title>
      </Helmet>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
            <UploadCloud className="h-8 w-8" />
            <span>{t('exportTitle')}</span>
          </h1>
          <p className="text-muted-foreground mt-2">{t('exportDesc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-hover h-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileArchive className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{t('exportWebsite')}</CardTitle>
                    <CardDescription>{t('exportWebsiteDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={handleExportWebsite}>
                  {t('download')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-hover h-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{t('exportDB')}</CardTitle>
                    <CardDescription>{t('exportDBDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={handleExportDatabase}>
                  {t('download')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ExportPage;