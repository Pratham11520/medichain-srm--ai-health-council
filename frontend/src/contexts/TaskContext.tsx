/**
 * TaskContext — Global Background Task Manager
 * Keeps AI tasks alive across page navigation.
 * When a user starts a report analysis or chat then switches pages,
 * the request continues in the background and the result waits for them.
 */

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

export type TaskType = 'report' | 'chat' | 'symptoms' | 'drug-interaction';
export type TaskStatus = 'running' | 'done' | 'error';

export interface BackgroundTask {
    id: string;
    type: TaskType;
    label: string;           // e.g. "Blood Test Analysis" or "Chat: fever headache..."
    status: TaskStatus;
    result?: string;         // Markdown response text
    provider?: string;       // which LLM answered
    error?: string;
    startedAt: number;
    completedAt?: number;
}

interface TaskContextValue {
    tasks: BackgroundTask[];
    // Create a new task and start it
    startTask: (
        type: TaskType,
        label: string,
        work: () => Promise<{ text: string; provider: string }>,
        onDone?: (task: BackgroundTask) => void
    ) => string; // returns task id
    getTask: (id: string) => BackgroundTask | undefined;
    getLatestTaskByType: (type: TaskType) => BackgroundTask | undefined;
    dismissTask: (id: string) => void;
    clearCompleted: () => void;
    runningCount: number;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const useTaskContext = () => {
    const ctx = useContext(TaskContext);
    if (!ctx) throw new Error('useTaskContext must be used inside <TaskProvider>');
    return ctx;
};

// Safe hook — returns null when outside provider (for pages that don't need it)
export const useTaskContextSafe = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<BackgroundTask[]>([]);
    const counterRef = useRef(0);

    const startTask = useCallback(
        (
            type: TaskType,
            label: string,
            work: () => Promise<{ text: string; provider: string }>,
            onDone?: (task: BackgroundTask) => void
        ): string => {
            const id = `task-${Date.now()}-${++counterRef.current}`;

            const newTask: BackgroundTask = {
                id,
                type,
                label,
                status: 'running',
                startedAt: Date.now(),
            };

            setTasks(prev => [newTask, ...prev.slice(0, 19)]); // keep max 20 tasks

            // Run in background — this Promise outlives page navigation
            work()
                .then(result => {
                    const done: BackgroundTask = {
                        ...newTask,
                        status: 'done',
                        result: result.text,
                        provider: result.provider,
                        completedAt: Date.now(),
                    };
                    setTasks(prev =>
                        prev.map(t => (t.id === id ? done : t))
                    );
                    onDone?.(done);
                })
                .catch(err => {
                    const failed: BackgroundTask = {
                        ...newTask,
                        status: 'error',
                        error: err?.message || 'Request failed',
                        completedAt: Date.now(),
                    };
                    setTasks(prev =>
                        prev.map(t => (t.id === id ? failed : t))
                    );
                });

            return id;
        },
        []
    );

    const getTask = useCallback(
        (id: string) => tasks.find(t => t.id === id),
        [tasks]
    );

    const getLatestTaskByType = useCallback(
        (type: TaskType) => tasks.find(t => t.type === type),
        [tasks]
    );

    const dismissTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    const clearCompleted = useCallback(() => {
        setTasks(prev => prev.filter(t => t.status === 'running'));
    }, []);

    const runningCount = tasks.filter(t => t.status === 'running').length;

    return (
        <TaskContext.Provider
            value={{
                tasks,
                startTask,
                getTask,
                getLatestTaskByType,
                dismissTask,
                clearCompleted,
                runningCount,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};
