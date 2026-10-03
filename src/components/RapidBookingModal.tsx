import React, { useState, useEffect } from 'react';
import { Reservation, CompanyProfile } from '../types';
import { getTodayString, getDefaultTime } from '../utils/format';
import { getCurrentLocation } from '../utils/geo';
import {
  Zap,
  X,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface RapidBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Reservation, 'id' | 'bonNumber' | 'createdAt' | 'updatedAt' | 'companySnapshot'>) => void;
  activeProfile: CompanyProfile;
}

export const RapidBookingModal: React.FC<RapidBookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activeProfile,
}) => {
  const [clientNom, setClientNom] = useState('');
  const [destination, setDestination] = useState('');
  const [prixTTC, setPrixTTC] = useState('45');
  const [depart, setDepart] = useState('Détection GPS en cours...');
  const [isLocating, setIsLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Quick preset shortcuts
  const quickDestinations = [
    'Aéroport Montpellier',
    'Gare Saint-Roch',
    'Gare Sud de France',
    'La Grande-Motte',
  ];

  useEffect(() => {
    if (isOpen) {
      setClientNom('');
      setDestination('');
      setPrixTTC('45');
      setDepart('Position GPS en cours...');
      setGeoNotice(null);

      // Auto start GPS immediately
      setIsLocating(true);
      getCurrentLocation()
        .then((geo) => {
          setDepart(geo.address);
          setGeoNotice(geo.isCoordinatesOnly ? 'Coordonnées GPS détectées' : 'Adresse détectée avec précision');
        })
        .catch((err) => {
          setDepart('Ma position actuelle (GPS)');
          setGeoNotice(err.message || 'Position approximative');
        })
        .finally(() => {
          setIsLocating(false);
        });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientNom.trim()) {
      alert('Veuillez indiquer le nom du client.');
      return;
    }
    if (!destination.trim()) {
      alert('Veuillez indiquer l’adresse de destination.');
      return;
    }
    const numPrice = parseFloat(prixTTC.replace(',', '.'));
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Veuillez saisir un prix valide.');
      return;
    }

    onSave({
      clientNom: clientNom.trim(),
      datePrestation: getTodayString(),
      heurePriseEnCharge: getDefaultTime(15),
      depart: depart || 'Ma position actuelle',
      destination: destination.trim(),
      prixTTC: numPrice,
      status: 'a_venir',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 border border-amber-300">
        
        {/* Flash Header */}
        <div className="bg-amber-500 text-slate-950 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-950 text-amber-400 rounded-lg">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">
                Course Rapide (moins de 20s)
              </h2>
              <p className="text-[11px] font-bold text-slate-900 opacity-90">
                Aujourd’hui à {getDefaultTime(15)} · Départ auto GPS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amber-600 text-slate-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS status banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-1.5 truncate">
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
            ) : (
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            )}
            <span className="font-semibold truncate">Départ :</span>
            <span className="truncate text-slate-800">{depart}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Client */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              1. Nom du client <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={clientNom}
              onChange={(e) => setClientNom(e.target.value)}
              placeholder="ex: Patrick Rossi"
              className="w-full px-3.5 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden transition"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              2. Destination <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="ex: Aéroport Montpellier Méditerranée"
              className="w-full px-3.5 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden transition"
            />
            {/* Quick shortcuts */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickDestinations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDestination(d)}
                  className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 active:bg-amber-100 text-slate-800 py-1 px-2.5 rounded-lg transition"
                >
                  + {d}
                </button>
              ))}
            </div>
          </div>

          {/* Prix TTC */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              3. Prix TTC (€) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-extrabold text-base">
                €
              </div>
              <input
                type="text"
                inputMode="decimal"
                required
                value={prixTTC}
                onChange={(e) => setPrixTTC(e.target.value)}
                className="w-full pl-9 pr-3.5 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xl font-black text-slate-950 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Big Action Button */}
          <button
            type="submit"
            className="w-full py-4 px-4 bg-slate-950 hover:bg-blue-950 active:bg-slate-900 text-white rounded-2xl font-black text-base tracking-wider uppercase shadow-xl transition flex items-center justify-center gap-2 mt-2"
          >
            <span>CRÉER LE BON IMMÉDIATEMENT</span>
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </button>
        </form>

      </div>
    </div>
  );
};
