import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Construction } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Soon = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Coming Soon - SaaS Management System</title>
      </Helmet>
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Construction className="h-24 w-24 mx-auto text-primary animate-bounce" />
          <h1 className="mt-8 text-4xl font-bold text-gradient">
            {t('comingSoon')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('featureUnderConstruction')}
          </p>
          <Button onClick={() => navigate(-1)} className="mt-8">
            {t('goBack')}
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default Soon;