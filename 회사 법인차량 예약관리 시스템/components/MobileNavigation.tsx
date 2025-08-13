import React from 'react';
import { Badge } from './ui/badge';
import { LayoutDashboard, Car, Plus, Settings } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
}

export default function MobileNavigation({ activeTab, onTabChange, pendingCount }: MobileNavigationProps) {
  const navItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: '대시보드'
    },
    {
      id: 'vehicles',
      icon: Car,
      label: '차량'
    },
    {
      id: 'reservation',
      icon: Plus,
      label: '예약'
    },
    {
      id: 'management',
      icon: Settings,
      label: '관리',
      badge: pendingCount > 0 ? pendingCount : undefined
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 relative transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                {item.badge && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-blue-500"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}