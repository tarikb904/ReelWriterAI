import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  onRetry,
  className = '',
  variant = 'error'
}) => {
  const variantStyles = {
    error: 'bg-error-50 border-error-200 text-error-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  };

  const iconStyles = {
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-primary-500',
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${iconStyles[variant]}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                variant === 'error'
                  ? 'text-error-700 hover:bg-error-100'
                  : variant === 'warning'
                  ? 'text-warning-700 hover:bg-warning-100'
                  : 'text-primary-700 hover:bg-primary-100'
              }`}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 transition-colors ${
                variant === 'error'
                  ? 'text-error-500 hover:bg-error-100'
                  : variant === 'warning'
                  ? 'text-warning-500 hover:bg-warning-100'
                  : 'text-primary-500 hover:bg-primary-100'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;