// ==========================================
// Medicine Verification Card Component
// Shows verified medicines with pharmacy buy
// links (1mg, Apollo, Netmeds, PharmEasy)
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ExternalLink, ChevronDown, ChevronUp, IndianRupee, Pill, Tag } from 'lucide-react';
import { verifyMedicationsInText, getUnverifiedLinks, type VerifiedMedication } from '../services/medicationVerifier';

interface MedicineCardProps {
    aiResponseText: string;
}

const PHARMACY_COLORS: Record<string, string> = {
    '1mg': 'bg-[#ff6f61]/20 text-[#ff6f61] hover:bg-[#ff6f61]/30 border-[#ff6f61]/20',
    'Apollo': 'bg-[#00b7eb]/20 text-[#00b7eb] hover:bg-[#00b7eb]/30 border-[#00b7eb]/20',
    'Netmeds': 'bg-[#27ae60]/20 text-[#27ae60] hover:bg-[#27ae60]/30 border-[#27ae60]/20',
    'PharmEasy': 'bg-[#e74c3c]/20 text-[#e74c3c] hover:bg-[#e74c3c]/30 border-[#e74c3c]/20',
};

export const MedicineVerificationCard: React.FC<MedicineCardProps> = ({ aiResponseText }) => {
    const [verified, setVerified] = useState<VerifiedMedication[]>([]);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        if (aiResponseText) {
            const results = verifyMedicationsInText(aiResponseText);
            setVerified(results);
        }
    }, [aiResponseText]);

    if (verified.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 space-y-2"
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    {verified.length} Medicine{verified.length > 1 ? 's' : ''} Verified from Indian Database
                </span>
            </div>

            {/* Medicine Cards */}
            {verified.map((med) => {
                const isExpanded = expanded === med.brandName;
                const brandPrice = med.priceRange;
                const genericPrice = med.genericPrice;

                return (
                    <motion.div
                        key={med.brandName}
                        layout
                        className="rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] overflow-hidden"
                    >
                        {/* Main Card */}
                        <div
                            className="p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => setExpanded(isExpanded ? null : med.brandName)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-emerald-400 flex-shrink-0" />
                                        <span className="text-sm font-bold text-white truncate">{med.brandName}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium flex-shrink-0">
                                            ✓ VERIFIED
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                        <span className="text-slate-500">Generic:</span> {med.genericName} • {med.category}
                                    </p>
                                </div>

                                {/* Price Column */}
                                <div className="text-right flex-shrink-0">
                                    <div className="flex items-center gap-1 text-xs">
                                        <span className="text-slate-500 line-through">{brandPrice}</span>
                                        <span className="text-emerald-400 font-bold">{genericPrice}</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5 justify-end">
                                        <Tag size={9} /> Save with generic
                                    </p>
                                </div>
                            </div>

                            {/* Buy Buttons Row */}
                            <div className="flex items-center gap-1.5 mt-2.5">
                                <span className="text-[10px] text-slate-500 mr-1">Buy on:</span>
                                {med.buyLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${PHARMACY_COLORS[link.label] || 'bg-white/10 text-white border-white/10'}`}
                                    >
                                        {link.label}
                                        <ExternalLink size={8} />
                                    </a>
                                ))}
                            </div>

                            <div className="flex items-center justify-center mt-2">
                                {isExpanded ? (
                                    <ChevronUp size={14} className="text-slate-500" />
                                ) : (
                                    <ChevronDown size={14} className="text-slate-500" />
                                )}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-3 pb-3 pt-1 border-t border-white/[0.05] space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div>
                                                <span className="text-slate-500">Dosage:</span>
                                                <p className="text-slate-300">{med.dosage}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Category:</span>
                                                <p className="text-slate-300">{med.category}</p>
                                            </div>
                                        </div>

                                        {med.sideEffects.length > 0 && (
                                            <div className="text-[11px]">
                                                <span className="text-yellow-500">⚠ Side Effects:</span>
                                                <p className="text-yellow-400/70">{med.sideEffects.join(', ')}</p>
                                            </div>
                                        )}

                                        {med.contraindications.length > 0 && (
                                            <div className="text-[11px]">
                                                <span className="text-red-400">🚫 Contraindications:</span>
                                                <p className="text-red-400/70">{med.contraindications.join(', ')}</p>
                                            </div>
                                        )}

                                        {med.genericAlternative && (
                                            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px]">
                                                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
                                                    <IndianRupee size={10} /> Generic Alternative (Save Money)
                                                </div>
                                                <p className="text-slate-300">
                                                    {med.genericAlternative.name} — <span className="text-emerald-400 font-bold">{med.genericAlternative.price}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default MedicineVerificationCard;
