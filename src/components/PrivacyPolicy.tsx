import React, { useEffect } from 'react';
import { Page } from '../App';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (page: Page) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy - Jay CSC Tool';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <button 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 transition-colors group font-bold uppercase text-xs tracking-widest"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] -z-10 rounded-full"></div>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">Last Updated: April 18, 2026</p>

        <section className="space-y-12">
          <div className="flex gap-8">
            <div className="flex-shrink-0 w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">100% Client-Side Processing</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Jay CSC Tool is built with a "Privacy-First" approach. All document processing, image resizing, and PDF generation happen exclusively in your web browser. We do <strong>NOT</strong> upload your personal documents, photos, or data to any server.
              </p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-shrink-0 w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-secondary shadow-sm">
              <Eye size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">No Data Collection</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We do not collect or store any sensitive information about you or your clients. There is no database behind our processing tools. Once you close your browser tab, all session data is permanently cleared from your device's memory.
              </p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-shrink-0 w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-tertiary shadow-sm">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Browser Storage</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We may use local storage or session storage strictly for application state management (like your current tab or basic settings) to provide a smooth user experience. This data never leaves your computer.
              </p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex-shrink-0 w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Third-Party Services</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Our site may include links to third-party websites. We are not responsible for the privacy practices or the content of these sites. We use Google Fonts and standard CDN services to deliver app assets efficiently.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-loose">
            If you have any questions about this Privacy Policy, please contact us.<br/>
            <span className="text-primary tracking-[8px]">Your security is our highest priority.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
