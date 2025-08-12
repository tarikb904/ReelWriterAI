import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Calendar, ExternalLink, Trash2, Play, FileText, MessageSquare } from 'lucide-react';
import { Session } from '../types';
import { useApp } from '../contexts/AppContext';
import { deleteSession } from '../utils/storage';
import { formatDistanceToNow } from 'date-fns';

interface HistoryProps {
  onNavigate: (page: string) => void;
}

const History: React.FC<HistoryProps> = ({ onNavigate }) => {
  const { sessions, refreshSessions, loadSession } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = sessions.filter(session =>
        session.contentIdea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.contentIdea.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.selectedHook?.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(sessions);
    }
  }, [sessions, searchTerm]);

  const handleLoadSession = async (session: Session) => {
    await loadSession(session.id);
    onNavigate('app');
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      await deleteSession(sessionId);
      await refreshSessions();
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return Search;
      case 2: return Play;
      case 3: return FileText;
      case 4: return MessageSquare;
      default: return Search;
    }
  };

  const getStepName = (step: number) => {
    switch (step) {
      case 1: return 'Research';
      case 2: return 'Hooks';
      case 3: return 'Script';
      case 4: return 'Captions';
      default: return 'Research';
    }
  };

  const getCompletionPercentage = (session: Session) => {
    let completed = 1; // Always have content idea
    if (session.selectedHook) completed++;
    if (session.script) completed++;
    if (session.captions && session.captions.length > 0) completed++;
    return (completed / 4) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
          Content History
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          View and manage all your previous content creation sessions. Sessions are automatically deleted after 7 days.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <HistoryIcon className="w-4 h-4" />
              <span>{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const StepIcon = getStepIcon(session.currentStep);
            const completionPercentage = getCompletionPercentage(session);
            
            return (
              <div
                key={session.id}
                className="card cursor-pointer hover:shadow-lg hover:border-primary-200 transition-all duration-200"
                onClick={() => handleLoadSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <StepIcon className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-medium text-primary-600">
                          Step {session.currentStep}: {getStepName(session.currentStep)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {session.contentIdea.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {session.contentIdea.snippet}
                    </p>

                    {/* Selected Hook */}
                    {session.selectedHook && (
                      <div className="bg-success-50 border border-success-200 rounded-lg p-3 mb-3">
                        <div className="text-xs font-medium text-success-700 mb-1">Selected Hook:</div>
                        <div className="text-sm text-success-800 font-medium">
                          "{session.selectedHook.content}"
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(completionPercentage)}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Source: {session.contentIdea.source}</span>
                        {session.script && (
                          <span>Script: {session.script.wordCount} words</span>
                        )}
                        {session.captions && session.captions.length > 0 && (
                          <span>Captions: {session.captions.length}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <a
                          href={session.contentIdea.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="View original content"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching sessions found' : 'No content sessions yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or clear the search to see all sessions.'
              : 'Start creating viral content to see your sessions here.'
            }
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="btn-secondary"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => onNavigate('app')}
              className="btn-primary"
            >
              Create Your First Content
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default History;