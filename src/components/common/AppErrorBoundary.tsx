import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { attemptChunkReloadOnce, isChunkLoadError } from '../../utils/lazyWithRetry';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: string;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  isChunkError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isChunkError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const chunkErr = isChunkLoadError(error);
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'An unexpected error occurred while loading this page.';
    return {
      hasError: true,
      isChunkError: chunkErr,
      errorMessage: msg,
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('[DORASANI ErrorBoundary] Caught rendering error:', error, info.componentStack);
    if (isChunkLoadError(error)) {
      attemptChunkReloadOnce();
    }
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({
        hasError: false,
        isChunkError: false,
        errorMessage: '',
      });
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.assign('/');
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5EE] px-4 py-12 text-[#1A3B2B]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#D8C7B5] p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#D0E9C0]/60 text-[#18482C] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif-royal text-xl sm:text-2xl font-bold text-[#1A3B2B]">
              {this.state.isChunkError
                ? 'A Fresh Update Is Ready'
                : 'Something Went Wrong'}
            </h1>
            <p className="text-xs sm:text-sm text-[#4F6355] leading-relaxed">
              {this.state.isChunkError
                ? 'DORASANI was recently updated. Please refresh this page to load the latest version cleanly.'
                : 'We hit an unexpected hiccup loading this view. Refreshing the page usually resolves it immediately.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Page</span>
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#D8C7B5] bg-white hover:bg-[#FAF5EE] text-[#1A3B2B] text-xs font-semibold transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
