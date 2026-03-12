import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[MediChain ErrorBoundary]', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        {/* Animated icon */}
                        <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
                            <span className="text-5xl">⚡</span>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            The MediChain interface encountered an unexpected error. Your health data is safe.
                        </p>

                        {this.state.errorMessage && (
                            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
                                <p className="text-xs font-mono text-red-400 break-all">{this.state.errorMessage}</p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, errorMessage: '' });
                                    window.location.hash = '/';
                                    window.location.reload();
                                }}
                                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-medium transition-colors"
                            >
                                Reload App
                            </button>
                            <button
                                onClick={() => window.location.hash = '/'}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10"
                            >
                                Go Home
                            </button>
                        </div>

                        <p className="mt-8 text-[10px] text-slate-600 font-mono">
                            Emergency: 112 | AIIMS: 1800-11-1234
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
