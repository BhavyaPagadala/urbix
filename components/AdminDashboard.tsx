
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, LineChart, Line } from 'recharts';
import { CivicReport, ReportStatus, Sentiment } from '../types';
import { Language, translations } from '../translations';
import { CIVIC_CATEGORIES } from '../constants';

interface AdminDashboardProps {
  reports: CivicReport[];
  onUpdateStatus: (id: string, status: ReportStatus) => void;
  pulseSummary?: string;
  language: Language;
}

const COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444',
  'Roads & Infrastructure': '#6366F1',
  'Water Supply': '#0EA5E9',
  'Sanitation & Waste': '#10B981',
  'Electricity': '#F59E0B',
  'Public Safety': '#F43F5E',
  'Environment': '#14B8A6',
  'Transportation': '#8B5CF6',
  'Public Parks': '#4ADE80',
  'Healthcare': '#D946EF',
  'Other': '#64748B'
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ reports = [], onUpdateStatus, pulseSummary, language }) => {
  const t = translations[language];
  const [localityFilter, setLocalityFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const sentimentMap: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
    const categoryMap: Record<string, number> = {};
    const dateMap: Record<string, number> = {};

    reports.forEach(r => {
      const s = r.sentiment?.toLowerCase() || 'neutral';
      sentimentMap[s] = (sentimentMap[s] || 0) + 1;
      
      const c = r.category || 'Other';
      categoryMap[c] = (categoryMap[c] || 0) + 1;
      
      const dateKey = new Date(r.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    });

    return {
      sentiment: Object.entries(sentimentMap).map(([name, value]) => ({ name, value })),
      categories: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      trends: Object.entries(dateMap).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()).map(([date, count]) => ({ date, count })),
      pending: reports.filter(r => r.status === ReportStatus.PENDING).length,
      resolved: reports.filter(r => r.status === ReportStatus.RESOLVED).length,
      total: reports.length
    };
  }, [reports]);

  const localities = useMemo(() => {
    const set = new Set(reports.map(r => r.location?.locality).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [reports]);

  const filteredReports = reports.filter(r => {
    const localityMatch = localityFilter === 'All' || r.location?.locality === localityFilter;
    const sentimentMatch = sentimentFilter === 'All' || r.sentiment === sentimentFilter;
    const categoryMatch = categoryFilter === 'All' || r.category === categoryFilter;
    return localityMatch && sentimentMatch && categoryMatch;
  });

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t.totalReports, value: stats.total, icon: '📊' },
          { label: t.unresolved, value: stats.pending, icon: '⌛' },
          { label: t.resRate, value: `${((stats.resolved / (stats.total || 1)) * 100).toFixed(0)}%`, icon: '✅' },
          { label: t.critical, value: reports.filter(r => r.sentiment === Sentiment.NEGATIVE).length, icon: '🚨' },
        ].map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 flex items-center space-x-6 shadow-xl"
          >
            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-2xl">{item.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
              <h3 className="text-3xl font-black text-white">{item.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* AI Pulse */}
          <div className="bg-indigo-900/40 rounded-[3rem] p-10 border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
              <span className="bg-indigo-500 text-[10px] font-black px-2 py-1 rounded text-white uppercase tracking-widest">Cognitive Engine</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t.pulse}</h2>
            </div>
            <div className="bg-black/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <p className="text-xl font-medium italic text-indigo-100 leading-relaxed">
                "{pulseSummary || "Processing real-time civic data..."}"
              </p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-xl">
            <h4 className="text-xs font-black text-slate-500 mb-8 uppercase tracking-widest">Report Trends (Last 7 Days)</h4>
            <div className="h-[300px] w-full">
              {stats.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trends}>
                    <XAxis dataKey="date" hide />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}} itemStyle={{color: '#818cf8'}} />
                    <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={5} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 font-bold uppercase text-xs">Waiting for data nodes...</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
           {/* Sentiment Pie */}
           <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-xl h-full flex flex-col justify-between">
            <h4 className="text-xs font-black text-slate-500 mb-6 uppercase tracking-widest">Public Sentiment</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.sentiment} innerRadius={70} outerRadius={90} dataKey="value" stroke="none" paddingAngle={5}>
                    {stats.sentiment.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name as keyof typeof COLORS] || '#475569'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-8">
              {stats.sentiment.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-full h-1 rounded-full mb-2" style={{backgroundColor: COLORS[s.name as keyof typeof COLORS] || '#475569'}} />
                  <p className="text-[9px] font-black uppercase text-slate-500">{s.name}</p>
                  <p className="text-lg font-black text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-white/5 flex flex-wrap justify-between items-center gap-6 bg-white/[0.02]">
          <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Incident Matrix</h4>
          <div className="flex flex-wrap gap-4">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border border-white/5 outline-none cursor-pointer">
              <option value="All">All Categories</option>
              {CIVIC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={localityFilter} onChange={e => setLocalityFilter(e.target.value)} className="bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border border-white/5 outline-none cursor-pointer">
              {localities.map(l => <option key={l} value={l}>{l === 'All' ? 'All Areas' : l}</option>)}
            </select>
            <select value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)} className="bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border border-white/5 outline-none cursor-pointer">
              <option value="All">All Moods</option>
              <option value={Sentiment.POSITIVE}>Positive</option>
              <option value={Sentiment.NEUTRAL}>Neutral</option>
              <option value={Sentiment.NEGATIVE}>Negative</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] bg-white/[0.01]">
                <th className="px-10 py-6 border-b border-white/5">Issue Context</th>
                <th className="px-10 py-6 border-b border-white/5">Locality</th>
                <th className="px-10 py-6 border-b border-white/5">Category</th>
                <th className="px-10 py-6 border-b border-white/5">Status</th>
                <th className="px-10 py-6 border-b border-white/5">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReports.map((report) => (
                <React.Fragment key={report.id}>
                  <tr 
                    className={`group hover:bg-white/[0.03] transition-colors cursor-pointer ${expandedReportId === report.id ? 'bg-white/[0.03]' : ''}`}
                    onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-3">
                        {report.sentiment === Sentiment.NEGATIVE && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                        <p className="font-bold text-white text-lg leading-none">{report.title}</p>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ID: {report.id}</span>
                        <span className="text-indigo-400 text-[10px] font-bold">View Details →</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">{report.location?.locality || 'N/A'}</td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] text-white font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/10">{report.category}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        report.status === ReportStatus.RESOLVED ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        report.status === ReportStatus.PENDING ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-10 py-8" onClick={e => e.stopPropagation()}>
                      <select 
                        className="bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-2 border border-white/5 outline-none focus:border-indigo-500 transition-all cursor-pointer" 
                        value={report.status} 
                        onChange={(e) => onUpdateStatus(report.id, e.target.value as ReportStatus)}
                      >
                        <option value={ReportStatus.PENDING}>Pending</option>
                        <option value={ReportStatus.REVIEWING}>Reviewing</option>
                        <option value={ReportStatus.RESOLVED}>Resolved</option>
                        <option value={ReportStatus.DISMISSED}>Dismissed</option>
                      </select>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedReportId === report.id && (
                      <motion.tr 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900/50"
                      >
                        <td colSpan={5} className="px-12 py-10 border-b border-white/5">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <div>
                                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">AI Vision Insight</h5>
                                <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-inner">
                                  <div className="flex items-start space-x-4">
                                    <span className="text-2xl">🤖</span>
                                    <p className="text-sm font-medium text-indigo-100 italic leading-relaxed">
                                      "{report.aiInsights || "No automated insight available."}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Original Context</h5>
                                <p className="text-slate-300 text-sm leading-relaxed">{report.description}</p>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Timeline</h5>
                              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                                {(report.history || []).map((h, i) => (
                                  <div key={i} className="relative pl-10">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center z-10">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    </div>
                                    <div className="flex justify-between items-start">
                                      <p className="text-xs font-bold text-white">
                                        Status: <span className="uppercase text-indigo-400 ml-1">{h.status}</span>
                                      </p>
                                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(h.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase">Actor: {h.actor}</p>
                                  </div>
                                ))}
                              </div>
                              {report.image && (
                                <div className="mt-8">
                                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Visual Evidence</h5>
                                  <img src={report.image} className="w-full h-48 object-cover rounded-3xl border border-white/10 shadow-2xl" alt="Evidence" />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReports.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xs">No reports match current filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
