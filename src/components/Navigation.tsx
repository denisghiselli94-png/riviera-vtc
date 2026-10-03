import React from 'react';
import { Home, PlusCircle, Calendar, Settings } from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  bookingCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  bookingCount,
}) => {
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 bottom-nav-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-1">
        {/* Tab 1: Accueil */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors ${
            activeTab === 'dashboard'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 mb-1 ${activeTab === 'dashboard' ? 'stroke-[2.5px] text-blue-950' : 'stroke-[1.75px]'}`} />
          <span className="text-[11px] tracking-tight">Accueil</span>
        </button>

        {/* Tab 2: Nouvelle Course */}
        <button
          type="button"
          onClick={() => onTabChange('new-booking')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors relative ${
            activeTab === 'new-booking'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <PlusCircle className={`w-5 h-5 mb-1 ${activeTab === 'new-booking' ? 'stroke-[2.5px] text-blue-950' : 'stroke-[1.75px]'}`} />
          </div>
          <span className="text-[11px] tracking-tight">+ Course</span>
        </button>

        {/* Tab 3: Réservations */}
        <button
          type="button"
          onClick={() => onTabChange('reservations')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors relative ${
            activeTab === 'reservations'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 mb-1 ${activeTab === 'reservations' ? 'stroke-[2.5px] text-blue-950' : 'stroke-[1.75px]'}`} />
            {typeof bookingCount === 'number' && bookingCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {bookingCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Réservations</span>
        </button>

        {/* Tab 4: Réglages */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] transition-colors ${
            activeTab === 'settings'
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Settings className={`w-5 h-5 mb-1 ${activeTab === 'settings' ? 'stroke-[2.5px] text-blue-950' : 'stroke-[1.75px]'}`} />
          <span className="text-[11px] tracking-tight">Réglages</span>
        </button>
      </div>
    </nav>
  );
};
