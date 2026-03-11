import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, X, Search, AlertTriangle, CheckCircle, Zap, Loader2, Beaker, Shield } from 'lucide-react';
import { checkDrugInteractions } from '../services/apiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatedPage } from '../components/AnimatedPage';
import { toast } from 'sonner';

const DRUG_PRESETS = [
    ['Aspirin', 'Warfarin'],
    ['Metformin', 'Alcohol'],
    ['Ibuprofen', 'Paracetamol'],
    ['Amlodipine', 'Atorvastatin'],
];

const RISK_COLORS = {
    high: 'from-red-500/20 to-red-900/10 border-red-500/30',
    medium: 'from-yellow-500/20 to-yellow-900/10 border-yellow-500/30',
    low: 'from-green-500/20 to-green-900/10 border-green-500/30',
};

export const DrugInteractionPage: React.FC = () => {
    const [medicines, setMedicines] = useState<string[]>(['', '']);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [checkedMeds, setCheckedMeds] = useState<string[]>([]);
    const [provider, setProvider] = useState('');

    const addMedicine = () => {
        if (medicines.length < 10) {
            setMedicines([...medicines, '']);
        }
    };

    const removeMedicine = (index: number) => {
        if (medicines.length > 2) {
            setMedicines(medicines.filter((_, i) => i !== index));
        } else {
            toast.info('You need at least 2 medicines to check interactions.');
        }
    };

    const updateMedicine = (index: number, value: string) => {
        const updated = [...medicines];
        updated[index] = value;
        setMedicines(updated);
    };

    const handlePreset = (preset: string[]) => {
        setMedicines(preset);
        setResult(null);
    };

    const handleCheck = async () => {
        const valid = medicines.filter(m => m.trim().length >= 2);
        if (valid.length < 2) {
            toast.error('Please enter at least 2 medicine names (minimum 2 characters each).');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await checkDrugInteractions(valid);
            setResult(res.text);
            setCheckedMeds(res.medicines_checked);
            setProvider(res.provider);
        } catch (err: any) {
            toast.error(err.message || 'Drug interaction check failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-orange-600/20" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_70%)]" />
                    <div className="relative p-8 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                    <Beaker className="text-white" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white">Drug Interaction Checker</h1>
                                    <p className="text-purple-300 text-sm font-mono">AI-Powered Safety Analysis</p>
                                </div>
                            </div>
                            <p className="text-slate-400 max-w-xl">
                                Enter multiple medicines you're taking or planning to take together. Our AI Council will analyze potential dangerous interactions, suggest safer alternatives, and flag monitoring requirements.
                            </p>
                        </div>
                        <Shield className="text-purple-500/30 hidden md:block flex-shrink-0" size={80} />
                    </div>
                </div>

                {/* Preset Combos */}
                <div className="glass-card p-5 rounded-2xl">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3">Quick Presets — Common Combinations</p>
                    <div className="flex flex-wrap gap-2">
                        {DRUG_PRESETS.map((preset, i) => (
                            <button
                                key={i}
                                onClick={() => handlePreset(preset)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-xs text-slate-300 hover:text-white transition-all font-medium"
                            >
                                {preset.join(' + ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Medicine Inputs */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Pill size={18} className="text-purple-400" />
                        Enter Medicines
                        <span className="ml-auto text-xs text-slate-500 font-mono">{medicines.filter(m => m.trim()).length} / 10 entered</span>
                    </h2>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {medicines.map((med, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex gap-3 items-center group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-purple-400">{index + 1}</span>
                                    </div>
                                    <input
                                        value={med}
                                        onChange={(e) => updateMedicine(index, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && index === medicines.length - 1 && addMedicine()}
                                        placeholder={index === 0 ? "e.g. Aspirin 75mg" : index === 1 ? "e.g. Warfarin 5mg" : `Medicine ${index + 1}...`}
                                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                    />
                                    <button
                                        onClick={() => removeMedicine(index)}
                                        className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-red-400 flex-shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={addMedicine}
                            disabled={medicines.length >= 10}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm transition-all disabled:opacity-40"
                        >
                            <Plus size={16} />
                            Add Medicine
                        </button>

                        <button
                            onClick={handleCheck}
                            disabled={loading}
                            className="flex-1 md:flex-none md:ml-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20 disabled:opacity-60"
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                            ) : (
                                <><Zap size={16} /> Check Interactions</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center gap-4"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-purple-400" size={32} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-semibold">AI Council analyzing interactions...</p>
                                <p className="text-slate-400 text-sm mt-1">Cross-referencing {medicines.filter(m => m.trim()).length} medicines against our database</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Result */}
                <AnimatePresence>
                    {result && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-2xl overflow-hidden"
                        >
                            {/* Result Header */}
                            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/20 px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400" size={20} />
                                    <div>
                                        <h3 className="text-white font-bold">Interaction Analysis Complete</h3>
                                        <p className="text-xs text-slate-400">
                                            Checked: {checkedMeds.join(' • ')}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    via {provider}
                                </span>
                            </div>

                            {/* Scrollable result content */}
                            <div className="p-6 prose-medichain max-h-[600px] overflow-y-auto custom-scrollbar text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                            </div>

                            {/* Warning Footer */}
                            <div className="px-6 py-4 bg-yellow-500/5 border-t border-yellow-500/20 flex items-start gap-3">
                                <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-400/80">
                                    This analysis is AI-generated and for informational purposes only. Always consult your doctor or pharmacist before combining medications.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AnimatedPage>
    );
};
