import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as Dialog from '@radix-ui/react-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';

const AccountDashboard = () => {
    const { t } = useLanguage();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTarget, setEditingTarget] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [reason, setReason] = useState("");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const res = await fetch("http://travel-server.test/api/reservations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const responseData = await res.json();
            setBookings(responseData);
        } catch (err) {
            console.error(err);
            toast({ title: "Failed to load reservations", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const updateReservationStatus = async (id, status) => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`http://travel-server.test/api/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                await fetchBookings();
                toast({
                    title: `Reservation ${status}`,
                    description: `Reservation has been ${status} successfully`
                });
            } else {
                throw new Error('Failed to update reservation');
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Failed to update reservation", variant: "destructive" });
        }
    };

    const cancelReservation = async () => {
        if (!reason.trim()) {
            toast({ title: "Reason is required", variant: "destructive" });
            return;
        }

        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`http://travel-server.test/api/reservations/${selectedId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason_cancelled: reason }),
            });

            if (!res.ok) throw new Error("Failed to cancel reservation");

            await fetchBookings();
            toast({ title: "Reservation Cancelled", description: "Reservation cancelled successfully" });
            setEditingTarget(false);
            setReason("");
            setSelectedId(null);
        } catch (err) {
            console.error(err);
            toast({ title: "Error cancelling reservation", variant: "destructive" });
        }
    };

    const handleUpdateRequest = (id, action) => {
        const status = action === 'Issued' ? 'Issued' : 'Cancelled';
        if (status === 'Cancelled') {
            setSelectedId(id);
            setEditingTarget(true);
        } else {
            updateReservationStatus(id, status);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="flex justify-between my-3 items-center">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {t('Account Dashboard')}
                    </h1>
                    <Button onClick={fetchBookings} disabled={loading}>
                        {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Account Dashboard Title')}</CardTitle>
                        <CardDescription>{t('Reservation History Desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('ID')}</TableHead>
                                    <TableHead>{t('Customer Name')}</TableHead>
                                    <TableHead>{t('Phone Number')}</TableHead>
                                    <TableHead>{t('status')}</TableHead>
                                    <TableHead>{t('Booking Type')}</TableHead>
                                    <TableHead>{t('Sell')}</TableHead>
                                    <TableHead>{t('Profite')}</TableHead>
                                    <TableHead>{t('Note')}</TableHead>
                                    <TableHead>{t('actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">
                                            {t('loading')}
                                        </TableCell>
                                    </TableRow>
                                ) : bookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">
                                            No reservations found
                                        </TableCell>
                                    </TableRow>
                                ) : (

                                    bookings.map((booking) => (
                                        booking.sent === 1 && (
                                            <TableRow key={booking.id}>
                                                <TableCell>{booking.id}</TableCell>
                                                <TableCell className="capitalize">{booking.customer.name || 'N/A'}</TableCell>
                                                <TableCell>{booking.customer.phone || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium
                                                         ${booking.status === 'Issued' ? 'bg-green-100 text-green-800'
                                                                : booking.status === 'Cancelled'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {booking.status || 'Hold'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{booking.reservable_type || 'N/A'}</TableCell>
                                                <TableCell>{booking.sell_price || 'N/A'}</TableCell>
                                                <TableCell>{booking.net_profit || 'N/A'}</TableCell>
                                                <TableCell>{booking.notes || 'N/A'}</TableCell>
                                                <TableCell className="flex gap-2">
                                                    {booking.status !== 'Issued' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-green-500 hover:text-green-600"
                                                            onClick={() => handleUpdateRequest(booking.id, 'Issued')}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {booking.status !== 'Cancelled' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={() => handleUpdateRequest(booking.id, 'Cancelled')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>)
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            <Dialog.Root open={editingTarget} onOpenChange={setEditingTarget}>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-900 p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-semibold">Reason Cancelled</Dialog.Title>
                    <Textarea
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter Reason..."
                        className="mt-4 w-full border rounded-lg px-3 py-2"
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => setEditingTarget(false)} className="px-4 py-2 rounded-lg hover:bg-gray-700">
                            Cancel
                        </button>
                        <button
                            onClick={cancelReservation}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
};

export default AccountDashboard;
