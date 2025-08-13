import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const themes = [
  { name: 'Default', value: 'theme-default', color: 'bg-primary' },
  { name: 'Forest', value: 'theme-forest', color: 'bg-green-600' },
  { name: 'Ocean', value: 'theme-ocean', color: 'bg-cyan-500' },
  { name: 'Sunset', value: 'theme-sunset', color: 'bg-orange-500' },
];

const ThemeLanguageSettings = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center space-x-2"><Icons.Palette className="h-5 w-5" /><span>{t('theme')} & {t('language')}</span></CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t('theme')}</Label>
          <div className="flex items-center space-x-3 mt-2">
            {themes.map(th => (
              <div key={th.value} className="flex flex-col items-center space-y-1">
                <Button
                  variant={theme === th.value ? 'default' : 'outline'}
                  size="icon"
                  className={`${th.color}`}
                  onClick={() => setTheme(th.value)}
                >
                  <Icons.Check className={`h-4 w-4 ${theme === th.value ? 'opacity-100' : 'opacity-0'}`} />
                </Button>
                <span className="text-xs text-muted-foreground">{th.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>{t('language')}</Label>
          <div className="flex items-center space-x-3 mt-2">
            <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('en')}>English</Button>
            <Button variant={language === 'ar' ? 'default' : 'outline'} size="sm" onClick={() => changeLanguage('ar')}>العربية</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeLanguageSettings;