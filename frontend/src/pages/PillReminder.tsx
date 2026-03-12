import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Check, Clock, X, Bell, Trash2, ShieldCheck, Sunrise, Sun, Sunset, Moon, Zap, Calendar } from 'lucide-react';
import { AnimatedPage } from '../components/AnimatedPage';
import { secureStorage } from '../services/blockchainService';
import { toast } from 'sonner';

interface PillSchedule {
    id: string;
    medicineName: string;
    dosage: string;
    times: ('morning' | 'afternoon' | 'evening' | 'night')[];
    startDate: string;
    endDate?: string;
    notes?: string;
    blockHash?: string;
}

interface PillLog {
    scheduleId: string;
    takenAt: number;
    time: string;
    date: string;
}

const TIME_SLOTS = [
    { key: 'morning' as const, label: 'Morning', time: '8:00 AM', icon: Sunrise, color: 'from-amber-400 to-orange-500' },
    { key: 'afternoon' as const, label: 'Afternoon', time: '1:00 PM', icon: Sun, color: 'from-yellow-400 to-amber-500' },
    { key: 'evening' as const, label: 'Evening', time: '6:00 PM', icon: Sunset, color: 'from-orange-400 to-red-500' },
    { key: 'night' as const, label: 'Night', time: '10:00 PM', icon: Moon, color: 'from-indigo-400 to-purple-500' },
];

const STORAGE_KEY = 'medichain_pill_schedules';
const LOG_KEY = 'medichain_pill_logs';

