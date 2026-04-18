import React, { useEffect } from 'react';
import { Page } from '../App';
import { Scale, AlertCircle, FileCheck, HelpCircle, ChevronLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (page: Page) => void;
}

export function TermsOfService({ onNavigate }: TermsOfServiceProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms of Service - Jay CSC Tool';
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
          Terms <span className="text-gradient">of Service</span>
        </h1>
        <p className="text-white/60 mb-12">Effective Date: April 18, 2026</p>

        <section className="space-y-12">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#7b61ff]">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Acceptance of Terms</h2>
              <p className="text-white/60 leading-relaxed">
                By accessing and using Jay CSC Tool, you agree to follow and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#00d2ff]">
              <FileCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Use of Service</h2>
              <p className="text-white/60 leading-relaxed">
                Jay CSC Tool provides utility tools for CSC VLEs and individual users. You are responsible for ensuring that the contents of documents you process (like PAN, Aadhar, or Resumes) are accurate and that you have the right to modify them.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#ff7b61]">
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">No Warranty</h2>
              <p className="text-white/60 leading-relaxed">
                Our services are provided "as is" without any warranties, express or implied. We do not guarantee that the tools will meet all your specific requirements or that their results will be error-free. You use these tools at your own risk.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Limitation of Liability</h2>
              <p className="text-white/60 leading-relaxed">
                Jay CSC Tool and its developers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our tools, including loss of data or business interruption.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm italic">
            Note: We reserve the right to update these terms at any time. Your continued use of the platform after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
}
