import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Home, ArrowLeft, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <>
      <Helmet>
        <title>404 Not Found - SaaS Management System</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="text-9xl font-bold text-primary"
          >
            404
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Oops! Page Not Found</h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              It seems the page you were looking for has vanished into thin air.
            </p>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </motion.div>
          
          <Frown className="h-16 w-16 text-muted-foreground mx-auto animate-bounce" />
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;