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
  AlertTriangle
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
      <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTool('case')}
          className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'case' ? 'bg-[#7b61ff] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Baseline size={18} /> Case Converter
        </button>
        <button 
          onClick={() => setActiveTool('counter')}
          className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'counter' ? 'bg-[#00d2ff] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Hash size={18} /> Word Counter
        </button>
        <button 
          onClick={() => setActiveTool('password')}
          className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'password' ? 'bg-[#ff7b61] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Key size={18} /> Password Generator
        </button>
        <button 
          onClick={() => setActiveTool('strength')}
          className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'strength' ? 'bg-[#00d2ff] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <ShieldCheck size={18} /> Strength Checker
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {activeTool === 'case' || activeTool === 'counter' ? (
          <>
            <div className="lg:col-span-8 space-y-4">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    {activeTool === 'case' ? <Type size={20} /> : <Hash size={20} />}
                    Input Text
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(text)}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                      title="Copy All"
                    >
                      {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                    <button 
                      onClick={() => setText('')}
                      className="p-2 text-white/60 hover:text-red-400 transition-colors"
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
                  className="w-full h-80 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#7b61ff]/50 transition-colors resize-none"
                />
              </div>

              {activeTool === 'case' && (
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => convertCase('upper')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                    <CaseUpper size={18} /> UPPERCASE
                  </button>
                  <button onClick={() => convertCase('lower')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                    <CaseLower size={18} /> lowercase
                  </button>
                  <button onClick={() => convertCase('sentence')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                    Sentence case
                  </button>
                  <button onClick={() => convertCase('title')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                    Title Case
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel p-6">
                <h3 className="text-white font-bold mb-6 border-b border-white/10 pb-4">Text Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Words</span>
                    <span className="text-white font-bold text-xl">{stats.words}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Characters</span>
                    <span className="text-white font-bold text-xl">{stats.chars}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Chars (no spaces)</span>
                    <span className="text-white font-bold text-xl">{stats.charsNoSpace}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Sentences</span>
                    <span className="text-white font-bold text-xl">{stats.sentences}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Paragraphs</span>
                    <span className="text-white font-bold text-xl">{stats.paragraphs}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTool === 'strength' ? (
          <div className="lg:col-span-12 max-w-2xl mx-auto w-full">
            <div className="glass-panel p-8 space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Password Strength Checker</h3>
                <p className="text-white/60 text-sm">Test how secure your password really is.</p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type="text" 
                    value={checkPassword}
                    onChange={(e) => setCheckPassword(e.target.value)}
                    placeholder="Enter password to test..."
                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-6 text-center text-xl font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#00d2ff]/50 transition-all"
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                    {strength.score >= 4 ? <Lock size={24} className="text-green-500" /> : <Unlock size={24} />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Security Level</span>
                    <span className={`text-sm font-black uppercase ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-500 ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {strength.tips.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                      <AlertTriangle size={16} className="text-yellow-500" /> Improvement Tips
                    </h4>
                    <ul className="space-y-2">
                      {strength.tips.map((tip, i) => (
                        <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-4 text-center">
                    <p className="text-[10px] text-white/40 uppercase font-black mb-1">Entropy</p>
                    <p className="text-white font-bold">{Math.round(strength.score * 12.5)} bits</p>
                  </div>
                  <div className="glass-panel p-4 text-center">
                    <p className="text-[10px] text-white/40 uppercase font-black mb-1">Crack Time</p>
                    <p className="text-white font-bold">
                      {strength.score >= 5 ? 'Centuries' : strength.score >= 4 ? 'Years' : strength.score >= 3 ? 'Months' : 'Minutes'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-12 max-w-2xl mx-auto w-full">
            <div className="glass-panel p-8 space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Secure Password Generator</h3>
                <p className="text-white/60 text-sm">Create strong, random passwords instantly.</p>
              </div>

              <div className="relative group">
                <input 
                  type="text" 
                  value={password} 
                  readOnly 
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-6 text-center text-2xl font-mono text-[#ff7b61] tracking-wider focus:outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <button 
                    onClick={generatePassword}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
                    title="Regenerate"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button 
                    onClick={() => handleCopy(password)}
                    className="p-3 bg-[#ff7b61] text-white rounded-xl shadow-lg hover:opacity-90 transition-all"
                    title="Copy Password"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold text-white mb-4">
                    <span>PASSWORD LENGTH</span>
                    <span className="text-[#ff7b61]">{length}</span>
                  </div>
                  <input 
                    type="range" 
                    min="6" max="64" 
                    value={length} 
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full accent-[#ff7b61]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                    <span className="text-white font-medium">Uppercase</span>
                    <input 
                      type="checkbox" 
                      checked={includeUppercase} 
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                      className="w-5 h-5 accent-[#ff7b61]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                    <span className="text-white font-medium">Numbers</span>
                    <input 
                      type="checkbox" 
                      checked={includeNumbers} 
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="w-5 h-5 accent-[#ff7b61]"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                    <span className="text-white font-medium">Symbols</span>
                    <input 
                      type="checkbox" 
                      checked={includeSymbols} 
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="w-5 h-5 accent-[#ff7b61]"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
