import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { LayoutDashboard, Briefcase, Clock, Download, FileText, Calendar as CalendarIcon, UserCheck, Wifi, WifiOff, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/components/ui/use-toast';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Dashboard = () => {
    const { t } = useLanguage();
    const { supabase } = useSupabase();

    const [allUsers, setAllUsers] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [shiftsReport, setShiftsReport] = useState([]);
    const [employeeStatus, setEmployeeStatus] = useState([]);
    
    const [loading, setLoading] = useState({ leaves: true, shifts: true, status: true, users: true });

    const [leaveFilter, setLeaveFilter] = useState('this_month');
    const [shiftFilter, setShiftFilter] = useState('today');
    const [leaveUserFilter, setLeaveUserFilter] = useState('all');
    const [shiftUserFilter, setShiftUserFilter] = useState('all');

    const [leaveDateRange, setLeaveDateRange] = useState({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    const [shiftDateRange, setShiftDateRange] = useState({ from: startOfDay(new Date()), to: endOfDay(new Date()) });

    const statusMap = {
        approved: { text: t('approved'), color: 'text-green-500' },
        pending: { text: t('pending'), color: 'text-yellow-500' },
        rejected: { text: t('rejected'), color: 'text-red-500' },
        online: { text: t('online'), color: 'text-green-500', icon: <Wifi className="h-4 w-4" /> },
        on_break: { text: t('onBreak'), color: 'text-yellow-500', icon: <Coffee className="h-4 w-4" /> },
        offline: { text: t('offline'), color: 'text-gray-500', icon: <WifiOff className="h-4 w-4" /> },
    };
    
    const getDateRange = (filter, customRange) => {
        const now = new Date();
        switch (filter) {
            case 'today': return { from: startOfDay(now), to: endOfDay(now) };
            case 'this_week': return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
            case 'this_month': return { from: startOfMonth(now), to: endOfMonth(now) };
            case 'custom': return customRange;
            default: return { from: startOfDay(now), to: endOfDay(now) };
        }
    };

    const fetchAllUsers = useCallback(async () => {
        if (!supabase) return;
        setLoading(prev => ({ ...prev, users: true }));
        try {
            const { data, error } = await supabase.from('user_profiles').select('id, username');
            if (error) throw error;
            setAllUsers(data);
        } catch (error) {
            toast({ title: t('errorLoadingData'), description: error.message, variant: "destructive" });
        } finally {
            setLoading(prev => ({ ...prev, users: false }));
        }
    }, [supabase, t]);
    
    const fetchEmployeeStatus = useCallback(async () => {
        if (!supabase) return;
        setLoading(prev => ({ ...prev, status: true }));
        try {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const { data: users, error: usersError } = await supabase
                .from('user_profiles')
                .select('id, username, avatar_url, shifts(start_time, end_time, breaks(start_time, end_time))')
                .eq('status', 'active');
            if (usersError) throw usersError;

            const statuses = users.map(user => {
                const todayShifts = user.shifts ? user.shifts.filter(s => format(new Date(s.start_time), 'yyyy-MM-dd') === todayStr) : [];
                const activeShift = todayShifts.find(s => !s.end_time);
                if (activeShift) {
                    const onBreak = activeShift.breaks ? activeShift.breaks.some(b => !b.end_time) : false;
                    return { ...user, current_status: onBreak ? 'on_break' : 'online' };
                }
                return { ...user, current_status: 'offline' };
            }).sort((a, b) => {
                const order = { online: 1, on_break: 2, offline: 3 };
                return order[a.current_status] - order[b.current_status];
            });
            setEmployeeStatus(statuses);
        } catch (error) {
            toast({ title: t('errorLoadingData'), description: error.message, variant: "destructive" });
        } finally {
            setLoading(prev => ({ ...prev, status: false }));
        }
    }, [supabase, t]);

    const fetchLeaveRequests = useCallback(async () => {
        if (!supabase) return;
        setLoading(prev => ({ ...prev, leaves: true }));
        const { from, to } = getDateRange(leaveFilter, leaveDateRange);
        if (!from || !to) {
            setLoading(prev => ({ ...prev, leaves: false }));
            return;
        }
        try {
            let query = supabase
                .from('leave_requests')
                .select('*, user_profiles(username, avatar_url)')
                .gte('leave_date', format(from, 'yyyy-MM-dd'))
                .lte('leave_date', format(to, 'yyyy-MM-dd'))
                .order('created_at', { ascending: false });
            
            if (leaveUserFilter !== 'all') {
                query = query.eq('user_id', leaveUserFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setLeaveRequests(data);
        } catch (error) {
            toast({ title: t('errorFetchingLeaveRequests'), description: error.message, variant: "destructive" });
        } finally {
            setLoading(prev => ({ ...prev, leaves: false }));
        }
    }, [supabase, leaveFilter, leaveDateRange, leaveUserFilter, t]);

    const fetchShiftsReport = useCallback(async () => {
        if (!supabase) return;
        setLoading(prev => ({ ...prev, shifts: true }));
        const { from, to } = getDateRange(shiftFilter, shiftDateRange);
        if (!from || !to) {
            setLoading(prev => ({ ...prev, shifts: false }));
            return;
        }
        try {
            let query = supabase
                .from('shifts')
                .select('*, user_profiles(username, avatar_url)')
                .gte('start_time', from.toISOString())
                .lte('start_time', to.toISOString())
                .order('start_time', { ascending: false });

            if (shiftUserFilter !== 'all') {
                query = query.eq('user_id', shiftUserFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setShiftsReport(data);
        } catch (error) {
            toast({ title: t('errorFetchingShiftReport'), description: error.message, variant: "destructive" });
        } finally {
            setLoading(prev => ({ ...prev, shifts: false }));
        }
    }, [supabase, shiftFilter, shiftDateRange, shiftUserFilter, t]);

    useEffect(() => {
        fetchAllUsers();
        fetchEmployeeStatus();
    }, [fetchAllUsers, fetchEmployeeStatus]);
    
    useEffect(() => { fetchLeaveRequests(); }, [fetchLeaveRequests]);
    useEffect(() => { fetchShiftsReport(); }, [fetchShiftsReport]);


    const handleExport = (formatType, data, columns, title) => {
        const exportData = data.map(row => {
            let newRow = {};
            columns.forEach(c => {
                newRow[c.header] = c.accessor(row);
            });
            return newRow;
        });

        if (formatType === 'pdf') {
            const doc = new jsPDF();
            doc.text(title, 14, 15);
            doc.autoTable({
                head: [columns.map(c => c.header)],
                body: exportData.map(row => Object.values(row)),
            });
            doc.save(`${title}.pdf`);
        } else if (formatType === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            XLSX.writeFile(workbook, `${title}.xlsx`);
        }
    };

    const formatNetTime = (shift) => {
        if (!shift.end_time) return t('active');
        const netSeconds = ((new Date(shift.end_time) - new Date(shift.start_time)) / 1000) - (shift.total_break_seconds || 0);
        if (isNaN(netSeconds) || netSeconds < 0) return `00:00:00`;
        const h = String(Math.floor(netSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((netSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(Math.floor(netSeconds % 60)).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };
    
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd/MM/yyyy, HH:mm');
    };

    const leaveColumns = [
        { header: t('employee'), accessor: row => row.user_profiles?.username || 'N/A', render: row => (
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8"><AvatarImage src={row.user_profiles?.avatar_url} /><AvatarFallback>{row.user_profiles?.username?.charAt(0)}</AvatarFallback></Avatar>
                {row.user_profiles?.username}
            </div>
        )},
        { header: t('leaveType'), accessor: row => t(row.leave_type) },
        { header: t('leaveDate'), accessor: row => formatDate(row.leave_date) },
        { header: t('reason'), accessor: row => row.notes || '-' },
        { header: t('status'), accessor: row => statusMap[row.status]?.text || row.status, render: row => (
            <span className={statusMap[row.status]?.color}>{statusMap[row.status]?.text}</span>
        )},
    ];

    const shiftColumns = [
        { header: t('employee'), accessor: row => row.user_profiles?.username || 'N/A', render: row => (
             <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8"><AvatarImage src={row.user_profiles?.avatar_url} /><AvatarFallback>{row.user_profiles?.username?.charAt(0)}</AvatarFallback></Avatar>
                {row.user_profiles?.username}
            </div>
        )},
        { header: t('shiftStart'), accessor: row => formatDateTime(row.start_time) },
        { header: t('shiftEnd'), accessor: row => row.end_time ? formatDateTime(row.end_time) : t('active') },
        { header: t('netTime'), accessor: row => formatNetTime(row) },
    ];
    
    return (
        <>
            <Helmet><title>{t('dashboard')} - {t('companyName')}</title></Helmet>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                <h1 className="text-3xl font-bold text-gradient flex items-center gap-3"><LayoutDashboard /> {t('dashboard')}</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="glass-effect lg:col-span-1">
                        <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck />{t('employeesStatus')}</CardTitle></CardHeader>
                        <CardContent className="max-h-[450px] overflow-y-auto">
                            <ul className="space-y-3">
                                {loading.status ? <li className="text-center">{t('loading')}...</li> : employeeStatus.map(emp => (
                                    <li key={emp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9"><AvatarImage src={emp.avatar_url} /><AvatarFallback>{emp.username?.charAt(0)}</AvatarFallback></Avatar>
                                            <span className="font-medium">{emp.username}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm font-semibold ${statusMap[emp.current_status]?.color}`}>
                                            {statusMap[emp.current_status]?.icon}
                                            <span>{statusMap[emp.current_status]?.text}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="glass-effect lg:col-span-2">
                        <CardHeader>
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <CardTitle className="flex items-center gap-2"><Briefcase />{t('leaveRequests')}</CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select value={leaveUserFilter} onValueChange={setLeaveUserFilter}>
                                        <SelectTrigger className="w-auto min-w-[150px]"><SelectValue placeholder={t('filterByEmployee')} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('allEmployees')}</SelectItem>
                                            {allUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={leaveFilter} onValueChange={setLeaveFilter}>
                                        <SelectTrigger className="w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">{t('today')}</SelectItem>
                                            <SelectItem value="this_week">{t('thisWeek')}</SelectItem>
                                            <SelectItem value="this_month">{t('thisMonth')}</SelectItem>
                                            <SelectItem value="custom">{t('custom')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {leaveFilter === 'custom' && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-[240px] justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />
                                                    {leaveDateRange.from ? (leaveDateRange.to ? `${format(leaveDateRange.from, "dd/MM/yy")} - ${format(leaveDateRange.to, "dd/MM/yy")}` : format(leaveDateRange.from, "dd/MM/yy")) : <span>{t('pickADate')}</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="range" selected={leaveDateRange} onSelect={setLeaveDateRange} initialFocus /></PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[450px] overflow-y-auto">
                             <Table>
                                <TableHeader><TableRow>{leaveColumns.map(col => <TableHead key={col.header}>{col.header}</TableHead>)}</TableRow></TableHeader>
                                <TableBody>
                                    {loading.leaves ? <TableRow><TableCell colSpan={leaveColumns.length} className="text-center">{t('loading')}...</TableCell></TableRow> : leaveRequests.map(req => (
                                        <TableRow key={req.id}>
                                            {leaveColumns.map(col => <TableCell key={col.header}>{col.render ? col.render(req) : col.accessor(req)}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>


                <Card className="glass-effect">
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex-grow">
                                <CardTitle className="flex items-center gap-2"><Clock />{t('shiftReport')}</CardTitle>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={shiftUserFilter} onValueChange={setShiftUserFilter}>
                                    <SelectTrigger className="w-auto min-w-[150px]"><SelectValue placeholder={t('filterByEmployee')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('allEmployees')}</SelectItem>
                                        {allUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                                    <SelectTrigger className="w-auto min-w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">{t('today')}</SelectItem>
                                        <SelectItem value="this_week">{t('thisWeek')}</SelectItem>
                                        <SelectItem value="this_month">{t('thisMonth')}</SelectItem>
                                        <SelectItem value="custom">{t('custom')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {shiftFilter === 'custom' && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-[240px] justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />
                                                {shiftDateRange.from ? (shiftDateRange.to ? `${format(shiftDateRange.from, "dd/MM/yy")} - ${format(shiftDateRange.to, "dd/MM/yy")}`: format(shiftDateRange.from, "dd/MM/yy")) : <span>{t('pickADate')}</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="range" selected={shiftDateRange} onSelect={setShiftDateRange} initialFocus /></PopoverContent>
                                    </Popover>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleExport('pdf', shiftsReport, shiftColumns, 'Shifts Report')}><Download className="mr-2 h-4 w-4" />{t('pdf')}</Button>
                                <Button variant="outline" size="sm" onClick={() => handleExport('excel', shiftsReport, shiftColumns, 'Shifts Report')}><FileText className="mr-2 h-4 w-4" />{t('excel')}</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow>{shiftColumns.map(col => <TableHead key={col.header}>{col.header}</TableHead>)}</TableRow></TableHeader>
                            <TableBody>
                                {loading.shifts ? <TableRow><TableCell colSpan={shiftColumns.length} className="text-center">{t('loading')}...</TableCell></TableRow> : shiftsReport.map(shift => (
                                    <TableRow key={shift.id}>
                                        {shiftColumns.map(col => <TableCell key={col.header}>{col.render ? col.render(shift) : col.accessor(shift)}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
};

export default Dashboard;