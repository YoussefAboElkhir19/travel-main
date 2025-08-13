import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Helmet } from 'react-helmet';
    import * as Icons from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useCompany } from '@/contexts/CompanyContext';
    import { useSupabase } from '@/contexts/SupabaseContext';
    import { toast } from '@/components/ui/use-toast';
    import SiteSettings from '@/components/settings/SiteSettings';
    import ThemeLanguageSettings from '@/components/settings/ThemeLanguageSettings';
    import GeneralSettings from '@/components/settings/GeneralSettings';
    import ShiftSettings from '@/components/settings/ShiftSettings';
    import SmtpSettings from '@/components/settings/SmtpSettings';
    import NavigationManagement from '@/components/settings/NavigationManagement';

    const Settings = () => {
      const { t } = useLanguage();
      const { company, loading: companyLoading } = useCompany();
      const { supabase } = useSupabase();
      
      const [settings, setSettings] = useState(null);
      const [navigation, setNavigation] = useState([]);
      const [isSaving, setIsSaving] = useState(false);

      useEffect(() => {
        const fetchSettings = async () => {
          if(company && supabase){
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .eq('company_id', company.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                toast({ title: "Error fetching settings", description: error.message, variant: "destructive"});
            } else {
              const mergedSettings = { ...company.settings, ...(data?.settings || {}) };
               setSettings({
                siteName: mergedSettings.siteName,
                logo: mergedSettings.logo,
                favicon: mergedSettings.favicon,
                shiftSettings: mergedSettings.shiftSettings,
                general: mergedSettings.general,
                smtp: mergedSettings.smtp,
              });
              setNavigation(mergedSettings.navigation.sort((a,b) => a.order - b.order));
            }
          }
        };
        fetchSettings();
      }, [company, supabase]);

      const handleSaveAll = useCallback(async () => {
        if (!settings || !company || !supabase) return;
        setIsSaving(true);
        
        const settingsPayload = {
            ...company.settings,
            ...settings,
            navigation,
        };

        const { error } = await supabase
            .from('company_settings')
            .upsert({ company_id: company.id, settings: settingsPayload }, { onConflict: 'company_id' });

        setIsSaving(false);
        if (error) {
            toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
        } else {
            document.title = settings.siteName || 'SaaS Management System';
            const link = document.querySelector("link[rel~='icon']");
            if (link) {
                link.href = settings.favicon || '/favicon.ico';
            }
            toast({ title: t('save'), description: "All your changes have been updated successfully." });
        }
      }, [settings, navigation, company, supabase, t]);
      
      if (companyLoading || !settings) return <div>{t('loading')}</div>;

      return (
        <>
          <Helmet>
            <title>{settings.siteName || t('settings')}</title>
            {settings.favicon && <link rel="icon" type="image/png" href={settings.favicon} />}
          </Helmet>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Icons.Settings className="h-8 w-8" /><span>{t('settings')}</span></h1>
                </div>
                <Button onClick={handleSaveAll} disabled={isSaving}>
                    {isSaving ? <Icons.Loader className="animate-spin h-4 w-4 mr-2" /> : <Icons.Save className="h-4 w-4 mr-2" />}
                    {t('save')}
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <SiteSettings settings={settings} setSettings={setSettings} />
              </motion.div>
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <ThemeLanguageSettings />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <GeneralSettings settings={settings} setSettings={setSettings} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <SmtpSettings settings={settings} setSettings={setSettings} />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <ShiftSettings settings={settings} setSettings={setSettings} />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <NavigationManagement navigation={navigation} setNavigation={setNavigation} />
            </motion.div>
          </div>
        </>
      );
    };

    export default Settings;