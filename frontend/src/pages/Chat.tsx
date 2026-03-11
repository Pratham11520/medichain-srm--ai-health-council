import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, ChatMessage, ChatSession } from '../types';
import { chatWithBackend, searchMedicines, MedicineRecord, AIResponse } from '../services/apiService';
import { jsPDF } from 'jspdf';
import { secureStorage } from '../services/blockchainService';
import { saveChatHistory, loadChatHistory } from '../services/storageService';
import { MedicineVerificationCard } from '../components/MedicineCard';
import {
  Send, Loader2, Bot, User, Hash, Paperclip, X,
  ShieldCheck, AlertTriangle, Pill, Search, Zap,
  Copy, Check, ChevronDown, Sparkles, MessageSquare,
  RefreshCw, History, FileDown, Share2, Clock,
  ChevronRight, Trash2, Mic, MicOff, Shield, Volume2, VolumeX, Globe
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { toast } from 'sonner';

interface ChatProps {
  user: UserProfile;
}

const QUICK_PROMPTS = [
  { icon: '🤒', text: 'I have fever and body pain since 2 days' },
  { icon: '💊', text: 'What is the generic alternative to Dolo 650?' },
  { icon: '🩺', text: 'My blood sugar is 280 mg/dL, what should I do?' },
  { icon: '😴', text: 'I have severe headache and cannot sleep' },
];

export const ChatPage: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [medResults, setMedResults] = useState<MedicineRecord[]>([]);
  const [medLoading, setMedLoading] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicineRecord | null>(null);
  const [showMedPanel, setShowMedPanel] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Language & TTS state
  const [chatLang, setChatLang] = useState<'en' | 'hi'>('en');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Text-to-Speech read-aloud
  const speakText = (msgId: string, text: string) => {
    if (speakingId === msgId) {
      // Stop speaking
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Clean markdown for speech
    const cleanText = text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      .replace(/\|[^|]+\|/g, '')
      .replace(/[-*]\s/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 3000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = chatLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = chatLang === 'hi' ? 'hi' : 'en';
    const preferred = voices.find(v => v.lang.startsWith(langPrefix) && v.localService);
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Confidence data per message
  const [confidenceMap, setConfidenceMap] = useState<Record<string, {
    confidence: string;
    quality_score: number;
    providers_consulted: any[];
    response_id: string;
    provider: string;
  }>>({});

  // Load saved chat history on mount
  useEffect(() => {
    loadChatHistory(user.email).then(sessions => {
      setSavedSessions(sessions);
    });
  }, [user.email]);

  // Auto-save chat after each message
  useEffect(() => {
    if (messages.length > 0) {
      const currentSession: ChatSession = {
        id: currentSessionId,
        title: messages[0]?.text.slice(0, 50) || 'New Consultation',
        messages,
        createdAt: messages[0]?.timestamp || Date.now(),
        updatedAt: Date.now(),
      };

      // Update or add current session
      const updated = savedSessions.filter(s => s.id !== currentSessionId);
      const allSessions = [currentSession, ...updated].slice(0, 50); // Keep max 50
      setSavedSessions(allSessions);
      saveChatHistory(user.email, allSessions);
    }
  }, [messages]);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Show scroll-to-bottom button when user scrolls up
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handler = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setShowScrollBtn(!nearBottom);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const sendMessage = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: Date.now(),
      hash: 'computing...',
      prevHash: messages[messages.length - 1]?.hash || '0'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      await secureStorage.addBlock(`CHAT:${user.email}:${text.slice(0, 80)}`);

      const historyText = messages.slice(-10).map(m => `${m.role === 'user' ? 'Patient' : 'MediBot'}: ${m.text}`);
      // Add language instruction to the query
      const langInstruction = chatLang === 'hi'
        ? '\n\n[IMPORTANT: Respond in Hindi (हिंदी) using Devanagari script. Use simple Hindi that common people understand. Include medicine names in English.]'
        : '';
      const response = await chatWithBackend(text + langInstruction, historyText, user);

      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(response.text));
      const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        hash: hashHex,
        prevHash: userMsg.id
      };

      // Blockchain-verify the AI response
      await secureStorage.addBlock(`RESPONSE:${hashHex.slice(0, 16)}:${response.provider || 'unknown'}`);

      // Store confidence data for this message
      setConfidenceMap(prev => ({
        ...prev,
        [aiMsg.id]: {
          confidence: response.confidence || 'unknown',
          quality_score: response.quality_score || 0,
          providers_consulted: response.providers_consulted || [],
          response_id: response.response_id || '',
          provider: response.provider || 'unknown',
        }
      }));

      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], hash: hashHex.slice(0, 16) },
        aiMsg
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Connection failed. Please try again.');
      setMessages(prev => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleMedSearch = async () => {
    if (!medSearch.trim()) return;
    setMedLoading(true);
    try {
      const results = await searchMedicines(medSearch, 8);
      setMedResults(results);
      if (results.length === 0) toast.info('No medicines found for that query.');
    } catch {
      toast.error('Medicine search failed.');
    } finally {
      setMedLoading(false);
    }
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
    setCurrentSessionId(crypto.randomUUID());
    toast.success('Chat cleared. Starting new consultation.');
  };

  // Load a saved session
  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistory(false);
    toast.success(`Loaded: ${session.title}`);
  };

  // Delete a saved session
  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSessions.filter(s => s.id !== sessionId);
    setSavedSessions(updated);
    await saveChatHistory(user.email, updated);
    if (sessionId === currentSessionId) {
      setMessages([]);
      setCurrentSessionId(crypto.randomUUID());
    }
    toast.success('Consultation deleted');
  };

  // Export chat as professional PDF
  const exportChat = () => {
    if (messages.length === 0) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 128, 128);
      doc.text('MediChain SRM', pageWidth / 2, y, { align: 'center' });
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('AI Health Council — Consultation Report', pageWidth / 2, y, { align: 'center' });
      y += 12;

      // Patient info
      doc.setDrawColor(0, 128, 128);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Patient: ${user.name}`, 14, y);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, y, { align: 'right' });
      y += 6;
      doc.text(`Email: ${user.email}`, 14, y);
      doc.text(`Blockchain: Verified ✓`, pageWidth - 14, y, { align: 'right' });
      y += 10;
      doc.line(14, y, pageWidth - 14, y);
      y += 10;

      // Messages
      messages.forEach(msg => {
        if (y > 270) { doc.addPage(); y = 20; }
        const sender = msg.role === 'user' ? `👤 ${user.name}` : '🤖 MediBot AI';
        doc.setFontSize(9);
        doc.setTextColor(msg.role === 'user' ? 0 : 0, msg.role === 'user' ? 100 : 128, msg.role === 'user' ? 180 : 128);
        doc.text(sender, 14, y);
        const time = new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        doc.text(time, pageWidth - 14, y, { align: 'right' });
        y += 5;

        // Confidence badge for AI messages
        if (msg.role === 'model' && confidenceMap[msg.id]) {
          const conf = confidenceMap[msg.id];
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(`Confidence: ${conf.confidence.toUpperCase()} | Quality: ${conf.quality_score}/100 | Provider: ${conf.provider}`, 14, y);
          y += 5;
        }

        doc.setFontSize(9);
        doc.setTextColor(40);
        const lines = doc.splitTextToSize(msg.text, pageWidth - 28);
        lines.forEach((line: string) => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(line, 14, y);
          y += 4.5;
        });
        y += 6;
      });

      // Footer
      if (y > 260) { doc.addPage(); y = 20; }
      y += 5;
      doc.line(14, y, pageWidth - 14, y);
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('⚕️ DISCLAIMER: AI-assisted guidance only. Consult a qualified MBBS/MD doctor.', 14, y);
      y += 4;
      doc.text('Verify medicines: 1mg.com | apollopharmacy.in | netmeds.com', 14, y);
      y += 4;
      doc.text(`Report ID: ${crypto.randomUUID().slice(0, 8)} | Generated: ${new Date().toISOString()}`, 14, y);

      doc.save(`MediChain_Consultation_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('📄 PDF consultation report downloaded!');
    } catch (err) {
      // Fallback to text export
      const text = messages.map(m =>
        `[${new Date(m.timestamp).toLocaleString()}] ${m.role === 'user' ? user.name : 'MediBot'}:\n${m.text}\n`
      ).join('\n---\n\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MediChain_Consultation_${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Consultation exported (text fallback)');
    }
  };

  // Share via WhatsApp or system share
  const shareChat = async () => {
    if (messages.length === 0) return;
    const lastAI = [...messages].reverse().find(m => m.role === 'model');
    if (!lastAI) return;

    const shareText = `🏥 *MediChain AI Consultation*\n\n${lastAI.text.slice(0, 800)}\n\n⚕️ _Powered by MediChain SRM — AI Health Council_\n🔗 Verify medicines: 1mg.com | apollopharmacy.in`;

    // Try WhatsApp first (most popular in India)
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp to share...');
  };

  return (
    <AnimatedPage>
      <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-48px)] -m-4 md:-m-8">

        {/* ── Consultations Sidebar ─────────────────── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full border-r border-white/5 bg-[#0a0e1a] flex flex-col overflow-hidden flex-shrink-0"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-teal-400" />
                  <h3 className="text-sm font-bold text-white">My Consultations</h3>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {savedSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <History size={24} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No saved consultations yet</p>
                  </div>
                ) : (
                  savedSessions.map(session => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => loadSession(session)}
                      className={`p-3 rounded-xl cursor-pointer transition-all group ${session.id === currentSessionId
                        ? 'bg-teal-500/10 border border-teal-500/20'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border border-transparent'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {session.title || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock size={8} />
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-slate-600">
                              {session.messages.length} msgs
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Chat Area ───────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── Chat Header ───────────────────────────── */}
          <div className="bg-[#0d1220]/80 border-b border-white/5 px-5 py-3 flex items-center justify-between backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-all ${showHistory ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                title="My Consultations"
              >
                <History size={16} />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d1220]" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">MediBot Council</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[11px] text-green-400">Online • Blockchain Verified • 254k+ Medicines</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <>
                  <button
                    onClick={shareChat}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10"
                    title="Share consultation"
                  >
                    <Share2 size={13} />
                  </button>
                  <button
                    onClick={exportChat}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10"
                    title="Export consultation"
                  >
                    <FileDown size={13} />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowMedPanel(!showMedPanel)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showMedPanel
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                  }`}
              >
                <Pill size={13} />
                <span className="hidden sm:inline">Verify Medicine</span>
              </button>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all border border-white/10"
                  title="New consultation"
                >
                  <RefreshCw size={13} />
                </button>
              )}
            </div>
          </div>

          {/* ── Medicine Verify Panel ──────────────────── */}
          <AnimatePresence>
            {showMedPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-white/5 bg-teal-950/20 flex-shrink-0"
              >
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    <input
                      value={medSearch}
                      onChange={e => setMedSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleMedSearch()}
                      placeholder="Search medicine, salt, or condition..."
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                    />
                    <button
                      onClick={handleMedSearch}
                      disabled={medLoading}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 rounded-xl text-white text-sm transition-colors disabled:opacity-50"
                    >
                      {medLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                    </button>
                  </div>

                  {medResults.length > 0 && (
                    <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                      {medResults.map((med, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => setSelectedMed(selectedMed?.medicine_name === med.medicine_name ? null : med)}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${selectedMed?.medicine_name === med.medicine_name
                            ? 'bg-teal-500/20 border border-teal-500/40'
                            : 'bg-white/5 border border-white/5 hover:border-white/15'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShieldCheck size={13} className="text-green-400" />
                              <span className="text-white font-medium text-xs">{med.medicine_name}</span>
                            </div>
                            <span className="text-xs text-teal-400 font-mono">₹{med.price_inr}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            Salt: {med.salt_composition} • {med.dosage_form}
                          </p>

                          <AnimatePresence>
                            {selectedMed?.medicine_name === med.medicine_name && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 pt-3 border-t border-white/10 space-y-1 text-[11px]"
                              >
                                <div><span className="text-slate-500">Uses: </span><span className="text-slate-300">{med.primary_uses}</span></div>
                                <div><span className="text-slate-500">Dosage: </span><span className="text-slate-300">{med.dosage_adult}</span></div>
                                <div><span className="text-slate-500">Side Effects: </span><span className="text-yellow-400/80">{med.common_side_effects}</span></div>
                                <div><span className="text-slate-500">Interactions: </span><span className="text-orange-400/80">{med.drug_interactions}</span></div>
                                {med.is_high_risk === 'True' && (
                                  <div className="flex items-center gap-1 text-red-400 font-bold">
                                    <AlertTriangle size={11} /> HIGH RISK MEDICINE
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Messages Area ─────────────────────────── */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-5 custom-scrollbar"
          >
            {/* Empty state with quick prompts */}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={36} className="text-teal-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Ask MediBot Anything</h3>
                  <p className="text-slate-400 text-sm">Backed by 254,000+ verified Indian medicines • Blockchain secured</p>
                  <p className="text-slate-500 text-xs mt-1">Buy medicines directly from 1mg, Apollo, Netmeds & PharmEasy</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => sendMessage(qp.text)}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 text-left transition-all group"
                    >
                      <span className="text-xl">{qp.icon}</span>
                      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{qp.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold self-end ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                    : 'bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10'
                    }`}>
                    {msg.role === 'user' ? user.name.charAt(0).toUpperCase() : <Bot size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className={`relative group max-w-[78%] md:max-w-[68%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-lg ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-br-sm'
                      : 'bg-[#151b2d] border border-white/[0.07] text-slate-200 rounded-bl-sm'
                      }`}>
                      {msg.role === 'model' ? (
                        <div className="prose-medichain text-sm leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      )}
                    </div>

                    {/* Medicine Verification Cards — shown under AI responses */}
                    {msg.role === 'model' && (
                      <MedicineVerificationCard aiResponseText={msg.text} />
                    )}

                    {/* Meta row */}
                    <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] text-slate-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-mono text-slate-700 flex items-center gap-0.5">
                        <Hash size={8} />{msg.hash.substring(0, 6)}
                      </span>
                      {msg.role === 'model' && (
                        <>
                          <button
                            onClick={() => copyMessage(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedId === msg.id ? (
                              <Check size={11} className="text-green-400" />
                            ) : (
                              <Copy size={11} className="text-slate-600 hover:text-slate-400" />
                            )}
                          </button>
                          <button
                            onClick={() => speakText(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title={speakingId === msg.id ? 'Stop reading' : `Read aloud (${chatLang === 'hi' ? 'हिंदी' : 'English'})`}
                          >
                            {speakingId === msg.id ? (
                              <VolumeX size={11} className="text-teal-400 animate-pulse" />
                            ) : (
                              <Volume2 size={11} className="text-slate-600 hover:text-teal-400" />
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Confidence Badge — shown under AI responses */}
                    {msg.role === 'model' && confidenceMap[msg.id] && (
                      <div className="flex items-center gap-2 mt-1.5 px-1 flex-wrap">
                        {/* Confidence Level */}
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${confidenceMap[msg.id].confidence === 'high'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : confidenceMap[msg.id].confidence === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : confidenceMap[msg.id].confidence === 'cached'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                          <Shield size={9} />
                          {confidenceMap[msg.id].confidence === 'high' ? '🟢 HIGH CONFIDENCE'
                            : confidenceMap[msg.id].confidence === 'medium' ? '🟡 MEDIUM'
                              : confidenceMap[msg.id].confidence === 'cached' ? '🔵 CACHED'
                                : '🔴 FALLBACK'}
                        </span>
                        {/* Quality Score */}
                        <span className="text-[10px] text-slate-500">
                          Q:{confidenceMap[msg.id].quality_score}
                        </span>
                        {/* Provider */}
                        <span className="text-[10px] text-slate-600">
                          via {confidenceMap[msg.id].provider}
                        </span>
                        {/* Providers consulted count */}
                        {confidenceMap[msg.id].providers_consulted.length > 0 && (
                          <span className="text-[9px] text-slate-700">
                            ({confidenceMap[msg.id].providers_consulted.filter(p => p.status === 'success').length} providers)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3 items-end"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-[#151b2d] border border-white/[0.07] rounded-2xl rounded-bl-sm px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="absolute bottom-24 right-6 w-9 h-9 rounded-full bg-teal-500 shadow-lg shadow-teal-500/30 flex items-center justify-center text-white z-10"
              >
                <ChevronDown size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Input Area ────────────────────────────── */}
          <div className="flex-shrink-0 border-t border-white/5 bg-[#0d1220]/80 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Type your health question... (Shift+Enter for new line)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 resize-none min-h-[46px] max-h-32 overflow-y-auto custom-scrollbar transition-all"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 128) + 'px';
                  }}
                />
                {/* Character count */}
                {input.length > 1500 && (
                  <span className={`absolute bottom-2 right-3 text-[10px] font-mono ${input.length > 1900 ? 'text-red-400' : 'text-slate-500'}`}>
                    {input.length}/2000
                  </span>
                )}
              </div>

              {/* Language Toggle */}
              <button
                onClick={() => {
                  const next = chatLang === 'en' ? 'hi' : 'en';
                  setChatLang(next);
                  toast.success(next === 'hi' ? '🇮🇳 हिंदी mode activated' : '🌐 English mode activated');
                }}
                className="h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0 flex items-center gap-1.5 text-xs font-bold"
                title={`Switch to ${chatLang === 'en' ? 'Hindi' : 'English'}`}
              >
                <Globe size={14} />
                {chatLang === 'en' ? 'EN' : 'हिं'}
              </button>

              {/* Voice Input Button */}
              <button
                onClick={() => {
                  if (isListening) {
                    recognitionRef.current?.stop();
                    setIsListening(false);
                    return;
                  }
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SpeechRecognition) {
                    toast.error('Voice input not supported in this browser. Use Chrome or Edge.');
                    return;
                  }
                  try {
                    const recognition = new SpeechRecognition();
                    recognition.lang = chatLang === 'hi' ? 'hi-IN' : 'en-IN';
                    recognition.interimResults = false;
                    recognition.continuous = false;
                    recognition.maxAlternatives = 1;
                    recognition.onresult = (event: any) => {
                      const transcript = event.results[0][0].transcript;
                      setInput(prev => prev ? prev + ' ' + transcript : transcript);
                      toast.success(`🎤 "${transcript.slice(0, 40)}..."`);
                    };
                    recognition.onend = () => setIsListening(false);
                    recognition.onerror = (e: any) => {
                      setIsListening(false);
                      if (e.error === 'no-speech') {
                        toast.info('No speech detected. Try again and speak clearly.');
                      } else if (e.error === 'not-allowed') {
                        toast.error('Microphone access denied. Allow mic in browser settings.');
                      } else {
                        toast.error(`Voice error: ${e.error}. Try Chrome or Edge.`);
                      }
                    };
                    recognitionRef.current = recognition;
                    recognition.start();
                    setIsListening(true);
                    toast.info(chatLang === 'hi' ? '🎤 बोलिए...' : '🎤 Listening...', { duration: 2000 });
                  } catch (err) {
                    toast.error('Voice input failed to start. Use Chrome or Edge browser.');
                  }
                }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={isListening ? 'Stop listening' : `Voice input (${chatLang === 'hi' ? 'हिंदी' : 'English'})`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || input.length > 2000}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {loading
                  ? <Loader2 size={18} className="animate-spin" />
                  : <Send size={18} />
                }
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 max-w-4xl mx-auto">
              <p className="text-[10px] text-slate-600">
                🔒 Blockchain verified • {chatLang === 'hi' ? '🇮🇳 हिंदी' : '🌐 English'} • 1mg, Apollo, Netmeds
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-700 font-mono">
                <MessageSquare size={9} />
                {messages.length} messages
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};