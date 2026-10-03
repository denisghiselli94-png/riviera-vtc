import React, { useState, useRef } from 'react';
import { CompanyProfile, AppBackupData } from '../types';
import {
  exportBackupData,
  importBackupData,
} from '../utils/storage';
import {
  Building2,
  Car,
  User,
  Shield,
  Save,
  Plus,
  Check,
  Upload,
  Download,
  Trash2,
  FileCheck,
  AlertCircle,
  FileText,
  Copy,
  Info,
} from 'lucide-react';

interface SettingsViewProps {
  profiles: CompanyProfile[];
  activeProfileId: string;
  onSaveProfile: (profile: CompanyProfile) => void;
  onSelectActiveProfile: (id: string) => void;
  onCreateNewProfile: (profile: CompanyProfile) => void;
  onDeleteProfile: (id: string) => void;
  onDataRestored: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profiles,
  activeProfileId,
  onSaveProfile,
  onSelectActiveProfile,
  onCreateNewProfile,
  onDeleteProfile,
  onDataRestored,
}) => {
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Editable Form State for Active Profile
  const [formData, setFormData] = useState<CompanyProfile>({ ...activeProfile });
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // New Profile Modal / Subview
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  // Kbis Import state
  const [kbisFileName, setKbisFileName] = useState<string | null>(null);
  const [kbisFilePreview, setKbisFilePreview] = useState<string | null>(null);
  const [showKbisExtractor, setShowKbisExtractor] = useState(false);
  const [kbisExtracted, setKbisExtracted] = useState<Partial<CompanyProfile>>({});
  const kbisFileInputRef = useRef<HTMLInputElement>(null);

  // Backup restore ref
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  // Sync form when active profile changes
  React.useEffect(() => {
    if (activeProfile) {
      setFormData({ ...activeProfile });
    }
  }, [activeProfileId, profiles]);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveActiveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomCommercial.trim()) {
      alert('Le nom commercial est requis.');
      return;
    }
    if (!formData.siren.trim()) {
      alert('Le numéro SIREN est requis.');
      return;
    }
    onSaveProfile(formData);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Switch Profile
  const handleSelectProfile = (id: string) => {
    onSelectActiveProfile(id);
  };

  // Create new profile flow
  const handleStartCreateProfile = () => {
    const newId = `profile-${Date.now()}`;
    const newProf: CompanyProfile = {
      id: newId,
      nomCommercial: newProfileName.trim() || `Chauffeur ${profiles.length + 1}`,
      raisonSociale: newProfileName.trim() || `Chauffeur ${profiles.length + 1} VTC`,
      formeJuridique: 'SASU',
      siren: '000 000 000',
      siret: '000 000 000 00010',
      codeApe: '4932Z',
      adresse: 'Montpellier, France',
      telephone: '+33 6 00 00 00 00',
      email: 'contact@vtc.fr',
      numeroRevtc: 'EVTC034...',
      numeroMacaron: '0000000',
      conducteurNom: 'DUPONT',
      conducteurPrenom: 'Jean',
      vehiculeMarque: 'Mercedes',
      vehiculeModele: 'Classe E',
      immatriculation: 'AA-123-BB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onCreateNewProfile(newProf);
    setIsCreatingProfile(false);
    setNewProfileName('');
  };

  // KBIS File Upload & Simple Parser
  const handleKbisFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setKbisFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setKbisFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setKbisFilePreview(null);
    }

    // Default extracted pre-fill based on file name or simulated smart pre-fill
    // As per user instructions:
    // "Pour cette première version : permettre simplement l’importation du document et afficher ensuite
    // un formulaire permettant de saisir/corriger les informations entreprise.
    // Prévoir le code de façon à pouvoir ajouter plus tard une extraction automatique par IA.
    // Afficher : 'Vérifiez les informations extraites avant de les enregistrer.'"
    setKbisExtracted({
      nomCommercial: activeProfile.nomCommercial,
      raisonSociale: activeProfile.raisonSociale,
      formeJuridique: activeProfile.formeJuridique,
      siren: activeProfile.siren,
      codeApe: activeProfile.codeApe,
      adresse: activeProfile.adresse,
    });
    setShowKbisExtractor(true);
  };

  const handleApplyKbisToProfile = () => {
    setFormData((prev) => ({
      ...prev,
      ...kbisExtracted,
      updatedAt: new Date().toISOString(),
    }));
    setShowKbisExtractor(false);
    alert('Les informations du Kbis ont été appliquées au formulaire de profil. N’oubliez pas de cliquer sur « Enregistrer ».');
  };

  // Data Export JSON
  const handleExportData = () => {
    const data = exportBackupData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `riviera-vtc-sauvegarde-${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Data Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = importBackupData(parsed as AppBackupData);
        if (result.success) {
          setBackupNotice('Sauvegarde restaurée avec succès !');
          onDataRestored();
        } else {
          alert(result.message);
        }
      } catch {
        alert('Erreur lors de la lecture du fichier JSON de sauvegarde.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (backupFileInputRef.current) backupFileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-28">

      {/* 1. SÉLECTEUR DE PROFIL ENTREPRISE / MULTI-CHAUFFEURS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-900" />
              Profils Entreprise & Chauffeurs
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sélectionnez le profil actif qui sera utilisé sur les nouveaux bons.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingProfile(true)}
            className="py-1.5 px-3 bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-900 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau profil</span>
          </button>
        </div>

        {/* Modal for new profile creation */}
        {isCreatingProfile && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in">
            <label className="text-xs font-bold text-slate-700 block">
              Nom du nouveau profil / Société :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="ex: Chauffeur 2 / VTC Prestige"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-950"
              />
              <button
                type="button"
                onClick={handleStartCreateProfile}
                className="py-2 px-3 bg-blue-950 text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingProfile(false)}
                className="py-2 px-3 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Profiles List */}
        <div className="mt-3 space-y-2">
          {profiles.map((prof) => {
            const isActive = prof.id === activeProfileId;
            return (
              <div
                key={prof.id}
                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                  isActive
                    ? 'border-blue-950 bg-blue-50/60 ring-2 ring-blue-950/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  onClick={() => handleSelectProfile(prof.id)}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {prof.nomCommercial}
                    </span>
                    {isActive && (
                      <span className="text-[10px] bg-blue-950 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {prof.conducteurPrenom} {prof.conducteurNom} · {prof.vehiculeMarque} {prof.vehiculeModele} ({prof.immatriculation})
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    SIREN : {prof.siren} · Macaron : {prof.numeroMacaron}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => handleSelectProfile(prof.id)}
                      className="py-1.5 px-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Activer
                    </button>
                  ) : (
                    <div className="p-1.5 text-blue-900">
                      <Check className="w-5 h-5 stroke-[3px]" />
                    </div>
                  )}

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteProfile(prof.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer ce profil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ÉDITION COMPLÈTE DU PROFIL ENTREPRISE ACTIF */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-900" />
              Détails du profil : {activeProfile.nomCommercial}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tous ces champs sont modifiables et seront utilisés sur les futurs bons de commande.
            </p>
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3px]" />
            Paramètres enregistrés avec succès ! Les futurs bons utiliseront ces informations.
          </div>
        )}

        <form onSubmit={handleSaveActiveProfile} className="space-y-4">
          
          {/* Entreprise info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-950" />
              Société / Transporteur
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Nom commercial <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomCommercial}
                  onChange={(e) => handleChange('nomCommercial', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Raison sociale <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.raisonSociale}
                  onChange={(e) => handleChange('raisonSociale', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Forme juridique
                </label>
                <input
                  type="text"
                  value={formData.formeJuridique}
                  onChange={(e) => handleChange('formeJuridique', e.target.value)}
                  placeholder="ex: SASU, SAS, EURL"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  SIREN <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.siren}
                  onChange={(e) => handleChange('siren', e.target.value)}
                  placeholder="ex: 104 415 914"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Code APE
                </label>
                <input
                  type="text"
                  value={formData.codeApe}
                  onChange={(e) => handleChange('codeApe', e.target.value)}
                  placeholder="4932Z"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  SIRET
                </label>
                <input
                  type="text"
                  value={formData.siret || ''}
                  onChange={(e) => handleChange('siret', e.target.value)}
                  placeholder="ex: 104 415 914 00012"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Adresse du siège
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  placeholder="ex: 10 Place de la Comédie, 34000 Montpellier"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Téléphone contact
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Numéro REVTC / VTC
                </label>
                <input
                  type="text"
                  value={formData.numeroRevtc}
                  onChange={(e) => handleChange('numeroRevtc', e.target.value)}
                  placeholder="EVTC03423..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Numéro macaron VTC <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.numeroMacaron}
                  onChange={(e) => handleChange('numeroMacaron', e.target.value)}
                  placeholder="0572597"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Conducteur info */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-950" />
              Conducteur
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Nom du conducteur <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.conducteurNom}
                  onChange={(e) => handleChange('conducteurNom', e.target.value)}
                  placeholder="LAMZOURI"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Prénom du conducteur <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.conducteurPrenom}
                  onChange={(e) => handleChange('conducteurPrenom', e.target.value)}
                  placeholder="Tajeddine"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Véhicule info */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-950" />
              Véhicule
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  value={formData.vehiculeMarque}
                  onChange={(e) => handleChange('vehiculeMarque', e.target.value)}
                  placeholder="Tesla"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Modèle
                </label>
                <input
                  type="text"
                  value={formData.vehiculeModele}
                  onChange={(e) => handleChange('vehiculeModele', e.target.value)}
                  placeholder="Model 3 Dual Motor"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Immatriculation <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.immatriculation}
                  onChange={(e) => handleChange('immatriculation', e.target.value)}
                  placeholder="FZ-061-XA"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-blue-950 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-blue-950 hover:bg-blue-900 active:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>ENREGISTRER LES MODIFICATIONS</span>
          </button>
        </form>
      </div>

      {/* 3. IMPORT KBIS (Section 7 from requirements) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-blue-900" />
            Importer mon KBIS
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sélectionnez votre extrait Kbis (PDF ou image) pour faciliter le remplissage du profil.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="file"
            ref={kbisFileInputRef}
            onChange={handleKbisFileUpload}
            accept=".pdf,image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => kbisFileInputRef.current?.click()}
            className="w-full py-4 px-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-700 transition"
          >
            <Upload className="w-6 h-6 text-blue-950" />
            <span className="text-xs font-bold text-slate-900">
              {kbisFileName ? `Fichier sélectionné : ${kbisFileName}` : 'Choisir mon fichier KBIS (PDF ou Image)'}
            </span>
            <span className="text-[10px] text-slate-500">
              Traitement 100% sécurisé et local sur votre appareil
            </span>
          </button>

          {/* Document preview if image */}
          {kbisFilePreview && (
            <div className="mt-3 p-2 bg-slate-100 rounded-xl border border-slate-200 text-center">
              <img
                src={kbisFilePreview}
                alt="Aperçu Kbis"
                className="max-h-48 mx-auto rounded-lg object-contain shadow-xs"
              />
            </div>
          )}

          {/* Smart extraction / validation form as requested */}
          {showKbisExtractor && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2 text-xs text-blue-950 font-semibold">
                <Info className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <span>
                  Vérifiez les informations extraites avant de les enregistrer.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Dénomination :</label>
                  <input
                    type="text"
                    value={kbisExtracted.nomCommercial || ''}
                    onChange={(e) => setKbisExtracted({ ...kbisExtracted, nomCommercial: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">SIREN :</label>
                  <input
                    type="text"
                    value={kbisExtracted.siren || ''}
                    onChange={(e) => setKbisExtracted({ ...kbisExtracted, siren: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Forme juridique :</label>
                  <input
                    type="text"
                    value={kbisExtracted.formeJuridique || ''}
                    onChange={(e) => setKbisExtracted({ ...kbisExtracted, formeJuridique: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Code APE :</label>
                  <input
                    type="text"
                    value={kbisExtracted.codeApe || ''}
                    onChange={(e) => setKbisExtracted({ ...kbisExtracted, codeApe: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyKbisToProfile}
                className="w-full py-2.5 px-3 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition"
              >
                Appliquer ces informations au profil entreprise
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. SAUVEGARDE & RESTAURATION (Section 8 from requirements) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-blue-900" />
            Sauvegarde & Données
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Stockage 100% local sur votre téléphone dans Safari. Exportez régulièrement vos données.
          </p>
        </div>

        {backupNotice && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {backupNotice}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <button
            type="button"
            onClick={handleExportData}
            className="py-3 px-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>EXPORTER MES DONNÉES</span>
          </button>

          {/* Import */}
          <input
            type="file"
            ref={backupFileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => backupFileInputRef.current?.click()}
            className="py-3 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-blue-950" />
            <span>IMPORTER UNE SAUVEGARDE</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 text-center">
          Le fichier de sauvegarde contient l’intégralité de vos réservations, profils entreprise et réglages.
        </p>
      </div>

    </div>
  );
};
