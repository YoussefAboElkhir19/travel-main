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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { format, differenceInDays, parseISO, add } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';


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
  const [loading, setLoading] = useState(false);

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
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3  items-center gap-4">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('searchBookings')} value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="pl-10" /></div>
              {/* Filter By Satues  */}
              <div>

                <select className="w-full md:w-auto px-3 py-2 border border-input rounded-md bg-background" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                  {['All', ...Object.keys(bookingTypeDetails)].map(type => <option key={type} value={type}>{t(type.toLowerCase())}</option>)}
                </select>
              </div>
              {/* Button Add New Reservation  */}
              <div>
                <Button onClick={() => handleAction('add')} className="w-full md:w-auto"><Plus className="h-4 w-4 mr-2" />{t('Add New Reservation')}</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> */}

        {/* {
        filteredBookings.map(booking => {
          const TypeIcon = bookingTypeDetails[booking.type]?.icon || FileText;
          const dateField = bookingTypeDetails[booking.type]?.dateField;
          const eventDate = booking.details[dateField];
          const isUpcoming = eventDate && differenceInDays(parseISO(eventDate), new Date()) <= (booking.reminderDays || 3) && differenceInDays(parseISO(eventDate), new Date()) >= 0; */}

        {/* return ( */}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t('Reservation')}</CardTitle>
              <CardDescription>{t('Reservation History Desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* {hasPermission('manage_all_leave_requests') && <TableHead>{t('employee')}</TableHead>} */}
                    <TableHead>{t('ID')}</TableHead>
                    <TableHead>{t('Customer Name')}</TableHead>
                    <TableHead>{t('Phone Number')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('Booking Type')}</TableHead>
                    <TableHead>{t('Sell')}</TableHead>
                    <TableHead>{t('Profite')}</TableHead>
                    <TableHead>{t('Note')}</TableHead>
                    <TableHead className="">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* {loading ? ( */}
                  {/* <TableRow> */}
                  {/* <TableCell colSpan={hasPermission('manage_all_leave_requests') ? 6 : 5} className="text-center"> */}
                  {/* {t('loading')} */}
                  {/* </TableCell> */}
                  {/* </TableRow> */}
                  {/* // ) : */}
                  {/* // requests.map(request => ( */}
                  <TableRow >
                    <TableCell className="">
                      Id Data
                    </TableCell>
                    {/* =============================================================== */}
                    <TableCell className="capitalize">Customer Data</TableCell>
                    <TableCell>01111111</TableCell>
                    <TableCell className="">Hold</TableCell>
                    <TableCell>Hotel</TableCell>
                    <TableCell className="">111</TableCell>
                    <TableCell className="">111</TableCell>
                    <TableCell className="">111</TableCell>
                    <TableCell className="flex gap-4">
                      <Eye className="w-4 h-4 text-green-600" onClick={() => handleAction('view')} />
                      <Edit className="w-4 h-4 text-blue-600" onClick={() => handleAction('edit')} />
                      <Trash2 className="w-4 h-4 text-red-700" />
                    </TableCell>
                  </TableRow>
                  {/* // ))} */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
        {/* ); */}
        {/* }) */}
        {/* } */}
      </div>
      {/* </div> */}

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

  // From To Add Booking Reservetion ==========================================================================
  const renderFormFields = () => {
    const bookingTypes = [
      "Hotel",
      "Flight",
      "Cruise",
      "Visa",
      "Appointment",
      "Insurance",
      "Tickets",
      "Transportation",
    ];

    // حساب صافي الربح تلقائيًا
    const calculateNetProfit = (sell, fees, cost) => {
      const s = parseFloat(sell) || 0;
      const f = parseFloat(fees) || 0;
      const c = parseFloat(cost) || 0;
      return s - f - c;
    };

    return (
      <div className='flex items-center justify-center z-50 ' >
        <div className="space-y-2 p-2 h-[600px] scrollbar-thin scrollbar-thumb-gray-400 max-h-[60vh] overflow-y-auto scrollbar-track-gray-200">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label>{t("customerName")}</Label>
              <Input
                value={data.customerName || ""}
                onChange={(e) => handleChange("customerName", e.target.value)}
              />
            </div>
            <div>
              <Label>{t("phoneNumber")}</Label>
              <Input
                value={data.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            </div>
          </div>

          {/* Booking Types */}
          <div className='mb-4'>
            <Label>{t("Booking Types")}</Label>
            <div className="flex md:flex-wrap flex-nowrap gap-2 mt-2 overflow-x-auto md:overflow-x-visible whitespace-nowrap no-scrollbar">
              {bookingTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("bookingType", type)}
                  className={`px-2 py-2 rounded-full shadow-sm border transition-all ${data.bookingType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/* Switch Cases To Forms Type Booking  */}
          <div className="space-y-6">
            {renderBookingForm()}
          </div>
          <hr className='border-gray-200 my-8' />
          {/* Price Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{t("Sell Price")}</Label>
              <Input
                type="number"
                value={data.sellPrice || ""}
                onChange={(e) =>
                  handleChange(
                    "sellPrice",
                    e.target.value,
                    calculateNetProfit(
                      e.target.value,
                      data.paymentFees,
                      data.cost
                    )
                  )
                }
              />
            </div>
            <div>
              <Label>{t("Payment Fees")}</Label>
              <Input
                type="number"
                value={data.paymentFees || ""}
                onChange={(e) =>
                  handleChange(
                    "paymentFees",
                    e.target.value,
                    calculateNetProfit(
                      data.sellPrice,
                      e.target.value,
                      data.cost
                    )
                  )
                }
              />
            </div>
            <div>
              <Label>{t("Cost")}</Label>
              <Input
                type="number"
                value={data.cost || ""}
                onChange={(e) =>
                  handleChange(
                    "cost",
                    e.target.value,
                    calculateNetProfit(
                      data.sellPrice,
                      data.paymentFees,
                      e.target.value
                    )
                  )
                }
              />
            </div>
            <div>
              <Label>{t("Net Profit")}</Label>
              <Input
                type="number"
                value={
                  calculateNetProfit(
                    data.sellPrice,
                    data.paymentFees,
                    data.cost
                  ) || 0
                }
                readOnly
              />
            </div>
          </div>

          {/* Booking Status */}
          <div>
            <Label>{t("Booking Status")}</Label>
            <select
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={data.status || "hold"}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="issued">{t("bookingStatus.issued")}</option>
              <option value="hold">{t("bookingStatus.hold")}</option>
              <option value="cancelled">{t("bookingStatus.cancelled")}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <Label>{t("notes")}</Label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              rows="3"
              value={data.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("addNotes")}
            />
          </div>
        </div>
      </div>
    );
  };

  // From To Edit Booking Reservetion ==========================================================================
  const renderFormFieldsEdit = () => {
    const bookingTypes = [
      "Hotel",
      "Flight",
      "Cruise",
      "Visa",
      "Appointment",
      "Insurance",
      "Tickets",
      "Transportation",
    ];

    // حساب صافي الربح تلقائيًا
    const calculateNetProfit = (sell, fees, cost) => {
      const s = parseFloat(sell) || 0;
      const f = parseFloat(fees) || 0;
      const c = parseFloat(cost) || 0;
      return s - f - c;
    };

    return (
      <div className='flex items-center justify-center z-50 ' >
        <div className="space-y-2 p-2 h-[600px] scrollbar-thin scrollbar-thumb-gray-400 max-h-[60vh] overflow-y-auto scrollbar-track-gray-200">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label>{t("customerName")}</Label>
              <Input
                value={"customerName"}
                onChange={(e) => handleChange("customerName", e.target.value)}
              />
            </div>
            <div>
              <Label>{t("phoneNumber")}</Label>
              <Input
                value={data.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            </div>
          </div>

          {/* Booking Types */}
          <div className='mb-4'>
            <Label>{t("Booking Types")}</Label>
            <div className="flex md:flex-wrap flex-nowrap gap-2 mt-2 overflow-x-auto md:overflow-x-visible whitespace-nowrap no-scrollbar">
              {bookingTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange("bookingType", type)}
                  className={`px-2 py-2 rounded-full shadow-sm border transition-all ${data.bookingType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/* Switch Cases To Forms Type Booking  */}
          <div className="space-y-6">
            {renderBookingForm()}
          </div>
          <hr className='border-gray-200 my-8' />
          {/* Price Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{t("Sell Price")}</Label>
              <Input
                type="number"
                value={data.sellPrice || ""}
                onChange={(e) =>
                  handleChange(
                    "sellPrice",
                    e.target.value,
                    calculateNetProfit(
                      e.target.value,
                      data.paymentFees,
                      data.cost
                    )
                  )
                }
              />
            </div>
            <div>
              <Label>{t("Payment Fees")}</Label>
              <Input
                type="number"
                value={data.paymentFees || ""}
                onChange={(e) =>
                  handleChange(
                    "paymentFees",
                    e.target.value,
                    calculateNetProfit(
                      data.sellPrice,
                      e.target.value,
                      data.cost
                    )
                  )
                }
              />
            </div>
            <div>
              <Label>{t("Cost")}</Label>
              <Input
                type="number"
                value={data.cost || ""}
                onChange={(e) =>
                  handleChange(
                    "cost",
                    e.target.value,
                    calculateNetProfit(
                      data.sellPrice,
                      data.paymentFees,
                      e.target.value
                    )
                  )
                }
              />
            </div>
            <div>
              <Label>{t("Net Profit")}</Label>
              <Input
                type="number"
                value={
                  calculateNetProfit(
                    data.sellPrice,
                    data.paymentFees,
                    data.cost
                  ) || 0
                }
                readOnly
              />
            </div>
          </div>

          {/* Booking Status */}
          <div>
            <Label>{t("Booking Status")}</Label>
            <select
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={data.status || "hold"}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="issued">{t("bookingStatus.issued")}</option>
              <option value="hold">{t("bookingStatus.hold")}</option>
              <option value="cancelled">{t("bookingStatus.cancelled")}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <Label>{t("notes")}</Label>
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              rows="3"
              value={data.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("addNotes")}
            />
          </div>
        </div>
      </div>
    );
  };


  //  Form Type Booking===================================================================================== 
  const renderBookingForm = () => {
    switch (data.bookingType) {
      case "Hotel":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* hotelName */}
            <h2>{t("Hotel Information")}</h2>
            <div>

              <Label>{t("Hotel Name")}</Label>
              <Input
                value={data.hotelName || ""}
                onChange={(e) => handleChange("hotelName", e.target.value)}
              />
            </div>
            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Number Of Geust")}</Label>
                <Input
                  type="number"
                  value={data.NumberofGeust || ""}
                  onChange={(e) => handleChange("NumberofGeust", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Number Of Room")}</Label>
                <Input
                  type="number"
                  value={data.NumberOfRoom || ""}
                  onChange={(e) => handleChange("NumberOfRoom", e.target.value)}
                />
              </div>
            </div>
            {/* checkIn && checkOut  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Check In")}</Label>
                <Input
                  type="date"
                  value={data.checkIn || ""}
                  onChange={(e) => handleChange("checkIn", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Check Out")}</Label>
                <Input
                  type="date"
                  value={data.checkOut || ""}
                  onChange={(e) => handleChange("checkOut", e.target.value)}
                />

              </div>

            </div>
            {/* RoomType && Gusts  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Room Type")}</Label>
                <Input
                  type="text"
                  value={data.roomType || ""}
                  onChange={(e) => handleChange("roomType", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Guests")}</Label>
                <Input
                  type="number"
                  value={data.guest || ""}
                  onChange={(e) => handleChange("guest", e.target.value)}
                />

              </div>

            </div>
            {/* BookingNumber  */}
            <div>

              <Label>{t("Booking Number")}</Label>
              <Input
                type="number"
                value={data.BookingNumber || ""}
                onChange={(e) => handleChange("BookingNumber", e.target.value)}
              />
            </div>
            {/* Supplier Name */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>
            {/* Supplier Status && Supplier Payment Due Date   */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>

                <Label>{t("Supplier Status")}</Label>
                <Select >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid" className="capitalize">
                      Paid
                    </SelectItem>
                    <SelectItem value="Not Paid" className="capitalize">
                      Not Paid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Supplier Payment Due Date")}</Label>
                <Input
                  type="date"
                  value={data.supplierPaymentDueDate || ""}
                  onChange={(e) => handleChange("supplierPaymentDueDate", e.target.value)}
                />

              </div>

            </div>
            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );
      // Flight =================================================================================
      case "Flight":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* hotelName */}
            <h2>{t("Flight Information")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Flight Number")}</Label>
                <Input
                  value={data.flightnumber || ""}
                  type="numder"
                  onChange={(e) => handleChange("flightnumber", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Airline")}</Label>
                <Input
                  value={data.airline || ""}
                  type="numder"
                  onChange={(e) => handleChange("airline", e.target.value)}
                />
              </div>
            </div>

            {/* Departure Date && Arrival Date  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Departure Date")}</Label>
                <Input
                  type="date"
                  value={data.departureDate || ""}
                  onChange={(e) => handleChange("departureDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Arrival Date")}</Label>
                <Input
                  type="date"
                  value={data.arrivalDate || ""}
                  onChange={(e) => handleChange("arrivalDate", e.target.value)}
                />

              </div>

            </div>
            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("From")}</Label>
                <Input
                  type="text"
                  value={data.from || ""}
                  onChange={(e) => handleChange("from", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("To")}</Label>
                <Input
                  type="text"
                  value={data.to || ""}
                  onChange={(e) => handleChange("to", e.target.value)}
                />
              </div>
            </div>
            <div>

              <Label>{t("Passenger Information")}</Label>
              <Input
                value={data.passengerInfo || ""}
                type="text"
                onChange={(e) => handleChange("passengerInfo", e.target.value)}
              />
            </div>

            {/* Supplier Name */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>
            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Paid
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Not Paid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );
      // Cruise=========================================================================
      case "Cruise":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Cruise Name */}
            <h2>{t("Cruise Information")}</h2>
            {/* Cruise Name && Cruise Line  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Cruise Name")}</Label>
                <Input
                  value={data.cruise || ""}
                  type="text"
                  onChange={(e) => handleChange("cruise", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Cruise Line")}</Label>
                <Input
                  value={data.cruiseLine || ""}
                  type="text"
                  onChange={(e) => handleChange("cruiseLine", e.target.value)}
                />
              </div>
            </div>
            {/* ship && cabin,  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Ship")}</Label>
                <Input
                  value={data.ship || ""}
                  type="text"
                  onChange={(e) => handleChange("ship", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Cabin")}</Label>
                <Input
                  value={data.cabin || ""}
                  type="text"
                  onChange={(e) => handleChange("cabin", e.target.value)}
                />
              </div>
            </div>

            {/* Departure Date && Rutern Date  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Departure Date")}</Label>
                <Input
                  type="date"
                  value={data.departureDate || ""}
                  onChange={(e) => handleChange("departureDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Rutern Date")}</Label>
                <Input
                  type="date"
                  value={data.returnDate || ""}
                  onChange={(e) => handleChange("returnDate", e.target.value)}
                />

              </div>

            </div>
            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Departure Port")}</Label>
                <Input
                  type="text"
                  value={data.departureport || ""}
                  onChange={(e) => handleChange("departureport", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Return Port")}</Label>
                <Input
                  type="text"
                  value={data.returnPort || ""}
                  onChange={(e) => handleChange("returnPort", e.target.value)}
                />
              </div>
            </div>

            {/* Supplier Name */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>
            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Paid
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Not Paid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );

      // Visa========================================================================
      case "Visa":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Visa Name */}
            <h2>{t("Visa Information")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>
                <Label>{t("Visa Name")}</Label>
                <Input
                  value={data.visa || ""}
                  type="text"
                  onChange={(e) => handleChange("visa", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Duration")}</Label>
                <Input
                  value={data.duration || ""}
                  type="number"
                  onChange={(e) => handleChange("duration", e.target.value)}
                />
              </div>
            </div>


            {/* applicationDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <Label>{t("Country")}</Label>
                <Input
                  type="text"
                  value={data.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Application Date")}</Label>
                <Input
                  type="date"
                  value={data.applicationDate || ""}
                  onChange={(e) => handleChange("applicationDate", e.target.value)}
                />
              </div>
            </div>

            <div>

              <Label>{t("Application Details")}</Label>
              <Textarea

                type="text"
                value={data.applicationDetails || ""}
                onChange={(e) => handleChange("applicationDetails", e.target.value)}
              />
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Approved
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );

      // Appointment ====================================================
      case "Appointment":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Appointment Name */}
            <h2>{t("Appointment Information")}</h2>
            <div>

              <Label>{t("Appointment Name")}</Label>
              <Input
                value={data.appointment || ""}
                type="text"
                onChange={(e) => handleChange("appointment", e.target.value)}
              />
            </div>


            {/* applicationDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Application Date")}</Label>
                <Input
                  type="datetime-local"
                  value={data.applicationDate || ""}
                  onChange={(e) => handleChange("applicationDate", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Location")}</Label>
                <Input
                  type="text"
                  value={data.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Approved
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );
      // Insurance======================================================================
      case "Insurance":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Insurance Name */}
            <h2>{t("Insurance Information")}</h2>
            <div>

              <Label>{t("Insurance Name")}</Label>
              <Input
                value={data.insurance || ""}
                type="text"
                onChange={(e) => handleChange("insurance", e.target.value)}
              />
            </div>

            <div>

              <Label>{t("Provider")}</Label>
              <Input
                type="text"
                value={data.provider || ""}
                onChange={(e) => handleChange("provider", e.target.value)}
              />
            </div>
            {/* start Date && EndDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Start Date")}</Label>
                <Input
                  type="date"
                  value={data.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("End Date")}</Label>
                <Input
                  type="date"
                  value={data.endDate || ""}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
            </div>
            <div>

              <Label>{t("Insured Persons")}</Label>
              <Input
                type="text"
                value={data.insuredPersons || ""}
                onChange={(e) => handleChange("insuredPersons", e.target.value)}
              />
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Active
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Expired
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );
      // Tickets======================================================================
      case "Tickets":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Tickets Name */}
            <h2>{t("Entertainment Tickets Information")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Event Name")}</Label>
                <Input
                  value={data.event || ""}
                  type="text"
                  onChange={(e) => handleChange("event", e.target.value)}
                />
              </div>

              <div>

                <Label>{t("Event Date")}</Label>
                <Input
                  type="date"
                  value={data.eventDate || ""}
                  onChange={(e) => handleChange("eventDate", e.target.value)}
                />
              </div>
            </div>
            {/* seat category, quantity. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Seat Category")}</Label>
                <Input
                  value={data.seatcategory || ""}
                  type="text"
                  onChange={(e) => handleChange("seatcategory", e.target.value)}
                />
              </div>

              <div>

                <Label>{t("Quantity")}</Label>
                <Input
                  type="text"
                  value={data.quantity || ""}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                />
              </div>
            </div>

            {/* Ticket Count   */}
            <div>

              <Label>{t("Ticket Count ")}</Label>
              <Input
                type="number"
                value={data.ticketCount || ""}
                onChange={(e) => handleChange("ticketCount", e.target.value)}
              />
            </div>
            {/* Supplier Name  */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Confirmed
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );
      case "Transportation":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Transportation Name */}
            <h2>{t("Transportation Information")}</h2>
            {/* Transportation Type */}
            <div>
              <Label>{t("Transportation Type")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car" className="capitalize">
                    Car
                  </SelectItem>
                  <SelectItem value="Bus" className="capitalize">
                    Bus
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t("Pickup Location")}</Label>
                <Input
                  value={data.pickupLocation || ""}
                  type="text"
                  onChange={(e) => handleChange("pickupLocation", e.target.value)}
                />
              </div>

              <div>

                <Label>{t("Dropoff Location")}</Label>
                <Input
                  type="text"
                  value={data.dropoffLocation || ""}
                  onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                />
              </div>
            </div>

            {/* Transportation Date   */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label>{t("Route From")}</Label>
                <Input
                  type="text"
                  value={data.routeFrom || ""}
                  onChange={(e) => handleChange("routeFrom", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Route To")}</Label>
                <Input
                  type="text"
                  value={data.routeTo || ""}
                  onChange={(e) => handleChange("routeTo", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label>{t("Transportation Date")}</Label>
                <Input
                  type="datetime-local"
                  value={data.transportationDate || ""}
                  onChange={(e) => handleChange("transportationDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Passenger Count")}</Label>
                <Input
                  type="number"
                  value={data.passengerCount || ""}
                  onChange={(e) => handleChange("passengerCount", e.target.value)}
                />
              </div>
            </div>
            {/* Supplier Name  */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>

            {/*  Status */}
            <div>

              <Label>{t("Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Confirmed
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );

      default:
        return (
          <p className="text-gray-500 italic">{t("selectBookingType")}</p>
        );
    }
  };

  // View Render the booking details based on the selected booking type=============================================
  const renderDetailsTypeBooking = () => {
    switch ("Hotel") {
      case "Hotel":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* hotelName */}
            <h2>{t("Hotel Information")}</h2>
            <div>

              <Label>{t("Hotel Name")}:Hotell</Label>

            </div>
            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Number Of Geust")}:22</Label>

              </div>
              <div>

                <Label>{t("Number Of Room")}:11</Label>

              </div>
            </div>
            {/* checkIn && checkOut  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Check In")}:1/2/333</Label>

              </div>
              <div>
                <Label>{t("Check Out")}:1/2/333</Label>


              </div>

            </div>
            {/* BookingNumber  */}
            <div>

              <Label>{t("Booking Number")}</Label>

            </div>
            {/* Supplier Name */}
            <div>

              <Label>{t("Supplier Name")}:supnamee</Label>

            </div>
            {/* Supplier Status && Supplier Payment Due Date   */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>

                <Label>{t("Supplier Status")}:Paid</Label>

              </div>
              <div>
                <Label>{t("Supplier Payment Due Date")}:1/2/2003</Label>

              </div>

            </div>
            {/* Notes */}
            <div>
              <Label>{t("notes")}:noteeeee</Label>

            </div>


          </div>
        );
      // Flight =================================================================================
      case "Flight":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* hotelName */}
            <h2>{t("Flight Information")}</h2>
            <div>

              <Label>{t("Flight Number")}</Label>
              <Input
                value={data.flightnumber || ""}
                type="numder"
                onChange={(e) => handleChange("flightnumber", e.target.value)}
              />
            </div>

            {/* Departure Date && Arrival Date  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Departure Date")}</Label>
                <Input
                  type="date"
                  value={data.departureDate || ""}
                  onChange={(e) => handleChange("departureDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Arrival Date")}</Label>
                <Input
                  type="date"
                  value={data.arrivalDate || ""}
                  onChange={(e) => handleChange("arrivalDate", e.target.value)}
                />

              </div>

            </div>
            {/* NumberofGeust && NumberOfRoom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("From")}</Label>
                <Input
                  type="text"
                  value={data.from || ""}
                  onChange={(e) => handleChange("from", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("To")}</Label>
                <Input
                  type="text"
                  value={data.to || ""}
                  onChange={(e) => handleChange("to", e.target.value)}
                />
              </div>
            </div>

            {/* Supplier Name */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>
            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Paid
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Not Paid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );
      // Cruise=========================================================================
      case "Cruise":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Cruise Name */}
            <h2>{t("Cruise Information")}</h2>
            <div>

              <Label>{t("Cruise Name")}</Label>
              <Input
                value={data.cruise || ""}
                type="text"
                onChange={(e) => handleChange("cruise", e.target.value)}
              />
            </div>

            {/* Departure Date && Rutern Date  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              <div>

                <Label>{t("Departure Date")}</Label>
                <Input
                  type="date"
                  value={data.departureDate || ""}
                  onChange={(e) => handleChange("departureDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Rutern Date")}</Label>
                <Input
                  type="date"
                  value={data.returnDate || ""}
                  onChange={(e) => handleChange("returnDate", e.target.value)}
                />

              </div>

            </div>
            {/* NumberofGeust && NumberOfRoom */}

            <div>

              <Label>{t("Departure Port")}</Label>
              <Input
                type="text"
                value={data.departureport || ""}
                onChange={(e) => handleChange("departureport", e.target.value)}
              />
            </div>
            <div>

              <Label>{t("Return Port")}</Label>
              <Input
                type="text"
                value={data.returnPort || ""}
                onChange={(e) => handleChange("returnPort", e.target.value)}
              />
            </div>

            {/* Supplier Name */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>
            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Paid
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Not Paid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );

      // Visa========================================================================
      case "Visa":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Visa Name */}
            <h2>{t("Visa Information")}</h2>
            <div>

              <Label>{t("Visa Name")}</Label>
              <Input
                value={data.visa || ""}
                type="text"
                onChange={(e) => handleChange("visa", e.target.value)}
              />
            </div>


            {/* applicationDate */}

            <div>

              <Label>{t("Application Date")}</Label>
              <Input
                type="date"
                value={data.applicationDate || ""}
                onChange={(e) => handleChange("applicationDate", e.target.value)}
              />
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Approved
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );

      // Appointment ====================================================
      case "Appointment":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Appointment Name */}
            <h2>{t("Appointment Information")}</h2>
            <div>

              <Label>{t("Appointment Name")}</Label>
              <Input
                value={data.appointment || ""}
                type="text"
                onChange={(e) => handleChange("appointment", e.target.value)}
              />
            </div>


            {/* applicationDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Application Date")}</Label>
                <Input
                  type="date"
                  value={data.applicationDate || ""}
                  onChange={(e) => handleChange("applicationDate", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("Location")}</Label>
                <Input
                  type="text"
                  value={data.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Supplier Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Approved
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>
        );
      // Insurance======================================================================
      case "Insurance":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Insurance Name */}
            <h2>{t("Insurance Information")}</h2>
            <div>

              <Label>{t("Insurance Name")}</Label>
              <Input
                value={data.insurance || ""}
                type="text"
                onChange={(e) => handleChange("insurance", e.target.value)}
              />
            </div>

            <div>

              <Label>{t("Provider")}</Label>
              <Input
                type="text"
                value={data.provider || ""}
                onChange={(e) => handleChange("provider", e.target.value)}
              />
            </div>
            {/* start Date && EndDate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>{t("Start Date")}</Label>
                <Input
                  type="date"
                  value={data.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>
              <div>

                <Label>{t("End Date")}</Label>
                <Input
                  type="date"
                  value={data.endDate || ""}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </div>
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Active
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Expired
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );
      // Tickets======================================================================
      case "Tickets":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Tickets Name */}
            <h2>{t("Entertainment Tickets Information")}</h2>
            <div>

              <Label>{t("Event Name")}</Label>
              <Input
                value={data.event || ""}
                type="text"
                onChange={(e) => handleChange("event", e.target.value)}
              />
            </div>

            <div>

              <Label>{t("Event Date")}</Label>
              <Input
                type="date"
                value={data.eventDate || ""}
                onChange={(e) => handleChange("eventDate", e.target.value)}
              />
            </div>

            {/* Ticket Count   */}
            <div>

              <Label>{t("Ticket Count Date")}</Label>
              <Input
                type="number"
                value={data.ticketCount || ""}
                onChange={(e) => handleChange("ticketCount", e.target.value)}
              />
            </div>
            {/* Supplier Name  */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>

            {/* Supplier Status */}
            <div>

              <Label>{t("Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Confirmed
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );
      case "Transportation":
        return (
          <div className="space-y-2 border rounded-md shadow-md p-3">
            {/* Transportation Name */}
            <h2>{t("Transportation Information")}</h2>
            {/* Transportation Type */}
            <div>
              <Label>{t("Transportation Type")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car" className="capitalize">
                    Car
                  </SelectItem>
                  <SelectItem value="Bus" className="capitalize">
                    Bus
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>


                <Label>{t("Pickup Location")}</Label>
                <Input
                  value={data.pickupLocation || ""}
                  type="text"
                  onChange={(e) => handleChange("pickupLocation", e.target.value)}
                />
              </div>

              <div>

                <Label>{t("Dropoff Location")}</Label>
                <Input
                  type="text"
                  value={data.dropoffLocation || ""}
                  onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                />
              </div>
            </div>

            {/* Transportation Date   */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <Label>{t("Transportation Date")}</Label>
                <Input
                  type="date"
                  value={data.transportationDate || ""}
                  onChange={(e) => handleChange("transportationDate", e.target.value)}
                />
              </div>
              <div>
                <Label>{t("Passenger Count")}</Label>
                <Input
                  type="number"
                  value={data.passengerCount || ""}
                  onChange={(e) => handleChange("passengerCount", e.target.value)}
                />
              </div>
            </div>
            {/* Supplier Name  */}
            <div>

              <Label>{t("Supplier Name")}</Label>
              <Input
                type="text"
                value={data.supplierName || ""}
                onChange={(e) => handleChange("supplierName", e.target.value)}
              />
            </div>

            {/*  Status */}
            <div>

              <Label>{t("Status")}</Label>
              <Select >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" className="capitalize">
                    Confirmed
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Pending
                  </SelectItem>
                  <SelectItem value="Not Paid" className="capitalize">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label>{t("notes")}</Label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows="3"
                value={data.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("addNotes")}
              />
            </div>


          </div>

        );

      default:
        return (
          <p className="text-gray-500 italic">{t("selectBookingType")}</p>
        );
    }
  }


  if (modal.type === 'view') {

    return (

      <>
        <Dialog open onOpenChange={onClose}>
          <DialogContent className="w-[800px] max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{modal.type === 'view'}</DialogTitle>
            </DialogHeader>
            {/* Details Main Reservation  */}
            <div className='text-center text-3xl font-bold text-gradient' >
              {t("Details  Reservation")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>

                <Label>{t("Customer Name")}: Youssef</Label>
              </div>
              <div>

                <Label>{t("Customer Phone")}: 1111111111111</Label>
              </div>
            </div>

            {/* Details Type Of Booking Seven  */}
            {/* Switch Cases To Forms Type Booking  */}
            <hr className='border-gray-200 ' />
            <div className="space-y-6">
              {renderDetailsTypeBooking()}
            </div>


            <DialogFooter>
              <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
              {/* <Button onClick={() => onSave(data)}>{t('save')}</Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </>
    );
  }

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

  return (<>
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[800px] max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {modal.type === 'add' ? t('addBooking') : t('edit') + ' ' + t('booking')}
          </DialogTitle>
        </DialogHeader>

        {modal.type === 'add' ? renderFormFields() : renderFormFieldsEdit()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={() => onSave(data)}>{t('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {/* Load  Vieew  */}

  </>
  );
};

export default Bookings;