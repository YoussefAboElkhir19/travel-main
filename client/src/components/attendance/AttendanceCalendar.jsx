import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  getDaysInMonth,
  isWeekend,
  startOfDay,
  parseISO,
} from 'date-fns';
import axios from 'axios';

const AttendanceCalendar = ({
  onDayClick,
  isRTL,
  fetchMonthData: propFetchMonthData,
  monthWorkHours,
  approvedLeavesCount,
}) => {
  const { t } = useLanguage();
  const { company } = useCompany();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthData, setMonthData] = useState({});

  const workDaysInMonth = Array.from(
    { length: getDaysInMonth(currentMonth) },
    (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
  ).filter(day => !isWeekend(day)).length;

  const requiredHours =
    (workDaysInMonth - approvedLeavesCount) *
    (company?.settings?.shiftSettings?.defaultShiftHours || 8);

  const fetchMonthData = useCallback(async () => {
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No token found in session storage');

      const authUserRaw = sessionStorage.getItem('user');
      if (!authUserRaw) throw new Error('No user found in session storage');
      const authUser = JSON.parse(authUserRaw);

      // 1) Shifts
      const shiftsRes = await axios.get('http://travel-server.test/api/shifts', {
        params: {
          user_id: authUser.id,
          start_date: format(monthStart, 'yyyy-MM-dd'),
          end_date: format(monthEnd, 'yyyy-MM-dd'),
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${token}`,
        },
      });

      // 2) Leaves
      const leavesRes = await axios.get('http://travel-server.test/api/get_leaves', {
        params: {
          user_id: authUser.id,
          start_date: format(monthStart, 'yyyy-MM-dd'),
          end_date: format(monthEnd, 'yyyy-MM-dd'),
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${token}`,
        },
      });

      const shifts = shiftsRes?.data?.data || shiftsRes?.data || [];
      const leaves = leavesRes?.data?.data || leavesRes?.data || [];
      const compiledData = {};
      const today = startOfDay(new Date());

      const daysInMonth = getDaysInMonth(currentMonth);
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        if (d < today) {
          const formatted = format(d, 'yyyy-MM-dd');
          compiledData[formatted] = { status: 'unexcused-absence' };
        }
      }

      if (Array.isArray(leaves)) {
        leaves.forEach(leave => {
          if (!leave?.leave_date) return;
          const dayKey = leave.leave_date.includes('T')
            ? format(parseISO(leave.leave_date), 'yyyy-MM-dd')
            : leave.leave_date;
          compiledData[dayKey] = { status: 'excused-absence', leaveData: leave };
        });
      }

      if (Array.isArray(shifts)) {
        shifts.forEach(shift => {
          if (!shift) return;
          const source = shift.start_time ?? shift.date;
          if (!source) return;

          const shiftDate = source.includes('T') ? parseISO(source) : new Date(source);
          if (Number.isNaN(shiftDate?.getTime?.())) return;

          const dayKey = format(shiftDate, 'yyyy-MM-dd');
          if (!compiledData[dayKey] || compiledData[dayKey].status !== 'present') {
            compiledData[dayKey] = { status: 'present', shifts: [] };
          }
          compiledData[dayKey].shifts.push(shift);
        });
      } else if (shifts && (shifts.start_time || shifts.date)) {
        const source = shifts.start_time ?? shifts.date;
        const shiftDate = source.includes('T') ? parseISO(source) : new Date(source);
        if (!Number.isNaN(shiftDate?.getTime?.())) {
          const dayKey = format(shiftDate, 'yyyy-MM-dd');
          compiledData[dayKey] = { status: 'present', shifts: [shifts] };
        }
      }

      

      setMonthData(compiledData);
      if (propFetchMonthData) propFetchMonthData(currentMonth);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  }, [currentMonth, propFetchMonthData]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  const changeMonth = amount => {
    setCurrentMonth(curr => addMonths(curr, amount));
  };

  const renderCalendarHeader = () => {
    const weekDays = isRTL
      ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-2 text-center text-muted-foreground font-semibold">
        {weekDays.map(d => (
          <div key={d}>{d}</div>
        ))}
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
      const weekStartSnapshot = day;

      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const formattedDay = format(currentDay, 'yyyy-MM-dd');
        const dayData = monthData[formattedDay];
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isToday = isSameDay(currentDay, new Date());

        let dayClass = '';
        let statusColor = '';

        if (isCurrentMonth && dayData?.status) {
          switch (dayData.status) {
            case 'present':
              dayClass = 'bg-green-500/80 text-white';
              statusColor = 'border-green-500';
              break;
            case 'excused-absence':
              dayClass = 'bg-yellow-500/80 text-white';
              statusColor = 'border-yellow-500';
              break;
            case 'unexcused-absence':
              dayClass = 'bg-red-500/80 text-white';
              statusColor = 'border-red-500';
              break;
            default:
              break;
          }
        }

        days.push(
          <div
            key={formattedDay}
            role="button"
            tabIndex={0}
            aria-label={`Day ${formattedDay}`}
            className={`p-2 h-20 flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer hover:bg-primary/20
              ${!isCurrentMonth ? 'text-muted-foreground/50 bg-accent/20' : dayClass || 'bg-card'}
              ${isToday ? `border-2 ${statusColor || 'border-primary'}` : ''}`}
            onClick={() => handleDayClick(currentDay, dayData)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleDayClick(currentDay, dayData);
            }}
          >
            <span className="font-medium text-lg">{format(currentDay, 'd')}</span>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div
          key={`week-${format(weekStartSnapshot, 'yyyy-MM-dd')}`}
          className="grid grid-cols-7 gap-2"
        >
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-2">{rows}</div>;
  };

  const handleDayClick = (day, dayData) => {
    const normalized = startOfDay(day);
    const formattedDate = format(normalized, 'yyyy-MM-dd');
    console.log('Day clicked:', formattedDate, dayData);
    onDayClick?.(normalized, dayData ?? null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:col-span-2"
    >
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
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>{t('present')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>{t('excusedAbsence')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>{t('unexcusedAbsence')}</span>
            </div>
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
