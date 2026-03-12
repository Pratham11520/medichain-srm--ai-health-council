import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, Hash, Link2, Clock, Database, Lock, Unlock, RefreshCcw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Loader2, ArrowRight, Fingerprint, Eye } from 'lucide-react';
import { secureStorage, calculateHash, getLedgerStats } from '../services/blockchainService';
import { Block } from '../types';
import { AnimatedPage } from '../components/AnimatedPage';

export const LedgerExplorerPage: React.FC = () => {
    const [chain, setChain] = useState<Block[]>([]);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [validating, setValidating] = useState(false);
    const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
    const [tamperTarget, setTamperTarget] = useState<number | null>(null);
    const [tamperDetected, setTamperDetected] = useState(false);
    const [stats, setStats] = useState<ReturnType<typeof getLedgerStats> | null>(null);
    const [liveAdding, setLiveAdding] = useState(false);

    const refreshChain = useCallback(() => {
        setChain([...secureStorage.chain]);
        setStats(getLedgerStats());
    }, []);

    useEffect(() => {
        refreshChain();
    }, [refreshChain]);

    // Validate the entire chain
    const handleValidate = async () => {
        setValidating(true);
        setTamperDetected(false);
        await new Promise(r => setTimeout(r, 800)); // Simulate processing
        const valid = await secureStorage.isValid();
        setIsValid(valid);
        setTamperDetected(!valid);
        setValidating(false);
    };

    // Add a demo block to the chain (live demonstration)
    const handleAddDemoBlock = async () => {
        setLiveAdding(true);
        const demoData = `DEMO_BLOCK:${Date.now()}:sample_medical_record_hash`;
        await secureStorage.addBlock(demoData);
        refreshChain();
        setLiveAdding(false);
        setIsValid(null); // Reset validation after modification
    };

    // Simulate tampering with a block (for demonstration)
    const handleTamper = async (index: number) => {
        if (index === 0) return; // Can't tamper with genesis
        setTamperTarget(index);
        // Directly mutate the block data to simulate tampering
        secureStorage.chain[index] = {
            ...secureStorage.chain[index],
            data: "TAMPERED_DATA_" + Math.random().toString(36).slice(2, 8),
        };
        refreshChain();
        setIsValid(null);
        setTimeout(() => setTamperTarget(null), 2000);
    };

    // Restore chain integrity (reset)
    const handleResetChain = () => {
        // Rebuild from scratch
        secureStorage.chain = [secureStorage.createGenesisBlock()];
        refreshChain();
        setIsValid(null);
        setTamperDetected(false);
        setTamperTarget(null);
    };

    const formatTimestamp = (ts: number) => {
        return new Date(ts).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    };

    const truncateHash = (hash: string, len = 12) => {
        if (hash.length <= len * 2) return hash;
        return hash.slice(0, len) + '...' + hash.slice(-len);
    };

    return (
        <AnimatedPage>
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/20">
                                <Shield size={24} className="text-white" />
                            </div>
                            Hash Ledger Explorer
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">
                            Blockchain-inspired tamper-evident record chaining — see how your data is secured in real time
                        </p>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleValidate}
                            disabled={validating}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                        >
                            {validating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                            Validate Chain
                        </button>
                        <button
                            onClick={handleAddDemoBlock}
                            disabled={liveAdding}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all disabled:opacity-50"
                        >
                            {liveAdding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                            Add Demo Block
                        </button>
                        <button
                            onClick={handleResetChain}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-sm font-medium transition-all"
                        >
                            <RefreshCcw size={16} />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Validation Status Banner */}
                <AnimatePresence>
                    {isValid !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className={`rounded-2xl p-5 border ${isValid
                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                    : 'bg-red-500/10 border-red-500/20'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {isValid ? (
                                    <>
                                        <CheckCircle2 size={24} className="text-emerald-400" />
                                        <div>
                                            <p className="text-emerald-400 font-bold">Chain Integrity Verified ✓</p>
                                            <p className="text-emerald-400/70 text-sm">All {chain.length} blocks validated — no tampering detected. Every hash matches its computed value.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert size={24} className="text-red-400" />
                                        <div>
                                            <p className="text-red-400 font-bold">⚠ Tampering Detected!</p>
                                            <p className="text-red-400/70 text-sm">Chain integrity compromised — block data was modified but its hash was not recomputed. This is how tamper detection works.</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Blocks', value: chain.length, icon: Database, color: 'from-sky-500 to-blue-600' },
                        { label: 'Hash Algorithm', value: 'SHA-256', icon: Fingerprint, color: 'from-violet-500 to-purple-600' },
                        { label: 'Encryption', value: 'AES-256-GCM', icon: Lock, color: 'from-amber-500 to-orange-600' },
                        { label: 'Chain Status', value: isValid === null ? 'Unchecked' : isValid ? 'Valid ✓' : 'Broken ✗', icon: isValid === false ? ShieldAlert : ShieldCheck, color: isValid === false ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-green-600' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-5 rounded-2xl border border-white/5"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <stat.icon size={18} className="text-white" />
                            </div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider">{stat.label}</p>
                            <p className="text-white text-xl font-bold mt-1">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* How It Works */}
                <div className="glass rounded-2xl border border-white/5 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Eye size={18} className="text-sky-400" />
                        How the Hash Ledger Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                step: '1',
                                title: 'Data Entry',
                                desc: 'Every action (chat, login, profile save) is captured as a record with a timestamp.',
                                icon: Database,
                                color: 'text-sky-400 bg-sky-500/10',
                            },
                            {
                                step: '2',
                                title: 'SHA-256 Hashing',
                                desc: 'The record + previous hash + index are combined and hashed with SHA-256 to create a unique fingerprint.',
                                icon: Fingerprint,
                                color: 'text-violet-400 bg-violet-500/10',
                            },
                            {
                                step: '3',
                                title: 'Chain Linking',
                                desc: 'Each block stores the previous block\'s hash, creating a tamper-evident chain. Changing one block invalidates all subsequent blocks.',
                                icon: Link2,
                                color: 'text-amber-400 bg-amber-500/10',
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.15 }}
                                className="glass p-5 rounded-xl border border-white/5 relative"
                            >
                                <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                                    <item.icon size={18} />
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                                {i < 2 && (
                                    <ArrowRight size={16} className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-600 z-10" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Block Chain Visualization */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Link2 size={18} className="text-sky-400" />
                        Live Block Chain ({chain.length} blocks)
                    </h2>

                    <div className="space-y-3">
                        {chain.map((block, index) => {
                            const isExpanded = expandedBlock === block.index;
                            const isGenesis = block.index === 0;
                            const isTampered = tamperTarget === block.index;

                            return (
                                <motion.div
                                    key={block.index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    {/* Chain link connector */}
                                    {index > 0 && (
                                        <div className="flex items-center gap-2 py-1 pl-8">
                                            <div className="w-0.5 h-4 bg-gradient-to-b from-sky-500/50 to-sky-500/20" />
                                            <span className="text-[10px] font-mono text-sky-500/50">
                                                prev_hash: {block.previousHash.slice(0, 16)}...
                                            </span>
                                        </div>
                                    )}

                                    <div
                                        className={`glass rounded-2xl border transition-all cursor-pointer overflow-hidden ${isTampered
                                                ? 'border-red-500/40 bg-red-500/5 ring-1 ring-red-500/20'
                                                : isGenesis
                                                    ? 'border-sky-500/20 bg-gradient-to-r from-sky-900/20 to-transparent'
                                                    : 'border-white/5 hover:border-white/10'
                                            }`}
                                        onClick={() => setExpandedBlock(isExpanded ? null : block.index)}
                                    >
                                        {/* Block Header */}
                                        <div className="p-4 flex items-center gap-4">
                                            {/* Block Index Badge */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${isGenesis
                                                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20'
                                                    : isTampered
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-white/5 text-slate-300'
                                                }`}>
                                                #{block.index}
                                            </div>

                                            {/* Block Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold text-sm">
                                                        {isGenesis ? '🏁 Genesis Block' : `Block #${block.index}`}
                                                    </span>
                                                    {isTampered && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium border border-red-500/20">
                                                            TAMPERED
                                                        </span>
                                                    )}
                                                    {isGenesis && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium border border-sky-500/20">
                                                            ORIGIN
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-xs font-mono break-all mt-1">
                                                    <Hash size={10} className="inline mr-1" />
                                                    {truncateHash(block.hash)}
                                                </p>
                                            </div>

                                            {/* Timestamp */}
                                            <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs">
                                                <Clock size={12} />
                                                {formatTimestamp(block.timestamp)}
                                            </div>

                                            {/* Expand indicator */}
                                            <div className="text-slate-500">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>

                                        {/* Expanded Block Details */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="border-t border-white/5"
                                                >
                                                    <div className="p-5 space-y-4">
                                                        {/* Hash Details Grid */}
                                                        <div className="grid md:grid-cols-2 gap-3">
                                                            <div className="bg-black/30 rounded-xl p-4">
                                                                <p className="text-[10px] text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                    <Fingerprint size={10} /> Block Hash (SHA-256)
                                                                </p>
                                                                <p className="text-xs font-mono text-white break-all leading-relaxed">
                                                                    {block.hash}
                                                                </p>
                                                            </div>
                                                            <div className="bg-black/30 rounded-xl p-4">
                                                                <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                    <Link2 size={10} /> Previous Hash
                                                                </p>
                                                                <p className="text-xs font-mono text-white break-all leading-relaxed">
                                                                    {block.previousHash === '0' ? '0 (Genesis — no previous block)' : block.previousHash}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Block Data */}
                                                        <div className="bg-black/30 rounded-xl p-4">
                                                            <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                <Database size={10} /> Stored Data
                                                            </p>
                                                            <p className="text-xs font-mono text-slate-300 break-all leading-relaxed">
                                                                {block.data}
                                                            </p>
                                                        </div>

                                                        {/* Metadata */}
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                            <div className="bg-black/20 rounded-lg p-3">
                                                                <p className="text-[10px] text-slate-500 uppercase">Index</p>
                                                                <p className="text-white font-mono text-sm">{block.index}</p>
                                                            </div>
                                                            <div className="bg-black/20 rounded-lg p-3">
                                                                <p className="text-[10px] text-slate-500 uppercase">Timestamp</p>
                                                                <p className="text-white font-mono text-sm">{block.timestamp}</p>
                                                            </div>
                                                            <div className="bg-black/20 rounded-lg p-3">
                                                                <p className="text-[10px] text-slate-500 uppercase">Readable Time</p>
                                                                <p className="text-white font-mono text-sm">{formatTimestamp(block.timestamp)}</p>
                                                            </div>
                                                        </div>

                                                        {/* Hash Composition Formula */}
                                                        <div className="bg-gradient-to-r from-sky-900/20 to-transparent rounded-xl p-4 border border-sky-500/10">
                                                            <p className="text-[10px] text-sky-400 uppercase tracking-wider mb-2">Hash Computed From</p>
                                                            <p className="text-xs font-mono text-slate-300">
                                                                <span className="text-sky-400">SHA256</span>(
                                                                <span className="text-amber-400">{block.index}</span> +
                                                                <span className="text-violet-400">{block.previousHash.slice(0, 8)}...</span> +
                                                                <span className="text-cyan-400">{block.timestamp}</span> +
                                                                <span className="text-rose-400">data</span>
                                                                )
                                                            </p>
                                                        </div>

                                                        {/* Tamper Demo Button */}
                                                        {!isGenesis && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTamper(block.index);
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all"
                                                            >
                                                                <AlertTriangle size={14} />
                                                                Simulate Tampering (Demo)
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="glass rounded-2xl border border-white/5 p-5">
                    <p className="text-slate-500 text-xs leading-relaxed">
                        <span className="text-amber-400 font-bold">⚠ Prototype Disclaimer:</span>{' '}
                        This is a blockchain-inspired hash ledger simulation for educational purposes. It runs client-side in the browser —
                        no distributed nodes, no consensus, no persistence between sessions. It demonstrates the <em>principle</em> of tamper-evident
                        record chaining using SHA-256 hashes and AES-256-GCM encryption, not a production blockchain.
                    </p>
                </div>
            </div>
        </AnimatedPage>
    );
};
