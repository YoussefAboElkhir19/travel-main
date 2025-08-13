import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from '@/components/ui/use-toast';
import NavigationModal from '@/components/settings/NavigationModal';

const NavigationManagement = ({ navigation, setNavigation }) => {
  const { t } = useLanguage();
  const { company } = useCompany();
  const [modalState, setModalState] = useState({ isOpen: false, type: null, data: null, isEditing: false });

  const openModal = useCallback((type, data = null) => {
    let defaultItem;
    switch(type) {
      case 'group':
        defaultItem = { id: `group-${Date.now()}`, type: 'group', label: 'New Group', order: navigation.length + 1, roles: [], divider: false };
        break;
      case 'item':
      default:
        defaultItem = { id: `item-${Date.now()}`, type: 'link', label: 'New Item', path: '/', icon: 'Link', order: navigation.length + 1, roles: [], groupId: '', openInNewTab: false };
    }
    
    setModalState({ 
      isOpen: true, 
      type, 
      data: data || defaultItem, 
      isEditing: !!data 
    });
  }, [navigation.length]);

  const handleModalSave = useCallback((newData) => {
    let newNav;
    const existingItem = navigation.find(item => item.id === newData.id);

    if (modalState.isEditing || existingItem) {
      newNav = navigation.map(item => item.id === newData.id ? newData : item);
    } else {
      newNav = [...navigation, newData];
    }
    const reorderedNav = newNav.map((item, index) => ({...item, order: index + 1}));
    setNavigation(reorderedNav);
    setModalState({ isOpen: false, type: null, data: null, isEditing: false });
  }, [navigation, modalState.isEditing, setNavigation]);
  
  const handleDelete = useCallback((id) => {
     setNavigation(nav => nav.filter(item => item.id !== id && item.groupId !== id));
     toast({ title: "Item Deleted", variant: "destructive"});
  }, [setNavigation]);
  
  const moveItem = useCallback((id, direction) => {
    setNavigation(currentNav => {
        const itemIndex = currentNav.findIndex(item => item.id === id);
        if ((direction === -1 && itemIndex === 0) || (direction === 1 && itemIndex === currentNav.length - 1)) return currentNav;
        const newNav = [...currentNav];
        const item = newNav.splice(itemIndex, 1)[0];
        newNav.splice(itemIndex + direction, 0, item);
        return newNav.map((item, index) => ({...item, order: index + 1}));
    });
  }, [setNavigation]);

  const groups = navigation.filter(item => item.type === 'group' && !item.divider);

  const AddItemDropdown = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button><Icons.Plus className="h-4 w-4 mr-2" />{t('addMenuItem')}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openModal('item')}>
                <Icons.Link className="h-4 w-4 mr-2"/>
                <span>New Item</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openModal('group')}>
                <Icons.Folder className="h-4 w-4 mr-2"/>
                <span>New Group</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
                const newDivider = { id: `group-${Date.now()}`, type: 'group', label: '', order: navigation.length + 1, roles: [], divider: true };
                setNavigation(nav => [...nav, newDivider].sort((a,b) => a.order - b.order));
                toast({ title: 'Divider Added' });
            }}>
                <Icons.Minus className="h-4 w-4 mr-2"/>
                <span>Add Divider</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2"><Icons.List className="h-5 w-5" /><span>{t('navigationManagement')}</span></CardTitle>
            <AddItemDropdown />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {navigation.map((item) => {
             if (item.divider) {
                return (
                    <div key={item.id} className="p-3 border rounded-lg flex items-center justify-between bg-muted/30">
                        <div className="flex items-center space-x-4">
                            <Icons.Minus className="h-5 w-5 text-muted-foreground" />
                            <p className="font-medium text-muted-foreground italic">Divider</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => moveItem(item.id, -1)}><Icons.ChevronUp className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => moveItem(item.id, 1)}><Icons.ChevronDown className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}><Icons.Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                );
             }
             const Icon = Icons[item.icon] || Icons.HelpCircle;
             return (
              <div key={item.id} className={`p-3 border rounded-lg flex items-center justify-between ${item.type === 'group' ? 'bg-muted/50 font-bold' : ''} ${item.groupId ? 'ml-8' : ''}`}>
                <div className="flex items-center space-x-4">
                    {item.type !== 'group' && <Icon className="h-5 w-5 text-muted-foreground" />}
                    {item.type === 'group' && <Icons.Folder className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.type !== 'group' && <p className="text-sm text-muted-foreground">{item.path}</p>}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => moveItem(item.id, -1)}><Icons.ChevronUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => moveItem(item.id, 1)}><Icons.ChevronDown className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openModal(item.type, item)}><Icons.Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}><Icons.Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
             );
          })}
        </CardContent>
      </Card>
      {modalState.isOpen && <NavigationModal {...modalState} groups={groups} availableRoles={company?.settings?.roles || []} onClose={() => setModalState({ isOpen: false, type: null, data: null, isEditing: false })} onSave={handleModalSave} />}
    </>
  );
};

export default NavigationManagement;