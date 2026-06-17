import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportClientError } from '@/lib/error-reporter';

type Props = { children: ReactNode; fallback?: ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError(error, { component: info.componentStack?.slice(0, 200), action: 'react_error_boundary' });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-8 text-center">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-2">The error has been reported to KuberOne Error Tracking.</p>
          <button type="button" className="mt-4 text-blue-600" onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
