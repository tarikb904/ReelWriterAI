import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ExternalLink, TrendingUp, Calendar, Globe } from 'lucide-react';
import { ContentIdea, APIProvider } from '../../types';
import { fetchContentIdeas } from '../../utils/api';
import { useApp } from '../../contexts/AppContext';
import { API_PROVIDERS } from '../../config/constants';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const Step1Research: React.FC = () => {
  const { 
    createNewSession, 
    selectedAPI, 
    setSelectedAPI,
    setError,
    error 
  } = useApp();
  
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);

  useEffect(() => {
    handleFetchIdeas();
  }, []);

  const handleFetchIdeas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ideas = await fetchContentIdeas();
      setContentIdeas(ideas);
      
      if (ideas.length === 0) {
        setError('No content ideas found. Please try again or check your internet connection.');
      }
    } catch (error) {
      console.error('Error fetching content ideas:', error);
      setError('Failed to fetch content ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIdea = async (idea: ContentIdea) => {
    setSelectedIdea(idea);
    try {
      await createNewSession(idea);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create new session. Please try again.');
    }
  };

  const handleAPIChange = async (provider: APIProvider) => {
    await setSelectedAPI(provider);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-4">
          Discover Viral Content Ideas
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Find trending topics in the Make Money Online and Business Operations niche 
          from Reddit and authoritative blogs.
        </p>
      </div>

      {/* Controls */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* API Selection */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-text-primary">AI Provider:</label>
            <select
              value={selectedAPI.id}
              onChange={(e) => {
                const provider = API_PROVIDERS.find(p => p.id === e.target.value);
                if (provider) handleAPIChange(provider);
              }}
              className="input w-48"
            >
              {API_PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleFetchIdeas}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Fetching...' : 'Refresh Ideas'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          onRetry={handleFetchIdeas}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Fetching viral content ideas..." />
        </div>
      )}

      {/* Content Ideas Grid */}
      {!isLoading && contentIdeas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Found {contentIdeas.length} Trending Ideas
            </h2>
            <div className="text-sm text-text-tertiary">
              Click on an idea to continue
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentIdeas.map((idea) => (
              <div
                key={idea.id}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 ${
                  selectedIdea?.id === idea.id ? 'ring-2 ring-primary-500 border-primary-300 dark:border-primary-600' : ''
                }`}
                onClick={() => handleSelectIdea(idea)}
              >
                {/* Source Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-text-tertiary">
                      <Globe className="w-3 h-3" />
                      <span className="font-medium">{idea.source}</span>
                    </div>
                    {idea.score && (
                      <div className="flex items-center space-x-1 text-xs text-orange-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>{idea.score}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">
                  {idea.title}
                </h3>

                {/* Snippet */}
                <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                  {idea.snippet}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectIdea(idea);
                    }}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Select This Idea
                  </button>
                  
                  <a
                    href={idea.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-text-tertiary hover:text-text-secondary transition-colors"
                    title="View original"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && contentIdeas.length === 0 && !error && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Ideas Found</h3>
          <p className="text-text-secondary mb-6">
            We couldn't find any content ideas at the moment. Try refreshing to fetch new ideas.
          </p>
          <button
            onClick={handleFetchIdeas}
            className="btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Step1Research;