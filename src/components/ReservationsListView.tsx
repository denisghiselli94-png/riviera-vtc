import React, { useState, useMemo } from 'react';
import { Reservation, CompanyProfile } from '../types';
import { formatEuro, formatFrenchDateShort, getTodayString } from '../utils/format';
import {
  Search,
  FileText,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  X,
  RotateCcw,
} from 'lucide-react';

interface ReservationsListViewProps {
  reservations: Reservation[];
  activeProfile: CompanyProfile;
  onViewBon: (res: Reservation) => void;
  onEditBooking: (res: Reservation) => void;
  onDuplicateBooking: (res: Reservation) => void;
  onDeleteBooking: (res: Reservation) => void;
  onToggleStatus: (res: Reservation) => void;
  onOpenNewBooking: () => void;
}

type FilterTab = 'a_venir' | 'aujourd_hui' | 'terminees' | 'toutes';

export const ReservationsListView: React.FC<ReservationsListViewProps> = ({
  reservations,
  activeProfile,
  onViewBon,
  onEditBooking,
  onDuplicateBooking,
  onDeleteBooking,
  onToggleStatus,
  onOpenNewBooking,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('a_venir');
  const [searchQuery, setSearchQuery] = useState('');

  const today = getTodayString();

  // Helper for current week calculation
  const isCurrentWeek = (dateStr: string): boolean => {
    const d = new Date(dateStr);
    const now = new Date();
    // Start of week (Monday)
    const day = now.getDay() || 7; // get current day of week (1=Mon ... 7=Sun)
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return d >= monday && d <= sunday;
  };

  const isCurrentMonth = (dateStr: string): boolean => {
    const [year, month] = dateStr.split('-');
    const now = new Date();
    return (
      parseInt(year) === now.getFullYear() &&
      parseInt(month) === now.getMonth() + 1
    );
  };

  // CA Totals calculated automatically
  const caTotals = useMemo(() => {
    let todayCA = 0;
    let weekCA = 0;
    let monthCA = 0;

    reservations.forEach((r) => {
      if (r.status === 'annulee') return;
      const price = r.prixTTC || 0;

      if (r.datePrestation === today) {
        todayCA += price;
      }
      if (isCurrentWeek(r.datePrestation)) {
        weekCA += price;
      }
      if (isCurrentMonth(r.datePrestation)) {
        monthCA += price;
      }
    });

    return { todayCA, weekCA, monthCA };
  }, [reservations, today]);

  // Filter & Search
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // 1. Tab filter
      if (activeFilter === 'a_venir') {
        if (r.status === 'terminee' || r.datePrestation < today) return false;
      } else if (activeFilter === 'aujourd_hui') {
        if (r.datePrestation !== today) return false;
      } else if (activeFilter === 'terminees') {
        if (r.status !== 'terminee') return false;
      }
      // 'toutes' shows everything

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesClient = r.clientNom?.toLowerCase().includes(q);
        const matchesDepart = r.depart?.toLowerCase().includes(q);
        const matchesDest = r.destination?.toLowerCase().includes(q);
        const matchesBon = r.bonNumber?.toLowerCase().includes(q);
        const matchesPhone = r.clientTelephone?.includes(q);
        return matchesClient || matchesDepart || matchesDest || matchesBon || matchesPhone;
      }

      return true;
    }).sort((a, b) => {
      // Sort upcoming by earliest first, completed by latest first
      if (activeFilter === 'terminees') {
        return b.datePrestation.localeCompare(a.datePrestation) || b.heurePriseEnCharge.localeCompare(a.heurePriseEnCharge);
      }
      return a.datePrestation.localeCompare(b.datePrestation) || a.heurePriseEnCharge.localeCompare(b.heurePriseEnCharge);
    });
  }, [reservations, activeFilter, searchQuery, today]);

  return (
    <div className="space-y-4 pb-24">
      
      {/* Financial Overview (CA Aujourd'hui, CA Semaine, CA Mois) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Chiffre d’affaires calculé
        </h2>
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
          <div className="px-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Aujourd'hui</span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-sans block mt-0.5">
              {formatEuro(caTotals.todayCA)}
            </span>
          </div>

          <div className="px-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Semaine</span>
            <span className="text-base sm:text-lg font-black text-blue-950 font-sans block mt-0.5">
              {formatEuro(caTotals.weekCA)}
            </span>
          </div>

          <div className="px-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ce mois</span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-sans block mt-0.5">
              {formatEuro(caTotals.monthCA)}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher client, adresse, N° bon..."
          className="w-full pl-10 pr-9 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs (Functional segmented control as allowed by constitution) */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveFilter('a_venir')}
          className={`flex-1 py-2 px-2 text-center rounded-lg transition ${
            activeFilter === 'a_venir'
              ? 'bg-white text-slate-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          À VENIR
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('aujourd_hui')}
          className={`flex-1 py-2 px-2 text-center rounded-lg transition ${
            activeFilter === 'aujourd_hui'
              ? 'bg-white text-slate-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          AUJOURD’HUI
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('terminees')}
          className={`flex-1 py-2 px-2 text-center rounded-lg transition ${
            activeFilter === 'terminees'
              ? 'bg-white text-slate-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          TERMINÉES
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('toutes')}
          className={`flex-1 py-2 px-2 text-center rounded-lg transition ${
            activeFilter === 'toutes'
              ? 'bg-white text-slate-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          TOUTES
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Aucune réservation trouvée</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? `Aucun résultat pour "${searchQuery}".`
                : 'Aucune course ne correspond à cet onglet.'}
            </p>
            <button
              type="button"
              onClick={onOpenNewBooking}
              className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-xl text-xs font-bold"
            >
              + Nouvelle réservation
            </button>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <div
              key={res.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition space-y-3 ${
                res.status === 'terminee'
                  ? 'border-slate-200/80 bg-slate-50/50 opacity-90'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header: Date, Heure, Client, Prix */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="bg-blue-950 text-white font-mono font-bold text-sm px-2.5 py-1.5 rounded-xl text-center shrink-0">
                    <div>{res.heurePriseEnCharge}</div>
                    <div className="text-[9px] font-normal opacity-80">{formatFrenchDateShort(res.datePrestation)}</div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {res.clientNom}
                    </h4>
                    {/* Unboxed clean metadata as per constitution */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-[11px]">{res.bonNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className={res.status === 'terminee' ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
                        {res.status === 'terminee' ? 'Terminée' : 'À venir'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-slate-950 font-sans">
                    {formatEuro(res.prixTTC)}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">TTC</span>
                </div>
              </div>

              {/* Trajet: Départ → Arrivée */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase w-12 shrink-0">Départ</span>
                  <span className="truncate font-medium text-slate-900">{res.depart}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 font-semibold text-[10px] uppercase w-12 shrink-0">Arrivée</span>
                  <span className="truncate font-medium text-slate-900">{res.destination}</span>
                </div>
              </div>

              {/* Actions row: Modifier, Dupliquer, Créer/recréer le bon, Marquer comme terminée, Supprimer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onViewBon(res)}
                  className="flex-1 py-2.5 px-3 bg-blue-950 hover:bg-blue-900 active:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                  <span>Voir le bon</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleStatus(res)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                    res.status === 'terminee'
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={res.status === 'terminee' ? 'Marquer comme à venir' : 'Marquer comme terminée'}
                >
                  {res.status === 'terminee' ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Réactiver</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Terminer</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onEditBooking(res)}
                  className="p-2.5 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition"
                  title="Modifier"
                  aria-label="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDuplicateBooking(res)}
                  className="p-2.5 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition"
                  title="Dupliquer"
                  aria-label="Dupliquer"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteBooking(res)}
                  className="p-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl transition"
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
