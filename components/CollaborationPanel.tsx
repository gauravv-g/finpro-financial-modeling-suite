
import React, { useState } from 'react';
import { SavedReport, Comment, ReportVersion } from '../types';
import { History, MessageSquare, Users, Send, Check, Clock, RotateCcw, Plus, Lock } from 'lucide-react';
import { formatLakhs } from '../utils/financials';

interface Props {
  savedReport: SavedReport;
  currentUser: string;
  userRole: 'owner' | 'ca' | 'viewer';
  onAddComment: (text: string) => void;
  onResolveComment: (id: string) => void;
  onRestoreVersion: (version: ReportVersion) => void;
  onInvite: (email: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CollaborationPanel: React.FC<Props> = ({ 
  savedReport, 
  currentUser, 
  userRole, 
  onAddComment, 
  onResolveComment, 
  onRestoreVersion,
  onInvite,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'team'>('comments');
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  if (!isOpen) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      onInvite(inviteEmail);
      setInviteEmail('');
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[60] flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h3 className="font-serif font-bold flex items-center gap-2">
          <Users size={18} className="text-amber-400" /> Collaboration
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
          Close
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'comments' ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare size={16} /> Chat ({savedReport.comments.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'history' ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <History size={16} /> History
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'team' ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Users size={16} /> Team
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        
        {/* COMMENTS TAB */}
        {activeTab === 'comments' && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex-1 space-y-4">
              {savedReport.comments.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Start a discussion!</p>
                </div>
              ) : (
                savedReport.comments.map(comment => (
                  <div key={comment.id} className={`flex gap-3 ${comment.author === currentUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${comment.role === 'ca' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {comment.author.charAt(0)}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm ${comment.author === currentUser ? 'bg-amber-100 text-slate-900 rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'}`}>
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="font-bold text-xs">{comment.author}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p>{comment.text}</p>
                      {comment.resolved && <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1"><Check size={10} /> Resolved</div>}
                      {!comment.resolved && userRole === 'ca' && (
                        <button onClick={() => onResolveComment(comment.id)} className="mt-2 text-[10px] text-slate-400 hover:text-green-600 flex items-center gap-1">
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleCommentSubmit} className="mt-auto border-t border-slate-200 pt-4 bg-slate-50 sticky bottom-0">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full p-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  placeholder="Type your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700 disabled:opacity-50">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4">
             {savedReport.versions.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                  <History size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No version history saved.</p>
                </div>
              ) : (
                [...savedReport.versions].reverse().map((version, i) => (
                  <div key={version.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group">
                    <div className="absolute top-4 left-4 bottom-0 w-0.5 bg-slate-100 -z-10"></div>
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            v{savedReport.versions.length - i}
                         </span>
                         <h4 className="font-bold text-slate-800 text-sm mt-1">{version.description}</h4>
                       </div>
                       <span className="text-[10px] text-slate-400 flex items-center gap-1">
                         <Clock size={10} /> {formatDate(version.timestamp)}
                       </span>
                    </div>
                    
                    <div className="text-xs text-slate-500 mb-3">
                       Edited by <strong>{version.author}</strong>
                       <br/>
                       Project Cost: {formatLakhs(version.dataSnapshot.financials.projectCost)}
                    </div>

                    <button 
                      onClick={() => onRestoreVersion(version)}
                      className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <RotateCcw size={12} /> Restore This Version
                    </button>
                  </div>
                ))
              )}
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
           <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Project Owner</h4>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                   <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                     {savedReport.clientName.charAt(0)}
                   </div>
                   <div>
                     <p className="font-bold text-sm text-slate-800">{savedReport.clientName}</p>
                     <p className="text-xs text-slate-500">Business Owner</p>
                   </div>
                   <div className="ml-auto">
                     <Lock size={14} className="text-slate-400" />
                   </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collaborators</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{savedReport.collaborators.length} Active</span>
                </div>
                
                {savedReport.collaborators.length > 0 ? (
                  <div className="space-y-2">
                    {savedReport.collaborators.map((email, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-sm text-slate-800 truncate">{email}</p>
                          <p className="text-xs text-slate-500">Viewer / Editor</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No team members invited yet.</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                 <h4 className="text-sm font-bold text-blue-900 mb-2">Invite CA / Advisor</h4>
                 <form onSubmit={handleInviteSubmit}>
                    <input 
                      type="email" 
                      placeholder="advisor@firm.com" 
                      className="w-full p-2 text-sm border border-blue-200 rounded mb-2 focus:outline-none focus:border-blue-400"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-bold transition flex items-center justify-center gap-2">
                       <Plus size={16} /> Send Invite
                    </button>
                 </form>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};
