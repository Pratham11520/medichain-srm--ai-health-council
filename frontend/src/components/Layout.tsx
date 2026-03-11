import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { LayoutDashboard, MessageSquare, Stethoscope, FileText, Shield, LogOut, Menu, X, Cpu, Beaker, ChevronRight, MapPin, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TaskTray } from './TaskTray';
import { clearAllUserData } from '../services/apiService';
import { EmergencySOS } from './EmergencySOS';

interface LayoutProps {
  user: UserProfile;
  setUser: (user: UserProfile | null) => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'teal' },
    { path: '/chat', label: 'MediBot Chat', icon: MessageSquare, color: 'cyan' },
    { path: '/symptoms', label: 'Symptom Analyzer', icon: Stethoscope, color: 'blue' },
    { path: '/report', label: 'Report Reader', icon: FileText, color: 'indigo' },
    {
      path: '/drug-interaction', label: 'Drug Interactions',
      icon: Beaker, color: 'purple',
    },
    { path: '/health-tracker', label: 'Health Tracker', icon: Heart, color: 'rose', badge: 'NEW' },
    { path: '/ledger', label: 'Blockchain Ledger', icon: Shield, color: 'pink' },
    { path: '/nearby', label: 'Nearby Pharmacies', icon: MapPin, color: 'green' },
  ];

  const handleLogout = () => {
    clearAllUserData();
    setUser(null);
    toast.success('Signed out successfully. All local data cleared.');
    navigate('/');
  };

  const bmi = user.weight && user.height
    ? (Number(user.weight) / ((Number(user.height) / 100) ** 2)).toFixed(1)
    : null;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center space-x-3 px-3 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Cpu size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">MediChain</h1>
          <span className="text-[10px] text-teal-400 font-medium uppercase tracking-wider">AI Health Council</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((navItem) => (
          <NavLink
            key={navItem.path}
            to={navItem.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                ? 'text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-teal-500/10 border border-teal-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <navItem.icon size={18} className={`relative z-10 ${isActive ? 'text-teal-400' : ''}`} />
                <span className="relative z-10 flex-1">{navItem.label}</span>
                {navItem.badge && (
                  <span className="relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/30">
                    {navItem.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight size={14} className="relative z-10 text-teal-400 opacity-60" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className="mt-4 mb-4 px-2">
        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">AI Council Online</span>
          </div>
          <p className="text-[9px] text-slate-600 font-mono">Gemini → OpenRouter → Ollama → Fallback</p>
        </div>
      </div>

      {/* User Profile + Logout */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        {/* BMI mini-badge */}
        {bmi && (
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">BMI</span>
            <span className="text-xs font-bold text-white">{bmi}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${Number(bmi) < 18.5 ? 'bg-blue-500/20 text-blue-400' :
              Number(bmi) < 25 ? 'bg-green-500/20 text-green-400' :
                Number(bmi) < 30 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
              }`}>
              {Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Overweight' : 'Obese'}
            </span>
          </div>
        )}

        <div className="glass p-3 rounded-xl flex items-center space-x-3 bg-gradient-to-br from-white/5 to-transparent">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-lg object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-teal-600/20 flex items-center justify-center text-teal-400 font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email || 'Secured Session'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--primary)] text-white font-sans">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-col w-72 glass border-r border-white/5 p-4 z-20 overflow-y-auto"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 glass border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-2">
          <Cpu size={20} className="text-teal-400" />
          <span className="font-bold">MediChain</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-slate-400">
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-[#0a0e1a] pt-16 px-4 flex flex-col overflow-y-auto pb-8"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0 relative">
        <div className="p-4 md:p-8 min-h-full">
          <Outlet />
        </div>
        <TaskTray />
        <EmergencySOS />
      </main>
    </div>
  );
};