import React from 'react';
import { Page } from '../App';
import { FileText, Image as ImageIcon, Crop, IdCard, Printer, ArrowRight, FileType, Maximize, Combine, Scissors, RotateCw, Baseline, Hash, Key, ShieldCheck, Search, Type } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const tools = [
    {
      id: 'pan-resizer' as Page,
      title: 'PAN Card Resizer',
      description: 'Resize photo & signature for NSDL/UTI exactly to required KB and pixels.',
      icon: <Crop className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50',
      popular: true,
    },
    {
      id: 'id-maker' as Page,
      title: 'Multi ID Maker',
      description: 'Advanced generator for School, Visitor, and Demo IDs with QR codes & bulk support.',
      icon: <IdCard className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-50',
      popular: true,
    },
    {
      id: 'resume-maker' as Page,
      title: 'Resume Builder',
      description: 'Create modern resumes with dynamic sections and download as PDF.',
      icon: <FileText className="w-8 h-8 text-emerald-500" />,
      color: 'bg-emerald-50',
    },
    {
      id: 'signature-resizer' as Page,
      title: 'Signature Resizer',
      description: 'Crop, remove background, and resize signatures to specific KB sizes.',
      icon: <ImageIcon className="w-8 h-8 text-orange-500" />,
      color: 'bg-orange-50',
    },
    {
      id: 'whatsapp-print' as Page,
      title: 'WhatsApp Print',
      description: 'Auto-fit WhatsApp images into A4 grids for easy passport/ID printing.',
      icon: <Printer className="w-8 h-8 text-rose-500" />,
      color: 'bg-rose-50',
    },
    {
      id: 'photo-name-joiner' as Page,
      title: 'Photo Name Joiner',
      description: 'Add name and date professional overlays to your photos for exam forms.',
      icon: <Type className="w-8 h-8 text-indigo-500" />,
      color: 'bg-indigo-50',
      popular: true,
    },
    {
      id: 'image-to-pdf' as Page,
      title: 'Image to PDF',
      description: 'Convert single or multiple images into a high-quality PDF document instantly.',
      icon: <FileType className="w-8 h-8 text-[#7b61ff]" />,
      color: 'bg-[#7b61ff]/10',
    },
    {
      id: 'image-resizer' as Page,
      title: 'Image Resizer',
      description: 'Resize images to specific KB/MB size for online forms and applications.',
      icon: <Maximize className="w-8 h-8 text-[#00d2ff]" />,
      color: 'bg-[#00d2ff]/10',
    },
    {
      id: 'pdf-merge' as Page,
      title: 'Merge PDF',
      description: 'Combine multiple PDF documents into a single file with custom page ordering.',
      icon: <Combine className="w-8 h-8 text-[#7b61ff]" />,
      color: 'bg-[#7b61ff]/10',
    },
    {
      id: 'pdf-split' as Page,
      title: 'Split PDF',
      description: 'Separate a large PDF into individual pages or extract specific document ranges.',
      icon: <Scissors className="w-8 h-8 text-[#00d2ff]" />,
      color: 'bg-[#00d2ff]/10',
    },
    {
      id: 'pdf-rotate' as Page,
      title: 'Rotate PDF',
      description: 'Permanently rotate PDF pages clockwise or anti-clockwise for better reading orientation.',
      icon: <RotateCw className="w-8 h-8 text-[#ff7b61]" />,
      color: 'bg-[#ff7b61]/10',
    },
    {
      id: 'text-case' as Page,
      title: 'Case Converter',
      description: 'Convert text to UPPERCASE, lowercase, Sentence case, or Title Case instantly.',
      icon: <Baseline className="w-8 h-8 text-[#7b61ff]" />,
      color: 'bg-[#7b61ff]/10',
    },
    {
      id: 'word-counter' as Page,
      title: 'Word Counter',
      description: 'Count words, characters, sentences, and paragraphs in your text with real-time stats.',
      icon: <Hash className="w-8 h-8 text-[#00d2ff]" />,
      color: 'bg-[#00d2ff]/10',
    },
    {
      id: 'password-gen' as Page,
      title: 'Password Generator',
      description: 'Generate strong, random, and secure passwords with customizable length and characters.',
      icon: <Key className="w-8 h-8 text-[#ff7b61]" />,
      color: 'bg-[#ff7b61]/10',
    },
    {
      id: 'password-strength' as Page,
      title: 'Strength Checker',
      description: 'Analyze your password security level with entropy scores and improvement tips.',
      icon: <ShieldCheck className="w-8 h-8 text-[#00d2ff]" />,
      color: 'bg-[#00d2ff]/10',
    },
  ];

  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold mb-10 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            100% Free & Secure Client-Side Tools
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[1.1] md:leading-[0.95]">
            Jay CSC Tool <br className="hidden md:block" /><span className="text-gradient">Modern Edition</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium">
            Premium utilities for CSC VLEs and common users. Fast, privacy-focused, and works completely offline in your browser. No data is uploaded to our servers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => onNavigate('pan-resizer')}
              className="px-10 py-4 text-base font-bold btn-primary rounded-2xl hover:shadow-xl transition-all active:scale-95"
            >
              Start with PAN Resizer
            </button>
            <button 
              onClick={() => onNavigate('id-maker')}
              className="px-10 py-4 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              Try Multi ID Maker
            </button>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="text-left">
              <h2 className="text-4xl font-[900] text-slate-900 tracking-tight">Popular Tools</h2>
              <p className="mt-2 text-slate-500 font-medium text-lg">Everything you need to process documents quickly.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search tools (e.g. PAN, PDF)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTools.map((tool) => (
                <div 
                  key={tool.id}
                  onClick={() => onNavigate(tool.id)}
                  className="group relative glass-panel p-8 glass-panel-hover cursor-pointer overflow-hidden flex flex-col items-start h-full"
                >
                  {tool.popular && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full shadow-lg tracking-widest uppercase">
                      Popular
                    </div>
                  )}
                  <div className={`w-[56px] h-[56px] rounded-2xl bg-slate-100 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors tracking-tight">
                    {tool.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-3 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-primary font-bold text-sm mt-auto group/btn">
                    Use Tool <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass-panel bg-white">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-6 border border-slate-100">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No tools found</h3>
              <p className="text-slate-500 font-medium">Try searching for something else like "PAN" or "PDF".</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-8 text-primary font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-10 glass-panel bg-white">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black border border-blue-100">1</div>
              <h4 className="text-xl font-[800] text-slate-900 mb-3 tracking-tight">100% Private</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">All processing happens directly in your browser. We never upload your sensitive documents to any server.</p>
            </div>
            <div className="p-10 glass-panel bg-white">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black border border-emerald-100">2</div>
              <h4 className="text-xl font-[800] text-slate-900 mb-3 tracking-tight">Lightning Fast</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">No waiting for client-server roundtrips. Experience instant results powered by modern web technologies.</p>
            </div>
            <div className="p-10 glass-panel bg-white">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-black border border-amber-100">3</div>
              <h4 className="text-xl font-[800] text-slate-900 mb-3 tracking-tight">Always Free</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">No hidden charges, no watermark, and no registration required. Built with ❤️ for the community.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
