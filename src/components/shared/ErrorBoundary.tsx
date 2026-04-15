import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Aquí puedes registrar el error en un servicio externo como Sentry
    console.error('LovIA Error Boundary capturó un fallo:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/'; // Regresar al inicio seguro
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <AlertTriangle size={64} style={styles.icon} />
            <h1 style={styles.title}>Ups, algo salió mal</h1>
            <p style={styles.subtitle}>
              Ocurrió un error inesperado en la aplicación. Nuestros ingenieros ya han sido notificados.
            </p>
            {this.state.error && (
              <pre style={styles.errorDetails}>
                {this.state.error.message}
              </pre>
            )}
            <button onClick={this.handleReset} style={styles.button}>
              <RefreshCcw size={18} style={{ marginRight: 8 }} />
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: 'var(--bg-color, #09090b)', // Usa tu variable de color oscura si existe
    color: '#EDEDED',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  card: {
    backgroundColor: '#18181b', // zinc-900
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center' as const,
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #27272a'
  },
  icon: {
    color: '#ef4444', // red-500
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '12px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#a1a1aa', // zinc-400
    lineHeight: '1.5',
    marginBottom: '24px'
  },
  errorDetails: {
    backgroundColor: '#09090b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#ef4444',
    overflowX: 'auto' as const,
    textAlign: 'left' as const,
    marginBottom: '24px'
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#09090b',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default ErrorBoundary;
