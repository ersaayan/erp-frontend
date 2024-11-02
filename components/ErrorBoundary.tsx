'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
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
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                            <p className="text-sm">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            >
                                Reload page
                            </button>
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}