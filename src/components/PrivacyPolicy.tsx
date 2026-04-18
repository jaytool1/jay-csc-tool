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
        className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="glass-panel p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7b61ff]/10 blur-[100px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00d2ff]/10 blur-[100px] -z-10 rounded-full"></div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Privacy <span className="text-gradient">Policy</span>
        </h1>
        <p className="text-white/60 mb-12">Last Updated: April 18, 2026</p>

        <section className="space-y-12">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#7b61ff]">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">100% Client-Side Processing</h2>
              <p className="text-white/60 leading-relaxed">
                Jay CSC Tool is built with a "Privacy-First" approach. All document processing, image resizing, and PDF generation happen exclusively in your web browser. We do <strong>NOT</strong> upload your personal documents, photos, or data to any server.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#00d2ff]">
              <Eye size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">No Data Collection</h2>
              <p className="text-white/60 leading-relaxed">
                We do not collect or store any sensitive information about you or your clients. There is no database behind our processing tools. Once you close your browser tab, all session data is permanently cleared from your device's memory.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#ff7b61]">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Browser Storage</h2>
              <p className="text-white/60 leading-relaxed">
                We may use local storage or session storage strictly for application state management (like your current tab or basic settings) to provide a smooth user experience. This data never leaves your computer.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Third-Party Services</h2>
              <p className="text-white/60 leading-relaxed">
                Our site may include links to third-party websites. We are not responsible for the privacy practices or the content of these sites. We use Google Fonts and standard CDN services to deliver app assets efficiently.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            If you have any questions about this Privacy Policy, please contact us. Your security is our highest priority.
          </p>
        </div>
      </div>
    </div>
  );
}
