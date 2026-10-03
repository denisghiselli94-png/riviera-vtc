import React, { useState, useEffect } from 'react';
import { Reservation, CompanyProfile } from '../types';
import { getTodayString, getDefaultTime } from '../utils/format';
import { getCurrentLocation } from '../utils/geo';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Euro,
  User,
  Phone,
  FileText,
  Navigation as NavigationIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Reservation, 'id' | 'bonNumber' | 'createdAt' | 'updatedAt' | 'companySnapshot'>) => void;
  activeProfile: CompanyProfile;
  initialData?: Reservation | null;
  startInGpsMode?: boolean;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activeProfile,
  initialData,
  startInGpsMode = false,
}) => {
  const [mode, setMode] = useState<'manuel' | 'gps'>('manuel');
  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('');
  const [datePrestation, setDatePrestation] = useState(getTodayString());
  const [heurePriseEnCharge, setHeurePriseEnCharge] = useState(getDefaultTime(15));
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');
  const [prixTTC, setPrixTTC] = useState<string>('45');
  const [notes, setNotes] = useState('');

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Quick preset shortcuts for destinations in Montpellier / Occitanie or custom
  const quickDestinations = [
    'Aéroport Montpellier Méditerranée',
    'Gare Saint-Roch Montpellier',
    'Gare Montpellier Sud de France',
    'La Grande-Motte',
    'Palavas-les-Flots',
    'Place de la Comédie',
  ];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        setMode('manuel');
        setClientNom(initialData.clientNom || '');
        setClientTelephone(initialData.clientTelephone || '');
        setDatePrestation(initialData.datePrestation || getTodayString());
        setHeurePriseEnCharge(initialData.heurePriseEnCharge || getDefaultTime(15));
        setDepart(initialData.depart || '');
        setDestination(initialData.destination || '');
        setPrixTTC(String(initialData.prixTTC || '45'));
        setNotes(initialData.notes || '');
        setGeoNotice(null);
        setLocationSuccess(false);
      } else {
        // Create new
        setClientNom('');
        setClientTelephone('');
        setDatePrestation(getTodayString());
        setHeurePriseEnCharge(getDefaultTime(15));
        setDestination('');
        setPrixTTC('45');
        setNotes('');
        setGeoNotice(null);
        setLocationSuccess(false);

        if (startInGpsMode) {
          setMode('gps');
          triggerGeolocation();
        } else {
          setMode('manuel');
          setDepart('');
        }
      }
    }
  }, [isOpen, initialData, startInGpsMode]);

  const triggerGeolocation = async () => {
    setIsLocating(true);
    setGeoNotice('Localisation GPS en cours...');
    setLocationSuccess(false);

    try {
      const geo = await getCurrentLocation();
      setDepart(geo.address);
      setLocationSuccess(true);
      if (geo.isCoordinatesOnly) {
        setGeoNotice('Position GPS détectée. Vous pouvez affiner l’adresse manuellement.');
      } else {
        setGeoNotice('Adresse détectée via GPS avec succès.');
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Échec de la géolocalisation';
      setGeoNotice(`${msg} — Vous pouvez saisir l'adresse manuellement.`);
      setDepart('Position actuelle (Vérifier adresse)');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSwitchToGps = () => {
    setMode('gps');
    triggerGeolocation();
  };

  const handleSwitchToManuel = () => {
    setMode('manuel');
    if (depart.includes('Position')) {
      setDepart('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientNom.trim()) {
      alert('Veuillez indiquer le nom du client.');
      return;
    }
    if (!depart.trim()) {
      alert('Veuillez indiquer l’adresse de départ.');
      return;
    }
    if (!destination.trim()) {
      alert('Veuillez indiquer l’adresse de destination.');
      return;
    }

    const numericPrice = parseFloat(prixTTC.replace(',', '.'));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Veuillez saisir un prix valide en euros.');
      return;
    }

    onSave({
      clientNom: clientNom.trim(),
      clientTelephone: clientTelephone.trim() || undefined,
      datePrestation: datePrestation || getTodayString(),
      heurePriseEnCharge: heurePriseEnCharge || getDefaultTime(15),
      depart: depart.trim(),
      destination: destination.trim(),
      prixTTC: numericPrice,
      notes: notes.trim() || undefined,
      status: initialData ? initialData.status : 'a_venir',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {initialData ? 'Modifier la réservation' : 'Nouvelle réservation'}
            </h2>
            <p className="text-[11px] text-slate-300">
              Profil actif : {activeProfile.nomCommercial} ({activeProfile.conducteurPrenom} {activeProfile.conducteurNom})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector (2 prominent buttons as required) */}
        {!initialData && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Choisir le mode de saisie :
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSwitchToManuel}
                className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition border-2 ${
                  mode === 'manuel'
                    ? 'border-blue-950 bg-white text-blue-950 shadow-xs ring-2 ring-blue-950/10'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-950" />
                  <span>MODE 1</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500">SAISIE MANUELLE</span>
              </button>

              <button
                type="button"
                onClick={handleSwitchToGps}
                className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition border-2 ${
                  mode === 'gps'
                    ? 'border-blue-950 bg-white text-blue-950 shadow-xs ring-2 ring-blue-950/10'
                    : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  ) : (
                    <NavigationIcon className="w-4 h-4 text-blue-950" />
                  )}
                  <span>MODE 2</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500">MA POSITION ACTUELLE</span>
              </button>
            </div>

            {/* GPS Feedback banner if in Mode 2 */}
            {mode === 'gps' && geoNotice && (
              <div className="mt-2.5 px-3 py-2 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 truncate">
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-900 animate-spin shrink-0" />
                  ) : locationSuccess ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span className="truncate text-[11px] font-medium">{geoNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={triggerGeolocation}
                  disabled={isLocating}
                  className="shrink-0 text-[10px] font-bold text-blue-900 underline hover:text-blue-950"
                >
                  Actualiser GPS
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          
          {/* Client Nom & Téléphone */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nom / Prénom du client <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  autoFocus
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Téléphone client <span className="text-slate-400 font-normal lowercase">(optionnel)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  value={clientTelephone}
                  onChange={(e) => setClientTelephone(e.target.value)}
                  placeholder="ex: 06 12 34 56 78"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Date & Heure (Native phone pickers) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Date de la course <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  value={datePrestation}
                  onChange={(e) => setDatePrestation(e.target.value)}
                  className="w-full pl-9 pr-2 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Heure prise en charge <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="time"
                  required
                  value={heurePriseEnCharge}
                  onChange={(e) => setHeurePriseEnCharge(e.target.value)}
                  className="w-full pl-9 pr-2 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
                />
              </div>
            </div>
          </div>

          {/* Adresses Départ & Arrivée */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Adresse de départ <span className="text-red-600">*</span>
                </label>
                {mode === 'gps' && (
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    Position actuelle
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={depart}
                  onChange={(e) => setDepart(e.target.value)}
                  placeholder={mode === 'gps' ? 'Localisation en cours...' : 'ex: 10 Place de la Comédie, Montpellier'}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Adresse d’arrivée <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="ex: Aéroport Montpellier Méditerranée"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
                />
              </div>

              {/* Fast shortcuts for quick destination fill */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickDestinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setDestination(dest)}
                    className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-slate-700 py-1 px-2.5 rounded-lg transition"
                  >
                    + {dest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prix TTC (€) & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Prix TTC (€) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                  €
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={prixTTC}
                  onChange={(e) => setPrixTTC(e.target.value)}
                  placeholder="ex: 45"
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Notes <span className="text-slate-400 font-normal lowercase">(optionnel)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Vol AF7540, 2 bagages"
                className="w-full px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-950 focus:ring-2 focus:ring-blue-950/20 focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Form Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-4 bg-blue-950 hover:bg-blue-900 active:bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{initialData ? 'ENREGISTRER LES MODIFICATIONS' : 'ENREGISTRER ET CRÉER LE BON'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
