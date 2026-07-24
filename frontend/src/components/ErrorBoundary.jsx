import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted">
          <p>Something went wrong. Try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}