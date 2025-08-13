import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Users, Plus, Search, Filter, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const Customers = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 234 567 8900',
      location: 'New York, USA',
      totalBookings: 12,
      totalSpent: '$15,420',
      lastBooking: '2024-02-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 234 567 8901',
      location: 'London, UK',
      totalBookings: 8,
      totalSpent: '$9,850',
      lastBooking: '2024-02-10',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1 234 567 8902',
      location: 'Dubai, UAE',
      totalBookings: 15,
      totalSpent: '$22,300',
      lastBooking: '2024-02-18',
      status: 'VIP'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 234 567 8903',
      location: 'Sydney, Australia',
      totalBookings: 5,
      totalSpent: '$6,750',
      lastBooking: '2024-01-28',
      status: 'Inactive'
    }
  ];

  const handleAction = (action, customer = null) => {
    toast({
      title: t('featureNotImplemented'),
      description: `${action} feature coming soon!`,
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'vip': return 'text-purple-500 bg-purple-500/10';
      case 'inactive': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Customers - SaaS Management System</title>
        <meta name="description" content="Manage your customer database and relationships" />
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
              <Users className="h-8 w-8" />
              <span>{t('customers')}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your customer relationships and data
            </p>
          </div>
          
          <Button onClick={() => handleAction('Add Customer')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Customers', value: '1,234', color: 'text-blue-500' },
            { label: 'Active Customers', value: '987', color: 'text-green-500' },
            { label: 'VIP Customers', value: '45', color: 'text-purple-500' },
            { label: 'New This Month', value: '23', color: 'text-orange-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={() => handleAction('Filter')}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{customer.location}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Total Bookings</p>
                        <p className="text-lg font-bold text-primary">{customer.totalBookings}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Total Spent</p>
                        <p className="text-lg font-bold text-primary">{customer.totalSpent}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">
                        Last booking: {customer.lastBooking}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 pt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleAction('View Customer', customer)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAction('Contact Customer', customer)}
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first customer'}
            </p>
            <Button onClick={() => handleAction('Add Customer')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Customers;