import React, {Component} from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
      this.state = { hasError: false, error: '', info: '', };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
      console.log('Caught error: %s',error);
      console.log('Got info: %s',info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
        return (<div>
                <h1>Something went wrong.</h1>
                <pre>{this.props && this.props.metadata}</pre>
                <p>Check out the console for what...</p>
                </div>)
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
export {ErrorBoundary}
