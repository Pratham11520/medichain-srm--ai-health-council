import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { Cpu, Mail, Lock, Loader2, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { authWithGoogle, authWithEmail } from '../services/apiService';

interface LoginProps {
  setUser: (user: UserProfile) => void;
}

declare global {
  interface Window { google?: any; }
}

export const Login: React.FC<LoginProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState<'select' | 'email'>('select');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? '763037765502-ootgm5c7famt4s8pu4vsag8vd1teru41.apps.googleusercontent.com';

  useEffect(() => {
    // ... Google Init Logic ...
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'filled_black', size: 'large', width: '100%', shape: 'pill', text: 'continue_with' }
        );
      }
    };
    if (window.google) initGoogle();
    else {
      const i = setInterval(() => { if (window.google) { initGoogle(); clearInterval(i); } }, 200);
      return () => clearInterval(i);
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    try {
      // Verify token with backend and get JWT session
      const authResult = await authWithGoogle(response.credential).catch(() => null);
      
      // Decode token client-side for user profile
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const profile: UserProfile = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        age: 0, gender: 'Male', weight: 0, height: 0, location: { lat: 0, lng: 0 }, history: []
      };
      
      if (authResult) {
        toast.success(`Welcome, ${authResult.user.name}! JWT session created.`);
      }
      navigate('/onboarding', { state: profile });
    } catch (err) {
      console.error(err);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleSendOTP = () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const simOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(simOtp);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      // Demo mode: show OTP in a toast notification
      toast.success(`🔐 Demo OTP: ${simOtp}`, {
        description: 'Copy this code (real deployment would email it)',
        duration: 30000,
      });
    }, 800);
  };

  const verifyOTP = async () => {
    if (otp === generatedOtp) {
      toast.success('Verified! Creating session...');
      // Call backend to get JWT
      await authWithEmail(email, email.split('@')[0]).catch(() => null);
      navigate('/onboarding', { state: { email, name: email.split('@')[0] } });
    } else {
      toast.error('Invalid OTP. Please check your code and try again.');
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[var(--primary)] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-teal-500/25"
            >
              <Cpu size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">MediChain SRM</h1>
            <p className="text-slate-400 text-sm mt-1">AI Health Council • Hash-Ledger Secured</p>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl">
            {loginMode === 'select' ? (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white text-center">Welcome Back</h2>
                <div id="googleSignInDiv" className="w-full min-h-[44px]"></div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1f2e] px-2 text-slate-500">Or continue with</span></div>
                </div>

                <button onClick={() => setLoginMode('email')} className="w-full py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center space-x-2 text-white font-medium">
                  <Mail size={18} /><span>Email OTP</span>
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <button onClick={() => setLoginMode('select')} className="text-slate-400 text-sm hover:text-white mb-2">← Back</button>

                {!otpSent ? (
                  <>
                    <input type="email" placeholder="Email Address" className="input-field w-full" value={email} onChange={e => setEmail(e.target.value)} />
                    <button onClick={handleSendOTP} disabled={loading} className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center space-x-2">
                      {loading ? <Loader2 className="animate-spin" /> : <><span>Send OTP</span><ArrowRight size={18} /></>}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-center text-slate-400">Code sent to {email}</p>
                    <input type="text" placeholder="• • • • • •" maxLength={6} className="input-field w-full text-center text-2xl tracking-widest font-mono" value={otp} onChange={e => setOtp(e.target.value)} />
                    <button onClick={verifyOTP} className="btn-primary w-full py-3.5 rounded-xl">Verify & Login</button>
                  </>
                )}
              </motion.div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
            <Shield size={10} className="text-teal-500" />
            <span>SECURED BY MEDICHAIN PROTOCOL</span>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};