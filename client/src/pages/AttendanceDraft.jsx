import React, { useState, useEffect, useCallback } from "react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export default function ShiftManager({ user }) {
    const [shiftState, setShiftState] = useState({
        id: null,
        status: "not_started",
        startTime: null,
        endTime: null,
        breakStartTime: null,
        totalBreakSeconds: 0,
        activeBreakId: null,
    });

    const [shiftCount, setShiftCount] = useState(0);
    const [monthData, setMonthData] = useState([]);
    const [isShiftActionLoading, setIsShiftActionLoading] = useState(false);

    // تحميل حالة الشيفت الحالي
    const loadState = useCallback(async () => {
        if (!user) return;
        setIsShiftActionLoading(true);

        try {
            // الشيفت النشط
            const resActive = await fetch(`/api/shifts/active?user_id=${user.id}`);
            const activeShifts = await resActive.json();

            const activeShift = activeShifts?.[0];
            if (activeShift) {
                const activeBreak = activeShift.breaks.find((b) => b.end_time === null);
                setShiftState({
                    id: activeShift.id,
                    status: activeBreak ? "on_break" : "active",
                    startTime: new Date(activeShift.start_time),
                    endTime: null,
                    breakStartTime: activeBreak ? new Date(activeBreak.start_time) : null,
                    totalBreakSeconds: activeShift.total_break_seconds || 0,
                    activeBreakId: activeBreak ? activeBreak.id : null,
                });
            } else {
                setShiftState({
                    id: null,
                    status: "not_started",
                    startTime: null,
                    endTime: null,
                    breakStartTime: null,
                    totalBreakSeconds: 0,
                    activeBreakId: null,
                });
            }

            // عدّ الشيفتات لليوم
            const todayStart = startOfDay(new Date()).toISOString();
            const todayEnd = endOfDay(new Date()).toISOString();
            const resCount = await fetch(
                `/api/shifts/count?user_id=${user.id}&start=${todayStart}&end=${todayEnd}`
            );
            const { count } = await resCount.json();
            setShiftCount(count || 0);
        } catch (err) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsShiftActionLoading(false);
        }
    }, [user]);

    // بدء شيفت
    const startShift = async () => {
        try {
            await fetch("/api/shifts/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id }),
            });
            toast({ title: "Shift started" });
            loadState();
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    // إنهاء شيفت
    const endShift = async () => {
        try {
            await fetch("/api/shifts/end", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shift_id: shiftState.id }),
            });
            toast({ title: "Shift ended" });
            loadState();
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    // بدء بريك
    const startBreak = async () => {
        try {
            await fetch("/api/breaks/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shift_id: shiftState.id }),
            });
            toast({ title: "Break started" });
            loadState();
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    // إنهاء بريك
    const endBreak = async () => {
        try {
            await fetch("/api/breaks/end", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ break_id: shiftState.activeBreakId }),
            });
            toast({ title: "Break ended" });
            loadState();
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    // جلب بيانات الشهر
    const fetchMonthData = useCallback(async (month) => {
        if (!user) return;
        try {
            const start = startOfMonth(month).toISOString();
            const end = endOfMonth(month).toISOString();
            const res = await fetch(
                `/api/shifts/month?user_id=${user.id}&start=${start}&end=${end}`
            );
            const data = await res.json();
            setMonthData(data);
        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    }, [user]);

    useEffect(() => {
        loadState();
        fetchMonthData(new Date());
    }, [loadState, fetchMonthData]);

    return (
        <div>
            <h1>Shift Manager</h1>
            <p>Status: {shiftState.status}</p>
            <p>Today's Shifts: {shiftCount}</p>

            {shiftState.status === "not_started" && (
                <button onClick={startShift} disabled={isShiftActionLoading}>
                    Start Shift
                </button>
            )}

            {shiftState.status === "active" && (
                <>
                    <button onClick={startBreak} disabled={isShiftActionLoading}>
                        Start Break
                    </button>
                    <button onClick={endShift} disabled={isShiftActionLoading}>
                        End Shift
                    </button>
                </>
            )}

            {shiftState.status === "on_break" && (
                <button onClick={endBreak} disabled={isShiftActionLoading}>
                    End Break
                </button>
            )}
        </div>
    );
}
