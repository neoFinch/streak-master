class ErrorBoundaryV2 extends React.Component {

    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('Uncaught error:', error, errorInfo);
        console.log( errorInfo.componentStack )
    }
}