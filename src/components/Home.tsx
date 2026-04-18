import React from 'react';
import { Page } from '../App';
import { FileText, Image as ImageIcon, Crop, IdCard, Printer, ArrowRight, FileType, Maximize, Combine, Scissors, RotateCw, Baseline, Hash, Key, ShieldCheck, Search } from 'lucide-react';

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
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel text-white/80 text-sm font-medium mb-10">
            <span className="flex h-2 w-2 rounded-full bg-[#00d2ff] animate-pulse"></span>
            100% Free & Secure Client-Side Tools
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.1] md:leading-[0.95] drop-shadow-2xl">
            Jay CSC Tool <br className="hidden md:block" /><span className="text-gradient">Modern Edition</span>
          </h1>
          <p className="mt-4 text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Premium utilities for CSC VLEs and common users. Fast, privacy-focused, and works completely offline in your browser. No data is uploaded to our servers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => onNavigate('pan-resizer')}
              className="px-8 py-3.5 text-base font-medium btn-primary rounded-xl hover:shadow-lg transition-all active:scale-95"
            >
              Start with PAN Resizer
            </button>
            <button 
              onClick={() => onNavigate('id-maker')}
              className="px-8 py-3.5 text-base font-medium text-white glass-panel hover:bg-white/10 transition-all active:scale-95"
            >
              Try Multi ID Maker
            </button>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="text-left">
              <h2 className="text-3xl font-bold text-white">Popular Tools</h2>
              <p className="mt-2 text-white/60">Everything you need to process documents quickly.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="text"
                placeholder="Search tools (e.g. PAN, PDF, Resize)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00d2ff]/50 focus:border-[#00d2ff] transition-all"
              />
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <div 
                  key={tool.id}
                  onClick={() => onNavigate(tool.id)}
                  className="group relative glass-panel p-6 glass-panel-hover cursor-pointer overflow-hidden flex flex-col items-start h-full"
                >
                  {tool.popular && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-gradient-to-r from-[#7b61ff] to-[#00d2ff] text-white text-xs font-bold rounded-full shadow-sm">
                      POPULAR
                    </div>
                  )}
                  <div className={`w-[44px] h-[44px] rounded-xl bg-primary/20 text-[#7b61ff] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d2ff] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-6 line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-[#00d2ff] font-medium text-sm mt-auto">
                    Use Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-panel">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-white/20 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
              <p className="text-white/60">Try searching for something else like "PAN" or "PDF".</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-[#00d2ff] hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 glass-panel">
              <div className="w-12 h-12 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h4 className="text-lg font-bold text-white mb-2">100% Private</h4>
              <p className="text-white/60 text-sm">All processing happens in your browser. We never upload your sensitive documents.</p>
            </div>
            <div className="p-6 glass-panel">
              <div className="w-12 h-12 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h4 className="text-lg font-bold text-white mb-2">Lightning Fast</h4>
              <p className="text-white/60 text-sm">No waiting for server uploads or downloads. Instant results using modern web tech.</p>
            </div>
            <div className="p-6 glass-panel">
              <div className="w-12 h-12 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h4 className="text-lg font-bold text-white mb-2">Always Free</h4>
              <p className="text-white/60 text-sm">No hidden charges, no watermarks, no registration required. Built for the community.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
