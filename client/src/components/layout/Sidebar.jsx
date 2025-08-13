import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';

const Sidebar = ({ onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { company } = useCompany();
  const location = useLocation();

  const menuItems = company?.settings?.navigation || [];

  const filteredNav = menuItems
    .filter(item => {
      // if (!user ) return false;
      // const userRoles = [user.role, ...(user.permissions || [])];
      // if (item.roles && item.roles.length > 0) {
      //   return item.roles.some(role => userRoles.includes(role));
      // }
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const buildTree = (items) => {
    const tree = [];
    const map = {};
    items.forEach(item => {
      map[item.id] = { ...item, items: [] };
    });

    items.forEach(item => {
      if (item.groupId) {
        if (map[item.groupId]) {
          map[item.groupId].items.push(map[item.id]);
        }
      } else {
        tree.push(map[item.id]);
      }
    });

    return tree;
  };

  const structuredNav = buildTree(filteredNav);

  const NavItem = ({ item, isSubItem = false }) => {
    const Icon = Icons[item.icon] || Icons.HelpCircle;
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = item.items && item.items.length > 0;

    const isActive = location.pathname === item.path || (hasSubItems && item.items.some(sub => location.pathname === sub.path));

    useEffect(() => {
      if (hasSubItems && item.items.some(sub => location.pathname.startsWith(sub.path))) {
        setIsOpen(true);
      }
    }, [location.pathname, item, hasSubItems]);

    const navLinkClass = `
      flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left
      ${isSubItem ? 'pl-8' : ''}
      ${isActive
        ? 'bg-primary text-primary-foreground shadow-lg'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }
    `;

    const content = (
      <>
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium text-sm flex-1">{t(item.label.toLowerCase().replace(/ /g, '')) || item.label}</span>
        {item.type === 'external' && <Icons.ExternalLink className="h-4 w-4 text-muted-foreground" />}
        {hasSubItems && (
          <Icons.ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </>
    );

    if (item.type === 'group' && item.divider) {
      return <hr className="my-3 border-border" />;
    }

    if (item.type === 'group' && !item.divider) {
      return (
        <div>
          <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t(item.label.toLowerCase().replace(/ /g, '')) || item.label}</h3>
          <div className="space-y-1">
            {item.items.map(subItem => <NavItem key={subItem.id} item={subItem} />)}
          </div>
        </div>
      );
    }

    if (item.type === 'external') {
      return <a href={item.path} target={item.openInNewTab ? '_blank' : '_self'} rel="noopener noreferrer" className={navLinkClass}>{content}</a>;
    }

    if (hasSubItems) {
      return (
        <div>
          <button onClick={() => setIsOpen(!isOpen)} className={navLinkClass}>
            {content}
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-4"
              >
                <div className="space-y-1 py-1">
                  {item.items.map(subItem => <NavItem key={subItem.id} item={subItem} isSubItem={true} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        className={navLinkClass}
        onClick={() => {
          if (window.innerWidth < 1024) {
            if (onClose) onClose();
          }
        }}
      >
        {content}
      </NavLink>
    );
  };

  return (
    <motion.div
      className="h-full bg-card border-r border-border sidebar-gradient flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              {company?.settings?.logo ? (
                <img src={company.settings.logo} alt="logo" className="h-6 w-6 object-contain" />
              ) : (
                <span className="text-primary-foreground font-bold text-lg">
                  {company?.name?.charAt(0) || 'C'}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-md text-foreground">
              {company?.settings?.siteName || t('tabTitle')}
            </h2>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <Icons.X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {structuredNav.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <NavItem item={item} />
          </motion.div>
        ))}
      </nav>
    </motion.div>
  );
};

export default Sidebar;