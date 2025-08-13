import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Crown, Building, Users, DollarSign, Settings, Plus, Edit, Trash2, CheckCircle, XCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();

  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'Demo Company',
      subdomain: 'demo',
      plan: 'Premium',
      status: 'active',
      employees: 25,
      expiresAt: '2025-08-15',
      monthlyRevenue: '$2,500',
      features: {
        max_employees: 50,
        max_bookings: 1000,
        respond_integration: true,
        advanced_reports: true
      }
    },
    {
      id: 2,
      name: 'Travel Agency Pro',
      subdomain: 'travelagency',
      plan: 'Business',
      status: 'active',
      employees: 12,
      expiresAt: '2025-08-28',
      monthlyRevenue: '$1,200',
      features: {
        max_employees: 25,
        max_bookings: 500,
        respond_integration: true,
        advanced_reports: false
      }
    },
    {
      id: 3,
      name: 'Small Tours',
      subdomain: 'smalltours',
      plan: 'Basic',
      status: 'expired',
      employees: 5,
      expiresAt: '2025-07-15',
      monthlyRevenue: '$500',
      features: {
        max_employees: 10,
        max_bookings: 100,
        respond_integration: false,
        advanced_reports: false
      }
    }
  ]);

  const plans = [
    {
      name: 'Basic',
      price: '$29/month',
      features: { max_employees: 10, max_bookings: 100, respond_integration: false, advanced_reports: false }
    },
    {
      name: 'Business',
      price: '$79/month',
      features: { max_employees: 25, max_bookings: 500, respond_integration: true, advanced_reports: false }
    },
    {
      name: 'Premium',
      price: '$149/month',
      features: { max_employees: 50, max_bookings: 1000, respond_integration: true, advanced_reports: true }
    }
  ];

  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleAction = (action, company = null) => {
    toast({
      title: "Action Performed",
      description: `${action} ${company ? `for ${company.name}` : ''} - Feature coming soon!`,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'expired': return 'text-red-500 bg-red-500/10';
      case 'suspended': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case 'premium': return 'text-purple-500 bg-purple-500/10';
      case 'business': return 'text-blue-500 bg-blue-500/10';
      case 'basic': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getDaysUntilExpiry = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Helmet>
        <title>Super Admin Dashboard - SaaS Management System</title>
        <meta name="description" content="Super administrator dashboard for managing all companies and subscriptions" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Crown className="h-8 w-8" /><span>Super Admin Dashboard</span></h1>
              <p className="text-muted-foreground mt-2">Manage all companies, subscriptions, and system settings</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button variant="outline" onClick={() => handleAction('System Settings')}><Settings className="h-4 w-4 mr-2" />System Settings</Button>
              <Button onClick={logout} variant="destructive">Logout</Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Companies', value: companies.length, icon: Building, color: 'text-blue-500' },
              { label: 'Active Subscriptions', value: companies.filter(c => c.status === 'active').length, icon: CheckCircle, color: 'text-green-500' },
              { label: 'Total Users', value: companies.reduce((acc, c) => acc + c.employees, 0), icon: Users, color: 'text-purple-500' },
              { label: 'Monthly Revenue', value: `$${companies.reduce((acc, c) => acc + parseFloat(c.monthlyRevenue.replace('$', '').replace(',', '')), 0).toLocaleString()}`, icon: DollarSign, color: 'text-orange-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-accent ${stat.color}`}><Icon className="h-6 w-6" /></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div><CardTitle>Companies Management</CardTitle><CardDescription>Manage all registered companies and their subscriptions</CardDescription></div>
                  <Button onClick={() => handleAction('Add Company')}><Plus className="h-4 w-4 mr-2" />Add Company</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companies.map((company, index) => {
                    const daysLeft = getDaysUntilExpiry(company.expiresAt);
                    return (
                      <motion.div key={company.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-foreground">{company.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(company.plan)}`}>{company.plan}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>{company.status}</span>
                              {daysLeft <= 7 && daysLeft > 0 && (<span className="px-2 py-1 rounded-full text-xs font-medium text-yellow-500 bg-yellow-500/10">Expires in {daysLeft} days</span>)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div><span className="font-medium text-foreground">Subdomain:</span> {company.subdomain}.app.com</div>
                              <div><span className="font-medium text-foreground">Employees:</span> {company.employees}/{company.features.max_employees}</div>
                              <div><span className="font-medium text-foreground">Revenue:</span> {company.monthlyRevenue}</div>
                              <div><span className="font-medium text-foreground">Expires:</span> {company.expiresAt}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedCompany(company)}><Edit className="h-3 w-3 mr-1" />Manage</Button>
                            <Button size="sm" variant={company.status === 'active' ? 'destructive' : 'default'} onClick={() => handleAction(company.status === 'active' ? 'Suspend' : 'Activate', company)}>
                              {company.status === 'active' ? <><XCircle className="h-3 w-3 mr-1" />Suspend</> : <><CheckCircle className="h-3 w-3 mr-1" />Activate</>}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {selectedCompany && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCompany(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <Card className="max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Manage {selectedCompany.name}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCompany(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium text-foreground mb-3">Company Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="companyName">Company Name</Label><Input id="companyName" defaultValue={selectedCompany.name} /></div>
                        <div><Label htmlFor="subdomain">Subdomain</Label><Input id="subdomain" defaultValue={selectedCompany.subdomain} /></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-3">Subscription Management</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          {plans.map((plan) => (
                            <div key={plan.name} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedCompany.plan === plan.name ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`} onClick={() => handleAction(`Change to ${plan.name}`, selectedCompany)}>
                              <h4 className="font-medium text-foreground">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">{plan.price}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label htmlFor="expiryDate">Expiry Date</Label><Input id="expiryDate" type="date" defaultValue={new Date(selectedCompany.expiresAt).toISOString().split('T')[0]} /></div>
                          <div><Label htmlFor="status">Status</Label><select id="status" defaultValue={selectedCompany.status} className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"><option value="active">Active</option><option value="suspended">Suspended</option><option value="expired">Expired</option></select></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-3">Feature Limits</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="maxEmployees">Max Employees</Label><Input id="maxEmployees" type="number" defaultValue={selectedCompany.features.max_employees} /></div>
                        <div><Label htmlFor="maxBookings">Max Bookings</Label><Input id="maxBookings" type="number" defaultValue={selectedCompany.features.max_bookings} /></div>
                      </div>
                      <div className="flex items-center justify-between mt-4"><span className="text-sm font-medium text-foreground">Respond Integration</span><Button size="sm" variant={selectedCompany.features.respond_integration ? 'default' : 'outline'} onClick={() => handleAction('Toggle Respond Integration', selectedCompany)}>{selectedCompany.features.respond_integration ? 'Enabled' : 'Disabled'}</Button></div>
                      <div className="flex items-center justify-between mt-2"><span className="text-sm font-medium text-foreground">Advanced Reports</span><Button size="sm" variant={selectedCompany.features.advanced_reports ? 'default' : 'outline'} onClick={() => handleAction('Toggle Advanced Reports', selectedCompany)}>{selectedCompany.features.advanced_reports ? 'Enabled' : 'Disabled'}</Button></div>
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={() => handleAction('Save Changes', selectedCompany)}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setSelectedCompany(null)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;