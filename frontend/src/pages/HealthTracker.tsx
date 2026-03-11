import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, TrendingUp, TrendingDown, Minus, Droplets, Thermometer, Scale, Activity, X, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { AnimatedPage } from '../components/AnimatedPage';
import { secureStorage } from '../services/blockchainService';
import { toast } from 'sonner';

interface HealthReading {
    id: string;
    type: 'bp' | 'sugar' | 'weight' | 'heartRate' | 'temperature';
    value: string;
    value2?: string; // For BP (systolic/diastolic)
    unit: string;
    timestamp: number;
    status: 'normal' | 'high' | 'low' | 'critical';
    blockHash?: string;
}

const VITALS_CONFIG = {
    bp: { label: 'Blood Pressure', icon: Heart, unit: 'mmHg', color: 'from-red-500 to-rose-600', emoji: '❤️' },
    sugar: { label: 'Blood Sugar', icon: Droplets, unit: 'mg/dL', color: 'from-blue-500 to-indigo-600', emoji: '🩸' },
    weight: { label: 'Weight', icon: Scale, unit: 'kg', color: 'from-emerald-500 to-green-600', emoji: '⚖️' },
    heartRate: { label: 'Heart Rate', icon: Activity, unit: 'bpm', color: 'from-pink-500 to-rose-600', emoji: '💓' },
    temperature: { label: 'Temperature', icon: Thermometer, unit: '°F', color: 'from-amber-500 to-orange-600', emoji: '🌡️' },
};

const STORAGE_KEY = 'medichain_health_readings';

function getStatus(type: string, value: number, value2?: number): 'normal' | 'high' | 'low' | 'critical' {
    switch (type) {
        case 'bp': {
            const sys = value, dia = value2 || 80;
            if (sys >= 180 || dia >= 120) return 'critical';
            if (sys >= 140 || dia >= 90) return 'high';
            if (sys < 90 || dia < 60) return 'low';
            return 'normal';
        }
        case 'sugar':
            if (value >= 300) return 'critical';
            if (value >= 200) return 'high';
            if (value < 70) return 'low';
            return 'normal';
        case 'heartRate':
            if (value > 120 || value < 40) return 'critical';
            if (value > 100) return 'high';
            if (value < 60) return 'low';
            return 'normal';
        case 'temperature':
            if (value >= 103) return 'critical';
            if (value >= 100.4) return 'high';
            if (value < 96) return 'low';
            return 'normal';
        default:
            return 'normal';
    }
}

const STATUS_STYLES = {
    normal: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/20', label: '🟢 Normal' },
    high: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/20', label: '🟡 High' },
    low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/20', label: '🔵 Low' },
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/20', label: '🔴 Critical' },
};

