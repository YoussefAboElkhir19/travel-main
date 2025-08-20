import React, { useState, useEffect, useRef } from 'react';
import { Bell, Send, Mail, Users, Eye, Volume2, MailCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

const NotificationsPage = () => {
  const { t } = useLanguage();
  const { createNotification, getRoles } = useNotifications();
  const audioRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    role_id: '',
    sendTo: 'all',
    deliveryMethod: 'inApp'
  });

  // Load roles on component mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to load roles:', error);
      }
    };
    
    loadRoles();
  }, [getRoles]);

  // Sound preferences - using memory storage instead of localStorage
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled]);

  // Handle input change
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Send notification using the context
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!formData.message) {
      toast({ title: "Message is required", variant: "destructive" });
      return;
    }

    // Validate role selection when sendTo is 'specific'
    if (formData.sendTo === 'specific' && !formData.role_id) {
      toast({ title: "Please select a role", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await createNotification(formData);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        message: '',
        role_id: '',
        sendTo: 'all',
        deliveryMethod: 'inApp'
      });

    } catch (error) {
      // Error is already handled in the context
      console.error('Failed to send notification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div className="space-y-6">
        <div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
            <Bell className="h-8 w-8" />
            <span>{t('notifications')}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }} 
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Compose Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>{t('notificationTitle')}</Label>
                    <Input 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      placeholder="Optional title" 
                    />
                  </div>
                  
                  <div>
                    <Label>{t('notificationMessage')}</Label>
                    <Textarea 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      placeholder="Your message here..." 
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t('sendTo')}</Label>
                      <Select 
                        value={formData.sendTo} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          sendTo: value,
                          role_id: value === 'all' ? '' : prev.role_id // Clear role when switching to 'all'
                        }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <Users className="h-4 w-4 mr-2 inline-block" />
                            {t('allEmployees')}
                          </SelectItem>
                          <SelectItem value="specific">
                            <Users className="h-4 w-4 mr-2 inline-block" />
                            {t('specificRoles')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.sendTo === 'specific' && (
                      <div>
                        <Label>Role *</Label>
                        <Select 
                          value={formData.role_id} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}
                          required
                        >
                          <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>{t('deliveryMethod')}</Label>
                    <Select 
                      value={formData.deliveryMethod} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryMethod: value }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inApp">
                          <Bell className="h-4 w-4 mr-2 inline-block" />
                          {t('inApp')}
                        </SelectItem>
                        <SelectItem value="email">
                          <Mail className="h-4 w-4 mr-2 inline-block" />
                          Email
                        </SelectItem>
                        <SelectItem value="both">
                          <MailCheck className="h-4 w-4 mr-2 inline-block" />
                          {t('emailAndInApp')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleSendNotification} 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Sending...' : t('send')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }} 
            className="lg:col-span-1 space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  {t('preview')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-accent min-h-[150px]">
                  {formData.title && (
                    <p className="font-bold mb-2">{formData.title}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">
                    {formData.message || "Your message preview will appear here."}
                  </p>
                  {formData.sendTo === 'specific' && formData.role_id && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Target: {roles.find(r => r.id.toString() === formData.role_id)?.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-switch" className="flex items-center gap-2 text-lg">
                    <Volume2 className="h-5 w-5" /> {t('sound')}
                  </Label>
                  <Switch 
                    id="sound-switch" 
                    checked={soundEnabled} 
                    onCheckedChange={setSoundEnabled} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;