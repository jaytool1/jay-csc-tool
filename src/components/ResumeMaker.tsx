import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import { 
  FileText, Download, Plus, Trash2, Layout as LayoutIcon, Sparkles, 
  FileCheck, Printer, Camera, Mail, Phone, MapPin, Linkedin, 
  Github, Globe, Award, BookOpen, Briefcase, User, Languages as LangIcon,
  ChevronRight, ChevronLeft, Save, Upload, Moon, Sun, Monitor, 
  Grid, List, Layers, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { ResumePreviewData } from './ResumePreviewData';

interface ResumeMakerProps {
  onNavigate: (page: Page) => void;
}

type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'creative' | 'professional' | 'ats' | 'modern-sidebar';

interface Experience {
  id: number;
  company: string;
  role: string;
  duration: string;
  desc: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  year: string;
}

interface Project {
  id: number;
  title: string;
  link: string;
  desc: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
}

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
  photo: string | null;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  languages: string;
  skills: string;
}

export function ResumeMaker({ onNavigate }: ResumeMakerProps) {
  const [template, setTemplate] = useState<ResumeTemplate>('modern');
  const [step, setStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  const [data, setData] = useState<ResumeData>({
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john.doe@techvision.com',
    phone: '+1 (555) 000-1234',
    address: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.dev',
    photo: null,
    summary: 'Strategic Senior Software Engineer with 8+ years of experience in building high-performance web applications. Expert in architectural design, cloud infrastructure, and leading cross-functional teams to deliver scalable SaaS solutions.',
    experience: [
      { id: 1, company: 'TechVision Global', role: 'Staff Engineer', duration: '2021 - Present', desc: 'Architected microservices architecture handling 10M+ daily requests. Improved system latency by 40% through strategic caching and DB optimization.' },
      { id: 2, company: 'Innovation Hub', role: 'Senior Developer', duration: '2018 - 2021', desc: 'Led the frontend team to rebuild the core customer portal using React and TypeScript, increasing user retention by 25%.' }
    ],
    education: [
      { id: 1, school: 'Stanford University', degree: 'M.S. in Computer Science', year: '2016 - 2018' },
      { id: 2, school: 'UC Berkeley', degree: 'B.S. in Software Engineering', year: '2012 - 2016' }
    ],
    projects: [
      { id: 1, title: 'OpenCloud Infrastructure', link: 'github.com/johndoe/opencloud', desc: 'A decentralized cloud orchestration engine built with Go and Kubernetes.' }
    ],
    certifications: [
      { id: 1, name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2022' }
    ],
    languages: 'English (Native), German (Fluent), Spanish (Basic)',
    skills: 'React, Node.js, TypeScript, AWS, Docker, Kubernetes, PostgreSQL, GraphQL, Python, System Design'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [contentScale, setContentScale] = useState(1);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!resumeRef.current) return;
      const element = resumeRef.current;
      const maxHeight = 1123;
      
      // Measure without transform to get true scrollHeight
      const originalTransform = element.style.transform;
      element.style.transform = 'none';
      element.style.height = 'auto';
      
      const naturalHeight = element.scrollHeight;
      
      if (naturalHeight > maxHeight) {
        const ratio = maxHeight / naturalHeight;
        // Limit shrink to 0.75 for readability
        setContentScale(Math.max(0.75, ratio));
      } else {
        setContentScale(1);
      }
      
      // Restore fixed height
      element.style.height = '1123px';
      element.style.transform = originalTransform;
    };

    const timeoutId = setTimeout(checkOverflow, 300);
    return () => clearTimeout(timeoutId);
  }, [data, template]);

  // Auto-save to LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('resume_builder_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved data');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('resume_builder_data', JSON.stringify(data));
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleListChange = (id: number, field: string, value: string, type: 'experience' | 'education' | 'projects' | 'certifications') => {
    setData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addListItem = (type: 'experience' | 'education' | 'projects' | 'certifications') => {
    let newItem: any;
    switch (type) {
      case 'experience':
        newItem = { id: Date.now(), company: '', role: '', duration: '', desc: '' };
        break;
      case 'education':
        newItem = { id: Date.now(), school: '', degree: '', year: '' };
        break;
      case 'projects':
        newItem = { id: Date.now(), title: '', link: '', desc: '' };
        break;
      case 'certifications':
        newItem = { id: Date.now(), name: '', issuer: '', date: '' };
        break;
    }
    
    setData(prev => ({
      ...prev,
      [type]: [...(prev[type] as any[]), newItem]
    }));
  };

  const removeListItem = (id: number, type: 'experience' | 'education' | 'projects' | 'certifications') => {
    setData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter(item => item.id !== id)
    }));
  };

  // AI Simulation Functions
  const simulateAISummary = () => {
    const summaries = [
      `Dedicated ${data.title || 'Professional'} with a proven track record of excellence. Expert in leveraging ${data.skills.split(',')[0] || 'industry-standard'} tools to drive organizational growth and innovation. Highly collaborative team player with strong problem-solving abilities.`,
      `Results-oriented ${data.title || 'Professional'} specializing in ${data.skills.split(',')[0] || 'strategic'} solutions. Committed to delivering high-quality outputs while optimizing operational efficiency. Experienced in leading diverse teams through complex project lifecycles.`,
      `Innovative ${data.title || 'Professional'} with over ${data.experience.length * 3}+ years of expertise. Passionate about ${data.skills.split(',')[1] || 'technology'} and its capacity to transform user experiences. Skilled in strategic planning and execution.`
    ];
    const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
    setData(prev => ({ ...prev, summary: randomSummary }));
  };

  const simulateAIBulletPoints = (id: number) => {
    const suggestions = [
      "Optimized system performance leading to a 30% reduction in server response time.",
      "Spearheaded the integration of automated testing protocols, increasing code coverage by 50%.",
      "Collaborated with cross-functional stakeholders to define product roadmaps and technical requirements.",
      "Mentored junior developers on best practices in architecture and clean code principles.",
      "Managed successful delivery of high-stakes projects on time and under budget."
    ];
    const bullet = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, desc: exp.desc ? exp.desc + '\n' + bullet : bullet } : exp
      )
    }));
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'resume_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importFromJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setData(json);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (e) {
          setExportError('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (data.name) score += 10;
    if (data.photo) score += 5;
    if (data.email && data.phone && data.address) score += 15;
    if (data.summary) score += 10;
    if (data.experience.length > 0) score += 20;
    if (data.education.length > 0) score += 20;
    if (data.skills) score += 10;
    if (data.projects.length > 0) score += 5;
    if (data.certifications.length > 0) score += 5;
    return Math.min(score, 100);
  };

  const generatePDF = async () => {
    if (!resumeRef.current) return;
    setIsGenerating(true);
    setExportError(null);
    
    try {
      // Small delay for layout to settle
      await new Promise(resolve => setTimeout(resolve, 800));

      const element = resumeRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, // Scale 2 is usually enough for high quality without crashing
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // 1. Sanitize all style tags to remove oklch/oklab definitions that crash the parser
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            // Replace oklch/oklab with hex equivalents for better visual consistency
            let css = styleTags[i].textContent || '';
            css = css.replace(/oklch\(0\.45 0\.24 277\.02\)/g, '#7c3aed'); // Primary
            css = css.replace(/(oklch|oklab|lch|lab)\([^)]+\)/g, '#334155'); // Default to slate-700
            styleTags[i].textContent = css;
          }

          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            // Force replace any oklch/oklab in inline styles
            const styleAttr = el.getAttribute('style');
            if (styleAttr && /(oklch|oklab|lch|lab)/.test(styleAttr)) {
              el.setAttribute('style', styleAttr.replace(/(oklch|oklab|lch|lab)\([^)]+\)/g, '#334155'));
            }
            // Computed style check for important colors
            const style = window.getComputedStyle(el);
            ['backgroundColor', 'color', 'borderColor', 'outlineColor', 'boxShadow'].forEach(prop => {
              const val = (style as any)[prop];
              if (val && typeof val === 'string' && /(oklch|oklab|lch|lab)/.test(val)) {
                // Heuristic for background vs text
                if (val.includes(' 0.9 ') || val.includes(' 0.95 ')) el.style.setProperty(prop, '#f8fafc', 'important');
                else if (val.includes(' 0.1 ') || val.includes(' 0.2 ')) el.style.setProperty(prop, '#0f172a', 'important');
                else el.style.setProperty(prop, '#334155', 'important');
              }
            });

            if (style.boxShadow && /(oklch|oklab|lch|lab)/.test(style.boxShadow)) {
              el.style.boxShadow = 'none';
            }
          }
          
          // Ensure the cloned container is visible and not clipped
          const clonedResume = clonedDoc.getElementById('resume-content-root');
          if (clonedResume) {
            clonedResume.style.height = 'auto';
            clonedResume.style.minHeight = '297mm';
            clonedResume.style.overflow = 'visible';
            clonedResume.style.position = 'relative';
          }
        }
      });

      if (!canvas) throw new Error('Canvas generation failed');

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const canvasToPdfRatio = pdfWidth / imgWidth;
      const totalPdfContentHeight = imgHeight * canvasToPdfRatio;
      
      if (totalPdfContentHeight <= pdfHeight + 1) {
        // Fits on one page
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, totalPdfContentHeight, undefined, 'FAST');
      } else {
        // Multi-page support
        let heightLeft = totalPdfContentHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfContentHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - totalPdfContentHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfContentHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
      }
      
      pdf.save(`${data.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setExportError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Premium Navbar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <FileText size={24} />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter">Resu<span className="text-primary">Master</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setShowTemplateModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
            >
              <LayoutIcon size={18} /> Templates
            </button>
            <div className="hidden sm:block h-6 w-[1px] bg-slate-200 mx-2"></div>
            <button 
              onClick={generatePDF}
              disabled={isGenerating}
              className="hidden sm:flex items-center gap-2 px-6 py-2 btn-primary rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Download size={18} />}
              Export PDF
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[3px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Profile Strength</span>
            <span className="text-xs font-black text-primary">{calculateCompletion()}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${calculateCompletion()}%` }}
              className="h-full bg-gradient-to-r from-primary to-emerald-500"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Multi-Step Editor */}
          <div className={`rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} sticky top-24 max-h-[calc(100vh-10rem)] overflow-y-auto overflow-x-hidden custom-scrollbar`}>
            {/* Step Indicators */}
            <div className="flex justify-between mb-12">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <div 
                    onClick={() => setStep(s)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all cursor-pointer ${
                      step >= s 
                        ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                        : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')
                    }`}
                  >
                    {step > s ? <CheckCircle2 size={18} /> : s}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${step === s ? 'text-primary' : 'text-slate-500'}`}>
                    {s === 1 ? 'Profile' : s === 2 ? 'Experience' : s === 3 ? 'Skills' : 'Projects'}
                  </span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className={`w-32 h-32 rounded-3xl overflow-hidden border-4 flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-white shadow-lg'}`}>
                          {data.photo ? (
                            <img src={data.photo} alt="Photo" className="w-full h-full object-cover" />
                          ) : (
                            <User size={48} className="text-slate-300" />
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all">
                          <Camera size={20} />
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[2px] ml-1 opacity-50">Full Name</label>
                          <input name="name" value={data.name} onChange={handleInputChange} className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-primary text-white' : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'}`} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-[2px] ml-1 opacity-50">Professional Title</label>
                          <input name="title" value={data.title} onChange={handleInputChange} className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-primary text-white' : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-[2px] ml-1 opacity-50">Email</label>
                        <input name="email" value={data.email} onChange={handleInputChange} className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-primary text-white' : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'}`} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-[2px] ml-1 opacity-50">Phone</label>
                        <input name="phone" value={data.phone} onChange={handleInputChange} className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-primary text-white' : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'}`} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-[2px] ml-1 opacity-50">Career Objective</label>
                      <div className="relative">
                        <textarea 
                          name="summary" 
                          value={data.summary} 
                          onChange={handleInputChange} 
                          className={`w-full p-4 pb-12 rounded-2xl outline-none border h-40 resize-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-primary text-white' : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'}`} 
                        />
                        <button 
                          onClick={simulateAISummary}
                          className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all"
                        >
                          <Sparkles size={14} /> AI Suggest
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[3px] opacity-60">Experience Record</h3>
                      <button 
                        onClick={() => addListItem('experience')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20"
                      >
                        <Plus size={16} /> Add Position
                      </button>
                    </div>

                    <div className="space-y-6">
                      {data.experience.map((exp) => (
                        <div key={exp.id} className={`p-6 rounded-3xl border transition-all group relative ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-primary/50' : 'bg-slate-50 border-slate-100 hover:border-primary/50'}`}>
                          <button 
                            onClick={() => removeListItem(exp.id, 'experience')}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded-full border border-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <input placeholder="Company Name" value={exp.company} onChange={(e) => handleListChange(exp.id, 'company', e.target.value, 'experience')} className={`p-3 rounded-xl border text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                            <input placeholder="Role" value={exp.role} onChange={(e) => handleListChange(exp.id, 'role', e.target.value, 'experience')} className={`p-3 rounded-xl border text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                          </div>
                          <div className="mb-4">
                            <input placeholder="Duration (e.g. 2020 - Present)" value={exp.duration} onChange={(e) => handleListChange(exp.id, 'duration', e.target.value, 'experience')} className={`w-full p-3 rounded-xl border text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                          </div>
                          <div className="relative">
                            <textarea 
                              placeholder="Key Achievements..." 
                              value={exp.desc} 
                              onChange={(e) => handleListChange(exp.id, 'desc', e.target.value, 'experience')} 
                              className={`w-full p-4 rounded-xl border text-xs font-medium h-32 resize-none outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 leading-relaxed'}`}
                            />
                            <button 
                              onClick={() => simulateAIBulletPoints(exp.id)}
                              className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all"
                            >
                              <Sparkles size={14} /> AI Improve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[3px] opacity-60">Academic History</h3>
                      <button 
                        onClick={() => addListItem('education')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20"
                      >
                        <Plus size={16} /> Add Education
                      </button>
                      <div className="space-y-4">
                        {data.education.map((edu) => (
                          <div key={edu.id} className={`p-6 rounded-3xl border transition-all group relative ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <button onClick={() => removeListItem(edu.id, 'education')} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded-full border border-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                              <Trash2 size={14} />
                            </button>
                            <input placeholder="Institution" value={edu.school} onChange={(e) => handleListChange(edu.id, 'school', e.target.value, 'education')} className={`w-full p-3 rounded-xl border text-xs font-bold outline-none mb-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                            <div className="grid grid-cols-2 gap-4">
                              <input placeholder="Degree" value={edu.degree} onChange={(e) => handleListChange(edu.id, 'degree', e.target.value, 'education')} className={`p-3 rounded-xl border text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                              <input placeholder="Year" value={edu.year} onChange={(e) => handleListChange(edu.id, 'year', e.target.value, 'education')} className={`p-3 rounded-xl border text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[3px] opacity-60">Skills & Tech Stack</h3>
                      <textarea 
                        name="skills" 
                        value={data.skills} 
                        onChange={handleInputChange} 
                        placeholder="React, Node.js, TypeScript..." 
                        className={`w-full p-4 rounded-3xl outline-none border h-32 resize-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-primary text-white' : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'}`} 
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[3px] opacity-60">Featured Projects</h3>
                        <button onClick={() => addListItem('projects')} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20">
                          <Plus size={16} /> Add Project
                        </button>
                      </div>
                      <div className="space-y-4">
                        {data.projects.map((proj) => (
                          <div key={proj.id} className={`p-6 rounded-3xl border transition-all group relative ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <button onClick={() => removeListItem(proj.id, 'projects')} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded-full border border-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                              <Trash2 size={14} />
                            </button>
                            <input placeholder="Project Title" value={proj.title} onChange={(e) => handleListChange(proj.id, 'title', e.target.value, 'projects')} className={`w-full p-3 rounded-xl border text-xs font-bold outline-none mb-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                            <textarea placeholder="Brief Description..." value={proj.desc} onChange={(e) => handleListChange(proj.id, 'desc', e.target.value, 'projects')} className={`w-full p-3 rounded-xl border text-xs font-medium h-20 resize-none outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-700'}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[3px] opacity-60">Certifications</h3>
                        <button onClick={() => addListItem('certifications')} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20">
                          <Plus size={16} /> Add Cert
                        </button>
                      </div>
                      <div className="space-y-4">
                        {data.certifications.map((cert) => (
                          <div key={cert.id} className={`p-6 rounded-3xl border transition-all group relative ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <button onClick={() => removeListItem(cert.id, 'certifications')} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-red-500 rounded-full border border-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                              <Trash2 size={14} />
                            </button>
                            <input placeholder="Certification Name" value={cert.name} onChange={(e) => handleListChange(cert.id, 'name', e.target.value, 'certifications')} className={`w-full p-3 rounded-xl border text-xs font-bold outline-none mb-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                            <div className="grid grid-cols-2 gap-4">
                              <input placeholder="Issuer" value={cert.issuer} onChange={(e) => handleListChange(cert.id, 'issuer', e.target.value, 'certifications')} className={`p-3 rounded-xl border text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                              <input placeholder="Date" value={cert.date} onChange={(e) => handleListChange(cert.id, 'date', e.target.value, 'certifications')} className={`p-3 rounded-xl border text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-[2px] ml-1 opacity-50">Languages</label>
                      <input name="languages" value={data.languages} onChange={handleInputChange} className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-primary text-white' : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'}`} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className={`mt-12 pt-8 border-t flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex gap-2">
                <button onClick={exportToJson} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all shadow-sm" title="Export as JSON"><Save size={20} /></button>
                <label className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all shadow-sm cursor-pointer" title="Import from JSON">
                  <Upload size={20} />
                  <input type="file" accept=".json" onChange={importFromJson} className="hidden" />
                </label>
              </div>
              <div className="flex gap-4">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                )}
                {step < 4 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-10 py-4 bg-emerald-500 text-white rounded-3xl text-xs font-black uppercase tracking-[3px] shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all animate-pulse"
                  >
                    {isGenerating ? "Finalizing..." : "Generate Mastery Resume"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Preview Panel */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between px-2">
                <h3 className={`text-[10px] font-black uppercase tracking-[4px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Live Render View</h3>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/20"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400/20"></div>
                </div>
            </div>
            
            <div className={`rounded-[3rem] p-4 lg:p-10 shadow-inner border overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-950 border-slate-900'} flex justify-center h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar`}>
              <div className="relative origin-top" style={{ transform: 'scale(0.65)', width: '794px', height: '1123px', marginBottom: '-400px' }}>
                <div 
                  ref={resumeRef}
                  id="resume-content-root"
                  className={`bg-white shadow-2xl w-[794px] h-[1123px] text-slate-800 transition-all origin-top transform-gpu overflow-hidden relative ${
                    template === 'classic' ? 'font-serif' : 'font-sans'
                  }`}
                  style={{ 
                    boxSizing: 'border-box',
                    padding: '0',
                    margin: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: `scale(${contentScale})`,
                    transformOrigin: 'top center'
                  }}
                >
                  <ResumePreviewData template={template} data={data} />
                </div>
                {contentScale < 1 && (
                  <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      Auto-Fitting Content ({Math.round(contentScale * 100)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">
                <Monitor size={14} /> Optimized for A4 Multi-page printing
            </div>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowTemplateModal(false)}></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-4xl p-10 rounded-[3rem] shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">Choose Your Signature Style</h2>
                <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {(['modern', 'classic', 'minimal', 'creative', 'professional', 'ats', 'modern-sidebar'] as ResumeTemplate[]).map((t) => (
                  <div 
                    key={t}
                    onClick={() => { setTemplate(t); setShowTemplateModal(false); }}
                    className={`group cursor-pointer space-y-3 transition-all ${template === t ? 'scale-105' : 'hover:scale-102 opacity-70 hover:opacity-100'}`}
                  >
                    <div className={`aspect-[3/4] rounded-2xl border-4 transition-all overflow-hidden ${template === t ? 'border-primary' : 'border-slate-100 dark:border-slate-800'}`}>
                      <div className={`w-full h-full p-2 origin-top scale-[0.2] flex flex-col gap-2 ${template === t ? 'bg-slate-50' : 'bg-white'}`}>
                         {/* Mini Thumbnail Mockup */}
                         <div className="h-6 w-1/2 bg-slate-800"></div>
                         <div className="h-2 w-1/3 bg-slate-200"></div>
                         <div className="grid grid-cols-3 gap-1 mt-2">
                             <div className="h-20 bg-slate-100 col-span-1"></div>
                             <div className="h-20 bg-slate-50 col-span-2 space-y-1">
                                 <div className="h-2 w-full bg-slate-200"></div>
                                 <div className="h-2 w-4/5 bg-slate-200"></div>
                                 <div className="h-2 w-3/4 bg-slate-200"></div>
                             </div>
                         </div>
                      </div>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest text-center ${template === t ? 'text-primary' : 'text-slate-500'}`}>
                      {t.replace('-', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 z-[200] bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs"
          >
            <CheckCircle2 size={24} /> Operation Successful!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10">
         <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="text-primary" /> How to use?
            </h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Fill Basic Info', desc: 'Start with your contact details, professional summary, and education history.' },
                { step: '02', title: 'Add Experience', desc: 'List your work history with bullet points highlighting your key achievements.' },
                { step: '03', title: 'Choose Style', desc: 'Switch between modern, classic, or clean presets to find the best look.' },
                { step: '04', title: 'Export PDF', desc: 'Use the print button to save your resume as a perfectly formatted PDF file.' }
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
              <FileCheck className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">ATS Friendly Designs</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              Our templates are optimized for Applicant Tracking Systems, ensuring your resume passes automated screenings easily.
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest w-fit mx-auto shadow-xl">
              <Printer size={16} className="text-primary" /> Print-Ready Output
            </div>
         </div>
      </section>
    </div>
  );
}
