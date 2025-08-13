import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorMessage from './UI/ErrorMessage';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-bg-secondary to-secondary-50 dark:from-gray-900 dark:via-bg-primary dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img 
              src="/logo black.png" 
              alt="ReelWriterAI" 
              className="h-12 w-auto dark:invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="text-2xl font-heading font-bold text-text-primary">
              ReelWriterAI
            </div>
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-text-primary mb-2">
            Welcome Back
          </h2>
          <p className="text-text-secondary">
            Sign in to create viral short-form video content
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-bg-secondary rounded-2xl shadow-xl border border-border-primary p-8 dark:shadow-gray-900/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-secondary transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
                variant="error"
              />
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full btn-primary py-3 text-base font-medium"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-bg-tertiary rounded-lg">
            <h4 className="text-sm font-medium text-text-primary mb-2">Demo Credentials:</h4>
            <div className="text-sm text-text-secondary space-y-1">
              <div><strong>Username:</strong> tahmid</div>
              <div><strong>Password:</strong> t112233</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-text-secondary">
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4 text-primary-600" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-success-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>4-Step Process</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-secondary-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Viral Content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;