/**
 * TaskTray — Floating indicator for background AI tasks
 * Shows in the corner when tasks are running or completed in the background.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskContextSafe, BackgroundTask } from '../contexts/TaskContext';
import { Loader2, CheckCircle2, XCircle, X, ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_ROUTES: Record<string, string> = {
    report: '/report',
    chat: '/chat',
    symptoms: '/symptoms',
    'drug-interaction': '/drug-interaction',
};

const TYPE_COLORS: Record<string, string> = {
    report: 'text-blue-400',
    chat: 'text-teal-400',
    symptoms: 'text-purple-400',
    'drug-interaction': 'text-orange-400',
};

function TaskRow({ task, onDismiss }: { task: BackgroundTask; onDismiss: () => void }) {
    const navigate = useNavigate();
    const elapsed = task.completedAt
        ? ((task.completedAt - task.startedAt) / 1000).toFixed(1)
        : ((Date.now() - task.startedAt) / 1000).toFixed(0);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors group"
        >
            {/* Status icon */}
            <div className="flex-shrink-0">
                {task.status === 'running' && (
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                )}
                {task.status === 'done' && (
                    <CheckCircle2 size={16} className="text-green-400" />
                )}
                {task.status === 'error' && (
                    <XCircle size={16} className="text-red-400" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${TYPE_COLORS[task.type] ?? 'text-slate-300'}`}>
                    {task.label}
                </p>
                <p className="text-[10px] text-slate-500">
                    {task.status === 'running' ? `Running ${elapsed}s...` : ''}
                    {task.status === 'done' ? `Done in ${elapsed}s via ${task.provider}` : ''}
                    {task.status === 'error' ? `Failed: ${task.error}` : ''}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {task.status === 'done' && TYPE_ROUTES[task.type] && (
                    <button
                        onClick={() => navigate(TYPE_ROUTES[task.type])}
                        className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors font-medium"
                    >
                        View
                    </button>
                )}
                {task.status !== 'running' && (
                    <button
                        onClick={onDismiss}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X size={12} className="text-slate-500" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export const TaskTray: React.FC = () => {
    const ctx = useTaskContextSafe();
    const [expanded, setExpanded] = useState(false);

    if (!ctx || ctx.tasks.length === 0) return null;

    const { tasks, dismissTask, clearCompleted, runningCount } = ctx;
    const hasCompleted = tasks.some(t => t.status !== 'running');

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Expanded tray */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="w-80 rounded-2xl glass-card border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-teal-400" />
                                <span className="text-xs font-bold text-white">Background Tasks</span>
                                {runningCount > 0 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                                        {runningCount} running
                                    </span>
                                )}
                            </div>
                            {hasCompleted && (
                                <button
                                    onClick={clearCompleted}
                                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Clear done
                                </button>
                            )}
                        </div>

                        {/* Task list */}
                        <div className="p-3 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                            <AnimatePresence>
                                {tasks.map(task => (
                                    <TaskRow key={task.id} task={task} onDismiss={() => dismissTask(task.id)} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(p => !p)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 transition-colors"
                style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Pulse dot when running */}
                {runningCount > 0 && (
                    <>
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
                    </>
                )}

                <div className="flex items-center gap-1">
                    {runningCount > 0 ? (
                        <Loader2 size={14} className="animate-spin text-blue-400" />
                    ) : (
                        <CheckCircle2 size={14} className="text-green-400" />
                    )}
                    <span className="text-xs font-semibold text-white">
                        {runningCount > 0 ? `${runningCount} running` : `${tasks.length} done`}
                    </span>
                </div>
                {expanded ? (
                    <ChevronDown size={12} className="text-slate-400" />
                ) : (
                    <ChevronUp size={12} className="text-slate-400" />
                )}
            </motion.button>
        </div>
    );
};
