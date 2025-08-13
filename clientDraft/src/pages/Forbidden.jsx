import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Access Forbidden - SaaS Management System</title>
        <meta name="description" content="You don't have permission to access this page" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <Shield className="h-12 w-12 text-red-400" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">Access Forbidden</h1>
            <p className="text-xl text-white/80 max-w-md mx-auto">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/90"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Forbidden;