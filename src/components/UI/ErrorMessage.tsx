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
    error: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/20 dark:border-error-800 dark:text-error-200',
    warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-200',
    info: 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-200',
  };

  const iconStyles = {
    error: 'text-error-500 dark:text-error-400',
    warning: 'text-warning-500 dark:text-warning-400',
    info: 'text-primary-500 dark:text-primary-400',
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
                  ? 'text-error-700 hover:bg-error-100 dark:text-error-300 dark:hover:bg-error-900/30'
                  : variant === 'warning'
                  ? 'text-warning-700 hover:bg-warning-100 dark:text-warning-300 dark:hover:bg-warning-900/30'
                  : 'text-primary-700 hover:bg-primary-100 dark:text-primary-300 dark:hover:bg-primary-900/30'
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
                  ? 'text-error-500 hover:bg-error-100 dark:text-error-400 dark:hover:bg-error-900/30'
                  : variant === 'warning'
                  ? 'text-warning-500 hover:bg-warning-100 dark:text-warning-400 dark:hover:bg-warning-900/30'
                  : 'text-primary-500 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-900/30'
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