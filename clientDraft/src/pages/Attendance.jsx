import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Helmet } from 'react-helmet';
    import { Clock } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { useAuth } from '@/contexts/AuthContext';
    import { useCompany } from '@/contexts/CompanyContext';
    import { useSupabase } from '@/contexts/SupabaseContext';
    import { toast } from '@/components/ui/use-toast';
    import { format, endOfDay, isAfter, startOfMonth, endOfMonth, startOfDay, endOfDay as dateFnsEndOdDay, getDaysInMonth } from 'date-fns';
    import ShiftControls from '@/components/attendance/ShiftControls';
    import AttendanceCalendar from '@/components/attendance/AttendanceCalendar';
    import ShiftDetailsModal from '@/components/attendance/ShiftDetailsModal';

    const Attendance = () => {
      const { t, isRTL } = useLanguage();
      const { user } = useAuth();
      const { company } = useCompany();
      const { supabase } = useSupabase();

      const [shiftState, setShiftState] = useState({
        id: null,
        status: 'not_started',
        startTime: null,
        endTime: null,
        breakStartTime: null,
        totalBreakSeconds: 0,
        activeBreakId: null,
      });

      const [shiftCount, setShiftCount] = useState(0);
      const [lastShiftDuration, setLastShiftDuration] = useState(0);
      const [timers, setTimers] = useState({ shift: 0, break: 0 });
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedDayData, setSelectedDayData] = useState({ shifts: [], date: null });
      const [monthWorkHours, setMonthWorkHours] = useState(0);
      const [approvedLeavesCount, setApprovedLeavesCount] = useState(0);
      const [isShiftActionLoading, setIsShiftActionLoading] = useState(true);
      
      const settings = useMemo(() => company?.settings?.shiftSettings || {}, [company]);

      const loadState = useCallback(async () => {
        if (!supabase || !user) return;
        setIsShiftActionLoading(true);

        const { data: activeShifts, error } = await supabase
          .from('shifts')
          .select('*, breaks(*)')
          .eq('user_id', user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false });

        if (error) {
          toast({ title: "Error loading shift", description: error.message, variant: "destructive" });
        } else {
            const activeShift = activeShifts?.[0];
            if (activeShift) {
              const activeBreak = activeShift.breaks.find(b => b.end_time === null);
              setShiftState({
                id: activeShift.id,
                status: activeBreak ? 'on_break' : 'active',
                startTime: new Date(activeShift.start_time),
                endTime: null,
                breakStartTime: activeBreak ? new Date(activeBreak.start_time) : null,
                totalBreakSeconds: activeShift.total_break_seconds || 0,
                activeBreakId: activeBreak ? activeBreak.id : null,
              });
            } else {
              setShiftState({ id: null, status: 'not_started', startTime: null, endTime: null, breakStartTime: null, totalBreakSeconds: 0, activeBreakId: null });
            }
        }
        
        const todayStart = startOfDay(new Date()).toISOString();
        const todayEnd = dateFnsEndOdDay(new Date()).toISOString();
        const { count, error: countError } = await supabase
          .from('shifts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('start_time', todayStart)
          .lte('start_time', todayEnd);
        
        if (countError) toast({ title: "Error fetching shift count", description: countError.message, variant: "destructive" });
        else setShiftCount(count || 0);

        setIsShiftActionLoading(false);
      }, [supabase, user]);

      useEffect(() => {
        loadState();
        const channel = supabase
          .channel('realtime-attendance')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts', filter: `user_id=eq.${user.id}` }, loadState)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'breaks' }, loadState)
          .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
      }, [loadState, supabase, user]);

      useEffect(() => {
        let shiftInterval, breakInterval;
        if (shiftState.status === 'active' && shiftState.startTime) {
          shiftInterval = setInterval(() => {
            const elapsed = (new Date() - new Date(shiftState.startTime)) / 1000;
            setTimers(t => ({ ...t, shift: elapsed - shiftState.totalBreakSeconds }));
          }, 1000);
        }
        if (shiftState.status === 'on_break' && shiftState.breakStartTime) {
          const elapsedSinceShiftStart = (new Date() - new Date(shiftState.startTime)) / 1000;
          breakInterval = setInterval(() => {
            const breakElapsed = (new Date() - new Date(shiftState.breakStartTime)) / 1000;
            setTimers(t => ({ shift: elapsedSinceShiftStart - shiftState.totalBreakSeconds - breakElapsed, break: breakElapsed }));
          }, 1000);
        }
        return () => { clearInterval(shiftInterval); clearInterval(breakInterval); };
      }, [shiftState.status, shiftState.startTime, shiftState.breakStartTime, shiftState.totalBreakSeconds]);
      
      useEffect(() => {
        const autoEndShift = async () => {
          if (shiftState.status === 'active' && settings.autoEndShift && isAfter(new Date(), endOfDay(new Date(shiftState.startTime)))) {
            await handleShiftAction('end');
            setLastShiftDuration(0);
          }
        };
        const interval = setInterval(autoEndShift, 60000);
        return () => clearInterval(interval);
      }, [shiftState, settings]);

      const handleShiftAction = useCallback(async (action) => {
        if (!supabase || !user || isShiftActionLoading) return;
        setIsShiftActionLoading(true);
        const now = new Date();
        try {
            switch (action) {
              case 'start':
                const { count: currentShiftCount, error: countError } = await supabase.from('shifts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('start_time', startOfDay(new Date()).toISOString());
                if (countError) throw countError;
                if (currentShiftCount >= settings.shiftsPerDay) {
                  toast({ title: t('shiftsLimitReached'), variant: "destructive" });
                  setShiftCount(currentShiftCount);
                  return;
                }
                const { data: newShift, error: startError } = await supabase.from('shifts').insert({ user_id: user.id, start_time: now.toISOString(), total_break_seconds: 0 }).select().single();
                if (startError) throw startError;
                toast({ title: t('startShift') });
                break;
    
              case 'start_break':
                const { data: newBreak, error: breakStartError } = await supabase.from('breaks').insert({ shift_id: shiftState.id, start_time: now.toISOString() }).select().single();
                if (breakStartError) throw breakStartError;
                toast({ title: t('startBreak') });
                break;
    
              case 'end_break':
                const breakDuration = (now - new Date(shiftState.breakStartTime)) / 1000;
                const newTotalBreakSeconds = (shiftState.totalBreakSeconds || 0) + breakDuration;
                const { error: breakEndError } = await supabase.from('breaks').update({ end_time: now.toISOString() }).eq('id', shiftState.activeBreakId);
                const { error: shiftUpdateError } = await supabase.from('shifts').update({ total_break_seconds: newTotalBreakSeconds }).eq('id', shiftState.id);
                if (breakEndError || shiftUpdateError) throw (breakEndError || shiftUpdateError);
                toast({ title: t('endBreak') });
                break;
    
              case 'end':
                const { error: endError } = await supabase.from('shifts').update({ end_time: now.toISOString() }).eq('id', shiftState.id);
                if (endError) throw endError;
                const shiftDuration = (now - shiftState.startTime) / 1000;
                setLastShiftDuration(shiftDuration - shiftState.totalBreakSeconds);
                toast({ title: t('endShift') });
                break;
              default: break;
            }
        } catch (error) {
            toast({ title: `Failed to ${action} shift`, description: error.message, variant: "destructive" });
        } finally {
            await loadState();
            setIsShiftActionLoading(false);
        }
      }, [shiftState, supabase, user, settings, isShiftActionLoading, t, loadState]);

      const handleDayClick = useCallback(async (day) => {
        if (!supabase || !user) return;
        const dayStart = startOfDay(day).toISOString();
        const dayEnd = dateFnsEndOdDay(day).toISOString();

        const { data, error } = await supabase
          .from('shifts')
          .select('*, breaks(*)')
          .eq('user_id', user.id)
          .gte('start_time', dayStart)
          .lte('start_time', dayEnd);

        if (error) {
          toast({ title: 'Error fetching shift data', description: error.message, variant: 'destructive' });
          return;
        }

        setSelectedDayData({ shifts: data, date: day });
        setIsModalOpen(true);
      }, [supabase, user]);

      const fetchMonthData = useCallback(async (date) => {
        if (!supabase || !user) return;
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
    
        const { data: shifts, error: shiftsError } = await supabase
          .from('shifts')
          .select('start_time, end_time, total_break_seconds')
          .eq('user_id', user.id)
          .gte('start_time', monthStart.toISOString())
          .lte('start_time', monthEnd.toISOString())
          .not('end_time', 'is', null);
    
        if (shiftsError) {
          toast({ title: 'Error fetching month work hours', description: shiftsError.message, variant: 'destructive' });
          return;
        }
    
        const totalSeconds = shifts.reduce((acc, shift) => {
          const start = new Date(shift.start_time);
          const end = new Date(shift.end_time);
          const duration = (end - start) / 1000;
          return acc + (duration - (shift.total_break_seconds || 0));
        }, 0);
    
        setMonthWorkHours(totalSeconds / 3600);
        
        const { count: leavesCount, error: leavesError } = await supabase
            .from('leave_requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .gte('leave_date', format(monthStart, 'yyyy-MM-dd'))
            .lte('leave_date', format(monthEnd, 'yyyy-MM-dd'));

        if(leavesError) {
            toast({ title: 'Error fetching approved leaves', description: leavesError.message, variant: 'destructive' });
        } else {
            setApprovedLeavesCount(leavesCount);
        }

      }, [supabase, user]);

      const requiredHours = useMemo(() => {
        const daysInMonth = getDaysInMonth(new Date());
        const dailyHours = settings.defaultShiftHours || 8;
        return (dailyHours * daysInMonth) - (approvedLeavesCount * dailyHours);
      }, [approvedLeavesCount, settings.defaultShiftHours]);

      return (
        <>
          <Helmet><title>{t('attendance')} - SaaS Management System</title></Helmet>
          
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><Clock className="h-8 w-8" /><span>{t('attendance')}</span></h1>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ShiftControls
                shiftState={shiftState}
                timers={timers}
                handleShiftAction={handleShiftAction}
                shiftCount={shiftCount}
                lastShiftDuration={lastShiftDuration}
                isLoading={isShiftActionLoading}
              />
              <AttendanceCalendar 
                onDayClick={handleDayClick} 
                isRTL={isRTL} 
                fetchMonthData={fetchMonthData} 
                monthWorkHours={monthWorkHours}
                approvedLeavesCount={approvedLeavesCount}
                requiredHours={requiredHours}
              />
            </div>

            {isModalOpen && (
              <ShiftDetailsModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                dayData={selectedDayData}
              />
            )}
          </div>
        </>
      );
    };

    export default Attendance;