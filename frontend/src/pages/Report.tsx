import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UserProfile } from '../types';
import { analyzeReportFileBackend, analyzeReportBackend } from '../services/apiService';
import { useTaskContextSafe } from '../contexts/TaskContext';
import {
  Upload, FileText, Image as ImageIcon, Loader2,
  ArrowLeft, ShieldCheck, Zap,
  AlertTriangle, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedPage } from '../components/AnimatedPage';
import { toast } from 'sonner';

interface ReportProps {
  user: UserProfile;
}

export const ReportPage: React.FC<ReportProps> = ({ user }) => {
  const taskCtx = useTaskContextSafe();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [manualText, setManualText] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');
  const [dragging, setDragging] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-load latest completed/running task if it exists
  const activeTask = taskCtx?.getLatestTaskByType('report');

  const handleFilePick = (f: File) => {
    if (f.size > 15 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 15 MB.');
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFilePick(f);
  }, []);

  const handleAnalyze = async () => {
    if (!taskCtx) {
      toast.error("Background task system not initialized.");
      return;
    }

    if (inputMode === 'upload' && !file) {
      toast.error('Please upload a PDF or image file.');
      return;
    }

    if (inputMode === 'manual' && manualText.trim().length < 20) {
      toast.error('Please paste at least 20 characters of report text.');
      return;
    }

    const label = file ? `Analyzing ${file.name}` : `Analyzing pasted report`;

    // Start background task
    taskCtx.startTask('report', label, async () => {
      if (inputMode === 'upload' && file) {
        // New multipart PDF/Image upload endpoint
        const res = await analyzeReportFileBackend(file, user);
        return { text: res.text, provider: res.provider };
      } else {
        // Fallback to text analysis
        const res = await analyzeReportBackend(manualText, "Auto-detect", user);
        return { text: res.text, provider: res.provider };
      }
    }, (task) => {
      if (task.status === 'done') {
        toast.success(`Report analyzed via ${task.provider}!`);
      } else {
        toast.error(`Analysis failed: ${task.error}`);
      }
    });

    toast.success("Analysis started in background! You can safely switch pages.");
  };

  const clearAll = () => {
    setFile(null);
    setPreview('');
    setManualText('');
    setShowFull(false);
    if (activeTask) {
      taskCtx?.dismissTask(activeTask.id);
    }
  };

  const copyToClipboard = () => {
    if (activeTask?.result) {
      navigator.clipboard.writeText(activeTask.result);
      setCopied(true);
      toast.success('Analysis copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-blue-600/20" />
          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Smart Report Analyzer</h1>
                <p className="text-blue-300 text-sm font-mono">Upload any PDF — AI auto-detects & analyzes</p>
              </div>
            </div>
          </div>
        </div>

        {!activeTask && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Input Mode Toggle */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
              {(['upload', 'manual'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === mode
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {mode === 'upload' ? '📄 Upload PDF/Image' : '✏️ Paste Text'}
                </button>
              ))}
            </div>

            {/* Upload Mode */}
            <AnimatePresence mode="wait">
              {inputMode === 'upload' && (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {!file ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`glass-card border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all group ${dragging ? 'border-blue-500/60 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/40'
                        }`}
                    >
                      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center mx-auto mb-5 transition-colors">
                        <Upload size={36} className="text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Drop your medical report here</h3>
                      <p className="text-sm text-slate-400 mb-5">PDF, JPG, or PNG (up to 15MB)</p>
                      <div className="flex justify-center gap-4 text-xs text-slate-500">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Auto-Detect Type</span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Extracts Text Automatically</span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => e.target.files?.[0] && handleFilePick(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="glass-card p-6 rounded-2xl space-y-4">
                      {/* File card */}
                      <div className="flex items-center justify-between glass p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            {file.type.startsWith('image/') ? <ImageIcon size={22} className="text-blue-400" /> : <FileText size={22} className="text-blue-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type === 'application/pdf' ? 'PDF Document' : 'Image'}</p>
                          </div>
                        </div>
                        <button onClick={() => setFile(null)} className="text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                          Remove
                        </button>
                      </div>

                      {preview && (
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                          <img src={preview} alt="Report preview" className="max-h-56 w-full object-contain" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <Zap size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-400">
                          The AI will automatically extract text from this file, detect whether it's a Blood Test, Urine Analysis, etc., and generate a clinical summary.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Manual Text Mode */}
              {inputMode === 'manual' && (
                <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="glass-card p-6 rounded-2xl space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                        Paste Report Text
                      </label>
                      <textarea
                        value={manualText}
                        onChange={e => setManualText(e.target.value)}
                        rows={10}
                        placeholder="Paste your full report or key values here..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none custom-scrollbar"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyze Button */}
            {(file || manualText.trim().length > 10) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleAnalyze}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transition-all"
              >
                <Zap size={22} />
                <span>Analyze Report in Background</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ── RUNNING OR COMPLETED VIEW ─────────────────────────────── */}
        {activeTask && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center justify-between">
              <button onClick={clearAll} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                <ArrowLeft size={16} /> New Report
              </button>
              {activeTask.status === 'done' && (
                <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  via {activeTask.provider}
                </span>
              )}
            </div>

            {activeTask.status === 'running' ? (
              <div className="glass-card p-10 rounded-2xl text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  <FileText className="absolute inset-0 m-auto text-blue-400" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing Report...</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    The AI Council is extracting text, detecting the report type, and cross-referencing values with clinical guidelines.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/5 inline-block text-sm text-slate-300">
                  You can safely navigate to other pages.
                  This analysis will continue in the background.
                </div>
              </div>
            ) : activeTask.status === 'error' ? (
              <div className="glass-card p-8 rounded-2xl text-center border border-red-500/20">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
                <h3 className="text-lg font-bold text-white mb-2">Analysis Failed</h3>
                <p className="text-red-400 text-sm mb-6">{activeTask.error}</p>
                <button onClick={clearAll} className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  Try Again
                </button>
              </div>
            ) : (
              /* RESULT VIEW */
              <div className="glass-card rounded-2xl overflow-hidden relative">
                {/* Result Header */}
                <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/20 px-6 py-4 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">Analysis Complete</h3>
                      <p className="text-xs text-slate-400">Patient: {user.name}, {user.age}yr</p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
                      title="Copy analysis"
                    >
                      {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* Markdown Content */}
                <div className={`prose-medichain px-6 py-5 overflow-y-auto custom-scrollbar transition-all ${showFull ? 'max-h-[800px]' : 'max-h-[420px]'}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeTask.result || ''}
                  </ReactMarkdown>
                </div>

                {/* Show more toggle */}
                <div className="px-6 py-3 border-t border-white/5 flex items-center justify-center bg-black/20">
                  <button
                    onClick={() => setShowFull(!showFull)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {showFull ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showFull ? 'Shrink view' : 'Expand full analysis'}
                  </button>
                </div>

                {/* Disclaimer */}
                <div className="px-6 py-4 bg-amber-500/5 border-t border-amber-500/20 flex gap-3">
                  <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-amber-400/90 leading-relaxed font-medium">AI Clinical Interpretation Disclaimer</p>
                    <p className="text-[10px] text-amber-400/70 mt-1">This analysis is generated by AI specifically for the Indian context. It does not replace professional medical advice. Always consult your treating physician.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security badge for completed/running */}
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono pt-4">
              <ShieldCheck size={12} className="text-sky-500" />
              Report analysis end-to-end encrypted • Background processing active
            </div>
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
};
