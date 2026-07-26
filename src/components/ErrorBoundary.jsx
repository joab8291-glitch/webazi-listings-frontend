import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
          <p className="font-display text-xl text-ink">Something went wrong</p>
          <p className="mt-2 text-sm text-inkSoft">
            Please refresh the page. If this keeps happening, let us know.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-jade px-5 py-2 text-sm font-medium text-paper"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