export const HealthTrackerPage: React.FC = () => {
    const [readings, setReadings] = useState<HealthReading[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('bp');
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setReadings(JSON.parse(stored));
    }, []);

    const saveReadings = (data: HealthReading[]) => {
        setReadings(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const addReading = async () => {
        const v1 = parseFloat(value1);
        if (isNaN(v1)) { toast.error('Please enter a valid number'); return; }
        const v2 = value2 ? parseFloat(value2) : undefined;

        const status = getStatus(selectedType, v1, v2);
        const blockData = `HEALTH_READING:${selectedType}:${v1}${v2 ? '/' + v2 : ''}:${VITALS_CONFIG[selectedType as keyof typeof VITALS_CONFIG].unit}`;
        const block = await secureStorage.addBlock(blockData);

        const reading: HealthReading = {
            id: crypto.randomUUID(),
            type: selectedType as any,
            value: String(v1),
            value2: v2 !== undefined ? String(v2) : undefined,
            unit: VITALS_CONFIG[selectedType as keyof typeof VITALS_CONFIG].unit,
            timestamp: Date.now(),
            status,
            blockHash: block.hash.slice(0, 12),
        };

        saveReadings([reading, ...readings].slice(0, 200));
        setValue1(''); setValue2(''); setShowForm(false);
        toast.success(`${VITALS_CONFIG[selectedType as keyof typeof VITALS_CONFIG].label} recorded & blockchain-verified ✓`);
        if (status === 'critical') toast.error('⚠️ CRITICAL reading — please consult a doctor immediately!');
    };

    const deleteReading = (id: string) => {
        saveReadings(readings.filter(r => r.id !== id));
        toast.success('Reading deleted');
    };

    // Get latest reading per type
    const getLatest = (type: string): HealthReading | undefined => readings.find(r => r.type === type);

    // Simple sparkline for a vital type
    const getSparklineData = (type: string): number[] => {
        return readings
            .filter(r => r.type === type)
            .slice(0, 7)
            .reverse()
            .map(r => parseFloat(r.value));
    };

    const renderSparkline = (data: number[]) => {
        if (data.length < 2) return null;
        const max = Math.max(...data), min = Math.min(...data);
        const range = max - min || 1;
        const width = 120, height = 32;
        const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');

        return (
            <svg width={width} height={height} className="opacity-60">
                <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
            </svg>
        );
    };

    return (
        <AnimatedPage>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg shadow-pink-500/20">
                                <Heart size={24} className="text-white" />
                            </div>
                            Health Vitals Tracker
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">Track your vitals — every reading is blockchain-verified and tamper-proof</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-sm font-medium shadow-lg shadow-pink-500/20 transition-all">
                        <Plus size={16} /> Add Reading
                    </button>
                </div>

                {/* Vital Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(VITALS_CONFIG).map(([key, config], i) => {
                        const latest = getLatest(key);
                        const sparkData = getSparklineData(key);
                        const statusStyle = latest ? STATUS_STYLES[latest.status] : null;

                        return (
                            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass p-4 rounded-2xl border border-white/5">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-3 shadow-lg`}>
                                    <config.icon size={18} className="text-white" />
                                </div>
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider">{config.label}</p>
                                {latest ? (
                                    <>
                                        <p className="text-white text-xl font-bold mt-1">
                                            {latest.value}{latest.value2 ? `/${latest.value2}` : ''} <span className="text-xs text-slate-500">{config.unit}</span>
                                        </p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyle?.bg} ${statusStyle?.text} ${statusStyle?.border} border font-medium inline-block mt-1`}>
                                            {statusStyle?.label}
                                        </span>
                                        <div className={`mt-2 ${statusStyle?.text}`}>{renderSparkline(sparkData)}</div>
                                    </>
                                ) : (
                                    <p className="text-slate-600 text-sm mt-1">No data</p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Add Reading Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass rounded-3xl border border-white/10 p-6 w-full max-w-md">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">Add Health Reading</h3>
                                    <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400"><X size={18} /></button>
                                </div>

                                {/* Type Selector */}
                                <div className="grid grid-cols-5 gap-2 mb-6">
                                    {Object.entries(VITALS_CONFIG).map(([key, config]) => (
                                        <button key={key} onClick={() => setSelectedType(key)} className={`p-3 rounded-xl text-center transition-all ${selectedType === key ? `bg-gradient-to-br ${config.color} text-white shadow-lg` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                                            <span className="text-lg block">{config.emoji}</span>
                                            <span className="text-[9px] block mt-1">{config.label.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Value Input */}
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input value={value1} onChange={e => setValue1(e.target.value)} type="number" placeholder={selectedType === 'bp' ? 'Systolic (e.g. 120)' : `Value (${VITALS_CONFIG[selectedType as keyof typeof VITALS_CONFIG].unit})`} className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 text-lg font-bold text-center" />
                                        {selectedType === 'bp' && (
                                            <input value={value2} onChange={e => setValue2(e.target.value)} type="number" placeholder="Diastolic (e.g. 80)" className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 text-lg font-bold text-center" />
                                        )}
                                    </div>
                                    <button onClick={addReading} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20">
                                        <Zap size={16} /> Save & Blockchain Verify
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recent Readings */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Recent Readings</h2>
                    <div className="space-y-2">
                        {readings.slice(0, 20).map((reading, i) => {
                            const config = VITALS_CONFIG[reading.type];
                            const statusStyle = STATUS_STYLES[reading.status];
                            return (
                                <motion.div key={reading.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass p-4 rounded-xl border border-white/5 flex items-center gap-4 group">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                                        <config.icon size={16} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-sm">{config.label}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border font-medium`}>{statusStyle.label}</span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] mt-0.5">{new Date(reading.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{reading.value}{reading.value2 ? `/${reading.value2}` : ''} <span className="text-xs text-slate-500">{reading.unit}</span></p>
                                        {reading.blockHash && <p className="text-[9px] text-teal-500 font-mono flex items-center gap-1 justify-end"><ShieldCheck size={8} />{reading.blockHash}</p>}
                                    </div>
                                    <button onClick={() => deleteReading(reading.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            );
                        })}
                        {readings.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <Heart size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No readings yet. Start tracking your vitals!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};
