import React from 'react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <div className="text-center max-w-lg">
            <h1 className="text-4xl font-bold text-destructive mb-4">Oops! Something went wrong.</h1>
            <p className="text-lg text-muted-foreground mb-6">
              We've encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 p-4 bg-muted rounded-lg text-left text-sm">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;