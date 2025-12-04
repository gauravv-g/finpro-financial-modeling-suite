
import React, { useState, useEffect } from 'react';
import { BookOpen, X, Search, PlayCircle, FileText, GraduationCap, ChevronRight, Lightbulb, Languages, Clock } from 'lucide-react';
import { getLearningContent, Guide, GlossaryTerm, VideoResource } from '../utils/learningContent';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningCenter: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'guides' | 'videos'>('guides');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Load content based on selected language
  const content = getLearningContent(currentLang);

  if (!isOpen) return null;

  // Filter Logic
  const filteredGlossary = content.glossary.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGuides = content.guides.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderGuideDetail = (guide: Guide) => (
    <div className="animate-fade-in">
      <button 
        onClick={() => setSelectedGuide(null)}
        className="text-sm text-slate-500 hover:text-amber-600 mb-4 flex items-center gap-1"
      >
        <ChevronRight size={14} className="rotate-180" /> {content.ui.read_guide.replace("Read ", "Back to ")}
      </button>
      <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">{guide.title}</h3>
      <div className="flex gap-2 mb-6">
        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold">
          {guide.category}
        </span>
        <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
          <Clock size={12} /> {guide.readTime}
        </span>
      </div>
      <div className="prose prose-slate prose-sm max-w-none">
        {guide.content.map((paragraph, idx) => (
          <p key={idx} className="mb-4 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ 
            // Simple markdown-like bold parsing
            __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        ))}
      </div>
    </div>
  );

  const renderVideoPlayer = (videoId: string, onClosePlayer: () => void) => (
    <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <button 
            onClick={onClosePlayer}
            className="absolute top-4 right-4 text-white hover:text-red-500 transition bg-black/50 p-2 rounded-full"
        >
            <X size={32} />
        </button>
        <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        </div>
    </div>
  );

  return (
    <>
    {playingVideo && renderVideoPlayer(playingVideo, () => setPlayingVideo(null))}
    
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[85vh] flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
          <div className="p-6">
            <h2 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-amber-500" /> {content.ui.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{content.ui.subtitle}</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-1">
            <button 
              onClick={() => { setActiveTab('guides'); setSelectedGuide(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'guides' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <BookOpen size={18} /> {content.ui.tab_guides}
            </button>
            <button 
              onClick={() => setActiveTab('glossary')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'glossary' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <FileText size={18} /> {content.ui.tab_glossary}
            </button>
            <button 
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'videos' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <PlayCircle size={18} /> {content.ui.tab_videos}
            </button>
          </nav>

          <div className="p-4 bg-amber-50 m-4 rounded-lg border border-amber-100">
            <h4 className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
              <Lightbulb size={12} /> {content.ui.protip_title}
            </h4>
            <p className="text-[10px] text-amber-700 leading-tight">
              {content.ui.protip_text}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full relative">
          
          {/* Mobile Header (Tabs) */}
          <div className="md:hidden flex overflow-x-auto border-b border-slate-200 p-2 gap-2 bg-slate-50">
             <button onClick={() => setActiveTab('guides')} className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab === 'guides' ? 'bg-amber-500 text-white' : 'bg-white border'}`}>Guides</button>
             <button onClick={() => setActiveTab('glossary')} className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab === 'glossary' ? 'bg-amber-500 text-white' : 'bg-white border'}`}>Glossary</button>
             <button onClick={() => setActiveTab('videos')} className={`px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab === 'videos' ? 'bg-amber-500 text-white' : 'bg-white border'}`}>Videos</button>
          </div>

          {/* Header Search & Close */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="relative max-w-md w-full">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder={content.ui.search_placeholder}
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button 
                        onClick={() => setCurrentLang('en')}
                        className={`px-2 py-1 text-xs rounded font-bold transition ${currentLang === 'en' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        ENG
                    </button>
                    <button 
                        onClick={() => setCurrentLang('hi')}
                        className={`px-2 py-1 text-xs rounded font-bold transition ${currentLang === 'hi' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        हिंदी
                    </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition ml-2">
                    <X size={24} className="text-slate-500" />
                </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            
            {activeTab === 'guides' && (
              selectedGuide ? renderGuideDetail(selectedGuide) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGuides.map(guide => (
                    <button 
                      key={guide.id}
                      onClick={() => setSelectedGuide(guide)}
                      className="text-left group bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-400 hover:shadow-md transition-all h-full flex flex-col"
                    >
                      <div className="mb-3 flex justify-between items-start">
                         <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">{guide.category}</span>
                         <span className="text-[10px] text-slate-400">{guide.readTime}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{guide.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{guide.description}</p>
                      <div className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {content.ui.read_guide} <ChevronRight size={12} />
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}

            {activeTab === 'glossary' && (
               <div className="space-y-4 max-w-3xl">
                 {filteredGlossary.map((item, idx) => (
                   <div key={idx} className="border-b border-slate-100 pb-4 last:border-0">
                      <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        {item.term}
                      </h4>
                      <p className="text-slate-600 mt-1">{item.definition}</p>
                      <div className="mt-2 bg-blue-50 p-2 rounded text-xs text-blue-800 flex items-start gap-2">
                         <span className="font-bold uppercase tracking-wide text-[10px] bg-blue-100 px-1 rounded shrink-0 mt-0.5">{content.ui.why_matters}</span>
                         {item.importance}
                      </div>
                   </div>
                 ))}
                 {filteredGlossary.length === 0 && <p className="text-slate-500 text-center py-10">{content.ui.no_results} "{searchTerm}"</p>}
               </div>
            )}

            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.videos.map(video => (
                  <div 
                    key={video.id} 
                    className="group cursor-pointer"
                    onClick={() => setPlayingVideo(video.youtubeId)}
                  >
                    <div className={`aspect-video ${video.thumbnailColor} rounded-xl mb-3 flex items-center justify-center relative overflow-hidden bg-cover bg-center`} style={{ backgroundImage: `url(https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg)` }}>
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                       <PlayCircle size={48} className="text-white/90 drop-shadow-lg group-hover:text-amber-500 group-hover:scale-110 transition-all duration-300 relative z-10" />
                       <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono z-10">
                          {video.duration}
                       </div>
                    </div>
                    <h4 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{video.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Click to play video</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
    </>
  );
};
