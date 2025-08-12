import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw, Copy, Check, Lightbulb, ArrowRight } from 'lucide-react';
import { Hook } from '../../types';
import { generateHooks } from '../../utils/api';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/storage';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const Step2Hooks: React.FC = () => {
  const { 
    selectedContentIdea,
    selectedHook,
    setSelectedHook,
    selectedAPI,
    setCurrentStep,
    updateSession,
    setError,
    error 
  } = useApp();
  
  const [hooks, setHooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedContentIdea && hooks.length === 0) {
      handleGenerateHooks();
    }
  }, [selectedContentIdea]);

  const handleGenerateHooks = async () => {
    if (!selectedContentIdea) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const generatedHooks = await generateHooks(
        selectedContentIdea,
        selectedAPI.id,
        selectedAPI.models[0]
      );
      
      setHooks(generatedHooks);
      
      if (generatedHooks.length === 0) {
        setError('No hooks were generated. Please try again.');
      }
    } catch (error) {
      console.error('Error generating hooks:', error);
      setError('Failed to generate hooks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHook = async (hookContent: string, index: number) => {
    const hook: Hook = {
      id: generateId(),
      content: hookContent,
      type: getHookType(hookContent),
      createdAt: new Date(),
    };

    setSelectedHook(hook);
    await updateSession({ 
      selectedHook: hook,
      currentStep: 3 
    });
  };

  const handleCopyHook = async (hookContent: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hookContent);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy hook:', error);
    }
  };

  const getHookType = (hook: string): string => {
    if (hook.includes('?')) return 'Question';
    if (/\d/.test(hook)) return 'Number/List';
    if (hook.toLowerCase().includes('secret') || hook.toLowerCase().includes('truth')) return 'Controversial';
    if (hook.toLowerCase().includes('i ') || hook.toLowerCase().includes('my ')) return 'Story';
    return 'Problem/Solution';
  };

  const getHookTypeColor = (type: string): string => {
    switch (type) {
      case 'Question': return 'bg-blue-100 text-blue-800';
      case 'Number/List': return 'bg-green-100 text-green-800';
      case 'Controversial': return 'bg-red-100 text-red-800';
      case 'Story': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProceedToScript = () => {
    setCurrentStep(3);
  };

  if (!selectedContentIdea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Idea Selected</h3>
          <p className="text-gray-600">Please go back to Step 1 and select a content idea first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
          Generate Engaging Hooks
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create powerful hooks that will stop viewers from scrolling and make them watch your entire video.
        </p>
      </div>

      {/* Selected Content Idea */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-primary-900 mb-2">Selected Content Idea:</h3>
        <p className="text-primary-800 font-medium mb-2">{selectedContentIdea.title}</p>
        <p className="text-primary-700 text-sm">{selectedContentIdea.snippet}</p>
        <div className="mt-3 text-xs text-primary-600">
          Source: {selectedContentIdea.source}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900">AI-Generated Hooks</span>
            <span className="text-sm text-gray-500">Using {selectedAPI.name}</span>
          </div>
          
          <button
            onClick={handleGenerateHooks}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Generating...' : 'Regenerate Hooks'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          onRetry={handleGenerateHooks}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Generating engaging hooks..." />
        </div>
      )}

      {/* Hooks List */}
      {!isLoading && hooks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Generated Hooks ({hooks.length})
            </h2>
            {selectedHook && (
              <button
                onClick={handleProceedToScript}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Continue to Script</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {hooks.map((hook, index) => {
              const hookType = getHookType(hook);
              const isSelected = selectedHook?.content === hook;
              
              return (
                <div
                  key={index}
                  className={`card cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary-200 ${
                    isSelected ? 'ring-2 ring-primary-500 border-primary-300 bg-primary-50' : ''
                  }`}
                  onClick={() => handleSelectHook(hook, index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Hook Type Badge */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHookTypeColor(hookType)}`}>
                          {hookType}
                        </span>
                        <span className="text-xs text-gray-500">Hook #{index + 1}</span>
                      </div>

                      {/* Hook Content */}
                      <p className="text-gray-900 font-medium text-lg leading-relaxed mb-4">
                        "{hook}"
                      </p>

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectHook(hook, index);
                          }}
                          className={`btn text-sm px-4 py-2 ${
                            isSelected ? 'btn-success' : 'btn-primary'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            'Select This Hook'
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHook(hook, index);
                          }}
                          className="btn-secondary text-sm px-3 py-2 flex items-center space-x-2"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Hook Summary */}
          {selectedHook && (
            <div className="bg-success-50 border border-success-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Check className="w-5 h-5 text-success-600" />
                <h3 className="font-semibold text-success-900">Selected Hook</h3>
              </div>
              <p className="text-success-800 font-medium text-lg mb-4">
                "{selectedHook.content}"
              </p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHookTypeColor(selectedHook.type)}`}>
                  {selectedHook.type}
                </span>
                <button
                  onClick={handleProceedToScript}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Continue to Script</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && hooks.length === 0 && !error && (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Hooks Generated</h3>
          <p className="text-gray-600 mb-6">
            Click the generate button to create engaging hooks for your content.
          </p>
          <button
            onClick={handleGenerateHooks}
            className="btn-primary"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Hooks
          </button>
        </div>
      )}
    </div>
  );
};

export default Step2Hooks;