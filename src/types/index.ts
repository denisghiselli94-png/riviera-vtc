export interface CompanyProfile {
  id: string;
  nomCommercial: string; // e.g. RIVIERA VTC
  raisonSociale: string; // e.g. RIVIERA VTC
  formeJuridique: string; // e.g. SASU
  siren: string; // e.g. 104 415 914
  siret?: string; // e.g. 104 415 914 00012
  codeApe: string; // e.g. 4932Z
  adresse: string; // e.g. 10 Place de la Comédie, 34000 Montpellier
  telephone: string; // e.g. +33 6 00 00 00 00
  email: string; // e.g. contact@rivieravtc.fr
  numeroRevtc: string; // e.g. EVTC034230001
  numeroMacaron: string; // e.g. 0572597
  conducteurNom: string; // e.g. LAMZOURI
  conducteurPrenom: string; // e.g. Tajeddine
  vehiculeMarque: string; // e.g. Tesla
  vehiculeModele: string; // e.g. Model 3 Dual Motor
  immatriculation: string; // e.g. FZ-061-XA
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'a_venir' | 'terminee' | 'annulee';

export interface Reservation {
  id: string;
  bonNumber: string; // RV-YYYYMMDD-XXXX
  clientNom: string; // e.g. Jean Dupont
  clientTelephone?: string;
  datePrestation: string; // YYYY-MM-DD
  heurePriseEnCharge: string; // HH:mm
  depart: string; // Adresse de départ
  destination: string; // Adresse d'arrivée
  prixTTC: number; // e.g. 45
  notes?: string;
  status: ReservationStatus;
  createdAt: string; // ISO date-time of booking creation (réservation préalable)
  updatedAt: string;
  // Snapshot of company profile at creation time (so changes to settings don't alter past vouchers)
  companySnapshot: CompanyProfile;
}

export type AppTab = 'dashboard' | 'reservations' | 'settings' | 'new-booking';

export interface AppBackupData {
  version: number;
  exportedAt: string;
  profiles: CompanyProfile[];
  activeProfileId: string;
  reservations: Reservation[];
}
