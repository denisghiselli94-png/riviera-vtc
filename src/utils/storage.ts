import { CompanyProfile, Reservation, AppBackupData } from '../types';
import { generateBonNumber, getTodayString } from './format';

const STORAGE_KEYS = {
  PROFILES: 'riviera_vtc_profiles_v2',
  ACTIVE_PROFILE_ID: 'riviera_vtc_active_profile_id_v2',
  RESERVATIONS: 'riviera_vtc_reservations_v2',
};

export const DEFAULT_RIVIERA_PROFILE: CompanyProfile = {
  id: 'riviera-default-01',
  nomCommercial: 'RIVIERA VTC',
  raisonSociale: 'RIVIERA VTC',
  formeJuridique: 'SASU',
  siren: '104 415 914',
  siret: '104 415 914 00012',
  codeApe: '4932Z',
  adresse: '10 Place de la Comédie, 34000 Montpellier',
  telephone: '+33 6 12 34 56 78',
  email: 'contact@rivieravtc.fr',
  numeroRevtc: 'EVTC034230001',
  numeroMacaron: '0572597',
  conducteurNom: 'LAMZOURI',
  conducteurPrenom: 'Tajeddine',
  vehiculeMarque: 'Tesla',
  vehiculeModele: 'Model 3 Dual Motor',
  immatriculation: 'FZ-061-XA',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const SAMPLE_CHAUFFEUR_2: CompanyProfile = {
  id: 'chauffeur-2-profile',
  nomCommercial: 'AZUR PRESTIGE VTC',
  raisonSociale: 'AZUR PRESTIGE SAS',
  formeJuridique: 'SAS',
  siren: '908 123 456',
  siret: '908 123 456 00018',
  codeApe: '4932Z',
  adresse: '15 Boulevard Victor Hugo, 34000 Montpellier',
  telephone: '+33 6 98 76 54 32',
  email: 'contact@azurprestigevtc.fr',
  numeroRevtc: 'EVTC034240002',
  numeroMacaron: '0681423',
  conducteurNom: 'BERNARD',
  conducteurPrenom: 'Alexandre',
  vehiculeMarque: 'Mercedes-Benz',
  vehiculeModele: 'Classe E Berline',
  immatriculation: 'GH-420-KL',
  isDefault: false,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

export function loadProfiles(): CompanyProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      const initial = [DEFAULT_RIVIERA_PROFILE, SAMPLE_CHAUFFEUR_2];
      saveProfiles(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_RIVIERA_PROFILE];
  } catch (err) {
    console.error('Error loading profiles from localStorage', err);
    return [DEFAULT_RIVIERA_PROFILE];
  }
}

export function saveProfiles(profiles: CompanyProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.error('Error saving profiles', err);
  }
}

export function loadActiveProfileId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    if (id) return id;
    return DEFAULT_RIVIERA_PROFILE.id;
  } catch {
    return DEFAULT_RIVIERA_PROFILE.id;
  }
}

export function saveActiveProfileId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
  } catch (err) {
    console.error('Error saving active profile ID', err);
  }
}

export function getActiveProfile(): CompanyProfile {
  const profiles = loadProfiles();
  const activeId = loadActiveProfileId();
  const found = profiles.find((p) => p.id === activeId);
  return found || profiles[0] || DEFAULT_RIVIERA_PROFILE;
}

export function loadReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    if (!raw) {
      const today = getTodayString();
      const initialReservations: Reservation[] = [
        {
          id: 'res-demo-01',
          bonNumber: `RV-${today.replace(/-/g, '')}-0001`,
          clientNom: 'Jean Dupont',
          clientTelephone: '+33 6 42 11 22 33',
          datePrestation: today,
          heurePriseEnCharge: '14:30',
          depart: 'Centre-ville, Montpellier',
          destination: 'Aéroport Montpellier Méditerranée',
          prixTTC: 45,
          notes: 'Client régulier, vol AF 7540',
          status: 'a_venir',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          companySnapshot: DEFAULT_RIVIERA_PROFILE,
        },
        {
          id: 'res-demo-02',
          bonNumber: `RV-${today.replace(/-/g, '')}-0002`,
          clientNom: 'Sophie Martin',
          clientTelephone: '+33 6 88 99 00 11',
          datePrestation: today,
          heurePriseEnCharge: '17:15',
          depart: 'Gare Saint-Roch, Montpellier',
          destination: 'Port de Plaisance, La Grande-Motte',
          prixTTC: 65,
          notes: '2 valises cabine',
          status: 'a_venir',
          createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
          companySnapshot: DEFAULT_RIVIERA_PROFILE,
        },
      ];
      saveReservations(initialReservations);
      return initialReservations;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading reservations', err);
    return [];
  }
}

export function saveReservations(reservations: Reservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  } catch (err) {
    console.error('Error saving reservations', err);
  }
}

export function createNewReservation(
  data: Omit<Reservation, 'id' | 'bonNumber' | 'createdAt' | 'updatedAt' | 'companySnapshot'>,
  activeProfile: CompanyProfile
): Reservation {
  const currentReservations = loadReservations();
  const datePrestation = data.datePrestation || getTodayString();
  const sameDayCount = currentReservations.filter((r) => r.datePrestation === datePrestation).length;

  const newBonNumber = generateBonNumber(datePrestation, sameDayCount);
  const now = new Date().toISOString();

  const newReservation: Reservation = {
    ...data,
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bonNumber: newBonNumber,
    createdAt: now,
    updatedAt: now,
    // Immutable snapshot of company info used at creation
    companySnapshot: { ...activeProfile },
  };

  const updated = [newReservation, ...currentReservations];
  saveReservations(updated);
  return newReservation;
}

export function updateReservation(
  id: string,
  updates: Partial<Omit<Reservation, 'id' | 'createdAt' | 'companySnapshot'>>
): Reservation | null {
  const current = loadReservations();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedItem: Reservation = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedItem;
  saveReservations(current);
  return updatedItem;
}

export function duplicateReservation(id: string, activeProfile: CompanyProfile): Reservation | null {
  const current = loadReservations();
  const source = current.find((r) => r.id === id);
  if (!source) return null;

  const today = getTodayString();
  const sameDayCount = current.filter((r) => r.datePrestation === today).length;
  const newBonNumber = generateBonNumber(today, sameDayCount);
  const now = new Date().toISOString();

  const duplicated: Reservation = {
    ...source,
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bonNumber: newBonNumber,
    datePrestation: today,
    status: 'a_venir',
    createdAt: now,
    updatedAt: now,
    companySnapshot: { ...activeProfile },
  };

  const updated = [duplicated, ...current];
  saveReservations(updated);
  return duplicated;
}

export function deleteReservation(id: string): boolean {
  const current = loadReservations();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveReservations(filtered);
  return true;
}

export function exportBackupData(): AppBackupData {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    profiles: loadProfiles(),
    activeProfileId: loadActiveProfileId(),
    reservations: loadReservations(),
  };
}

export function importBackupData(backup: AppBackupData): { success: boolean; message: string } {
  if (!backup || !Array.isArray(backup.profiles) || !Array.isArray(backup.reservations)) {
    return { success: false, message: 'Fichier de sauvegarde non valide ou corrompu.' };
  }

  saveProfiles(backup.profiles);
  if (backup.activeProfileId) {
    saveActiveProfileId(backup.activeProfileId);
  }
  saveReservations(backup.reservations);

  return { success: true, message: 'Sauvegarde restaurée avec succès !' };
}
