/**
 * RIVIERA VTC – Gestion des réservations
 * Application mobile professionnelle & PWA pour chauffeurs VTC
 */

import React, { useState, useEffect } from 'react';
import { Reservation, CompanyProfile, AppTab } from './types';
import {
  loadProfiles,
  saveProfiles,
  loadActiveProfileId,
  saveActiveProfileId,
  loadReservations,
  createNewReservation,
  updateReservation,
  duplicateReservation,
  deleteReservation,
  DEFAULT_RIVIERA_PROFILE,
} from './utils/storage';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ReservationsListView } from './components/ReservationsListView';
import { SettingsView } from './components/SettingsView';
import { BonDeCommandeView } from './components/BonDeCommandeView';
import { BookingFormModal } from './components/BookingFormModal';
import { RapidBookingModal } from './components/RapidBookingModal';
import { ConfirmModal } from './components/ConfirmModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const [profiles, setProfiles] = useState<CompanyProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => loadActiveProfileId());
  const [reservations, setReservations] = useState<Reservation[]>(() => loadReservations());

  // Navigation & Views
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedBonReservation, setSelectedBonReservation] = useState<Reservation | null>(null);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRapidBookingOpen, setIsRapidBookingOpen] = useState(false);
  const [startGpsMode, setStartGpsMode] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Delete Confirmation state
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: 'reservation' | 'profile';
    resTarget?: Reservation;
    profileTargetId?: string;
  }>({
    isOpen: false,
    type: 'reservation',
  });

  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_RIVIERA_PROFILE;

  // Refresh data handler (e.g. after backup import)
  const handleDataRestored = () => {
    const updatedProfiles = loadProfiles();
    const updatedActiveId = loadActiveProfileId();
    const updatedReservations = loadReservations();
    setProfiles(updatedProfiles);
    setActiveProfileId(updatedActiveId);
    setReservations(updatedReservations);
    setSelectedBonReservation(null);
  };

  // Switch tabs
  const handleTabChange = (tab: AppTab) => {
    if (tab === 'new-booking') {
      setEditingReservation(null);
      setStartGpsMode(false);
      setIsBookingModalOpen(true);
      return;
    }
    // Close Bon view when explicitly switching bottom nav tabs
    setSelectedBonReservation(null);
    setActiveTab(tab);
  };

  // Open New Booking
  const handleOpenNewBooking = (gpsMode = false) => {
    setEditingReservation(null);
    setStartGpsMode(gpsMode);
    setIsBookingModalOpen(true);
  };

  // Save Booking (create or update)
  const handleSaveBooking = (
    data: Omit<Reservation, 'id' | 'bonNumber' | 'createdAt' | 'updatedAt' | 'companySnapshot'>
  ) => {
    if (editingReservation) {
      const updated = updateReservation(editingReservation.id, data);
      if (updated) {
        setReservations(loadReservations());
        setIsBookingModalOpen(false);
        setEditingReservation(null);
        // If we were viewing the bon of this item, update it
        if (selectedBonReservation?.id === updated.id) {
          setSelectedBonReservation(updated);
        }
      }
    } else {
      const newRes = createNewReservation(data, activeProfile);
      setReservations(loadReservations());
      setIsBookingModalOpen(false);
      setIsRapidBookingOpen(false);
      // Immediately open the newly generated Bon de Commande VTC as requested!
      setSelectedBonReservation(newRes);
    }
  };

  // Edit Booking
  const handleEditBooking = (res: Reservation) => {
    setEditingReservation(res);
    setStartGpsMode(false);
    setIsBookingModalOpen(true);
  };

  // Duplicate Booking
  const handleDuplicateBooking = (res: Reservation) => {
    const duplicated = duplicateReservation(res.id, activeProfile);
    if (duplicated) {
      setReservations(loadReservations());
      // Open the duplicated bon
      setSelectedBonReservation(duplicated);
    }
  };

  // Delete request
  const handleDeleteBookingRequest = (res: Reservation) => {
    setConfirmDelete({
      isOpen: true,
      type: 'reservation',
      resTarget: res,
    });
  };

  // Toggle status
  const handleToggleStatus = (res: Reservation) => {
    const newStatus = res.status === 'terminee' ? 'a_venir' : 'terminee';
    const updated = updateReservation(res.id, { status: newStatus });
    if (updated) {
      setReservations(loadReservations());
      if (selectedBonReservation?.id === updated.id) {
        setSelectedBonReservation(updated);
      }
    }
  };

  // Profile actions
  const handleSaveProfile = (profile: CompanyProfile) => {
    const index = profiles.findIndex((p) => p.id === profile.id);
    let updated: CompanyProfile[];
    if (index >= 0) {
      updated = [...profiles];
      updated[index] = profile;
    } else {
      updated = [...profiles, profile];
    }
    setProfiles(updated);
    saveProfiles(updated);
  };

  const handleSelectActiveProfile = (id: string) => {
    setActiveProfileId(id);
    saveActiveProfileId(id);
  };

  const handleCreateNewProfile = (newProfile: CompanyProfile) => {
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    setActiveProfileId(newProfile.id);
    saveActiveProfileId(newProfile.id);
  };

  const handleDeleteProfileRequest = (id: string) => {
    if (profiles.length <= 1) {
      alert('Vous devez conserver au moins un profil.');
      return;
    }
    setConfirmDelete({
      isOpen: true,
      type: 'profile',
      profileTargetId: id,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.type === 'reservation' && confirmDelete.resTarget) {
      deleteReservation(confirmDelete.resTarget.id);
      setReservations(loadReservations());
      if (selectedBonReservation?.id === confirmDelete.resTarget.id) {
        setSelectedBonReservation(null);
      }
    } else if (confirmDelete.type === 'profile' && confirmDelete.profileTargetId) {
      const updated = profiles.filter((p) => p.id !== confirmDelete.profileTargetId);
      setProfiles(updated);
      saveProfiles(updated);
      if (activeProfileId === confirmDelete.profileTargetId) {
        setActiveProfileId(updated[0].id);
        saveActiveProfileId(updated[0].id);
      }
    }
    setConfirmDelete({ isOpen: false, type: 'reservation' });
  };

  // If viewing Bon de Commande VTC, render official full screen view
  if (selectedBonReservation) {
    return (
      <BonDeCommandeView
        reservation={selectedBonReservation}
        onBack={() => setSelectedBonReservation(null)}
        onEdit={(res) => {
          handleEditBooking(res);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-blue-900 selection:text-white">
      
      {/* PWA & iOS Safari install prompt banner */}
      <PWAInstallBanner />

      {/* Main Header */}
      <Header
        activeProfile={activeProfile}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            reservations={reservations}
            activeProfile={activeProfile}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewBooking={() => handleOpenNewBooking(false)}
            onOpenRapidBooking={() => setIsRapidBookingOpen(true)}
            onViewBon={(res) => setSelectedBonReservation(res)}
            onEditBooking={handleEditBooking}
            onDuplicateBooking={handleDuplicateBooking}
            onDeleteBooking={handleDeleteBookingRequest}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsListView
            reservations={reservations}
            activeProfile={activeProfile}
            onViewBon={(res) => setSelectedBonReservation(res)}
            onEditBooking={handleEditBooking}
            onDuplicateBooking={handleDuplicateBooking}
            onDeleteBooking={handleDeleteBookingRequest}
            onToggleStatus={handleToggleStatus}
            onOpenNewBooking={() => handleOpenNewBooking(false)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSaveProfile={handleSaveProfile}
            onSelectActiveProfile={handleSelectActiveProfile}
            onCreateNewProfile={handleCreateNewProfile}
            onDeleteProfile={handleDeleteProfileRequest}
            onDataRestored={handleDataRestored}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (4 large icons, safe-area aware) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        bookingCount={reservations.filter((r) => r.status === 'a_venir').length}
      />

      {/* Modal 1: Standard / Manual & GPS New Booking */}
      <BookingFormModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingReservation(null);
        }}
        onSave={handleSaveBooking}
        activeProfile={activeProfile}
        initialData={editingReservation}
        startInGpsMode={startGpsMode}
      />

      {/* Modal 2: ⚡ Course Rapide (<20 seconds flow) */}
      <RapidBookingModal
        isOpen={isRapidBookingOpen}
        onClose={() => setIsRapidBookingOpen(false)}
        onSave={handleSaveBooking}
        activeProfile={activeProfile}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={
          confirmDelete.type === 'reservation'
            ? 'Supprimer la réservation'
            : 'Supprimer le profil chauffeur'
        }
        message={
          confirmDelete.type === 'reservation'
            ? `Êtes-vous sûr de vouloir supprimer définitivement la réservation de ${confirmDelete.resTarget?.clientNom} (${confirmDelete.resTarget?.bonNumber}) ? Cette action est irréversible.`
            : 'Êtes-vous sûr de vouloir supprimer ce profil ? Les réservations passées conserveront leurs informations enregistrées.'
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, type: 'reservation' })}
      />
    </div>
  );
}
