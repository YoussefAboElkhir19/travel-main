import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Briefcase, Plus, Calendar as CalendarIcon, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { format, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LeaveRequests = () => {
    const { t } = useLanguage();
    const { user, hasPermission } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ leaveType: 'weekly_leave', date: null, notes: '' });
    const [loading, setLoading] = useState(true);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('http://travel-server.test/api/leave-requests/');
            if (!res.ok) throw new Error('Failed to fetch leave requests');

            const data = await res.json();

            // لو الـ data مش Array أو فاضية، نوقف هنا بدون عرض إيرور
            if (!Array.isArray(data) || data.length === 0) {
                setRequests([]);
                setLoading(false);
                return;
            }

            const transformed = data.map(req => ({
                ...req,
                leave_date: req.leave_date ? new Date(req.leave_date) : null
            }));

            setRequests(transformed);

        } catch (error) {
            toast({
                title: t('errorFetchingLeaveRequests'),
                description: error.message,
                variant: "destructive"
            });
        }
        setLoading(false);
    }, [t]);


    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleNewRequest = () => {
        setModalData({ leaveType: 'weekly_leave', date: null, notes: '' });
        setIsModalOpen(true);
    };

    const handleSaveRequest = async () => {
        if (!modalData.date) {
            toast({ title: t('error'), description: t('dateIsRequired'), variant: "destructive" });
            return;
        }
        try {
            const res = await fetch('http://travel-server.test/api/leave-requests/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    leave_type: modalData.leaveType,
                    leave_date: format(modalData.date, 'yyyy-MM-dd'),
                    notes: modalData.notes,
                    status: 'pending'
                })
            });
            if (!res.ok) throw new Error('Failed to add leave request');
            toast({ title: t('success'), description: t('requestSent') });
            setIsModalOpen(false);
            fetchLeaveRequests();
        } catch (error) {
            toast({ title: t('error'), description: error.message, variant: "destructive" });
            console.log(error)
        }
    };

    const handleUpdateRequest = async (id, status) => {
        try {
            await axios.put(`http://travel-server.test/api/leave-requests/${id}`, {
                status: status // إما "approved" أو "rejected"
            });
            // setEditingRequest(null);
            fetchLeaveRequests();
        } catch (error) {
            console.error('Error updating leave request:', error);
        }
    };

    const handleDeleteRequest = async (id) => {
        if (window.confirm('Are you sure you want to delete this request?')) {
            try {
                await axios.delete(`http://localhost:8000/api/leave-requests/${id}`);
                fetchLeaveRequests();
            } catch (error) {
                console.error('Error deleting leave request:', error);
            }
        }
    };

    const statusMap = {
        approved: { text: t('approved'), color: 'text-green-500' },
        pending: { text: t('pending'), color: 'text-yellow-500' },
        rejected: { text: t('rejected'), color: 'text-red-500' },
    };

    const leaveTypes = ['weekly_leave', 'sick_leave', 'recreational_leave', 'early_leave'];

    return (
        <>
            <Helmet><title>{t('Leave Requests')} - {t('companyName')}</title></Helmet>
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gradient flex items-center gap-3"><Briefcase /> {t('Leave Requests')}</h1>
                        <Button onClick={handleNewRequest}><Plus className="mr-2 h-4 w-4" />{t('newRequest')}</Button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('leaveHistory')}</CardTitle>
                            <CardDescription>{t('leaveHistoryDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {hasPermission('manage_all_leave_requests') && <TableHead>{t('employee')}</TableHead>}
                                        <TableHead>{t('leaveType')}</TableHead>
                                        <TableHead>{t('leaveDate')}</TableHead>
                                        <TableHead>{t('notes')}</TableHead>
                                        <TableHead>{t('status')}</TableHead>
                                        <TableHead className="text-right">{t('actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={hasPermission('manage_all_leave_requests') ? 6 : 5} className="text-center">
                                                {t('loading')}
                                            </TableCell>
                                        </TableRow>
                                    ) : requests.map(request => (
                                        <TableRow key={request.id}>
                                            {hasPermission('manage_all_leave_requests') && (
                                                <TableCell className="flex items-center gap-2">
                                                    <img src={`http://travel-server.test/uploads/users/${request.user.avatar_url}` || `https://ui-avatars.com/api/?name=${request.user.user_name}&background=random`} alt="" className="h-8 w-8 rounded-full" />
                                                    {request.user.user_name}
                                                </TableCell>
                                            )}
                                            <TableCell className="capitalize">{t(request.leave_type)}</TableCell>
                                            <TableCell>{request.leave_date ? format(new Date(request.leave_date), 'PPP') : '-'}</TableCell>
                                            <TableCell className="max-w-xs truncate">{request.notes || '-'}</TableCell>
                                            <TableCell>
                                                <span className={`font-medium ${statusMap[request.status]?.color}`}>{statusMap[request.status]?.text}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {request.status === 'pending' && hasPermission('manage_all_leave_requests') && (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="text-green-500 hover:text-green-600" onClick={() => handleUpdateRequest(request.id, 'approved')}><Check className="h-4 w-4" /></Button>
                                                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleUpdateRequest(request.id, 'rejected')}><X className="h-4 w-4" /></Button>
                                                    </>
                                                )}
                                                {request.status === 'pending' && request.user_id === user.id && (
                                                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteRequest(request.id)}><Trash2 className="h-4 w-4" /></Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('newRequest')}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Select onValueChange={(value) => setModalData(prev => ({ ...prev, leaveType: value }))} defaultValue={modalData.leaveType}>
                                    <SelectTrigger><SelectValue placeholder={t('leaveType')} /></SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map(type => (
                                            <SelectItem key={type} value={type} className="capitalize">{t(type)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* تعديل اختيار التاريخ */}
                                <Popover
                                    modal // عشان الكالندر يبان فوق الـ Dialog
                                    open={isCalendarOpen}
                                    onOpenChange={setIsCalendarOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !modalData.date && "text-muted-foreground"
                                            )}
                                            onClick={() => setIsCalendarOpen(true)}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {modalData.date
                                                ? format(modalData.date, "PPP")
                                                : <span>{t("pickADate")}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 z-[9999]"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={modalData.date}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setModalData(prev => ({
                                                        ...prev,
                                                        date: new Date(date)
                                                    }));
                                                }
                                                setIsCalendarOpen(false);
                                            }}
                                            disabled={(date) => date < startOfToday()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Textarea
                                    placeholder={t('notes')}
                                    value={modalData.notes}
                                    onChange={(e) => setModalData(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
                                <Button onClick={handleSaveRequest}>{t('submitRequest')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </>
    );
};

export default LeaveRequests;
