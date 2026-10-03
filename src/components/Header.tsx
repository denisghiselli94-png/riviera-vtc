import React from 'react';
import { CompanyProfile } from '../types';
import { formatFrenchDateLong } from '../utils/format';
import { ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  activeProfile: CompanyProfile;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeProfile, onOpenSettings }) => {
  const todayStr = formatFrenchDateLong();

  return (
    <header className="no-print bg-white border-b border-slate-200 pt-safe px-4 pb-3 sticky top-0 z-30 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-900" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase font-sans">
              {activeProfile.nomCommercial || 'RIVIERA VTC'}
            </h1>
          </div>
          <p className="text-xs font-semibold text-blue-950 uppercase tracking-wider">
            Gestion des réservations
          </p>
          <p className="text-[11px] text-slate-500 capitalize mt-0.5 font-medium">
            {todayStr}
          </p>
        </div>

        {/* Chauffeur & Vehicle Badge */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Modifier le profil entreprise"
          className="flex flex-col items-end text-right bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-2.5 py-1.5 transition text-left"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
            <User className="w-3.5 h-3.5 text-blue-900 shrink-0" />
            <span className="truncate max-w-[110px]">
              {activeProfile.conducteurPrenom} {activeProfile.conducteurNom.charAt(0)}.
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[110px]">
              {activeProfile.immatriculation || 'VTC'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
