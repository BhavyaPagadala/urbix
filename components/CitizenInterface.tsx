
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CivicReport, ReportStatus, Sentiment } from '../types';
import { analyzeCivicReport } from '../services/geminiService';
import { Language, translations } from '../translations';

interface CitizenInterfaceProps {
  onReportSubmit: (report: Partial<CivicReport>) => void;
  reports: CivicReport[];
  username: string;
  language: Language;
}

const getSentimentIcon = (sentiment: Sentiment) => {
  switch (sentiment) {
    case Sentiment.POSITIVE: return '🟢';
    case Sentiment.NEUTRAL: return '🟡';
    case Sentiment.NEGATIVE: return '🔴';
    default: return '⚪';
  }
};

const CitizenInterface: React.FC<CitizenInterfaceProps> = ({ onReportSubmit, reports, username, language }) => {
  const t = translations[language];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [locality, setLocality] = useState('Main Area');
  const [aiDraft, setAiDraft] = useState<any>(null);

  const myReports = reports.filter(r => r.reporter === username);

  // Automatically trigger AI analysis when an image is selected to fill the form
  useEffect(() => {
    const handleAutoFill = async () => {
      if (image && !title && !description) {
        setIsAiProcessing(true);
        try {
          const draft = await analyzeCivicReport("", image);
          setAiDraft(draft);
          setTitle(draft.title);
          setDescription(draft.description);
        } catch (err) {
          console.error("Auto-fill failed", err);
        } finally {
          setIsAiProcessing(false);
        }
      }
    };
    handleAutoFill();
  }, [image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAiDraft(null); // Reset draft on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      // If we already have a draft from auto-fill, use it. Otherwise, analyze now.
      const finalAnalysis = aiDraft || await analyzeCivicReport(description, image);
      
      onReportSubmit({
        title,
        description,
        image,
        category: finalAnalysis.category,
        department: finalAnalysis.department,
        sentiment: finalAnalysis.sentiment as Sentiment,
        location: { locality },
        aiInsights: finalAnalysis.summary
      });

      setTitle('');
      setDescription('');
      setImage(undefined);
      setAiDraft(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
      <div className="xl:col-span-5">
        <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 sticky top-28 shadow-2xl">
          <h2 className="text-3xl font-black mb-8">{t.reportIssue}</h2>
          
          <div className="mb-8 p-6 bg-indigo-600/10 rounded-3xl border border-indigo-500/20">
            <p className="text-xs font-bold text-indigo-400 uppercase mb-4 tracking-widest">Step 1: Upload Photo for Auto-Fill</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="photo" />
            <label htmlFor="photo" className={`w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${image ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-white/10 text-slate-400 hover:border-indigo-500 hover:text-white'}`}>
              <span className="text-3xl mb-2">{image ? '📸' : '➕'}</span>
              <span className="text-xs font-black uppercase tracking-widest">{image ? 'Photo Selected' : 'Add Photo to Detect Issue'}</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-500 uppercase">{t.issueTitle}</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className={`w-full px-6 py-4 rounded-xl bg-slate-800 text-white font-bold outline-none border transition-colors ${isAiProcessing ? 'animate-pulse border-indigo-500/50' : 'border-white/5'}`} 
                required 
                placeholder={isAiProcessing ? "AI is thinking of a title..." : "Problem name"}
              />
              {isAiProcessing && <span className="absolute right-4 top-10 text-[8px] bg-indigo-600 text-white px-2 py-1 rounded font-black animate-bounce">AI WRITING</span>}
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-500 uppercase">{t.issueDesc}</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={3} 
                className={`w-full px-6 py-4 rounded-xl bg-slate-800 text-white font-bold outline-none border transition-colors ${isAiProcessing ? 'animate-pulse border-indigo-500/50' : 'border-white/5'}`} 
                required 
                placeholder={isAiProcessing ? "AI is describing the photo..." : "Details about the problem"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.locality}</label>
                <input 
                  type="text" 
                  value={locality} 
                  onChange={(e) => setLocality(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white text-xs font-bold border border-white/5" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Detection Status</label>
                <div className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-indigo-400">
                    {isAiProcessing ? 'Detecting...' : aiDraft ? 'Issue Detected' : 'Waiting...'}
                  </span>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {image && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                  <img src={image} className="w-full h-40 object-cover rounded-xl border border-white/10" alt="Incident" />
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-black uppercase bg-slate-900/80 px-4 py-2 rounded-full border border-white/10">AI Scanning Active</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isSubmitting || isAiProcessing} 
              className={`w-full py-5 rounded-2xl ${isSubmitting || isAiProcessing ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-black text-lg uppercase transition-all shadow-xl shadow-indigo-600/20`}
            >
              {isSubmitting ? 'Sending...' : t.submit}
            </button>
          </form>
        </div>
      </div>

      <div className="xl:col-span-7 space-y-8">
        <h2 className="text-3xl font-black">{t.incidentLog}</h2>
        <div className="space-y-6">
          {myReports.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-[3rem] border border-dashed border-white/5">
              <p className="text-slate-500 font-bold uppercase tracking-widest">No reports yet.</p>
            </div>
          ) : myReports.map((report) => (
            <motion.div layout key={report.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white">{report.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-white/5 rounded text-slate-400 border border-white/5">{report.category}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/10">{report.department}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 bg-slate-800 rounded text-slate-400">
                      {getSentimentIcon(report.sentiment)} {report.sentiment}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                  report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                  report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                  'bg-white/10 text-white border-white/5'
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">{report.description}</p>
              
              {report.image && (
                <div className="relative group rounded-2xl overflow-hidden border border-white/10">
                  <img src={report.image} className="w-full h-48 object-cover opacity-80" alt="Incident" />
                  <div className="absolute top-4 left-4 flex gap-2">
                     <span className="bg-indigo-600 text-[8px] font-black text-white px-2 py-1 rounded shadow-lg uppercase">AI DETECTED</span>
                     <span className="bg-black/60 backdrop-blur-md text-[8px] font-black text-white px-2 py-1 rounded shadow-lg uppercase">{report.category}</span>
                  </div>
                </div>
              )}

              {report.aiInsights && (
                <div className="flex items-start space-x-3 bg-indigo-950/30 p-4 rounded-2xl border border-indigo-500/10">
                  <span className="text-xl mt-1">🤖</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Analyst Note</p>
                    <p className="text-xs font-bold text-slate-300 italic">"{report.aiInsights}"</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizenInterface;
