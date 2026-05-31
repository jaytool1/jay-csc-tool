import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { 
  Type, 
  Hash, 
  Key, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Check,
  CaseUpper,
  CaseLower,
  Baseline,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface TextToolsProps {
  onNavigate: (page: Page) => void;
  initialTool?: 'case' | 'counter' | 'password' | 'strength';
}

export function TextTools({ onNavigate, initialTool = 'case' }: TextToolsProps) {
  const [activeTool, setActiveTool] = useState<'case' | 'counter' | 'password' | 'strength'>(initialTool);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Password Strength State
  const [checkPassword, setCheckPassword] = useState('');
  const [strength, setStrength] = useState({
    score: 0,
    label: 'Very Weak',
    color: 'bg-red-500',
    tips: [] as string[]
  });

  const calculateStrength = (pwd: string) => {
    let score = 0;
    const tips = [];
    
    if (pwd.length >= 8) score += 1;
    else tips.push('Make it at least 8 characters long');
    
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    else tips.push('Add uppercase letters');
    
    if (/[0-9]/.test(pwd)) score += 1;
    else tips.push('Add numbers');
    
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    else tips.push('Add special characters');

    let label = 'Very Weak';
    let color = 'bg-red-500';

    if (score >= 5) { label = 'Very Strong'; color = 'bg-green-500'; }
    else if (score >= 4) { label = 'Strong'; color = 'bg-emerald-500'; }
    else if (score >= 3) { label = 'Good'; color = 'bg-yellow-500'; }
    else if (score >= 2) { label = 'Weak'; color = 'bg-orange-500'; }

    setStrength({ score, label, color, tips });
  };

  useEffect(() => {
    calculateStrength(checkPassword);
  }, [checkPassword]);

  // Password Generator State
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Case Converter Logic
  const convertCase = (type: 'upper' | 'lower' | 'sentence' | 'title') => {
    let result = text;
    switch (type) {
      case 'upper':
        result = text.toUpperCase();
        break;
      case 'lower':
        result = text.toLowerCase();
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        break;
      case 'title':
        result = text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        break;
    }
    setText(result);
  };

  // Word Counter Logic
  const stats = {
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    sentences: text.split(/[.!?]+/).filter(Boolean).length,
    paragraphs: text.split(/\n+/).filter(Boolean).length
  };

  // Password Generator Logic
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let chars = lowercase;
    if (includeUppercase) chars += uppercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;
    
    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  useEffect(() => {
    if (activeTool === 'password') {
      generatePassword();
    }
  }, [activeTool, length, includeUppercase, includeNumbers, includeSymbols]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => setActiveTool('case')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'case' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Baseline size={14} /> Case Converter
        </button>
        <button 
          onClick={() => setActiveTool('counter')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'counter' ? 'bg-white text-secondary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Hash size={14} /> Word Counter
        </button>
        <button 
          onClick={() => setActiveTool('password')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'password' ? 'bg-white text-[#ff7b61] shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Key size={14} /> Password Generator
        </button>
        <button 
          onClick={() => setActiveTool('strength')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'strength' ? 'bg-white text-emerald-500 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={14} /> Strength Checker
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {activeTool === 'case' || activeTool === 'counter' ? (
          <>
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                  <h3 className="text-slate-900 font-black flex items-center gap-3 uppercase tracking-tight">
                    {activeTool === 'case' ? <Type size={20} className="text-primary" /> : <Hash size={20} className="text-secondary" />}
                    Input Workspace
                  </h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleCopy(text)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all border border-slate-200"
                      title="Copy All"
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <button 
                      onClick={() => setText('')}
                      className="p-3 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition-all border border-slate-200"
                      title="Clear"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type your text here..."
                  className="w-full h-96 bg-slate-50 border border-slate-100 rounded-[1.5rem] p-8 text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none shadow-inner"
                />
              </div>

              {activeTool === 'case' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => convertCase('upper')} className="px-6 py-4 bg-white border border-slate-200 hover:border-primary text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 transition-all hover:shadow-lg">
                    <CaseUpper size={24} className="text-primary" /> UPPERCASE
                  </button>
                  <button onClick={() => convertCase('lower')} className="px-6 py-4 bg-white border border-slate-200 hover:border-primary text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 transition-all hover:shadow-lg">
                    <CaseLower size={24} className="text-primary" /> lowercase
                  </button>
                  <button onClick={() => convertCase('sentence')} className="px-6 py-4 bg-white border border-slate-200 hover:border-primary text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 transition-all hover:shadow-lg text-center">
                    <CaseUpper size={24} className="text-primary opacity-50" /> Sentence Case
                  </button>
                  <button onClick={() => convertCase('title')} className="px-6 py-4 bg-white border border-slate-200 hover:border-primary text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 transition-all hover:shadow-lg text-center">
                    <Baseline size={24} className="text-primary" /> Title Case
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white">
                <h3 className="text-white font-black mb-8 border-b border-white/10 pb-6 uppercase tracking-widest text-xs">Text Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Words</span>
                    <span className="text-primary font-black text-2xl">{stats.words}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Characters</span>
                    <span className="text-primary font-black text-2xl">{stats.chars}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Chars (raw)</span>
                    <span className="text-primary font-black text-2xl">{stats.charsNoSpace}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Sentences</span>
                    <span className="text-primary font-black text-2xl">{stats.sentences}</span>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-primary/10 rounded-2xl border border-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary">Content Quality</p>
                  <p className="text-xs text-white/60 font-medium leading-relaxed">Your text consists of <span className="text-white font-bold">{stats.paragraphs}</span> logical structural blocks (paragraphs).</p>
                </div>
              </div>
            </div>
          </>
        ) : activeTool === 'strength' ? (
          <div className="lg:col-span-12 max-w-2xl mx-auto w-full">
            <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-sm space-y-10">
              <div className="text-center">
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Security Audit</h3>
                <p className="text-slate-500 font-medium font-mono text-sm tracking-tight">Advanced password complexity analysis.</p>
              </div>

              <div className="space-y-8">
                <div className="relative">
                  <input 
                    type="text" 
                    value={checkPassword}
                    onChange={(e) => setCheckPassword(e.target.value)}
                    placeholder="Enter password to analyze..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 text-center text-2xl font-mono text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                  />
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-200 pointer-events-none">
                    {strength.score >= 4 ? <Lock size={32} className="text-emerald-500" /> : <Unlock size={32} />}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Safety Quotient</span>
                    <span className={`text-xs font-black uppercase tracking-widest ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1 shadow-inner">
                    <div 
                      className={`h-full transition-all duration-700 ease-out rounded-full ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {strength.tips.length > 0 && (
                  <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100">
                    <h4 className="text-amber-900 font-black mb-6 flex items-center gap-3 text-xs uppercase tracking-widest">
                      <AlertTriangle size={20} className="text-amber-500" /> Improvement Protocol
                    </h4>
                    <ul className="space-y-4">
                      {strength.tips.map((tip, i) => (
                        <li key={i} className="text-amber-800 text-sm flex items-start gap-3 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-200 mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest font-mono">Entropy</p>
                    <p className="text-slate-900 font-black text-lg">{Math.round(strength.score * 12.5)} <span className="text-[10px] text-slate-400 font-bold ml-1">BITS</span></p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest font-mono">Crack Time</p>
                    <p className="text-slate-900 font-black text-lg">
                      {strength.score >= 5 ? 'CENTURIES' : strength.score >= 4 ? 'YEARS' : strength.score >= 3 ? 'MONTHS' : 'MINUTES'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-12 max-w-2xl mx-auto w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32"></div>
              
              <div className="text-center relative z-10">
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Vault Generator</h3>
                <p className="text-white/40 font-medium font-mono text-xs uppercase tracking-widest">Military-grade random entropy generation.</p>
              </div>

              <div className="relative group z-10">
                <input 
                  type="text" 
                  value={password} 
                  readOnly 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-[2rem] p-10 text-center text-3xl font-mono text-[#ff7b61] tracking-[0.2em] focus:outline-none shadow-inner"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-3">
                  <button 
                    onClick={generatePassword}
                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5"
                    title="Regenerate"
                  >
                    <RefreshCw size={24} />
                  </button>
                  <button 
                    onClick={() => handleCopy(password)}
                    className="p-4 bg-[#ff7b61] text-white rounded-2xl shadow-2xl shadow-[#ff7b61]/20 hover:scale-105 transition-all"
                    title="Copy Password"
                  >
                    {copied ? <Check size={24} /> : <Copy size={24} />}
                  </button>
                </div>
              </div>

              <div className="space-y-10 relative z-10">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">
                    <span>Complexity Depth</span>
                    <span className="text-[#ff7b61]">{length} CHARS</span>
                  </div>
                  <input 
                    type="range" 
                    min="6" max="64" 
                    value={length} 
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#ff7b61] border border-white/5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all group">
                    <span className="text-white/60 font-black text-[10px] uppercase tracking-widest group-hover:text-white">Capitals</span>
                    <input 
                      type="checkbox" 
                      checked={includeUppercase} 
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                      className="w-5 h-5 rounded-md accent-[#ff7b61]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all group">
                    <span className="text-white/60 font-black text-[10px] uppercase tracking-widest group-hover:text-white">Numeric</span>
                    <input 
                      type="checkbox" 
                      checked={includeNumbers} 
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="w-5 h-5 rounded-md accent-[#ff7b61]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all group">
                    <span className="text-white/60 font-black text-[10px] uppercase tracking-widest group-hover:text-white">Special</span>
                    <input 
                      type="checkbox" 
                      checked={includeSymbols} 
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="w-5 h-5 rounded-md accent-[#ff7b61]"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide Section */}
      <section className="mt-24 grid md:grid-cols-2 gap-10">
         <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="text-primary" /> How to use?
            </h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Choose Tool', desc: 'Select between Case Converter, Word Counter, or Password Tools from the top nav.' },
                { step: '02', title: 'Input Content', desc: 'Paste your text or type directly into the processing area for real-time analysis.' },
                { step: '03', title: 'Apply Actions', desc: 'Use the action buttons to transform text or configure security settings.' },
                { step: '04', title: 'Copy Results', desc: 'Click the copy button to get your processed text or generated password instantly.' }
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <span className="text-primary font-black text-lg">{item.step}</span>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
         </div>

         <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Hash className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Smart Text Engine</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              Advanced algorithms for precise character counting and cryptographic password generation.
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest w-fit mx-auto shadow-xl">
              <Key size={16} className="text-primary" /> End-to-End Local
            </div>
         </div>
      </section>
    </div>
  );
}
