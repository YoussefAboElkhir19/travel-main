import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { useLanguage } from '@/contexts/LanguageContext';

const PageTitleUpdater = () => {
    const location = useLocation();
    const { company } = useCompany();
    const { t } = useLanguage();
    
    useEffect(() => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const pageKey = pathParts.length > 0 ? pathParts[pathParts.length - 1].replace(/-/g, '') : 'dashboard';
        const pageTitle = t(pageKey);
        const siteName = company?.settings?.siteName || 'SaaS Portal';
        
        if (pageTitle && pageTitle !== pageKey) {
            document.title = `${pageTitle} - ${siteName}`;
        } else {
            const capitalizedTitle = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
            document.title = `${capitalizedTitle} - ${siteName}`;
        }

    }, [location, company, t]);

    return null;
};

export default PageTitleUpdater;