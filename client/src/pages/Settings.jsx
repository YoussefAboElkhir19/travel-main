import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from '@/components/ui/use-toast';
import SiteSettings from '@/components/settings/SiteSettings';
import ThemeLanguageSettings from '@/components/settings/ThemeLanguageSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';
import ShiftSettings from '@/components/settings/ShiftSettings';
import SmtpSettings from '@/components/settings/SmtpSettings';
import NavigationManagement from '@/components/settings/NavigationManagement';

const Settings = () => {
  const { t } = useLanguage();
  const {
    company,
    loading: companyLoading,
    updateCompanySettings,
    updateNavigation: updateCompanyNavigation,
    refreshCompanyData
  } = useCompany();

  const [settings, setSettings] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize settings from company data
  useEffect(() => {
    if (company && company.settings) {
      setSettings({
        siteName: company.settings.siteName || 'Company Portal',
        logo: company.settings.logo || null,
        favicon: company.settings.favicon || null,
        shiftSettings: company.settings.shiftSettings || {
          defaultShiftHours: 8,
          defaultBreakMinutes: 60,
          autoEndShift: true,
          shiftsPerDay: 1,
        },
        general: company.settings.general || {
          timezone: 'UTC+02:00',
          currency: 'EGP',
        },
        smtp: company.settings.smtp || {
          server: '',
          port: '',
          email: '',
          password: '',
        },
      });

      // Sort navigation by order
      const sortedNavigation = [...(company.settings.navigation || [])].sort((a, b) => a.order - b.order);
      setNavigation(sortedNavigation);
      setIsLoading(false);
    }
  }, [company]);

  // Handle saving all settings
  const handleSaveAll = useCallback(async () => {
    if (!settings || !company) {
      toast({
        title: "Error",
        description: "Missing required data",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare the complete settings payload
      const settingsPayload = {
        siteName: settings.siteName,
        logo: settings.logo,
        favicon: settings.favicon,
        shiftSettings: settings.shiftSettings,
        general: settings.general,
        smtp: settings.smtp,
        // Keep other existing settings
        primaryColor: company.settings.primaryColor,
        secondaryColor: company.settings.secondaryColor,
        roles: company.settings.roles,
      };

      // Update company settings
      const settingsResult = await updateCompanySettings(settingsPayload);

      if (!settingsResult.success) {
        throw new Error(settingsResult.error || 'Failed to update settings');
      }

      // Update navigation
      const navigationResult = await updateCompanyNavigation(navigation);

      if (!navigationResult.success) {
        throw new Error(navigationResult.error || 'Failed to update navigation');
      }

      // Update document title and favicon
      document.title = settings.siteName || 'Company Portal';
      const link = document.querySelector("link[rel~='icon']");
      if (link && settings.favicon) {
        link.href = settings.favicon;
      }

      // Refresh company data to ensure consistency
      await refreshCompanyData();

      toast({
        title: t('save'),
        description: "All your changes have been updated successfully.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [settings, navigation, company, updateCompanySettings, updateCompanyNavigation, refreshCompanyData, t]);

  // Handle individual setting updates
  const handleSettingsUpdate = useCallback((newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  // Handle navigation updates
  const handleNavigationUpdate = useCallback((newNavigation) => {
    setNavigation(newNavigation);
  }, []);

  // Show loading state
  if (companyLoading || isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Icons.Loader className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{settings.siteName || t('settings')}</title>
        {settings.favicon && <link rel="icon" type="image/png" href={settings.favicon} />}
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
              <Icons.Settings className="h-8 w-8" />
              <span>{t('settings')}</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your company settings and preferences
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              onClick={refreshCompanyData}
              disabled={isSaving}
            >
              <Icons.RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <Icons.Loader className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Icons.Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : t('save')}
            </Button>
          </div>
        </motion.div>

        {/* Site and Theme Settings Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* component  SiteSettings in setting folder  */}
            <SiteSettings
              settings={settings}
              setSettings={handleSettingsUpdate}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ThemeLanguageSettings />
          </motion.div>
        </div>

        {/* General and SMTP Settings Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* component  GeneralSettings in setting folder  */}
            <GeneralSettings
              settings={settings}
              setSettings={handleSettingsUpdate}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SmtpSettings
              settings={settings}
              setSettings={handleSettingsUpdate}
            />
          </motion.div>
        </div>

        {/* Shift Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ShiftSettings
            settings={settings}
            setSettings={handleSettingsUpdate}
          />
        </motion.div>

        {/* Navigation Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <NavigationManagement
            navigation={navigation}
            setNavigation={handleNavigationUpdate}
          />
        </motion.div>

        {/* Save Button (Mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:hidden"
        >
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <Icons.Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Icons.Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving Changes...' : t('save')}
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default Settings;