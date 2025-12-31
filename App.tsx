
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, Send, RefreshCw, Compass, PenTool, Shuffle, Zap, Sun, Moon, Radio } from 'lucide-react';
import { Audience, Tone, Theme, GeneratorParams, GreetingResponse, GreetingItem } from './types';
import { generateGreetings } from './services/geminiService';
import GreetingCard from './components/GreetingCard';

const THEMES = [
  'Growth & Transformation',
  'Technological Progress',
  'Human Evolution',
  'Hope & Resilience',
  'Inner Peace',
  'Creative Vision',
  'Global Harmony',
  'Digital Connectivity'
];

const AUTO_INTERVAL = 20000;

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greetings, setGreetings] = useState<GreetingItem[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<Theme>(Theme.Dark);
  
  const [params, setParams] = useState<GeneratorParams>({
    audience: Audience.Personal,
    tone: Tone.Visionary,
    themes: ['Growth & Transformation', 'Hope & Resilience']
  });

  const progressIntervalRef = useRef<number | null>(null);

  const randomizeParams = useCallback(() => {
    const audiences = Object.values(Audience);
    const tones = Object.values(Tone);
    const randomAudience = audiences[Math.floor(Math.random() * audiences.length)];
    const randomTone = tones[Math.floor(Math.random() * tones.length)];
    const randomThemes = [...THEMES].sort(() => 0.5 - Math.random()).slice(0, 3);

    setParams({
      audience: randomAudience,
      tone: randomTone,
      themes: randomThemes
    });
  }, []);

  const handleGenerate = useCallback(async (currentParams?: GeneratorParams) => {
    setLoading(true);
    setError(null);
    try {
      const activeParams = currentParams || params;
      const jsonResponse = await generateGreetings(activeParams);
      const parsed: GreetingResponse = JSON.parse(jsonResponse);
      
      setCategoryName(parsed.category || "The 2026 Collective");
      setGreetings(parsed.greetings || []);
    } catch (err: any) {
      setError("Creative synthesis interrupted. Retrying...");
      if (!isAutoMode) setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [params, isAutoMode]);

  useEffect(() => {
    if (isAutoMode) {
      handleGenerate();
      
      const startTime = Date.now();
      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / AUTO_INTERVAL) * 100, 100);
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          randomizeParams();
        }
      }, 100);
    } else {
      setProgress(0);
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
    };
  }, [isAutoMode, randomizeParams, handleGenerate]);

  // Dynamic Theme Classes
  const getThemeClasses = () => {
    switch(currentTheme) {
      case Theme.Light:
        return {
          body: 'bg-slate-50 text-slate-900',
          glass: 'bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-xl',
          label: 'text-slate-400',
          btnActive: 'bg-slate-900 text-white border-slate-900 shadow-xl',
          btnInactive: 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800',
          footer: 'text-slate-400 border-slate-200',
          author: 'text-slate-300 border-slate-200',
          accent: 'text-amber-600'
        };
      case Theme.Neon:
        return {
          body: 'bg-black text-cyan-400',
          glass: 'bg-black/90 backdrop-blur-2xl border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)]',
          label: 'text-cyan-900',
          btnActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]',
          btnInactive: 'bg-black/40 border-cyan-900/40 text-cyan-900 hover:text-cyan-500 hover:border-cyan-500/50',
          footer: 'text-cyan-900 border-cyan-900/30',
          author: 'text-cyan-900 border-cyan-900/30',
          accent: 'text-fuchsia-500 shadow-fuchsia-500/50'
        };
      default: // Dark
        return {
          body: 'bg-[#020617] text-slate-50',
          glass: 'bg-glass',
          label: 'text-slate-500',
          btnActive: 'bg-white/10 border-white/20 text-white shadow-2xl ring-1 ring-white/10',
          btnInactive: 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5',
          footer: 'text-slate-800 border-white/5',
          author: 'text-slate-600 border-white/5',
          accent: 'text-amber-500'
        };
    }
  };

  const themeStyles = getThemeClasses();

  return (
    <div className={`min-h-screen transition-colors duration-1000 selection:bg-amber-500/30 font-sans ${themeStyles.body}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {currentTheme === Theme.Dark && (
          <>
            <div className="absolute top-0 left-1/4 w-[60%] h-[60%] bg-blue-600/[0.04] blur-[160px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[60%] h-[60%] bg-amber-600/[0.04] blur-[160px] rounded-full" />
          </>
        )}
        {currentTheme === Theme.Neon && (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.05)_0%,_transparent_100%)]" />
            <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-fuchsia-600/[0.05] blur-[120px] rounded-full animate-pulse" />
          </>
        )}
        {currentTheme === Theme.Light && (
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,_rgba(251,191,36,0.03)_0%,_transparent_40%)]" />
        )}
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-28">
        <header className="text-center mb-24 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border text-[10px] font-black tracking-[0.4em] uppercase backdrop-blur-md transition-all ${currentTheme === Theme.Light ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white/5 border-white/10 text-amber-200/90'}`}>
            <Sparkles size={14} className={themeStyles.accent} />
            <span>{isAutoMode ? 'Neural Cycle Active' : 'Neural Design Studio'}</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tighter">
            <span className={`gradient-text ${currentTheme === Theme.Neon ? 'drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''}`}>Lumina</span>
          </h1>
          <p className={`text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed tracking-tight ${currentTheme === Theme.Light ? 'text-slate-500' : 'text-slate-400'}`}>
            Forging high-fidelity connections for the 2026 dawning. 
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <aside className="lg:col-span-4 space-y-10 sticky top-16">
            
            {/* Theme Selector */}
            <section className={`rounded-[3rem] p-10 space-y-8 transition-all duration-1000 ${themeStyles.glass}`}>
              <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] ${themeStyles.label}`}>
                <Sun size={14} /> Visual Environment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[Theme.Light, Theme.Dark, Theme.Neon].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCurrentTheme(t)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all border text-[10px] font-bold uppercase tracking-widest ${
                      currentTheme === t ? themeStyles.btnActive : themeStyles.btnInactive
                    }`}
                  >
                    {t === Theme.Light && <Sun size={16} />}
                    {t === Theme.Dark && <Moon size={16} />}
                    {t === Theme.Neon && <Radio size={16} />}
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section className={`rounded-[3rem] p-10 space-y-12 transition-all duration-1000 ${themeStyles.glass} ${isAutoMode ? 'opacity-20 grayscale pointer-events-none scale-95' : 'opacity-100'}`}>
              <div className="space-y-8">
                <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] ${themeStyles.label}`}>
                  <Compass size={14} /> Target Audience
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {Object.values(Audience).map((aud) => (
                    <button
                      key={aud}
                      onClick={() => setParams(prev => ({ ...prev, audience: aud }))}
                      className={`px-6 py-4 rounded-[1.25rem] text-sm font-medium text-left transition-all border ${
                        params.audience === aud ? themeStyles.btnActive : themeStyles.btnInactive
                      }`}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <label className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] ${themeStyles.label}`}>
                  <Zap size={14} /> Tone & Expression
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {Object.values(Tone).map((tn) => (
                    <button
                      key={tn}
                      onClick={() => setParams(prev => ({ ...prev, tone: tn }))}
                      className={`px-6 py-4 rounded-[1.25rem] text-sm font-medium text-left transition-all border ${
                        params.tone === tn ? themeStyles.btnActive : themeStyles.btnInactive
                      }`}
                    >
                      {tn}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                className={`w-full py-6 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-50 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${currentTheme === Theme.Neon ? 'shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'shadow-[0_20px_50px_rgba(180,83,9,0.3)]'}`}
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                <span>{loading ? 'Synthesizing...' : 'Generate Lab Data'}</span>
              </button>
            </section>

            <section className={`rounded-[3rem] p-10 border-2 transition-all duration-1000 ${themeStyles.glass} ${currentTheme === Theme.Neon ? 'border-cyan-500/20' : 'border-amber-500/10'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-colors duration-500 ${isAutoMode ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-600'}`}>
                    <Shuffle size={24} className={isAutoMode ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight">Auto-Cycle</h3>
                    <p className={`text-[10px] uppercase tracking-widest font-black ${themeStyles.label}`}>Evolutionary Feed</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 ${isAutoMode ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-slate-800'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-500 ${isAutoMode ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
              </div>

              {isAutoMode && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className={`h-2.5 w-full rounded-full overflow-hidden border transition-colors ${currentTheme === Theme.Light ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-white/5'}`}>
                    <div className="h-full bg-amber-500 transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(245,158,11,0.6)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-center">
                     <p className="text-[9px] text-amber-500/60 font-mono tracking-widest font-bold uppercase">Refreshing Lab Data...</p>
                  </div>
                </div>
              )}
            </section>
          </aside>

          <section className="lg:col-span-8 space-y-12">
            {greetings.length > 0 || loading ? (
              <div className="space-y-16">
                <div className={`flex items-end justify-between px-4 border-l-2 py-2 transition-colors ${currentTheme === Theme.Neon ? 'border-cyan-500' : 'border-amber-500/20'}`}>
                  <h2 className="text-5xl font-serif font-bold tracking-tight">
                    {categoryName || "2026 Collective"}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                  {loading && !greetings.length ? (
                     Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`h-[500px] rounded-[3rem] animate-pulse border transition-colors ${currentTheme === Theme.Light ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.02] border-white/5'}`} />
                    ))
                  ) : (
                    greetings.map((greeting, idx) => (
                      <GreetingCard 
                        key={`${greeting.text.slice(0, 15)}-${idx}`} 
                        content={greeting.text} 
                        context={greeting.context}
                        index={idx} 
                        themes={params.themes}
                        tone={params.tone}
                      />
                    ))
                  )}
                  {loading && greetings.length > 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-[4rem] z-20 flex items-center justify-center pointer-events-none">
                       <div className="bg-amber-500 text-[#020617] px-8 py-3 rounded-full text-xs font-black tracking-[0.2em] shadow-2xl">
                         SYNCHRONIZING NEW WAVE
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`h-full flex flex-col items-center justify-center min-h-[660px] border-2 border-dashed rounded-[5rem] text-center px-12 group transition-all duration-700 hover:bg-white/[0.01] ${currentTheme === Theme.Light ? 'border-slate-200 hover:border-slate-400' : 'border-white/5 hover:border-amber-500/10'}`}>
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-12 transition-all duration-700 shadow-2xl ${currentTheme === Theme.Light ? 'bg-slate-100 text-slate-300' : 'bg-white/5 text-slate-800 group-hover:text-amber-500/30'}`}>
                  <PenTool size={64} />
                </div>
                <h3 className={`text-4xl font-bold mb-6 font-serif tracking-tight ${currentTheme === Theme.Light ? 'text-slate-400' : 'text-slate-400'}`}>Studio Idle.</h3>
                <p className={`max-w-sm font-medium text-lg leading-relaxed ${currentTheme === Theme.Light ? 'text-slate-400' : 'text-slate-600'}`}>
                  Design your parameters in the lab and trigger the synthesizer to manifest the dawn.
                </p>
              </div>
            )}
          </section>
        </div>

        <footer className={`mt-48 py-20 border-t text-center space-y-4 transition-colors ${themeStyles.footer}`}>
          <p className="text-[11px] font-black tracking-[1em] uppercase ml-[1em]">
            FOR THE 2026 DAWNING • NEURAL DESIGN STUDIO
          </p>
          <p className="text-[10px] font-medium tracking-[0.5em] uppercase">
            DESIGNED & DEVELOPED BY <span className="text-amber-500/80 font-bold">BALAJIDUDDUKURI</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
