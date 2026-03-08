import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12">
                    <div className="max-w-xl w-full bg-card shadow-2xl rounded-3xl p-8 sm:p-12 text-center border border-border animate-fade-in-up">
                        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <AlertTriangle className="h-10 w-10 text-danger" />
                        </div>

                        <h2 className="text-3xl font-extrabold text-text-primary mb-4 tracking-tight">System Encountered an Error</h2>
                        <p className="text-lg text-text-secondary mb-8 font-medium">
                            We've encountered a synchronized state mismatch. Don't worry, your data is safe.
                        </p>

                        {this.state.error && (
                            <div className="bg-background border border-border text-text-secondary p-5 rounded-2xl text-sm mb-10 overflow-auto max-h-40 text-left font-mono shadow-inner">
                                <span className="text-danger font-bold mr-2">Error:</span>
                                {this.state.error.message}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                className="flex-1 py-4 text-lg"
                                icon={RefreshCw}
                            >
                                Restart Session
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                className="flex-1 py-4 text-lg"
                                icon={Home}
                            >
                                Return Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
