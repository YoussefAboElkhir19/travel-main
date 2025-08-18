import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, formatDuration, intervalToDuration } from 'date-fns';

const ShiftDetailsModal = ({ isOpen, onOpenChange, dayData }) => {
  const { t } = useLanguage();

  if (!dayData) return null;

  const { shifts, date } = dayData;
  console.log("shifts :", shifts);

  const formatSeconds = (seconds) => {
    if (!seconds || seconds < 0) seconds = 0;
    const duration = intervalToDuration({ start: 0, end: Math.floor(seconds) * 1000 });
    const formatted = formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] });
    return formatted || "0 seconds";
  };

  const getShiftNetTime = (shift) => {
    if (!shift.end_time) return 0;
    const duration = (new Date(shift.end_time) - new Date(shift.start_time)) / 1000;
    return duration - (shift.total_break_seconds || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect" style={{ background: 'hsla(var(--background) / 0.8)' }}>
        <DialogHeader>
          <DialogTitle>{t('shiftDetails')} - {date ? format(date, 'MMMM d, yyyy') : ''}</DialogTitle>
          <DialogDescription>
            {shifts && shifts.length > 0 ? `Total shifts: ${shifts.length}` : 'No shift data for this day.'}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
          {shifts && shifts.length > 0 ? (
            shifts.map((shift, index) => (
              <div key={shift.id} className="p-4 border rounded-lg">
                <h4 className="font-bold mb-2">Shift {index + 1}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('shiftStart')}:</span><span className="font-semibold">{format(new Date(shift.start_time), 'p')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('shiftEnd')}:</span><span className="font-semibold">{shift.end_time ? format(new Date(shift.end_time), 'p') : 'Active'}</span></div>

                  {shift.breaks && shift.breaks.length > 0 && (
                    <div className="pl-4 border-l-2 ml-2 mt-2 pt-2 space-y-1">
                      <p className="text-muted-foreground mb-1">Breaks:</p>
                      {shift.breaks.map((breakItem, breakIndex) => (
                        <div key={breakItem.id} className="text-xs">
                          <div className="flex justify-between">
                            <span>Break {breakIndex + 1} Start:</span>
                            <span>{format(new Date(breakItem.start_time), 'p')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Break {breakIndex + 1} End:</span>
                            <span>{breakItem.end_time ? format(new Date(breakItem.end_time), 'p') : 'Active'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between pt-1"><span className="text-muted-foreground">{t('totalBreak')}:</span><span className="font-semibold">{formatSeconds(shift.total_break_seconds)}</span></div>
                  <div className="flex justify-between text-base border-t pt-2 mt-2"><span className="font-bold">{t('netTime')}:</span><span className="font-bold text-primary">{formatSeconds(getShiftNetTime(shift))}</span></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No shift data recorded for this day. This employee was absent.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetailsModal;