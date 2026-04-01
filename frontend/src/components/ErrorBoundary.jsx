import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-red-100">
                        <h1 className="text-3xl font-black text-red-600 mb-4 tracking-tighter italic">Engine Failure</h1>
                        <p className="text-gray-600 mb-8 font-medium">A critical error occurred in the learning engine. Our engineers have been notified.</p>
                        <div className="bg-gray-50 p-4 rounded-xl mb-8 overflow-auto max-h-40">
                            <p className="text-xs font-mono text-red-500">{this.state.error?.toString()}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Restart Engine
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
