import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Lock, Brain, ArrowRight, Shield, Heart, Pill, ShieldCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { PROBLEM_STATEMENT, OBJECTIVES, HOW_IT_WORKS, TEAM_INFO } from '../constants';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-[var(--primary)] text-white overflow-x-hidden selection:bg-sky-500 selection:text-white">

        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div style={{ y: y1, x: -50 }} className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-600/20 rounded-full blur-[100px]" />
          <motion.div style={{ y: y2, x: 50 }} className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden glass flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                <img src="/logo.png" alt="MediChain" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-white leading-tight">MediChain</span>
                <span className="block text-[10px] text-sky-400 font-mono uppercase tracking-widest">AI Health Council</span>
              </div>
            </div>
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all font-medium text-sm backdrop-blur-sm">
              Launch Console
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative pt-40 pb-20 px-6 z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border border-sky-500/30 mb-8">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-xs font-mono text-teal-300">SYSTEM ONLINE • V5.0 PARALLEL CONSENSUS</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">AI Healthcare</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {PROBLEM_STATEMENT}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="flex justify-center space-x-6">
              <button onClick={() => navigate('/login')} className="group relative px-8 py-4 bg-sky-500 rounded-full font-bold text-lg overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] transition-shadow">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center space-x-2">
                  <span>Initialize AI</span>
                  <ArrowRight size={20} />
                </span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 md:col-span-2 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity"><Brain size={120} /></div>
              <h3 className="text-2xl font-bold mb-4">Multi-LLM AI Council</h3>
              <p className="text-slate-400 max-w-md">Gemini → OpenRouter → Ollama → Fallback. Zero-downtime AI with cross-verification against 254k+ verified Indian medicines for maximum accuracy.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 rounded-3xl relative overflow-hidden group bg-gradient-to-br from-sky-900/40 to-black/40">
              <h3 className="text-2xl font-bold mb-4">Blockchain Security</h3>
              <p className="text-slate-400 text-sm mb-4">SHA-256 hash chain + AES-256-GCM encryption. Every consultation is blockchain-verified.</p>
              <div className="font-mono text-[10px] text-sky-400 break-all opacity-50">0x71c480df92d6e35f0ac756209b023f034731...</div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-card p-8 rounded-3xl md:col-span-3 flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Indian Medical Database</h3>
                <p className="text-slate-400">254,000+ verified medicines with dosage, prices, and generic alternatives. Buy directly from trusted pharmacies.</p>
              </div>
              <div className="flex space-x-3 mt-6 md:mt-0 flex-wrap gap-2">
                {['1mg', 'Apollo', 'Netmeds', 'PharmEasy'].map(brand => (
                  <span key={brand} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">{brand}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 relative z-10 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to AI-powered healthcare</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center p-8 rounded-3xl glass-card relative">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="absolute top-4 right-6 text-6xl font-black text-white/5">{item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-20 px-6 relative z-10 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">Our Mission</h2>
            <p className="text-slate-400 text-lg">Making healthcare accessible to every Indian citizen</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OBJECTIVES.map((obj, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 p-5 rounded-2xl glass-card">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck size={16} className="text-sky-400" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{obj}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pharmacy Partners */}
        <section className="py-16 px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm text-slate-500 uppercase tracking-widest mb-8">Verify & Purchase Medicines From Trusted Pharmacies</p>
            <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
              {[
                { name: '1mg', color: 'text-[#ff6f61]' },
                { name: 'Apollo Pharmacy', color: 'text-[#00b7eb]' },
                { name: 'Netmeds', color: 'text-[#27ae60]' },
                { name: 'PharmEasy', color: 'text-[#e74c3c]' },
              ].map(p => (
                <span key={p.name} className={`text-lg md:text-2xl font-bold ${p.color} opacity-60 hover:opacity-100 transition-opacity cursor-default`}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-black/30">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden glass flex items-center justify-center">
                    <img src="/logo.png" alt="MediChain" className="w-full h-full object-cover grayscale opacity-70" />
                  </div>
                  <div>
                    <span className="font-bold text-lg text-white">MediChain</span>
                    <span className="block text-[10px] text-sky-400 font-mono uppercase">AI Health Council</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm">{TEAM_INFO.tagline}</p>
                <p className="text-slate-600 text-xs mt-2">{TEAM_INFO.university} • {TEAM_INFO.department}</p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Heart size={16} className="text-red-400" /> Emergency Contacts (India)
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>🚑 Ambulance: <span className="text-white font-mono">108</span></li>
                  <li>🏥 Medical Emergency: <span className="text-white font-mono">102</span></li>
                  <li>📞 Mental Health: <span className="text-white font-mono">9152987821</span> (iCALL)</li>
                  <li>☠️ Poison Control: <span className="text-white font-mono">1800-112-247</span></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4">Important Disclaimer</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  ⚕️ MediChain provides AI-assisted medical guidance only. It is NOT a substitute for professional medical advice. Always seek the advice of a qualified MBBS/MD doctor.
                </p>
                <p className="text-slate-600 text-xs mt-3">
                  🔒 All consultations secured with SHA-256 blockchain verification and AES-256-GCM encryption.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-600 text-xs">© {new Date().getFullYear()} MediChain — AI Health Council</p>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Shield size={10} /> Blockchain Verified</span>
                <span>•</span>
                <span>v4.0.0</span>
                <span>•</span>
                <span>Made in India 🇮🇳</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AnimatedPage>
  );
};
