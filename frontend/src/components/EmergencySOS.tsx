import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, MapPin, AlertTriangle } from 'lucide-react';

export const EmergencySOS: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSOS = () => {
    // Call 108 (Indian ambulance)
    window.open('tel:108', '_self');

    // Try to share location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const msg = `🚨 EMERGENCY! I need help. My location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        // Try to share via SMS or clipboard
        if (navigator.share) {
          navigator.share({ title: 'Emergency SOS', text: msg }).catch(() => {});
        } else {
          navigator.clipboard.writeText(msg).catch(() => {});
        }
      }, () => {}, { enableHighAccuracy: true, timeout: 5000 });
    }

    setShowConfirm(false);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        onClick={() => setShowConfirm(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 shadow-2xl shadow-red-600/40 flex items-center justify-center text-white font-black text-xs transition-colors"
        title="Emergency SOS — Call 108"
      >
        <span className="text-lg">SOS</span>
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-400 rounded-full animate-ping" />
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#1a1f2e] border border-red-500/30 rounded-3xl p-8 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={40} className="text-red-400" />
              </div>

              <h2 className="text-2xl font-black text-white mb-2">Emergency SOS</h2>
              <p className="text-slate-400 text-sm mb-6">
                This will call <strong className="text-red-400">108</strong> (Indian ambulance service) and share your GPS location.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleSOS}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 transition-all"
                >
                  <Phone size={22} />
                  Call 108 — Ambulance
                </button>

                <a
                  href="tel:112"
                  className="w-full py-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Phone size={16} />
                  Call 112 — Emergency
                </a>

                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>

              <p className="text-[10px] text-slate-700 mt-5 font-mono">
                Your location will be shared with emergency services
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
