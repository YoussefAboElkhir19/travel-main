import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import * as Icons from 'lucide-react';

const ShiftSettings = ({ settings, setSettings }) => {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center space-x-2"><Icons.Clock className="h-5 w-5" /><span>Shift Settings</span></CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="defaultShiftHours">Default Shift Hours</Label>
            <Input id="defaultShiftHours" type="number" value={settings.shiftSettings.defaultShiftHours} onChange={(e) => setSettings(s => ({ ...s, shiftSettings: { ...s.shiftSettings, defaultShiftHours: parseInt(e.target.value) } }))} />
          </div>
          <div>
            <Label htmlFor="defaultBreakMinutes">Default Break (minutes)</Label>
            <Input id="defaultBreakMinutes" type="number" value={settings.shiftSettings.defaultBreakMinutes} onChange={(e) => setSettings(s => ({ ...s, shiftSettings: { ...s.shiftSettings, defaultBreakMinutes: parseInt(e.target.value) } }))} />
          </div>
          <div>
            <Label htmlFor="shiftsPerDay">Shifts per Day</Label>
            <Input id="shiftsPerDay" type="number" value={settings.shiftSettings.shiftsPerDay} onChange={(e) => setSettings(s => ({ ...s, shiftSettings: { ...s.shiftSettings, shiftsPerDay: parseInt(e.target.value) } }))} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="autoEndShift" checked={settings.shiftSettings.autoEndShift} onCheckedChange={(val) => setSettings(s => ({ ...s, shiftSettings: { ...s.shiftSettings, autoEndShift: val } }))} />
          <Label htmlFor="autoEndShift">Auto-end shift at 23:59 for online employees</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftSettings;