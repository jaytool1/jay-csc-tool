import React, { useState, useRef } from 'react';
import { Page } from '../App';
import { FileText, Download, Plus, Trash2, Layout as LayoutIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResumeMakerProps {
  onNavigate: (page: Page) => void;
}

type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';

export function ResumeMaker({ onNavigate }: ResumeMakerProps) {
  const [template, setTemplate] = useState<ResumeTemplate>('modern');
  const [data, setData] = useState({
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '+91 9876543210',
    address: 'New Delhi, India',
    summary: 'Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success.',
    experience: [
      { id: 1, company: 'Tech Solutions Inc.', role: 'Senior Developer', duration: '2020 - Present', desc: 'Led a team of 5 developers to build a scalable SaaS platform.' }
    ],
    education: [
      { id: 1, school: 'Delhi University', degree: 'B.Tech in Computer Science', year: '2016 - 2020' }
    ],
    skills: 'JavaScript, React, Node.js, HTML, CSS, Tailwind'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const generatePDF = async () => {
    if (!resumeRef.current) return;
    setIsGenerating(true);
    setExportError(null);
    
    try {
      // Small delay for layout to settle
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(resumeRef.current, { 
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: resumeRef.current.offsetWidth,
        height: resumeRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          // 1. Sanitize all style tags to remove oklch definitions that crash the parser
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            styleTags[i].textContent = styleTags[i].textContent?.replace(/oklch\([^)]+\)/g, '#000000') || '';
          }

          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            // Force replace any oklch in inline styles
            const styleAttr = el.getAttribute('style');
            if (styleAttr && styleAttr.includes('oklch')) {
              el.setAttribute('style', styleAttr.replace(/oklch\([^)]+\)/g, '#000000'));
            }
            // Computed style check
            const style = window.getComputedStyle(el);
            ['backgroundColor', 'color', 'borderColor', 'outlineColor', 'boxShadow'].forEach(prop => {
              const val = (style as any)[prop];
              if (val && typeof val === 'string' && val.includes('oklch')) {
                if (val.includes('0.9')) el.style.setProperty(prop, '#f8fafc', 'important');
                else if (val.includes('0.1')) el.style.setProperty(prop, '#0f172a', 'important');
                else el.style.setProperty(prop, '#000000', 'important');
              }
            });

            if (style.boxShadow && style.boxShadow.includes('oklch')) {
              el.style.boxShadow = 'none';
            }
          }
        }
      });

      if (!canvas) throw new Error('Canvas generation failed');

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${data.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setExportError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-[#00d2ff]" /> Resume Builder
        </h1>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-6 py-2 btn-primary rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-70 whitespace-nowrap"
          >
            {isGenerating ? 'Generating...' : <><Download size={18} /> Download PDF</>}
          </button>
          {exportError && <p className="text-[10px] text-red-500 font-bold">{exportError}</p>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="glass-panel p-6 space-y-6 h-[800px] overflow-y-auto">
          <div>
            <h3 className="font-bold text-white mb-3 border-b border-white/15 pb-2 flex items-center gap-2">
              <LayoutIcon size={18} className="text-[#00d2ff]" /> Choose Template
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
              {(['modern', 'classic', 'minimal', 'creative', 'professional'] as ResumeTemplate[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`py-2 px-1 rounded text-[10px] font-bold uppercase transition-all border ${
                    template === t 
                      ? 'bg-[#7b61ff] border-[#7b61ff] text-white shadow-lg shadow-[#7b61ff]/20' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <h3 className="font-bold text-white mb-3 border-b border-white/15 pb-2">Personal Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="name" value={data.name} onChange={handleInputChange} placeholder="Full Name" className="input-glass rounded p-2 w-full text-sm" />
              <input type="text" name="title" value={data.title} onChange={handleInputChange} placeholder="Professional Title" className="input-glass rounded p-2 w-full text-sm" />
              <input type="email" name="email" value={data.email} onChange={handleInputChange} placeholder="Email" className="input-glass rounded p-2 w-full text-sm" />
              <input type="text" name="phone" value={data.phone} onChange={handleInputChange} placeholder="Phone" className="input-glass rounded p-2 w-full text-sm" />
              <input type="text" name="address" value={data.address} onChange={handleInputChange} placeholder="Address" className="col-span-2 input-glass rounded p-2 w-full text-sm" />
              <textarea name="summary" value={data.summary} onChange={handleInputChange} placeholder="Professional Summary" className="col-span-2 input-glass rounded p-2 w-full text-sm h-24" />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-3 border-b border-white/15 pb-2">Skills</h3>
            <input type="text" name="skills" value={data.skills} onChange={handleInputChange} placeholder="Comma separated skills" className="input-glass rounded p-2 w-full text-sm" />
          </div>
          
          {/* Simplified Experience/Education for this demo to save space */}
          <div className="p-4 bg-primary/20 text-white/80 rounded-lg text-sm border border-[#7b61ff]/30">
            Note: Dynamic adding/removing of experience and education is simplified in this preview version. Edit the default text directly in the preview or form.
          </div>
        </div>

        {/* Preview */}
        <div className="glass-panel bg-black/20 p-8 flex justify-center overflow-y-auto h-[800px]">
          {/* A4 Paper Container */}
          <div 
            ref={resumeRef}
            className={`bg-white shadow-lg w-[210mm] min-h-[297mm] p-[20mm] text-slate-800 ${
              template === 'classic' ? 'font-serif' : 'font-sans'
            }`}
            style={{ boxSizing: 'border-box' }}
          >
            {template === 'modern' && (
              <>
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-4 mb-6">
                  <h1 className="text-4xl font-bold uppercase tracking-wider text-slate-900">{data.name}</h1>
                  <p className="text-xl text-emerald-600 mt-1">{data.title}</p>
                  <div className="flex gap-4 mt-3 text-sm text-slate-600">
                    <span>{data.email}</span> • <span>{data.phone}</span> • <span>{data.address}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-2">Professional Summary</h2>
                  <p className="text-sm leading-relaxed">{data.summary}</p>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-3">Experience</h2>
                  {data.experience.map(exp => (
                    <div key={exp.id} className="mb-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-800">{exp.role}</h3>
                        <span className="text-sm font-medium text-emerald-600">{exp.duration}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-600 mb-1">{exp.company}</div>
                      <p className="text-sm text-slate-700">{exp.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="mb-6">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-3">Education</h2>
                  {data.education.map(edu => (
                    <div key={edu.id} className="mb-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                        <span className="text-sm font-medium text-emerald-600">{edu.year}</span>
                      </div>
                      <div className="text-sm text-slate-600">{edu.school}</div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 mb-2">Skills</h2>
                  <p className="text-sm leading-relaxed">{data.skills}</p>
                </div>
              </>
            )}

            {template === 'classic' && (
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-1">{data.name}</h1>
                <p className="text-sm text-slate-600 mb-4">{data.address} | {data.phone} | {data.email}</p>
                
                <div className="text-left mt-8">
                  <h2 className="text-base font-bold border-b border-slate-300 mb-2 uppercase italic">Objective</h2>
                  <p className="text-sm mb-6">{data.summary}</p>

                  <h2 className="text-base font-bold border-b border-slate-300 mb-3 uppercase italic">Experience</h2>
                  {data.experience.map(exp => (
                    <div key={exp.id} className="mb-4">
                      <div className="flex justify-between font-bold text-sm">
                        <span>{exp.company}</span>
                        <span>{exp.duration}</span>
                      </div>
                      <div className="italic text-sm mb-1">{exp.role}</div>
                      <p className="text-sm">{exp.desc}</p>
                    </div>
                  ))}

                  <h2 className="text-base font-bold border-b border-slate-300 mb-3 uppercase italic mt-6">Education</h2>
                  {data.education.map(edu => (
                    <div key={edu.id} className="mb-2">
                      <div className="flex justify-between font-bold text-sm">
                        <span>{edu.school}</span>
                        <span>{edu.year}</span>
                      </div>
                      <div className="text-sm">{edu.degree}</div>
                    </div>
                  ))}

                  <h2 className="text-base font-bold border-b border-slate-300 mb-2 uppercase italic mt-6">Skills</h2>
                  <p className="text-sm">{data.skills}</p>
                </div>
              </div>
            )}

            {template === 'minimal' && (
              <div className="max-w-[160mm] mx-auto">
                <h1 className="text-4xl font-light text-slate-900 mb-2">{data.name}</h1>
                <p className="text-slate-500 mb-12">{data.title}</p>

                <div className="space-y-10">
                  <section>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[2px] mb-4">About</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
                  </section>

                  <section>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[2px] mb-6">Experience</h2>
                    <div className="space-y-6">
                      {data.experience.map(exp => (
                        <div key={exp.id}>
                          <h3 className="text-sm font-bold text-slate-800">{exp.role} at {exp.company}</h3>
                          <p className="text-[10px] text-slate-400 mb-2">{exp.duration}</p>
                          <p className="text-sm text-slate-600">{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[2px] mb-4">Contact</h2>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>{data.email}</p>
                      <p>{data.phone}</p>
                      <p>{data.address}</p>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {template === 'creative' && (
              <div className="flex gap-10 h-full">
                <div className="w-1/3 bg-slate-100 -m-[20mm] p-[20mm] h-[297mm]">
                  <div className="mb-10">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Contact</h2>
                    <div className="text-[10px] space-y-3 text-slate-600">
                      <p className="font-bold">Email<br/><span className="font-normal">{data.email}</span></p>
                      <p className="font-bold">Phone<br/><span className="font-normal">{data.phone}</span></p>
                      <p className="font-bold">Location<br/><span className="font-normal">{data.address}</span></p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.split(',').map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-white text-[9px] font-bold rounded shadow-sm">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-2/3">
                  <h1 className="text-5xl font-black text-slate-900 mb-2">{data.name.split(' ')[0]}<br/><span className="text-slate-300">{data.name.split(' ')[1]}</span></h1>
                  <p className="text-sm font-bold text-indigo-600 mb-10 uppercase tracking-widest">{data.title}</p>

                  <div className="mb-10">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-indigo-600 inline-block">Profile</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{data.summary}</p>
                  </div>

                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 border-b-2 border-indigo-600 inline-block">Work Experience</h2>
                    <div className="space-y-6">
                      {data.experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
                            <span className="text-[9px] font-bold text-slate-400">{exp.duration}</span>
                          </div>
                          <p className="text-[10px] font-bold text-indigo-600 mb-2">{exp.company}</p>
                          <p className="text-[10px] text-slate-600">{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {template === 'professional' && (
              <div className="-m-[20mm]">
                <div className="bg-slate-800 text-white p-[20mm] pb-10">
                  <h1 className="text-4xl font-bold mb-2">{data.name}</h1>
                  <p className="text-slate-400 text-lg mb-6">{data.title}</p>
                  <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                    <span className="flex items-center gap-2">✉ {data.email}</span>
                    <span className="flex items-center gap-2">☎ {data.phone}</span>
                    <span className="flex items-center gap-2">📍 {data.address}</span>
                  </div>
                </div>
                
                <div className="p-[20mm] pt-10 grid grid-cols-3 gap-10">
                  <div className="col-span-2 space-y-8">
                    <section>
                      <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 mb-4">Experience</h2>
                      {data.experience.map(exp => (
                        <div key={exp.id} className="mb-6">
                          <h3 className="font-bold text-slate-900">{exp.role}</h3>
                          <div className="flex justify-between text-sm text-slate-500 mb-2">
                            <span>{exp.company}</span>
                            <span>{exp.duration}</span>
                          </div>
                          <p className="text-sm text-slate-600">{exp.desc}</p>
                        </div>
                      ))}
                    </section>
                    
                    <section>
                      <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 mb-4">Education</h2>
                      {data.education.map(edu => (
                        <div key={edu.id} className="mb-4">
                          <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                          <div className="flex justify-between text-sm text-slate-500">
                            <span>{edu.school}</span>
                            <span>{edu.year}</span>
                          </div>
                        </div>
                      ))}
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 mb-4">Summary</h2>
                      <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
                    </section>

                    <section>
                      <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 mb-4">Skills</h2>
                      <div className="space-y-2">
                        {data.skills.split(',').map((s, i) => (
                          <div key={i} className="text-sm text-slate-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                            {s.trim()}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
