import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
          <div className="text-5xl mb-6">🦉</div>
          <h1 className="text-2xl font-black text-on-background tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-on-surface-variant mb-8 max-w-xs leading-relaxed">
            An unexpected error occurred. Tap below to reload the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 btn-brand rounded-full text-sm font-black uppercase tracking-widest"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
