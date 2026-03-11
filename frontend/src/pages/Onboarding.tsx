import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storageService';
import { secureStorage } from '../services/blockchainService';
import { getLocation } from '../services/locationService';
import { MapPin, ChevronRight, ChevronLeft, Ruler, Weight, User, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { toast } from 'sonner';

interface OnboardingProps {
  setUser: (user: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const locationState = useLocation().state as Partial<UserProfile>;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: locationState?.name || '',
    email: locationState?.email || '',
    picture: locationState?.picture,
    age: 25,
    gender: 'Male',
    height: 170,
    weight: 70,
    location: { lat: 0, lng: 0 },
  });

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!profile.name.trim()) { toast.error('Please enter your name.'); return false; }
      if (!profile.email.trim() || !profile.email.includes('@')) { toast.error('Please enter a valid email.'); return false; }
      if (profile.age < 1 || profile.age > 120) { toast.error('Please enter a valid age.'); return false; }
    }
    if (step === 2) {
      if (profile.height < 50 || profile.height > 250) { toast.error('Please enter a valid height (50-250 cm).'); return false; }
      if (profile.weight < 1 || profile.weight > 500) { toast.error('Please enter a valid weight (1-500 kg).'); return false; }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Complete setup — save profile persistently
    setLoading(true);
    try {
      // Initialize ledger
      await secureStorage.initUser(profile);

      // Save to encrypted localStorage using storageService
      await saveUserProfile(profile);

      // Also save a quick-access key for session restore (App.tsx reads this)
      localStorage.setItem('medichain_user_enc', btoa(JSON.stringify(profile)));
      localStorage.setItem('medichain_last_email', profile.email);

      setUser(profile);
      toast.success(`Welcome, ${profile.name}! Your health profile is saved.`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding save failed:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await getLocation();
      setProfile(p => ({ ...p, location: { lat: loc.latitude, lng: loc.longitude } }));
      toast.success('Location detected! This helps find nearby pharmacies and hospitals.');
    } catch {
      toast.error('Could not detect location. You can skip this step.');
    } finally {
      setLocationLoading(false);
    }
  };

  const STEPS = ['Profile', 'Body Metrics', 'Location'];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[var(--primary)] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="w-full max-w-lg relative z-10">
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 < step ? 'bg-teal-500 text-white' :
                      i + 1 === step ? 'bg-teal-500/20 border-2 border-teal-500 text-teal-400' :
                        'bg-white/5 border border-white/10 text-slate-600'
                    }`}>
                    {i + 1 < step ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:inline ${i + 1 === step ? 'text-teal-400 font-medium' : 'text-slate-600'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px flex-1 mx-2 ${i + 1 < step ? 'bg-teal-500' : 'bg-white/10'}`} style={{ width: 40 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="glass-card p-8 rounded-3xl shadow-2xl"
            >
              {/* Step 1 — Profile */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Basic Details</h2>
                    <p className="text-slate-400 text-sm mt-1">This personalizes your AI health advice.</p>
                  </div>
                  {profile.picture && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <img src={profile.picture} alt={profile.name} className="w-10 h-10 rounded-full" />
                      <p className="text-sm text-slate-300">Signed in as <strong className="text-white">{profile.email}</strong></p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-500" size={16} />
                      <input
                        type="text"
                        className="input-field pl-10 w-full"
                        placeholder="e.g. Pratham Nagpal"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                  </div>
                  {!profile.picture && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
                      <input
                        type="email"
                        className="input-field w-full"
                        placeholder="your@email.com"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Age</label>
                      <input
                        type="number"
                        className="input-field w-full"
                        min={1} max={120}
                        value={profile.age}
                        onChange={e => setProfile({ ...profile, age: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Gender</label>
                      <select
                        className="input-field w-full"
                        value={profile.gender}
                        onChange={e => setProfile({ ...profile, gender: e.target.value as UserProfile['gender'] })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Body Metrics */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Body Metrics</h2>
                    <p className="text-slate-400 text-sm mt-1">Used for BMI calculation and personalized dosing guidance.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Height (cm)</label>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-3.5 text-slate-500" size={16} />
                      <input
                        type="number"
                        className="input-field pl-10 w-full"
                        min={50} max={250}
                        value={profile.height}
                        onChange={e => setProfile({ ...profile, height: Number(e.target.value) })}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">e.g. 170 cm = 5'7"</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Weight (kg)</label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-3.5 text-slate-500" size={16} />
                      <input
                        type="number"
                        className="input-field pl-10 w-full"
                        min={1} max={500}
                        value={profile.weight}
                        onChange={e => setProfile({ ...profile, weight: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  {profile.height > 50 && profile.weight > 0 && (
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
                      <span className="text-sm text-slate-300">Your BMI</span>
                      <div className="text-right">
                        <span className="font-bold text-white">
                          {(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
                        </span>
                        <span className="text-xs text-teal-400 ml-2">
                          {(() => {
                            const b = profile.weight / ((profile.height / 100) ** 2);
                            return b < 18.5 ? 'Underweight' : b < 25 ? 'Normal ✓' : b < 30 ? 'Overweight' : 'Obese';
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 — Location */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Location</h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Used to find nearby pharmacies, hospitals, and doctors. Never shared with anyone.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile.location.lat ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-slate-500'}`}>
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {profile.location.lat ? 'Location Detected ✓' : 'Location Not Set'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {profile.location.lat
                              ? `${profile.location.lat.toFixed(4)}°N, ${profile.location.lng.toFixed(4)}°E`
                              : 'Required for nearby pharmacy feature'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={detectLocation}
                        disabled={locationLoading}
                        className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm font-medium transition-colors"
                      >
                        {locationLoading ? <Loader2 size={16} className="animate-spin" /> : 'Detect'}
                      </button>
                    </div>

                    {!profile.location.lat && (
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400/80">
                        📍 Location is needed for the "Nearby Pharmacies & Hospitals" feature. You can also skip and set it later.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all font-medium"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold shadow-lg shadow-teal-500/20 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : step === 3 ? (
                    <><CheckCircle size={18} /> Complete Setup</>
                  ) : (
                    <>Continue <ChevronRight size={18} /></>
                  )}
                </button>
              </div>

              {step === 3 && !profile.location.lat && (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full mt-2 text-xs text-slate-500 hover:text-slate-400 transition-colors py-2"
                >
                  Skip location for now →
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AnimatedPage>
  );
};