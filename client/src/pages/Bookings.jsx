import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Calendar, Plus, Search, Hotel, Plane, FileCheck, Ship, ShieldCheck, Car, Eye, Edit, Trash2, BarChart2, FileText, Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { format, differenceInDays, parseISO, add } from 'date-fns';

const mockBookingsData = [
  { id: 1, userId: 2, createdAt: '2025-07-25T10:00:00Z', customerName: 'Jane Smith', customerPhone: '987-654-3210', type: 'Hotel', sellPrice: 1200, status: 'issued', details: { name: 'Grand Hyatt', checkIn: format(add(new Date(), { days: 5 }), 'yyyy-MM-dd'), checkOut: '2025-08-15' }, reminderDays: 3 },
  { id: 2, userId: 2, createdAt: '2025-07-24T11:30:00Z', customerName: 'Jane Smith', customerPhone: '987-654-3210', type: 'Flight', sellPrice: 850, status: 'hold', details: { airline: 'Emirates', ticketNumber: 'EK512', departureDate: format(add(new Date(), { days: 2 }), 'yyyy-MM-dd') }, reminderDays: 3 },
  { id: 3, userId: 2, createdAt: '2025-07-22T14:00:00Z', customerName: 'Jane Smith', customerPhone: '987-654-3210', type: 'Visa', sellPrice: 300, status: 'cancelled', details: { country: 'USA', applicationDate: '2025-07-20' }, reminderDays: 3 },
  { id: 4, userId: 1, createdAt: '2025-07-26T09:00:00Z', customerName: 'Admin Booking', customerPhone: '111-222-3333', type: 'Cruise', sellPrice: 2500, status: 'issued', details: { line: 'Royal Caribbean', shipName: 'Symphony of the Seas', sailDate: '2025-09-01' }, reminderDays: 7 },
];

const bookingTypeDetails = {
  Hotel: { icon: Hotel, color: 'text-blue-500', dateField: 'checkIn' },
  Flight: { icon: Plane, color: 'text-purple-500', dateField: 'departureDate' },
  Visa: { icon: FileCheck, color: 'text-green-500', dateField: 'applicationDate' },
  Cruise: { icon: Ship, color: 'text-teal-500', dateField: 'sailDate' },
  Insurance: { icon: ShieldCheck, color: 'text-orange-500', dateField: 'startDate' },
  Transport: { icon: Car, color: 'text-yellow-500', dateField: 'pickupDate' },
};

const Bookings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ type: 'All', search: '' });
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

  useEffect(() => {
    const userBookings = mockBookingsData.filter(b => b.userId === user.id);
    setBookings(userBookings);
  }, [user.id]);
  
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      (filters.type === 'All' || b.type === filters.type) &&
      (b.customerName.toLowerCase().includes(filters.search.toLowerCase()))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings, filters]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'issued': return 'bg-green-500/10 text-green-500';
      case 'hold': return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleAction = (type, data = null) => setModal({ isOpen: true, type, data });
  const closeModal = () => setModal({ isOpen: false, type: null, data: null });

  const handleSave = (updatedBooking) => {
    if (updatedBooking.id) {
      setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      toast({ title: "Booking updated" });
    } else {
      const newBooking = { ...updatedBooking, id: Date.now(), userId: user.id, createdAt: new Date().toISOString() };
      setBookings(prev => [newBooking, ...prev]);
      toast({ title: "Booking added" });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    toast({ title: "Booking deleted", variant: "destructive" });
    closeModal();
  };

  return (
    <>
      <Helmet><title>{t('myreservations')} - SaaS Management System</title></Helmet>
      
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Calendar className="h-8 w-8" /><span>{t('myreservations')}</span></h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-grow w-full"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('searchBookings')} value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))} className="pl-10"/></div>
              <select className="w-full md:w-auto px-3 py-2 border border-input rounded-md bg-background" value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))}>
                {['All', ...Object.keys(bookingTypeDetails)].map(type => <option key={type} value={type}>{t(type.toLowerCase())}</option>)}
              </select>
              <Button onClick={() => handleAction('add')} className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" />{t('addBooking')}</Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map(booking => {
            const TypeIcon = bookingTypeDetails[booking.type]?.icon || FileText;
            const dateField = bookingTypeDetails[booking.type]?.dateField;
            const eventDate = booking.details[dateField];
            const isUpcoming = eventDate && differenceInDays(parseISO(eventDate), new Date()) <= (booking.reminderDays || 3) && differenceInDays(parseISO(eventDate), new Date()) >= 0;

            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`card-hover h-full flex flex-col ${isUpcoming ? 'border-primary' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`h-6 w-6 ${bookingTypeDetails[booking.type]?.color}`} />
                        <div>
                          <CardTitle>{booking.type}</CardTitle>
                          <CardDescription>{booking.customerName}</CardDescription>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>{t(`bookingStatus.${booking.status}`)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm">
                      {Object.entries(booking.details).map(([key, value]) => (
                        <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</p>
                      ))}
                      <p><strong>{t('price')}:</strong> ${booking.sellPrice}</p>
                      {isUpcoming && <div className="flex items-center text-primary pt-2"><Bell className="h-4 w-4 mr-2 animate-pulse"/><span>Reminder active</span></div>}
                    </div>
                  </CardContent>
                  <DialogFooter className="p-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleAction('view', booking)}><Eye className="h-4 w-4 mr-1" />{t('view')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAction('edit', booking)}><Edit className="h-4 w-4 mr-1" />{t('edit')}</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleAction('delete', booking)}><Trash2 className="h-4 w-4 mr-1" />{t('delete')}</Button>
                  </DialogFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <AnimatePresence>
        {modal.isOpen && <BookingModal modal={modal} onClose={closeModal} onSave={handleSave} onDelete={handleDelete} />}
      </AnimatePresence>
    </>
  );
};

const BookingModal = ({ modal, onClose, onSave, onDelete }) => {
  const { t } = useLanguage();
  const [data, setData] = useState(modal.data || { type: 'Hotel', details: {}, reminderDays: 3 });

  const handleChange = (field, value, isDetail = false) => {
    if (isDetail) {
      setData(prev => ({ ...prev, details: { ...prev.details, [field]: value } }));
    } else {
      setData(prev => ({ ...prev, [field]: value }));
    }
  };

  const renderFormFields = () => {
    // This is a simplified form, would be expanded in a real scenario
    return (
      <div className="space-y-4">
        <Label>{t('customerName')}</Label><Input value={data.customerName || ''} onChange={e => handleChange('customerName', e.target.value)} />
        <Label>Price</Label><Input type="number" value={data.sellPrice || ''} onChange={e => handleChange('sellPrice', e.target.value)} />
        <Label>Status</Label>
        <select className="w-full px-3 py-2 border border-input rounded-md bg-background" value={data.status || 'hold'} onChange={e => handleChange('status', e.target.value)}>
          <option value="issued">Issued</option><option value="hold">Hold</option><option value="cancelled">Cancelled</option>
        </select>
        <Label>Reminder (days before)</Label><Input type="number" value={data.reminderDays || 3} onChange={e => handleChange('reminderDays', e.target.value)} />
      </div>
    );
  };
  
  if (modal.type === 'delete') {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('confirmDelete')}</DialogTitle></DialogHeader>
          <DialogDescription>{t('deleteDescription')}</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button variant="destructive" onClick={() => onDelete(data.id)}>{t('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{modal.type === 'add' ? t('addBooking') : t('edit') + ' ' + t('booking')}</DialogTitle></DialogHeader>
        {renderFormFields()}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={() => onSave(data)}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Bookings;