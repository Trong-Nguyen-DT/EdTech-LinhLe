import React from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import App from './App.tsx';
import { ThemeProvider } from './utils/theme.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Đã xảy ra lỗi hiển thị giao diện.',
    };
  }

  handleResetApp = () => {
    try {
      window.location.hash = '#/';
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('mathmaster_auth_session_v1');
      window.location.hash = '#/';
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Không thể hiển thị trang hiện tại
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ứng dụng gặp sự cố tạm thời khi khởi tạo giao diện. Thầy/Cô hoặc học sinh có thể tải lại trang chủ để tiếp tục.
            </p>
            {this.state.errorMessage && (
              <p className="text-xs font-mono text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 break-words">
                {this.state.errorMessage}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleResetApp}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                Tải lại trang
              </button>
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Về trang đăng nhập
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AppErrorBoundary>
);
