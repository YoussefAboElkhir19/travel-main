
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, getDaysInMonth, isWeekend, startOfDay } from 'date-fns';

const AttendanceCalendar = ({ onDayClick, isRTL, fetchMonthData: propFetchMonthData, monthWorkHours, approvedLeavesCount }) => {
  const { t } = useLanguage();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { company } = useCompany();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthData, setMonthData] = useState({});

  const workDaysInMonth = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)).filter(day => !isWeekend(day)).length;
  const requiredHours = (workDaysInMonth - approvedLeavesCount) * (company?.settings?.shiftSettings?.defaultShiftHours || 8);
  
  const fetchMonthData = useCallback(async () => {
    if (!supabase || !user) return;
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('start_time')
      .eq('user_id', user.id)
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString());

    const { data: leaves, error: leavesError } = await supabase
      .from('leave_requests')
      .select('leave_date, status')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .gte('leave_date', format(monthStart, 'yyyy-MM-dd'))
      .lte('leave_date', format(monthEnd, 'yyyy-MM-dd'));

    if (shiftsError || leavesError) {
      console.error("Error fetching calendar data:", shiftsError || leavesError);
      return;
    }

    const compiledData = {};
    const today = startOfDay(new Date());
    
    // Iterate through all days of the month to set unexcused absences
    const daysInMonth = getDaysInMonth(currentMonth);
    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        if (day < today) {
            const formattedDay = format(day, 'yyyy-MM-dd');
            compiledData[formattedDay] = { status: 'unexcused-absence' };
        }
    }

    shifts.forEach(shift => {
      const day = format(new Date(shift.start_time), 'yyyy-MM-dd');
      compiledData[day] = { status: 'present' };
    });
    
    leaves.forEach(leave => {
      compiledData[leave.leave_date] = { status: 'excused-absence' };
    });
    
    setMonthData(compiledData);
    if(propFetchMonthData) propFetchMonthData(currentMonth);
  }, [currentMonth, supabase, user, propFetchMonthData]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  const changeMonth = (amount) => {
    setCurrentMonth(current => addMonths(current, amount));
  }

  const renderCalendarHeader = () => {
    const weekDays = isRTL 
      ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-2 text-center text-muted-foreground font-semibold">
        {weekDays.map(d => <div key={d}>{d}</div>)}
      </div>
    );
  };

  const renderCalendarCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: isRTL ? 6 : 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: isRTL ? 6 : 0 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDay = format(day, 'yyyy-MM-dd');
        const dayData = monthData[formattedDay];
        let dayClass = '';
        if (dayData?.status === 'present') dayClass = 'bg-green-500/80 text-white';
        if (dayData?.status === 'excused-absence') dayClass = 'bg-yellow-500/80 text-white';
        if (dayData?.status === 'unexcused-absence') dayClass = 'bg-red-500/80 text-white';

        days.push(
          <div
            key={day.toString()}
            className={`p-2 h-20 flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer hover:bg-primary/20 ${
              !isSameMonth(day, monthStart) ? 'text-muted-foreground/50 bg-accent/20' : 'bg-card'
            } ${isSameDay(day, new Date()) ? 'border-2 border-primary' : ''} ${dayClass}`}
            onClick={() => onDayClick(day)}
          >
            <span className="font-medium text-lg">{format(day, 'd')}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day.toString()} className="grid grid-cols-7 gap-2">{days}</div>);
      days = [];
    }
    return <div className="space-y-2">{rows}</div>;
  };
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
      <Card className="h-full glass-effect" style={{ background: 'hsla(var(--primary) / 0.1)' }}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('attendanceCalendar')}</CardTitle>
              <CardDescription>{t('attendanceCalendarDesc')}</CardDescription>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderCalendarHeader()}
          {renderCalendarCells()}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>{t('present')}</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>{t('excusedAbsence')}</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>{t('unexcusedAbsence')}</span></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('totalWorkingHours')}</p>
              <p className="text-2xl font-bold">{monthWorkHours.toFixed(1)}H</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('requiredHours')}</p>
              <p className="text-2xl font-bold">{requiredHours.toFixed(1)}H</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AttendanceCalendar;
