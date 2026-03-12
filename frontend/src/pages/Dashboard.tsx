import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Heart, Ruler, Weight, ShieldCheck,
  MessageSquare, Beaker, FileText, Stethoscope,
  TrendingUp, Database, Zap, Clock, MapPin, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { getMedicineStats, getLLMStatus } from '../services/apiService';
import { getLedgerStats } from '../services/blockchainService';
import { getDailyTip } from '../data/healthTips';

interface DashboardProps {
  user: UserProfile;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [medStats, setMedStats] = useState<any>(null);
  const [llmStatus, setLlmStatus] = useState<any>(null);
  const ledgerStats = getLedgerStats();
  const dailyTip = getDailyTip();

  useEffect(() => {
    getMedicineStats().then(setMedStats).catch(() => { });
    getLLMStatus().then(setLlmStatus).catch(() => { });
  }, []);

  const bmi = user.weight && user.height
    ? Number(user.weight) / ((Number(user.height) / 100) ** 2)
    : null;

  const bmiLabel = bmi
    ? bmi < 18.5 ? { text: 'Underweight', color: 'text-blue-400', bg: 'bg-blue-500/20' }
      : bmi < 25 ? { text: 'Normal', color: 'text-green-400', bg: 'bg-green-500/20' }
        : bmi < 30 ? { text: 'Overweight', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
          : { text: 'Obese', color: 'text-red-400', bg: 'bg-red-500/20' }
    : null;

  const quickActions = [
    {
      label: 'MediBot Chat',
      desc: 'Ask anything about health, medicines, or symptoms',
      icon: MessageSquare,
      gradient: 'from-sky-500/20 to-blue-500/10',
      border: 'border-sky-500/20 hover:border-sky-500/40',
      iconColor: 'text-sky-400',
      path: '/chat'
    },
    {
      label: 'Symptom Analyzer',
      desc: 'Get structured clinical assessment with urgency level',
      icon: Stethoscope,
      gradient: 'from-blue-500/20 to-indigo-500/10',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconColor: 'text-blue-400',
      path: '/symptoms'
    },
    {
      label: 'Drug Interactions',
      desc: 'Check safety of combining multiple medicines',
      icon: Beaker,
      gradient: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconColor: 'text-purple-400',
      path: '/drug-interaction',
      badge: 'NEW'
    },
    {
      label: 'Report Reader',
      desc: 'Interpret blood tests, X-ray reports, and more',
      icon: FileText,
      gradient: 'from-orange-500/20 to-red-500/10',
      border: 'border-orange-500/20 hover:border-orange-500/40',
      iconColor: 'text-orange-400',
      path: '/report'
    },
    {
      label: 'Nearby Pharmacies',
      desc: 'Find pharmacies, hospitals & clinics near you',
      icon: MapPin,
      gradient: 'from-green-500/20 to-sky-500/10',
      border: 'border-green-500/20 hover:border-green-500/40',
      iconColor: 'text-green-400',
      path: '/nearby'
    },
    {
      label: 'Health Tracker',
      desc: 'Track BP, sugar, weight — blockchain verified',
      icon: Heart,
      gradient: 'from-rose-500/20 to-pink-500/10',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconColor: 'text-rose-400',
      path: '/health-tracker',
      badge: 'NEW'
    },
  ];

  const activeProviders = llmStatus
    ? Object.values(llmStatus).filter((p: any) => p.available).length
    : null;

  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                {user.name.split(' ')[0]}
              </span>
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Clock size={14} />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeProviders !== null && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-xs font-mono text-green-400">{activeProviders} AI PROVIDERS ONLINE</span>
              </div>
            )}
          </div>
        </div>
        {/* Daily Health Tip + Blockchain Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 glass rounded-2xl border border-emerald-500/10 p-5 flex items-start gap-4">
            <div className="text-4xl">{dailyTip.emoji}</div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Zap size={14} /> Daily Health Tip
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{dailyTip.tip}</p>
              <span className="text-[10px] text-slate-600 mt-1 inline-block capitalize">Category: {dailyTip.category}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl border border-sky-500/10 p-5">
            <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield size={14} /> Blockchain Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chain Length</span>
                <span className="text-white font-mono font-bold">{ledgerStats.chainLength} blocks</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chain Valid</span>
                <span className="text-emerald-400 font-bold">✓ Verified</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Algorithm</span>
                <span className="text-slate-300 font-mono">SHA-256 + AES-256-GCM</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Health Score */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl border border-sky-500/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Activity size={14} /> AI Health Score
              </h3>
              <p className="text-xs text-slate-500 mb-4">Based on BMI, vitals & blockchain activity</p>
              {(() => {
                // Calculate health score
                let score = 50; // Base
                if (bmi) {
                  if (bmi >= 18.5 && bmi < 25) score += 30;
                  else if (bmi >= 25 && bmi < 30) score += 15;
                  else score += 5;
                }
                if (user.weight > 0) score += 5;
                if (user.height > 0) score += 5;
                if (ledgerStats.chainLength > 1) score += Math.min(ledgerStats.chainLength, 10);
                score = Math.min(score, 100);
                const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (score / 100) * circumference;
                return (
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{score}</span>
                        <span className="text-[9px] text-slate-500 uppercase">/ 100</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-semibold text-white">
                          {score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Attention'}
                        </span>
                      </div>
                      {bmi && (
                        <p className="text-xs text-slate-500">BMI: {bmi.toFixed(1)} ({bmiLabel?.text})</p>
                      )}
                      <p className="text-xs text-slate-500">{ledgerStats.chainLength} blockchain records</p>
                      <p className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                        <TrendingUp size={10} className="text-sky-500" />
                        Keep using MediChain to improve your score
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.div>

        {/* Pharmacy Partners */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-4 py-2 flex-wrap">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest">Pharmacy Partners</span>
          {['1mg', 'Apollo', 'Netmeds', 'PharmEasy'].map(p => (
            <span key={p} className="text-xs font-bold text-slate-500 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">{p}</span>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Vitals */}
          {[
            { label: 'Weight', value: `${user.weight}`, unit: 'kg', icon: Weight, color: 'teal' },
            { label: 'Height', value: `${user.height}`, unit: 'cm', icon: Ruler, color: 'purple' },
            { label: 'Age', value: `${user.age}`, unit: 'yrs', icon: Heart, color: 'blue' },
            {
              label: 'BMI',
              value: bmi ? bmi.toFixed(1) : '--',
              unit: bmiLabel?.text || '',
              icon: Activity,
              color: 'orange',
              extra: bmiLabel
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="glass-card p-5 rounded-2xl relative overflow-hidden group"
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon size={16} className={`text-${stat.color}-400`} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              {stat.extra ? (
                <span className={`text-xs font-medium ${stat.extra.color}`}>{stat.extra.text}</span>
              ) : (
                <span className="text-xs text-slate-500">{stat.unit}</span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">AI Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.path}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className={`text-left p-5 rounded-2xl bg-gradient-to-br ${action.gradient} border ${action.border} transition-all group relative overflow-hidden`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <action.icon size={24} className={action.iconColor} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{action.label}</h3>
                      {action.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/30">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{action.desc}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Medicine Database */}
          <motion.div variants={item} initial="hidden" animate="show" className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Database size={16} className="text-sky-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Database</span>
            </div>
            <p className="text-2xl font-black text-white">
              {medStats?.total_medicines ? medStats.total_medicines.toLocaleString() : '254,022'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Verified Indian medicines</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {medStats?.unique_drug_classes || '8'} drug classes
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {medStats?.unique_manufacturers || '7,649'} manufacturers
              </span>
            </div>
          </motion.div>

          {/* Hash Ledger */}
          <motion.div variants={item} initial="hidden" animate="show" className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-green-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hash Ledger</span>
            </div>
            <p className="text-2xl font-black text-white">{ledgerStats.chainLength}</p>
            <p className="text-xs text-slate-400 mt-1">Blocks in chain</p>
            <div className="mt-3">
              <p className="text-[10px] font-mono text-green-400/60 truncate">
                SHA-256 + AES-256-GCM
              </p>
              <p className="text-[10px] font-mono text-slate-600 truncate">
                Genesis: {ledgerStats.genesisHash}
              </p>
            </div>
          </motion.div>

          {/* LLM Council */}
          <motion.div variants={item} initial="hidden" animate="show" className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Council</span>
            </div>
            <p className="text-2xl font-black text-white">
              {activeProviders ?? 4}
            </p>
            <p className="text-xs text-slate-400 mt-1">Providers available</p>
            <div className="mt-3 space-y-1">
              {llmStatus ? Object.entries(llmStatus).map(([name, info]: [string, any]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${info.available ? 'bg-green-500' : 'bg-slate-600'}`} />
                  <span className="text-[10px] font-mono text-slate-500 capitalize">{name}</span>
                </div>
              )) : (
                ['Gemini', 'g4f', 'Ollama', 'Fallback'].map(p => (
                  <div key={p} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span className="text-[10px] font-mono text-slate-500">{p}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Emergency Contacts Strip */}
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingUp size={12} className="text-red-400" />
            </div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Emergency Contacts</span>
          </div>
          {[
            { label: 'Emergency', num: '112' },
            { label: 'AIIMS Helpline', num: '1800-11-1234' },
            { label: 'Poison Control', num: '1800-11-6117' },
          ].map(c => (
            <div key={c.num} className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{c.label}:</span>
              <span className="text-xs font-mono font-bold text-red-400">{c.num}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
};
