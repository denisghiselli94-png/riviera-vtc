import React, { useState } from 'react';
import { Reservation } from '../types';
import {
  formatEuro,
  formatFrenchDateShort,
  formatFrenchDateTime,
} from '../utils/format';
import {
  ArrowLeft,
  Printer,
  Share2,
  Edit3,
  CheckCircle2,
  Copy,
  FileText,
  Car,
  Shield,
  MapPin,
  Clock,
  User,
  Check,
} from 'lucide-react';

interface BonDeCommandeViewProps {
  reservation: Reservation;
  onBack: () => void;
  onEdit: (reservation: Reservation) => void;
}

export const BonDeCommandeView: React.FC<BonDeCommandeViewProps> = ({
  reservation,
  onBack,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const company = reservation.companySnapshot;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const textContent = `BON DE COMMANDE VTC N° ${reservation.bonNumber}
${company.nomCommercial || 'RIVIERA VTC'}
Prestation sur réservation préalable

Client : ${reservation.clientNom}
${reservation.clientTelephone ? `Tél : ${reservation.clientTelephone}\n` : ''}Date : ${formatFrenchDateShort(reservation.datePrestation)}
Heure : ${reservation.heurePriseEnCharge}
Prise en charge : ${reservation.depart}
Destination : ${reservation.destination}
Prix convenu : ${formatEuro(reservation.prixTTC)} TTC

Chauffeur : ${company.conducteurPrenom} ${company.conducteurNom}
Véhicule : ${company.vehiculeMarque} ${company.vehiculeModele} (${company.immatriculation})
SIREN : ${company.siren} | Macaron : ${company.numeroMacaron}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bon de commande VTC - ${reservation.bonNumber}`,
          text: textContent,
        });
      } catch (err: unknown) {
        // Ignored if cancelled
        if ((err as Error)?.name !== 'AbortError') {
          copyToClipboard(textContent);
        }
      }
    } else {
      copyToClipboard(textContent);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onEdit(reservation)}
              className="flex items-center gap-1 text-xs font-semibold py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Modifier la course"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Modifier</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-semibold py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Partager le bon"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copié !' : 'Partager'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copy feedback toast on mobile */}
      {copied && (
        <div className="no-print fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Texte du bon copié dans le presse-papier !
        </div>
      )}

      {/* Main Printable Document Container */}
      <div className="max-w-2xl mx-auto p-3 sm:p-6">
        <div className="bon-print-container bg-white rounded-2xl shadow-xl p-5 sm:p-8 text-slate-900 border border-slate-200">
          
          {/* Legal Compliance Banner */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 font-sans">
                  {company.nomCommercial || 'RIVIERA VTC'}
                </h1>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-widest mt-0.5">
                  {company.formeJuridique} · SIREN : {company.siren}
                </p>
                <div className="text-[11px] text-slate-600 mt-1">
                  {company.adresse && <span>{company.adresse} · </span>}
                  {company.telephone && <span>Tél : {company.telephone}</span>}
                </div>
              </div>

              <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                <div className="inline-block bg-blue-950 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wider uppercase mb-1">
                  Bon de Commande VTC
                </div>
                <div className="text-sm font-black font-mono tracking-tight text-slate-900">
                  N° {reservation.bonNumber}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Arrêté du 28 janvier 2015 · Code des Transports
                </div>
              </div>
            </div>

            {/* Crucial Legal Prior Booking Requirement Notice */}
            <div className="mt-4 bg-blue-50/70 border border-blue-200/80 rounded-lg p-2.5 text-xs text-blue-950 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
              <span>
                <strong>Réservation préalable obligatoire :</strong> Le présent bon justifie que la prestation de transport a fait l’objet d’une commande préalable avant la prise en charge.
              </span>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 px-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs mb-5">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date de commande / émission</span>
              <span className="font-bold text-slate-900">{formatFrenchDateTime(reservation.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date de prestation</span>
              <span className="font-bold text-slate-900">{formatFrenchDateShort(reservation.datePrestation)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Heure de prise en charge</span>
              <span className="font-bold text-slate-900">{reservation.heurePriseEnCharge}</span>
            </div>
          </div>

          {/* Client & Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Client Card */}
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <User className="w-4 h-4 text-blue-900" />
                <span>Client Donneur d'Ordre</span>
              </div>
              <p className="text-base font-bold text-slate-900">{reservation.clientNom}</p>
              {reservation.clientTelephone ? (
                <p className="text-xs text-slate-600 mt-1 font-mono">Tél : {reservation.clientTelephone}</p>
              ) : (
                <p className="text-xs text-slate-400 mt-1 italic">Téléphone non renseigné</p>
              )}
            </div>

            {/* Price Card */}
            <div className="border-2 border-blue-950 bg-blue-950/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-950">
                Prix Convenu de la Prestation
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-black text-blue-950 font-sans tracking-tight">
                  {formatEuro(reservation.prixTTC)} <span className="text-sm font-semibold text-slate-700">TTC</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tarif forfaitaire net convenu avant le début de la prise en charge.
                </p>
              </div>
            </div>
          </div>

          {/* Trajet Details */}
          <div className="border border-slate-200 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <MapPin className="w-4 h-4 text-blue-900" />
              <span>Itinéraire & Prise en charge</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-100" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Lieu de prise en charge (Départ)</span>
                  <p className="text-sm font-semibold text-slate-900">{reservation.depart}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 ring-4 ring-red-100" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Lieu de dépose (Destination)</span>
                  <p className="text-sm font-semibold text-slate-900">{reservation.destination}</p>
                </div>
              </div>

              {reservation.notes && (
                <div className="pt-2 border-t border-slate-100 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Notes & instructions</span>
                  <p className="text-xs text-slate-700 italic">{reservation.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Transporteur & Chauffeur / Véhicule Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Transporteur Info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Shield className="w-3.5 h-3.5 text-blue-900" />
                <span>Informations Transporteur</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <p><strong className="text-slate-900">{company.nomCommercial || 'RIVIERA VTC'}</strong> ({company.formeJuridique})</p>
                <p><span className="text-slate-500">SIREN :</span> <span className="font-mono">{company.siren}</span></p>
                {company.siret && <p><span className="text-slate-500">SIRET :</span> <span className="font-mono">{company.siret}</span></p>}
                <p><span className="text-slate-500">Activité :</span> Voiture de transport avec chauffeur</p>
                <p><span className="text-slate-500">Code APE :</span> {company.codeApe || '4932Z'}</p>
                <p><span className="text-slate-500">N° Macaron VTC :</span> <strong className="text-slate-900 font-mono">{company.numeroMacaron}</strong></p>
                {company.numeroRevtc && <p><span className="text-slate-500">N° REVTC :</span> <span className="font-mono">{company.numeroRevtc}</span></p>}
              </div>
            </div>

            {/* Conducteur & Véhicule */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Car className="w-3.5 h-3.5 text-blue-900" />
                <span>Conducteur & Véhicule</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <p><span className="text-slate-500">Conducteur :</span> <strong className="text-slate-900">{company.conducteurPrenom} {company.conducteurNom}</strong></p>
                <p><span className="text-slate-500">Véhicule :</span> {company.vehiculeMarque} {company.vehiculeModele}</p>
                <p>
                  <span className="text-slate-500">Immatriculation :</span>{' '}
                  <span className="inline-block font-mono font-bold bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-900">
                    {company.immatriculation}
                  </span>
                </p>
                <p><span className="text-slate-500">Statut :</span> Conforme réglementation VTC France</p>
              </div>
            </div>
          </div>

          {/* Mandatory Footer Mentions */}
          <div className="border-t border-slate-200 pt-4 text-center space-y-1.5">
            <p className="text-xs font-semibold text-slate-800">
              « Prestation de transport effectuée sur réservation préalable. »
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Document officiel tenant lieu de justificatif de réservation préalable (Articles L. 3122-1 et R. 3122-1 du Code des Transports). Ce document doit pouvoir être présenté sous forme papier ou électronique à toute réquisition des agents de contrôle.
            </p>
            <p className="text-[10px] text-slate-400 font-mono pt-1">
              Émis le {formatFrenchDateTime(reservation.createdAt)} · Réf. {reservation.bonNumber}
            </p>
          </div>

        </div>

        {/* Quick action buttons below document on mobile */}
        <div className="no-print mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-3 rounded-xl bg-blue-950 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-900 active:bg-slate-900 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="py-3 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 active:bg-slate-100 transition"
          >
            <Share2 className="w-4 h-4 text-blue-900" />
            <span>Partager</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(reservation)}
            className="py-3 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 active:bg-slate-100 transition"
          >
            <Edit3 className="w-4 h-4 text-slate-700" />
            <span>Modifier</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="py-3 px-3 rounded-xl bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-300 active:bg-slate-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
        </div>

      </div>
    </div>
  );
};
