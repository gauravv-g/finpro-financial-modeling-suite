
import React, { useState, useEffect } from 'react';
import { SavedReport } from '../types';
import { Plus, Trash2, FolderOpen, RefreshCw, Cloud, Lock, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { formatLakhs } from '../utils/financials';
import { useSecurity } from './SecurityVault';

interface Props {
  onSelect: (report: SavedReport) => void;
  onNew: () => void;
}

export const ProjectManager: React.FC<Props> = ({ onSelect, onNew }) => {
  const { encryptAndSave, loadAndDecrypt, logout, saveToCloud } = useSecurity();
  const [projects, setProjects] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await loadAndDecrypt('finstruct_reports_history');
      if (data) {
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to load secure projects", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure? This action is irreversible.")) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      await encryptAndSave('finstruct_reports_history', updated);
    }
  };

  const handleManualSync = async () => {
      setSyncing(true);
      await saveToCloud();
      setTimeout(() => setSyncing(false), 1000);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Decrypting Project Library...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-serif font-bold text-slate-800 flex items-center gap-2">
             <FolderOpen className="text-emerald-500" /> Secure Project Library
           </h2>
           <p className="text-slate-500 text-sm flex items-center gap-1">
             <ShieldCheck size={12} className="text-emerald-500" /> 
             AES-256 Encrypted • Google Drive Backed
           </p>
        </div>
        
        <div className="flex gap-2">
             <button onClick={logout} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold transition">
               <Lock size={16} /> Lock Vault
             </button>

             <button onClick={handleManualSync} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-bold transition">
               <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Force Sync'}
             </button>
             
             <button onClick={onNew} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 text-sm font-bold transition shadow-lg">
               <Plus size={18} /> New Project
             </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Cloud size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Library Empty</h3>
          <p className="text-slate-400 mb-6">Projects created here are synced to your private Google Drive.</p>
          <button onClick={onNew} className="bg-amber-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition shadow-lg">
             Create First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => onSelect(project)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-emerald-500 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors">{project.clientName}</h3>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wide font-bold">{project.type}</span>
                 </div>
                 <button 
                    onClick={(e) => handleDelete(project.id, e)}
                    className="text-slate-300 hover:text-red-500 transition p-2"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>

              <div className="space-y-2 text-sm text-slate-500 mb-4">
                 <div className="flex justify-between">
                    <span>Project Cost</span>
                    <span className="font-mono text-slate-700 font-semibold">{formatLakhs(project.projectCost)}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Last Edited</span>
                    <span>{new Date(project.date).toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-4 border-t border-slate-100">
                  <div className={`w-2 h-2 rounded-full ${project.status === 'Signed Off' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  {project.status}
                  <span className="ml-auto flex items-center gap-1"><Cloud size={10} /> Synced</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
