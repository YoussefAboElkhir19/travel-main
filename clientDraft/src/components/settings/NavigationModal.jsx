import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const NavigationModal = ({ isOpen, type, data, isEditing, groups, availableRoles, onClose, onSave }) => {
    const { t } = useLanguage();
    const [itemData, setItemData] = useState(data);
    const iconList = Object.keys(Icons).filter(key => typeof Icons[key] === 'object' && key[0] === key[0].toUpperCase() && !key.includes('Provider'));

    const handleRoleChange = useCallback((role, checked) => {
        setItemData(prev => {
            const currentRoles = prev.roles || [];
            if (checked) {
                return { ...prev, roles: [...currentRoles, role] };
            } else {
                return { ...prev, roles: currentRoles.filter(r => r !== role) };
            }
        });
    }, []);

    const handleChange = useCallback((field, value) => {
      setItemData(prev => ({...prev, [field]: value}));
    }, []);
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>{isEditing ? `Edit ${type}` : `Add new ${type}`}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <div><Label>{t('menuItemLabel')}</Label><Input value={itemData.label} onChange={e => handleChange('label', e.target.value)} /></div>
                    {type === 'item' && (
                        <>
                            <div><Label>{t('menuItemPath')}</Label><Input value={itemData.path} onChange={e => handleChange('path', e.target.value)} /></div>
                            <div>
                                <Label>{t('menuItemIcon')}</Label>
                                <Select value={itemData.icon} onValueChange={(val) => handleChange('icon', val)}>
                                    <SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger>
                                    <SelectContent>
                                        {iconList.map(iconName => {
                                            const IconComponent = Icons[iconName];
                                            return (
                                                <SelectItem key={iconName} value={iconName}>
                                                    <div className="flex items-center space-x-2">
                                                        <IconComponent className="h-4 w-4" />
                                                        <span>{iconName}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Item Type</Label><Select value={itemData.type} onValueChange={(val) => handleChange('type', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="link">Internal Link</SelectItem><SelectItem value="external">External Link</SelectItem></SelectContent></Select></div>
                            <div><Label>Group</Label><Select value={itemData.groupId} onValueChange={(val) => handleChange('groupId', val)}><SelectTrigger><SelectValue placeholder="No group"/></SelectTrigger><SelectContent>{groups.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}</SelectContent></Select></div>
                             <div className="flex items-center space-x-2"><Checkbox id="new-tab-switch" checked={!!itemData.openInNewTab} onCheckedChange={(val) => handleChange('openInNewTab', val)} /><Label htmlFor="new-tab-switch">Open in new tab</Label></div>
                        </>
                    )}
                     <div>
                        <Label>Visible to Roles (leave empty for all)</Label>
                        <div className="space-y-2 mt-2">
                            {availableRoles.map(role => (
                                <div key={role} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role}`}
                                        checked={(itemData.roles || []).includes(role)}
                                        onCheckedChange={(checked) => handleRoleChange(role, checked)}
                                    />
                                    <label htmlFor={`role-${role}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">{role}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={onClose}>{t('cancel')}</Button><Button onClick={() => onSave(itemData)}>{t('save')}</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NavigationModal;