export const PillReminderPage: React.FC = () => {
    const [schedules, setSchedules] = useState<PillSchedule[]>([]);
    const [logs, setLogs] = useState<PillLog[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [medicineName, setMedicineName] = useState('');
    const [dosage, setDosage] = useState('');
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const s = localStorage.getItem(STORAGE_KEY);
        const l = localStorage.getItem(LOG_KEY);
        if (s) setSchedules(JSON.parse(s));
        if (l) setLogs(JSON.parse(l));
    }, []);

    const saveSchedules = (data: PillSchedule[]) => {
        setSchedules(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const saveLogs = (data: PillLog[]) => {
        setLogs(data);
        localStorage.setItem(LOG_KEY, JSON.stringify(data));
    };

    const addSchedule = async () => {
        if (!medicineName.trim() || selectedTimes.length === 0) {
            toast.error('Please enter medicine name and select at least one time');
            return;
        }

        const block = await secureStorage.addBlock(`PILL_REMINDER:${medicineName}:${dosage}:${selectedTimes.join(',')}`);

        const schedule: PillSchedule = {
            id: crypto.randomUUID(),
            medicineName: medicineName.trim(),
            dosage: dosage.trim() || '1 tablet',
            times: selectedTimes as any[],
            startDate: new Date().toISOString().slice(0, 10),
            notes: notes.trim() || undefined,
            blockHash: block.hash.slice(0, 12),
        };

        saveSchedules([schedule, ...schedules]);
        setMedicineName(''); setDosage(''); setSelectedTimes([]); setNotes(''); setShowForm(false);
        toast.success(`${schedule.medicineName} reminder set ✓ Blockchain verified`);
    };

    const deleteSchedule = (id: string) => {
        saveSchedules(schedules.filter(s => s.id !== id));
        toast.success('Reminder deleted');
    };

    const markTaken = async (scheduleId: string, timeSlot: string) => {
        const today = new Date().toISOString().slice(0, 10);
        const already = logs.find(l => l.scheduleId === scheduleId && l.time === timeSlot && l.date === today);
        if (already) { toast.info('Already marked as taken today'); return; }

        const schedule = schedules.find(s => s.id === scheduleId);
        await secureStorage.addBlock(`PILL_TAKEN:${schedule?.medicineName}:${timeSlot}:${today}`);

        const log: PillLog = { scheduleId, takenAt: Date.now(), time: timeSlot, date: today };
        saveLogs([log, ...logs].slice(0, 500));
        toast.success(`${schedule?.medicineName} (${timeSlot}) — marked as taken ✓`);
    };

    const isTaken = (scheduleId: string, timeSlot: string): boolean => {
        const today = new Date().toISOString().slice(0, 10);
        return logs.some(l => l.scheduleId === scheduleId && l.time === timeSlot && l.date === today);
    };

    // Compute adherence percentage
    const getAdherence = (): number => {
        if (schedules.length === 0) return 100;
        const today = new Date().toISOString().slice(0, 10);
        let total = 0, taken = 0;
        schedules.forEach(s => {
            s.times.forEach(t => {
                total++;
                if (logs.some(l => l.scheduleId === s.id && l.time === t && l.date === today)) taken++;
            });
        });
        return total > 0 ? Math.round((taken / total) * 100) : 100;
    };

    const adherence = getAdherence();

    return (
        <AnimatedPage>
            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
                                <Pill size={24} className="text-white" />
                            </div>
                            Pill Reminder
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">Never miss a dose — blockchain-verified medication tracking</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium shadow-lg shadow-violet-500/20 transition-all">
                        <Plus size={16} /> Add Medicine
                    </button>
                </div>

                {/* Adherence Banner */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-white/5 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-sm">Today's Adherence</span>
                        <span className={`text-2xl font-black ${adherence >= 80 ? 'text-emerald-400' : adherence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {adherence}%
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${adherence}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${adherence >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : adherence >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`} />
                    </div>
                </motion.div>

                {/* Today's Schedule */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-violet-400" /> Today's Schedule
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {TIME_SLOTS.map(slot => {
                            const schedulesForTime = schedules.filter(s => s.times.includes(slot.key));
                            if (schedulesForTime.length === 0) return null;

                            return (
                                <motion.div key={slot.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-white/5 overflow-hidden">
                                    <div className={`px-4 py-3 bg-gradient-to-r ${slot.color} flex items-center gap-2`}>
                                        <slot.icon size={16} className="text-white" />
                                        <span className="text-white font-bold text-sm">{slot.label}</span>
                                        <span className="text-white/70 text-xs ml-auto">{slot.time}</span>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {schedulesForTime.map(schedule => {
                                            const taken = isTaken(schedule.id, slot.key);
                                            return (
                                                <div key={schedule.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${taken ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/5'}`}>
                                                    <button onClick={() => markTaken(schedule.id, slot.key)} disabled={taken} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${taken ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-violet-500/20 hover:text-violet-400'}`}>
                                                        {taken ? <Check size={14} /> : <Pill size={14} />}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium text-sm ${taken ? 'text-emerald-400 line-through' : 'text-white'}`}>{schedule.medicineName}</p>
                                                        <p className="text-[11px] text-slate-500">{schedule.dosage}</p>
                                                    </div>
                                                    {schedule.blockHash && (
                                                        <span className="text-[9px] text-sky-500 font-mono flex items-center gap-0.5"><ShieldCheck size={8} />{schedule.blockHash}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {schedules.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <Pill size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No medicines added yet. Add your first reminder!</p>
                        </div>
                    )}
                </div>

                {/* All Medicines */}
                {schedules.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-white mb-4">All Medicines</h2>
                        <div className="space-y-2">
                            {schedules.map((schedule, i) => (
                                <motion.div key={schedule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass p-4 rounded-xl border border-white/5 flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Pill size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold text-sm">{schedule.medicineName}</p>
                                        <p className="text-slate-500 text-[11px]">{schedule.dosage} • {schedule.times.join(', ')}</p>
                                        {schedule.notes && <p className="text-slate-600 text-[10px] mt-0.5">📝 {schedule.notes}</p>}
                                    </div>
                                    {schedule.blockHash && (
                                        <span className="text-[9px] text-sky-500 font-mono flex items-center gap-0.5"><ShieldCheck size={8} />{schedule.blockHash}</span>
                                    )}
                                    <button onClick={() => deleteSchedule(schedule.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Medicine Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass rounded-3xl border border-white/10 p-6 w-full max-w-md">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">Add Medicine Reminder</h3>
                                    <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400"><X size={18} /></button>
                                </div>

                                <div className="space-y-4">
                                    <input value={medicineName} onChange={e => setMedicineName(e.target.value)} placeholder="Medicine name (e.g. Dolo 650)" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50" />
                                    <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage (e.g. 1 tablet, 5ml)" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50" />

                                    <div>
                                        <p className="text-slate-400 text-sm mb-2">When to take</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {TIME_SLOTS.map(slot => {
                                                const selected = selectedTimes.includes(slot.key);
                                                return (
                                                    <button key={slot.key} onClick={() => setSelectedTimes(prev => selected ? prev.filter(t => t !== slot.key) : [...prev, slot.key])} className={`p-3 rounded-xl text-center transition-all ${selected ? `bg-gradient-to-br ${slot.color} text-white shadow-lg` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                                                        <slot.icon size={18} className="mx-auto mb-1" />
                                                        <span className="text-[10px] block">{slot.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (e.g. Take after food)" rows={2} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 text-sm resize-none" />

                                    <button onClick={addSchedule} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                                        <Zap size={16} /> Save & Blockchain Verify
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AnimatedPage>
    );
};
