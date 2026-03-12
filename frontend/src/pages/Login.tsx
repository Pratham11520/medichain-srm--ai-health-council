import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { Cpu, Mail, Loader2, ArrowRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { authWithGoogle, requestEmailOTP, verifyEmailOTP } from '../services/apiService';

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
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 6-digit OTP state
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)
  ];

  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? '763037765502-ootgm5c7famt4s8pu4vsag8vd1teru41.apps.googleusercontent.com';

  useEffect(() => {
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
      const authResult = await authWithGoogle(response.credential).catch(() => null);
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const profile: UserProfile = {
        name: payload.name, email: payload.email, picture: payload.picture,
        age: 0, gender: 'Male', weight: 0, height: 0, location: { lat: 0, lng: 0 }, history: []
      };
      
      if (authResult) {
        toast.success(`Welcome, ${authResult.user.name}! Secure session created.`);
      }
      navigate('/onboarding', { state: profile });
    } catch (err) {
      console.error(err);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleSendOTP = async () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await requestEmailOTP(email);
      setOtpSent(true);
      toast.success('Verification code sent!', { 
        description: `Check the inbox for ${email}`,
        duration: 5000,
      });
      // Auto focus first OTP input after short delay
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmailOTP(email, otpCode, email.split('@')[0]);
      toast.success('Verified! Creating secure session...');
      navigate('/onboarding', { state: { email, name: email.split('@')[0] } });
    } catch (err: any) {
      toast.error(err.message || 'Invalid code. Please check and try again.');
      // Clear OTP on format failure or wrong try
      setOtpValues(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) { // Handle paste
      const pastedData = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newOtp = [...otpValues];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtpValues(newOtp);
      const focusIndex = Math.min(index + pastedData.length, 5);
      inputRefs[focusIndex].current?.focus();
      return;
    }
    
    if (/[^0-9]/.test(value) && value !== '') return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto advance
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      if (otpValues.join('').length === 6) {
        verifyOTP();
      }
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[var(--primary)] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Orbs */}
        <motion.div animate={{ y: [0, -30, 0], x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-600/20 rounded-full blur-[100px]" />
        <motion.div animate={{ y: [0, 40, 0], x: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
          
          <div className="text-center mb-8">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              animate={{ boxShadow: ['0px 0px 30px rgba(14, 165, 233, 0.4)', '0px 0px 60px rgba(14, 165, 233, 0.8)', '0px 0px 30px rgba(14, 165, 233, 0.4)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 rounded-3xl overflow-hidden glass shadow-2xl flex items-center justify-center mx-auto mb-4"
            >
              <img src="/logo.png" alt="MediChain Logo" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-6">MediChain</h1>
            <p className="text-slate-400 text-sm mt-1">AI Health Council • Hash-Ledger Secured</p>
          </div>

          <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl">
            {loginMode === 'select' ? (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white text-center">Welcome Back</h2>
                <div id="googleSignInDiv" className="w-full min-h-[44px] flex justify-center"></div>

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
                <button 
                  onClick={() => {
                    setLoginMode('select');
                    setOtpSent(false);
                    setOtpValues(['', '', '', '', '', '']);
                  }} 
                  className="text-slate-400 text-sm hover:text-white mb-2"
                >
                  ← Back
                </button>

                {!otpSent ? (
                  <AnimatePresence mode="wait">
                    <motion.div key="email-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <h2 className="text-xl font-bold text-white">Sign in with Email</h2>
                      <p className="text-sm text-slate-400">We'll send you a secure 6-digit verification code.</p>
                      
                      <input 
                        type="email" 
                        placeholder="you@example.com" 
                        className="input-field w-full text-lg py-3" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        autoFocus
                      />
                      
                      <button onClick={handleSendOTP} disabled={loading || !email} className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <><span>Send Code</span><ArrowRight size={18} /></>}
                      </button>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                        <p className="text-sm text-slate-400">We sent a 6-digit code to <strong className="text-sky-400">{email}</strong></p>
                      </div>

                      {/* 6-Digit Code Input */}
                      <div className="flex justify-between gap-2">
                        {otpValues.map((value, index) => (
                          <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={1}
                            className="w-12 h-14 bg-black/40 border border-white/10 rounded-xl text-center text-2xl text-white font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder-slate-700"
                            placeholder="•"
                            value={value}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          />
                        ))}
                      </div>

                      <button onClick={verifyOTP} disabled={loading || otpValues.join('').length !== 6} className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <span>Verify & Login</span>}
                      </button>

                      <div className="text-center">
                        <button onClick={handleSendOTP} disabled={loading} className="text-xs text-slate-500 hover:text-sky-400 transition-colors">
                          Didn't receive a code? Resend
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
            <Shield size={10} className="text-sky-500" />
            <span>SECURED BY MEDICHAIN PROTOCOL</span>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};
