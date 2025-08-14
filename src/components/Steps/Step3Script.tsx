import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Save, Edit3, ArrowRight, Clock, BarChart3 } from 'lucide-react';
import { Script } from '../../types';
import { generateScript } from '../../utils/api';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/storage';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const Step3Script: React.FC = () => {
  const { 
    selectedContentIdea,
    selectedHook,
    script,
    setScript,
    selectedAPI,
    setCurrentStep,
    updateSession,
    setError,
    error 
  } = useApp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedContentIdea && selectedHook && !script) {
      handleGenerateScript();
    }
  }, [selectedContentIdea, selectedHook]);

  useEffect(() => {
    if (script) {
      setEditedContent(script.content);
    }
  }, [script]);

  const handleGenerateScript = async () => {
    if (!selectedContentIdea || !selectedHook) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const generatedScript = await generateScript(
        selectedContentIdea,
        selectedHook.content,
        selectedAPI.id,
        selectedAPI.models[0]
      );
      
      const newScript: Script = {
        id: generateId(),
        content: generatedScript,
        wordCount: countWords(generatedScript),
        estimatedDuration: estimateDuration(generatedScript),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setScript(newScript);
      setEditedContent(generatedScript);
      
      await updateSession({ 
        script: newScript,
        currentStep: 3 
      });
      
    } catch (error) {
      console.error('Error generating script:', error);
      setError('Failed to generate script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScript = async () => {
    if (!script) return;

    setIsSaving(true);
    
    try {
      const updatedScript: Script = {
        ...script,
        content: editedContent,
        wordCount: countWords(editedContent),
        estimatedDuration: estimateDuration(editedContent),
        updatedAt: new Date(),
      };

      setScript(updatedScript);
      setIsEditing(false);
      
      await updateSession({ 
        script: updatedScript 
      });
      
    } catch (error) {
      console.error('Error saving script:', error);
      setError('Failed to save script. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const estimateDuration = (text: string): number => {
    const words = countWords(text);
    // Average speaking rate: 150-160 words per minute
    return Math.round((words / 155) * 60); // Duration in seconds
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProceedToCaptions = () => {
    setCurrentStep(4);
  };

  if (!selectedContentIdea || !selectedHook) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Missing Requirements</h3>
          <p className="text-gray-600">Please complete Steps 1 and 2 before generating your script.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-4">
          Write Your Video Script
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Create a compelling 2-2.5 minute script that follows proven frameworks for maximum engagement.
        </p>
      </div>

      {/* Context Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Content Idea */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 dark:bg-primary-900/20 dark:border-primary-800">
          <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">Content Idea:</h3>
          <p className="text-primary-800 dark:text-primary-200 font-medium text-sm">{selectedContentIdea.title}</p>
        </div>

        {/* Selected Hook */}
        <div className="bg-success-50 border border-success-200 rounded-xl p-6 dark:bg-success-900/20 dark:border-success-800">
          <h3 className="font-semibold text-success-900 dark:text-success-100 mb-2">Selected Hook:</h3>
          <p className="text-success-800 dark:text-success-200 font-medium text-sm">"{selectedHook.content}"</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-text-primary">Video Script</span>
            <span className="text-sm text-text-tertiary">Using {selectedAPI.name}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {script && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Script</span>
              </button>
            )}
            
            <button
              onClick={handleGenerateScript}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating...' : script ? 'Regenerate' : 'Generate Script'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          onRetry={handleGenerateScript}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Generating your video script..." />
        </div>
      )}

      {/* Script Content */}
      {!isLoading && script && (
        <div className="space-y-6">
          {/* Script Stats */}
          <div className="bg-bg-tertiary rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-text-secondary">Word Count</span>
                </div>
                <div className="text-2xl font-bold text-text-primary">{script.wordCount}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-text-secondary">Duration</span>
                </div>
                <div className="text-2xl font-bold text-text-primary">{formatDuration(script.estimatedDuration)}</div>
              </div>
              
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-sm font-medium text-text-secondary mb-2">Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  script.estimatedDuration >= 120 && script.estimatedDuration <= 150
                    ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200'
                    : 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200'
                }`}>
                  {script.estimatedDuration >= 120 && script.estimatedDuration <= 150
                    ? 'Perfect Length'
                    : script.estimatedDuration < 120
                    ? 'Too Short'
                    : 'Too Long'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Script Editor */}
          <div className="bg-bg-secondary rounded-xl shadow-sm border border-border-primary">
            <div className="p-6 border-b border-border-primary">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Your Video Script</h3>
                {isEditing && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(script.content);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveScript}
                      disabled={isSaving}
                      className="btn-primary text-sm flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="textarea w-full h-96 font-mono text-sm leading-relaxed"
                  placeholder="Write your script here..."
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-text-primary leading-relaxed">
                    {script.content}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-tertiary">
                Last updated: {new Date(script.updatedAt).toLocaleString()}
              </div>
              
              <button
                onClick={handleProceedToCaptions}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Generate Captions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !script && !error && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Ready to Create Your Script</h3>
          <p className="text-text-secondary mb-6">
            Generate a professional video script based on your selected content idea and hook.
          </p>
          <button
            onClick={handleGenerateScript}
            className="btn-primary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Script
          </button>
        </div>
      )}
    </div>
  );
};

export default Step3Script;