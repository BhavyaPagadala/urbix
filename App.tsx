
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import CitizenInterface from './components/CitizenInterface';
import AdminDashboard from './components/AdminDashboard';
import SplashScreen from './components/SplashScreen';
import { User, UserRole, CivicReport, ReportStatus, Sentiment } from './types';
import { ADMIN_SECRET_KEY, MOCK_REPORTS_INITIAL } from './constants';
import { generateUrbanPulseSummary, analyzeCivicReport } from './services/geminiService';
import { Logo } from './components/Logo';
import { Language, translations } from './translations';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [pulseSummary, setPulseSummary] = useState<string | undefined>();
  const [view, setView] = useState<'login' | 'register' | 'main'>('login');
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    try {
      const savedReports = localStorage.getItem('urbix_reports');
      if (savedReports) {
        setReports(JSON.parse(savedReports));
      } else {
        setReports(MOCK_REPORTS_INITIAL.map(r => ({ 
          ...r, 
          department: 'City Office',
          history: [{ timestamp: r.createdAt, status: r.status as ReportStatus, actor: 'system' }]
        })) as CivicReport[]);
      }

      const savedUser = localStorage.getItem('urbix_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView('main');
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('urbix_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN && reports.length > 0) {
      generateUrbanPulseSummary(reports).then(setPulseSummary).catch(console.error);
    }
  }, [user, reports]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !email) {
      return alert("Please fill in all the boxes.");
    }
    
    let usersDb = [];
    try {
      usersDb = JSON.parse(localStorage.getItem('urbix_users_db') || '[]');
    } catch (err) {
      usersDb = [];
    }

    if (usersDb.some((u: User) => u.username.toLowerCase() === username.toLowerCase())) {
      return alert("This name is already taken. Please choose another one.");
    }

    if (role === UserRole.ADMIN) {
      if (adminKey !== ADMIN_SECRET_KEY) {
        return alert("Wrong Admin Key. You cannot create an admin account.");
      }
    }

    const newUser: User = { 
      username: username.trim(), 
      password, 
      email: email.trim(), 
      phone: phone.trim(), 
      role, 
      createdAt: Date.now() 
    };

    usersDb.push(newUser);
    localStorage.setItem('urbix_users_db', JSON.stringify(usersDb));
    setUser(newUser);
    localStorage.setItem('urbix_user', JSON.stringify(newUser));
    setView('main');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return alert("Enter name and password.");

    let usersDb = [];
    try {
      usersDb = JSON.parse(localStorage.getItem('urbix_users_db') || '[]');
    } catch (err) {
      usersDb = [];
    }

    const found = usersDb.find((u: User) => 
      u.username.toLowerCase() === username.toLowerCase().trim() && 
      u.password === password
    );

    if (found) {
      setUser(found);
      localStorage.setItem('urbix_user', JSON.stringify(found));
      setView('main');
    } else {
      alert("Wrong name or password. Please try again.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('urbix_user');
    setView('login');
    setUsername('');
    setPassword('');
    setAdminKey('');
  };

  const handleReportSubmit = (partialReport: Partial<CivicReport>) => {
    const newReport: CivicReport = {
      id: `rep-${Date.now()}`,
      reporter: user?.username || 'user',
      title: partialReport.title || 'No Title',
      description: partialReport.description || '',
      category: partialReport.category || 'Other',
      department: partialReport.department || 'City Office',
      sentiment: partialReport.sentiment || Sentiment.NEUTRAL,
      status: ReportStatus.PENDING,
      location: partialReport.location || { locality: 'Main Area' },
      image: partialReport.image,
      createdAt: Date.now(),
      aiInsights: partialReport.aiInsights,
      history: [{ timestamp: Date.now(), status: ReportStatus.PENDING, actor: user?.username || 'user' }]
    };
    setReports(prev => [newReport, ...prev]);
  };

  const handleUpdateStatus = async (id: string, newStatus: ReportStatus) => {
    let reportToAnalyze: CivicReport | undefined;

    setReports(prevReports => {
      const report = prevReports.find(r => r.id === id);
      if (!report) return prevReports;

      if (report.status === ReportStatus.RESOLVED && 
         (newStatus === ReportStatus.PENDING || newStatus === ReportStatus.REVIEWING)) {
        alert("This problem is already fixed. You cannot change it back to 'Pending' or 'Reviewing'.");
        return prevReports;
      }

      if (report.status === ReportStatus.DISMISSED && 
         (newStatus === ReportStatus.PENDING || newStatus === ReportStatus.REVIEWING)) {
        alert("This report was closed. You cannot mark it as pending again.");
        return prevReports;
      }

      reportToAnalyze = {
        ...report,
        status: newStatus,
        history: [...(report.history || []), { timestamp: Date.now(), status: newStatus, actor: user?.username || 'admin' }]
      };

      return prevReports.map(r => r.id === id ? reportToAnalyze! : r);
    });

    if (reportToAnalyze) {
      try {
        const aiUpdate = await analyzeCivicReport(reportToAnalyze.description, reportToAnalyze.image);
        setReports(prev => prev.map(r => r.id === id ? {
          ...r,
          category: aiUpdate.category,
          sentiment: aiUpdate.sentiment as Sentiment,
          aiInsights: `[Status: ${newStatus}] ${aiUpdate.summary}`
        } : r));
      } catch (err) {
        console.error("AI automated re-analysis failed:", err);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <AnimatePresence mode="wait">
          {(view === 'login' || view === 'register') ? (
            <motion.div 
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-slate-950 flex overflow-hidden font-sans"
            >
              <div className="hidden lg:flex w-[60%] relative flex-col justify-between p-20 text-white border-r border-white/5">
                <div className="relative z-10">
                  <div className="flex items-center space-x-5 mb-16">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-2xl">
                      <Logo className="w-10 h-10" interactive />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">URBIX</h1>
                  </div>
                  
                  <div className="max-w-2xl">
                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-6 block">Simple City Help</span>
                    <h2 className="text-8xl font-black tracking-tighter leading-[0.85] mb-10">
                      Fix your <br /><span className="text-white/30 text-outline">City.</span>
                    </h2>
                    <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                      Tell us about problems in your city. Our AI will help the right office fix it fast.
                    </p>
                  </div>
                </div>
                
                <div className="relative z-10 flex bg-slate-800/50 p-2 rounded-2xl w-fit">
                    {(['en', 'hi', 'te'] as Language[]).map((lang) => (
                      <button key={lang} onClick={() => setLanguage(lang)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${language === lang ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{lang}</button>
                    ))}
                </div>
              </div>

              <div className="w-full lg:w-[40%] flex items-center justify-center p-12 bg-slate-900">
                <div className="max-w-md w-full">
                  <h2 className="text-5xl font-black text-white mb-8">{view === 'login' ? 'Welcome' : 'Join Us'}</h2>
                  <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-6">
                    <div className="space-y-4">
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-6 py-5 rounded-2xl border border-white/5 bg-slate-800 text-white font-bold outline-none focus:border-indigo-500 transition-colors" placeholder="User Name" required />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-5 rounded-2xl border border-white/5 bg-slate-800 text-white font-bold outline-none focus:border-indigo-500 transition-colors" placeholder="Password" required />
                    </div>
                    {view === 'register' && (
                      <div className="space-y-4">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-xl border border-white/5 bg-slate-800 text-white font-bold outline-none focus:border-indigo-500 transition-colors" placeholder="Email Address" required />
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-2xl">
                          <button type="button" onClick={() => setRole(UserRole.CITIZEN)} className={`py-3 text-xs font-black uppercase rounded-xl transition-all ${role === UserRole.CITIZEN ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Citizen</button>
                          <button type="button" onClick={() => setRole(UserRole.ADMIN)} className={`py-3 text-xs font-black uppercase rounded-xl transition-all ${role === UserRole.ADMIN ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}>Admin</button>
                        </div>
                        {role === UserRole.ADMIN && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-2">Secret Admin Key Required</label>
                            <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} className="w-full px-6 py-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 font-bold outline-none focus:border-rose-500 transition-colors" placeholder="Enter Key" required />
                          </div>
                        )}
                      </div>
                    )}
                    <button type="submit" className="w-full py-6 bg-white text-black font-black rounded-3xl uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-50 transition-colors">
                      {view === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  </form>
                  <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="w-full text-center mt-10 text-slate-500 text-xs font-bold uppercase hover:text-white transition-colors">
                    {view === 'login' ? 'No account? Create one now' : 'Already have an account? Sign in'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Layout user={user} onLogout={handleLogout} language={language} setLanguage={setLanguage}>
                <div className="space-y-12">
                  <header>
                    <h1 className="text-6xl font-black text-white">{t.welcome}, {user?.username}</h1>
                    <div className="flex items-center space-x-4 mt-4">
                      <span className="text-xs font-bold text-slate-500 uppercase">{t.systemStatus}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">• {user?.role === UserRole.ADMIN ? t.subWelcomeAdmin : t.subWelcomeCitizen}</span>
                    </div>
                  </header>
                  <AnimatePresence mode="wait">
                    {user?.role === UserRole.ADMIN ? (
                      <AdminDashboard 
                        key="admin" 
                        reports={reports} 
                        onUpdateStatus={handleUpdateStatus} 
                        pulseSummary={pulseSummary} 
                        language={language} 
                      />
                    ) : (
                      <CitizenInterface 
                        key="citizen" 
                        onReportSubmit={handleReportSubmit} 
                        reports={reports} 
                        username={user?.username || ''} 
                        language={language} 
                      />
                    )}
                  </AnimatePresence>
                </div>
              </Layout>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default App;
