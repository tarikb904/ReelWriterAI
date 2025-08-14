import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Copy, Check, Instagram, Linkedin, Youtube, Download } from 'lucide-react';
import { Caption } from '../../types';
import { generateCaptions } from '../../utils/api';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/storage';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const Step4Captions: React.FC = () => {
  const { 
    script,
    captions,
    setCaptions,
    selectedAPI,
    updateSession,
    setError,
    error 
  } = useApp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<{
    instagram: string;
    linkedin: string;
    youtube: string[];
  } | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (script && !generatedCaptions) {
      handleGenerateCaptions();
    }
  }, [script]);

  const handleGenerateCaptions = async () => {
    if (!script) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const generated = await generateCaptions(
        script.content,
        selectedAPI.id,
        selectedAPI.models[0]
      );
      
      setGeneratedCaptions(generated);
      
      // Convert to Caption objects
      const newCaptions: Caption[] = [
        {
          id: generateId(),
          platform: 'instagram',
          content: generated.instagram,
          createdAt: new Date(),
        },
        {
          id: generateId(),
          platform: 'linkedin',
          content: generated.linkedin,
          createdAt: new Date(),
        },
        ...generated.youtube.map(title => ({
          id: generateId(),
          platform: 'youtube' as const,
          content: title,
          createdAt: new Date(),
        })),
      ];

      setCaptions(newCaptions);
      
      await updateSession({ 
        captions: newCaptions,
        currentStep: 4 
      });
      
    } catch (error) {
      console.error('Error generating captions:', error);
      setError('Failed to generate captions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItems(prev => new Set([...prev, id]));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleExportAll = () => {
    if (!generatedCaptions) return;

    const exportContent = `
REELWRITER AI - SOCIAL MEDIA CAPTIONS
Generated on: ${new Date().toLocaleString()}

=== INSTAGRAM / FACEBOOK / THREADS ===
${generatedCaptions.instagram}

=== LINKEDIN ===
${generatedCaptions.linkedin}

=== YOUTUBE TITLES ===
${generatedCaptions.youtube.map((title, index) => `${index + 1}. ${title}`).join('\n')}

---
Generated with ReelWriterAI
    `.trim();

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reelwriter-captions-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!script) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Script Available</h3>
          <p className="text-gray-600">Please complete Step 3 and create your script first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-4">
          Social Media Captions
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Generate optimized captions and titles for Instagram, LinkedIn, and YouTube based on your script.
        </p>
      </div>

      {/* Controls */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-text-primary">Caption Generation</span>
            <span className="text-sm text-text-tertiary">Using {selectedAPI.name}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {generatedCaptions && (
              <button
                onClick={handleExportAll}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            )}
            
            <button
              onClick={handleGenerateCaptions}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating...' : 'Regenerate Captions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
          onRetry={handleGenerateCaptions}
          className="mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Generating social media captions..." />
        </div>
      )}

      {/* Generated Captions */}
      {!isLoading && generatedCaptions && (
        <div className="space-y-8">
          {/* Instagram/Facebook/Threads */}
          <div className="bg-bg-secondary rounded-xl shadow-sm border border-border-primary overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Instagram className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">Instagram / Facebook / Threads</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-bg-tertiary rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap text-sm text-text-primary font-sans leading-relaxed">
                  {generatedCaptions.instagram}
                </pre>
              </div>
              <button
                onClick={() => handleCopy(generatedCaptions.instagram, 'instagram')}
                className="btn-primary flex items-center space-x-2"
              >
                {copiedItems.has('instagram') ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Caption</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="bg-bg-secondary rounded-xl shadow-sm border border-border-primary overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Linkedin className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">LinkedIn</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-bg-tertiary rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap text-sm text-text-primary font-sans leading-relaxed">
                  {generatedCaptions.linkedin}
                </pre>
              </div>
              <button
                onClick={() => handleCopy(generatedCaptions.linkedin, 'linkedin')}
                className="btn-primary flex items-center space-x-2"
              >
                {copiedItems.has('linkedin') ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Caption</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* YouTube Titles */}
          <div className="bg-bg-secondary rounded-xl shadow-sm border border-border-primary overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Youtube className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">YouTube Titles</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {generatedCaptions.youtube.map((title, index) => (
                  <div key={index} className="flex items-center justify-between bg-bg-tertiary rounded-lg p-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-medium text-text-tertiary bg-border-primary px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-text-primary">{title}</span>
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {title.length} characters
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(title, `youtube-${index}`)}
                      className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                    >
                      {copiedItems.has(`youtube-${index}`) ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-success-50 border border-success-200 rounded-xl p-6 text-center dark:bg-success-900/20 dark:border-success-800">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Check className="w-6 h-6 text-success-600" />
              <h3 className="text-lg font-semibold text-success-900 dark:text-success-100">Content Creation Complete!</h3>
            </div>
            <p className="text-success-800 dark:text-success-200 mb-4">
              Your viral content package is ready! You now have a complete set of materials for your short-form video.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleExportAll}
                className="btn-success flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !generatedCaptions && !error && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Ready to Generate Captions</h3>
          <p className="text-text-secondary mb-6">
            Create optimized social media captions and titles based on your script.
          </p>
          <button
            onClick={handleGenerateCaptions}
            className="btn-primary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Generate Captions
          </button>
        </div>
      )}
    </div>
  );
};

export default Step4Captions;