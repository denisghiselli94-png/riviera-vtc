import React from 'react';
import { Reservation, CompanyProfile, AppTab } from '../types';
import { formatEuro, getTodayString } from '../utils/format';
import {
  Plus,
  Calendar,
  Settings as SettingsIcon,
  Zap,
  Clock,
  ArrowRight,
  FileText,
  Copy,
  Trash2,
  Edit3,
  CheckCircle,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  reservations: Reservation[];
  activeProfile: CompanyProfile;
  onNavigate: (tab: AppTab) => void;
  onOpenNewBooking: () => void;
  onOpenRapidBooking: () => void;
  onViewBon: (res: Reservation) => void;
  onEditBooking: (res: Reservation) => void;
  onDuplicateBooking: (res: Reservation) => void;
  onDeleteBooking: (res: Reservation) => void;
  onToggleStatus: (res: Reservation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reservations,
  activeProfile,
  onNavigate,
  onOpenNewBooking,
  onOpenRapidBooking,
  onViewBon,
  onEditBooking,
  onDuplicateBooking,
  onDeleteBooking,
  onToggleStatus,
}) => {
  const today = getTodayString();

  // Today's statistics
  const todayReservations = reservations.filter((r) => r.datePrestation === today);
  const todayActive = todayReservations.filter((r) => r.status !== 'annulee');
  const countToday = todayActive.length;
  const caPrevuToday = todayActive.reduce((sum, r) => sum + (r.prixTTC || 0), 0);

  // Next course (closest upcoming course today or future)
  const upcomingCourses = reservations
    .filter((r) => r.status === 'a_venir' && r.datePrestation >= today)
    .sort((a, b) => {
      if (a.datePrestation !== b.datePrestation) {
        return a.datePrestation.localeCompare(b.datePrestation);
      }
      return a.heurePriseEnCharge.localeCompare(b.heurePriseEnCharge);
    });

  const nextCourse = upcomingCourses[0];

  // Up to 5 upcoming reservations to display on the dashboard
  const displayUpcoming = upcomingCourses.slice(0, 6);

  return (
    <div className="space-y-5 pb-24">
      {/* 3 GROS BOUTONS (Mandatory specification) */}
      <div className="space-y-2.5">
        {/* Button 1: + NOUVELLE RÉSERVATION */}
        <button
          type="button"
          onClick={onOpenNewBooking}
          className="w-full py-4 px-5 bg-blue-950 hover:bg-blue-900 active:bg-slate-900 text-white rounded-2xl font-black text-base sm:text-lg tracking-wide shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Plus className="w-6 h-6 stroke-[3px]" />
            </div>
            <span className="text-left leading-tight">NOUVELLE RÉSERVATION</span>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition" />
        </button>

        {/* ⚡ COURSE RAPIDE (Prominent one-touch 20s feature) */}
        <button
          type="button"
          onClick={onOpenRapidBooking}
          className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 active:from-amber-700 text-slate-950 rounded-2xl font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-md transition flex items-center justify-between border border-amber-300"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-950 text-amber-400 rounded-lg">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <span>⚡ COURSE RAPIDE (GPS AUTO &lt; 20S)</span>
          </div>
          <span className="text-xs bg-slate-950 text-amber-400 font-bold px-2 py-0.5 rounded-full">
            Flash
          </span>
        </button>

        {/* Buttons 2 & 3: RÉSERVATIONS & PARAMÈTRES */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('reservations')}
            className="py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm tracking-tight border-2 border-slate-200 shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-950" />
              <span>RÉSERVATIONS</span>
            </div>
            {reservations.length > 0 && (
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {reservations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm tracking-tight border-2 border-slate-200 shadow-xs transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-950" />
              <span>PARAMÈTRES</span>
            </div>
            <span className="text-xs text-slate-400">Profil</span>
          </button>
        </div>
      </div>

      {/* SECTION "AUJOURD’HUI" (Metrics) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Aujourd'hui
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {today.split('-').reverse().join('/')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-100">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">Nombre de courses</p>
            <p className="text-2xl font-black text-slate-950 mt-0.5">
              {countToday} <span className="text-xs font-semibold text-slate-400">course{countToday > 1 ? 's' : ''}</span>
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">Chiffre d’affaires prévu</p>
            <p className="text-2xl font-black text-blue-950 mt-0.5">
              {formatEuro(caPrevuToday)}
            </p>
          </div>
        </div>

        {/* Prochaine course */}
        <div className="pt-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight mb-1">
            Prochaine course
          </p>
          {nextCourse ? (
            <div
              onClick={() => onViewBon(nextCourse)}
              className="bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-xl p-3 cursor-pointer transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-950 text-white font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg shrink-0">
                  {nextCourse.heurePriseEnCharge}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-900 truncate">{nextCourse.clientNom}</p>
                  <p className="text-xs text-slate-600 truncate">
                    {nextCourse.depart} → {nextCourse.destination}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-blue-950 font-mono">
                  {formatEuro(nextCourse.prixTTC)}
                </span>
                <span className="block text-[10px] text-blue-900 font-bold underline mt-0.5">
                  Voir le bon
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-1">
              Aucune course à venir pour l'instant.
            </p>
          )}
        </div>
      </div>

      {/* SECTION "PROCHAINES RÉSERVATIONS" (Cards with required actions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Prochaines réservations ({displayUpcoming.length})
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('reservations')}
            className="text-xs font-bold text-blue-950 hover:underline"
          >
            Tout voir →
          </button>
        </div>

        {displayUpcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">Aucune réservation programmée</p>
            <p className="text-xs text-slate-500 mt-1">Créez votre première réservation pour générer le bon de commande.</p>
            <button
              type="button"
              onClick={onOpenNewBooking}
              className="mt-4 px-4 py-2 bg-blue-950 text-white rounded-xl text-xs font-bold"
            >
              + Nouvelle réservation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayUpcoming.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition space-y-3"
              >
                {/* Header: Heure, Client, Prix */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-blue-950 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                      {res.heurePriseEnCharge}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-tight">
                        {res.clientNom}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {res.bonNumber} · {res.datePrestation.split('-').reverse().join('/')}
                      </p>
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
                <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-900 shrink-0" />
                  <span className="truncate font-medium">
                    {res.depart} <span className="text-slate-400 mx-1">→</span> {res.destination}
                  </span>
                </div>

                {/* Required Actions: Modifier, Dupliquer, Créer le bon de commande, Supprimer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => onViewBon(res)}
                    className="flex-1 py-2.5 px-3 bg-blue-950 hover:bg-blue-900 active:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-300" />
                    <span>Bon de commande</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
