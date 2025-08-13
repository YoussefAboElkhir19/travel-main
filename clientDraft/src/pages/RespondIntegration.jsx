import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { MessageSquare, Settings, Users, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const RespondIntegration = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  const integrationStats = [
    { label: 'Messages Today', value: '127', color: 'text-blue-500' },
    { label: 'Active Conversations', value: '23', color: 'text-green-500' },
    { label: 'Response Time', value: '2.3m', color: 'text-purple-500' },
    { label: 'Satisfaction Rate', value: '94%', color: 'text-orange-500' }
  ];

  const teamMembers = [
    { id: 1, name: 'John Doe', status: 'online', messages: 45, responseTime: '1.2m' },
    { id: 2, name: 'Jane Smith', status: 'away', messages: 32, responseTime: '2.1m' },
    { id: 3, name: 'Mike Johnson', status: 'offline', messages: 28, responseTime: '3.5m' }
  ];

  const handleConnect = () => {
    if (!apiKey || !workspaceId) {
      toast({
        title: "Missing Information",
        description: "Please provide both API key and workspace ID.",
        variant: "destructive",
      });
      return;
    }

    setIsConnected(true);
    toast({
      title: "Integration Connected",
      description: "Respond.io has been successfully connected to your account.",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
    setWorkspaceId('');
    toast({
      title: "Integration Disconnected",
      description: "Respond.io integration has been disconnected.",
    });
  };

  const handleAction = (action) => {
    toast({
      title: t('featureNotImplemented'),
      description: `${action} feature coming soon!`,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500 bg-green-500/10';
      case 'away': return 'text-yellow-500 bg-yellow-500/10';
      case 'offline': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  return (
    <>
      <Helmet>
        <title>Respond Integration - SaaS Management System</title>
        <meta name="description" content="Integrate and manage Respond.io chat functionality" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
              <MessageSquare className="h-8 w-8" />
              <span>{t('respondIntegration')}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect and manage your Respond.io chat integration
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 lg:mt-0">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-500 font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Connection Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className={`border-2 ${isConnected ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Integration Setup</span>
              </CardTitle>
              <CardDescription>
                Configure your Respond.io connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Respond.io API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isConnected}
                  />
                </div>
                <div>
                  <Label htmlFor="workspaceId">Workspace ID</Label>
                  <Input
                    id="workspaceId"
                    placeholder="Enter your workspace ID"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                    disabled={isConnected}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isConnected ? (
                  <Button onClick={handleConnect}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connect Integration
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={handleDisconnect}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleAction('Test Connection')}>
                  Test Connection
                </Button>
              </div>
              
              {!isConnected && (
                <div className="p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Setup Instructions:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Log in to your Respond.io dashboard</li>
                    <li>Navigate to Settings → API & Webhooks</li>
                    <li>Generate a new API key with appropriate permissions</li>
                    <li>Copy your workspace ID from the URL or settings</li>
                    <li>Paste both values above and click Connect</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {isConnected && (
          <>
            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {integrationStats.map((stat, index) => (
                  <Card key={stat.label} className="card-hover">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Team Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Team Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor your team's chat performance and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-medium text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{member.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 text-center">
                          <div>
                            <p className="text-lg font-bold text-foreground">{member.messages}</p>
                            <p className="text-xs text-muted-foreground">Messages</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground">{member.responseTime}</p>
                            <p className="text-xs text-muted-foreground">Avg Response</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chat Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Chat Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed analytics and insights from your chat interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Chat analytics dashboard coming soon!</p>
                      <Button 
                        variant="outline"
                        onClick={() => handleAction('View Analytics')}
                      >
                        View Detailed Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Shift Restrictions Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Shift-Based Access</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Respond.io integration is only available during active work shifts. 
                    Chat functionality is automatically disabled during break times and outside work hours.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>• Chat access: Only during active shifts</p>
                    <p>• Break time: Chat is disabled</p>
                    <p>• After hours: No chat access</p>
                    <p>• Admin override: Available for administrators</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default RespondIntegration;