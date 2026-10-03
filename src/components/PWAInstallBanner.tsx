import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <div className="no-print bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Installer Riviera VTC sur votre écran d’accueil pour un accès hors-ligne rapide.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={install}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3 py-1 rounded text-xs transition"
            >
              Installer
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Fermer"
              className="p-1 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isIOS && (
        <div className="no-print bg-blue-950 text-white px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <Share2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span className="truncate">Astuce iPhone : Ajoutez Riviera VTC à l’écran d’accueil</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowIOSModal(true)}
              className="underline text-blue-200 hover:text-white font-medium ml-2"
            >
              Comment faire ?
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Fermer"
              className="p-1 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Modal instructions */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-900 font-black">Riviera VTC</span> sur iPhone
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">
                Installez l'application en 2 clics pour un affichage plein écran et une réactivité maximale :
              </p>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="p-2 bg-blue-100 text-blue-900 rounded-lg shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">1. Touchez l'icône Partager</p>
                  <p className="text-xs text-slate-600 mt-0.5">Dans la barre du bas de Safari (icône carré avec flèche vers le haut).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="p-2 bg-blue-100 text-blue-900 rounded-lg shrink-0">
                  <PlusSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">2. Sélectionnez "Sur l'écran d'accueil"</p>
                  <p className="text-xs text-slate-600 mt-0.5">Faites défiler le menu vers le bas puis validez en appuyant sur "Ajouter".</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 italic">
                L'icône Riviera VTC apparaîtra sur votre écran d'accueil comme une véritable application native.
              </p>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
