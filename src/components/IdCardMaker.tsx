import React, { useState, useRef } from 'react';
import { Page } from '../App';
import { Printer, Upload, Download, Plus, Layout as LayoutIcon, CreditCard as IdCard } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface IdCardMakerProps {
  onNavigate: (page: Page) => void;
}

type IdTemplate = 'classic' | 'modern' | 'corporate' | 'badge';

interface StudentData {
  schoolName: string;
  studentName: string;
  classSec: string;
  rollNo: string;
  fatherName: string;
  motherName: string;
  dob: string;
  bloodGrp: string;
  contact: string;
  address: string;
  photoUrl: string | null;
  logoUrl: string | null;
  signUrl: string | null;
}

export function IdCardMaker({ onNavigate }: IdCardMakerProps) {
  const [template, setTemplate] = useState<IdTemplate>('classic');
  const [data, setData] = useState<StudentData>({
    schoolName: 'BTKR MEMORIAL PUBLIC SCHOOL',
    studentName: 'Mitya Nandan',
    classSec: 'First C',
    rollNo: '2019',
    fatherName: 'Mayank Singh',
    motherName: 'Binita Sen',
    dob: '10-06-2006',
    bloodGrp: 'O+',
    contact: '821457545',
    address: 'Gonda, UP',
    photoUrl: null,
    logoUrl: null,
    signUrl: null,
  });

  const [primaryColor, setPrimaryColor] = useState('#1e40af'); // blue-800
  const [secondaryColor, setSecondaryColor] = useState('#dc2626'); // red-600
  const [isGenerating, setIsGenerating] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof StudentData) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setData(prev => ({ ...prev, [field]: url }));
    }
  };

  const generatePDF = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      // Small delay to ensure images are fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          // 1. Sanitize all style tags to remove oklch definitions that crash the parser
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            styleTags[i].textContent = styleTags[i].textContent?.replace(/oklch\([^)]+\)/g, '#000000') || '';
          }

          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const styleAttr = el.getAttribute('style');
            if (styleAttr && styleAttr.includes('oklch')) {
              el.setAttribute('style', styleAttr.replace(/oklch\([^)]+\)/g, '#000000'));
            }
            const style = window.getComputedStyle(el);
            ['backgroundColor', 'color', 'borderColor', 'outlineColor', 'boxShadow'].forEach(prop => {
              const val = (style as any)[prop];
              if (val && typeof val === 'string' && val.includes('oklch')) {
                if (val.includes('0.9')) el.style.setProperty(prop, '#f8fafc', 'important');
                else el.style.setProperty(prop, '#000000', 'important');
              }
            });

            if (style.boxShadow && style.boxShadow.includes('oklch')) {
              el.style.boxShadow = 'none';
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Standard ID card size: 86mm x 54mm (Landscape is common for CR80)
      // If the template is vertical (like ours looks 270x430), we use Portrait 54x86
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 86]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 54, 86, undefined, 'FAST');
      pdf.save(`${data.studentName || 'student'}_ID_Card.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // For user visibility in case of failure
      setError('Failed to generate PDF. Please ensure all images are uploaded correctly.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <IdCard className="text-[#00d2ff]" /> ID Card Maker
        </h1>
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="px-6 py-2 btn-primary rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-70"
        >
          {isGenerating ? 'Generating...' : <><Printer size={18} /> Print / Save PDF</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Panel: Form */}
        <div className="lg:col-span-3 glass-panel p-5 h-fit">
          <h2 className="font-bold text-white border-b border-white/15 pb-2 mb-4">Student Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">School Name</label>
              <input type="text" name="schoolName" value={data.schoolName} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Student Name</label>
              <input type="text" name="studentName" value={data.studentName} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Class/Sec</label>
                <input type="text" name="classSec" value={data.classSec} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Roll/Reg No</label>
                <input type="text" name="rollNo" value={data.rollNo} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Father's Name</label>
              <input type="text" name="fatherName" value={data.fatherName} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">D.O.B</label>
                <input type="text" name="dob" value={data.dob} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Blood Grp</label>
                <input type="text" name="bloodGrp" value={data.bloodGrp} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Contact Number</label>
              <input type="text" name="contact" value={data.contact} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Address</label>
              <input type="text" name="address" value={data.address} onChange={handleInputChange} className="input-glass rounded p-2 w-full text-sm" />
            </div>

            {/* Image Uploads */}
            <div className="pt-2 border-t border-white/15 mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Student Photo</label>
                <div className="relative border-2 border-dashed border-white/15 bg-black/10 rounded-lg p-2 text-center hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'photoUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="flex items-center justify-center gap-2 text-xs text-white/60 font-medium">
                    <Upload size={14} /> {data.photoUrl ? 'Change Photo' : 'Upload Photo'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Signature Image</label>
                <div className="relative border-2 border-dashed border-white/15 bg-black/10 rounded-lg p-2 text-center hover:bg-white/5 cursor-pointer transition-colors">
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signUrl')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="flex items-center justify-center gap-2 text-xs text-white/60 font-medium">
                    <Upload size={14} /> {data.signUrl ? 'Change Signature' : 'Upload Signature'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel: Live Preview */}
        <div className="lg:col-span-6 glass-panel bg-black/20 p-8 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
          <div className="absolute top-4 flex items-center gap-2 text-[#00d2ff] font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse"></span> Live Card Preview
          </div>
          
          {/* ID Card Canvas (Standard 54x86mm aspect ratio ~ 1:1.59) */}
          <div className="shadow-2xl bg-white relative overflow-hidden" style={{ width: '270px', height: '430px' }}>
            {/* The actual card content to be captured */}
            <div ref={cardRef} className="w-full h-full bg-white flex flex-col relative text-slate-900">
              {template === 'classic' && (
                <>
                  {/* Header */}
                  <div 
                    className="text-white text-center p-3 flex flex-col items-center justify-center min-h-[70px]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {data.logoUrl && (
                      <img src={data.logoUrl} alt="Logo" className="w-8 h-8 object-contain mb-1 absolute left-2 top-2" />
                    )}
                    <h2 className="font-bold text-[11px] leading-tight max-w-[80%] uppercase">{data.schoolName || 'SCHOOL NAME'}</h2>
                  </div>

                  {/* Body */}
                  <div className="flex-grow flex flex-col items-center px-4 pt-4 pb-2">
                    {/* Photo */}
                    <div className="w-24 h-28 border-2 border-slate-200 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center mb-3">
                      {data.photoUrl ? (
                        <img src={data.photoUrl} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-slate-400">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-3">{data.studentName || 'Student Name'}</h3>

                    {/* Details Grid */}
                    <div className="w-full text-[9px] space-y-1.5 text-slate-700">
                      <div className="flex"><span className="w-12 font-semibold" style={{color: secondaryColor}}>Father</span><span className="mr-1">:</span><span className="flex-1 truncate">{data.fatherName}</span></div>
                      <div className="flex"><span className="w-12 font-semibold" style={{color: secondaryColor}}>D.O.B</span><span className="mr-1">:</span><span className="flex-1 truncate">{data.dob}</span></div>
                      <div className="flex"><span className="w-12 font-semibold" style={{color: secondaryColor}}>Class</span><span className="mr-1">:</span><span className="flex-1 truncate">{data.classSec}</span></div>
                      <div className="flex"><span className="w-12 font-semibold" style={{color: secondaryColor}}>Roll No</span><span className="mr-1">:</span><span className="flex-1 truncate">{data.rollNo}</span></div>
                      <div className="flex"><span className="w-12 font-semibold" style={{color: secondaryColor}}>Phone</span><span className="mr-1">:</span><span className="flex-1 truncate">{data.contact}</span></div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto px-4 pb-2 flex justify-between items-end">
                    <div className="flex flex-col items-center">
                      {data.signUrl ? (
                        <img src={data.signUrl} alt="Signature" className="h-8 object-contain mb-1" />
                      ) : (
                        <div className="h-8 w-16 border-b border-slate-300 mb-1"></div>
                      )}
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Student Sign</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-16 border-b border-slate-300 mb-1"></div>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Principal Sign</span>
                    </div>
                  </div>

                  <div 
                    className="text-white text-center py-1.5 text-[9px] font-medium"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {data.address || 'School Address'}
                  </div>
                </>
              )}

              {template === 'modern' && (
                <div className="flex flex-col h-full bg-slate-50">
                  <div className="h-24 relative flex items-center justify-center p-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}></div>
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }}></div>
                    <h2 className="relative z-10 font-black text-xs text-center uppercase tracking-tighter" style={{ color: primaryColor }}>{data.schoolName}</h2>
                  </div>
                  
                  <div className="flex-grow flex flex-col items-center -mt-8 px-4">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mb-4">
                      {data.photoUrl ? (
                        <img src={data.photoUrl} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-black uppercase tracking-tight mb-1" style={{ color: primaryColor }}>{data.studentName}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">{data.classSec} • ROLL {data.rollNo}</p>
                    
                    <div className="w-full space-y-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Parent Name</span>
                        <span className="text-[10px] font-bold text-slate-700">{data.fatherName}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Date of Birth</span>
                          <span className="text-[10px] font-bold text-slate-700">{data.dob}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Blood Group</span>
                          <span className="text-[10px] font-bold text-red-600">{data.bloodGrp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 mt-auto flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                      {data.signUrl && (
                        <img src={data.signUrl} alt="Signature" className="h-6 object-contain mb-1" />
                      )}
                      <span className="text-[6px] font-bold text-slate-400 uppercase">Signature</span>
                    </div>
                    <div className="flex-grow h-12 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-lg" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                      {data.contact}
                    </div>
                  </div>
                </div>
              )}

              {template === 'corporate' && (
                <div className="flex flex-col h-full border-t-8" style={{ borderColor: primaryColor }}>
                  <div className="p-6 flex justify-between items-start">
                    <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                      {data.logoUrl ? <img src={data.logoUrl} className="w-8 h-8 object-contain" /> : <div className="w-6 h-6 bg-slate-200 rounded-full"></div>}
                    </div>
                    <div className="text-right">
                      <h2 className="text-[10px] font-black text-slate-900 uppercase leading-tight">{data.schoolName}</h2>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Identity Card</p>
                    </div>
                  </div>

                  <div className="px-6 flex flex-col items-center">
                    <div className="w-full aspect-square bg-slate-50 border border-slate-100 p-2 mb-6">
                      <div className="w-full h-full grayscale hover:grayscale-0 transition-all">
                        {data.photoUrl ? (
                          <img src={data.photoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200"></div>
                        )}
                      </div>
                    </div>

                    <div className="w-full text-left">
                      <h3 className="text-xl font-light text-slate-900 mb-1">{data.studentName.split(' ')[0]} <span className="font-bold">{data.studentName.split(' ')[1]}</span></h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mb-8">{data.classSec}</p>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400">ID</div>
                          <div>
                            <p className="text-[7px] font-bold text-slate-300 uppercase">Registration</p>
                            <p className="text-[10px] font-bold text-slate-700">{data.rollNo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400">PH</div>
                          <div>
                            <p className="text-[7px] font-bold text-slate-300 uppercase">Contact</p>
                            <p className="text-[10px] font-bold text-slate-700">{data.contact}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto p-6 flex justify-between items-end">
                    <div className="flex flex-col items-start">
                      {data.signUrl ? (
                        <img src={data.signUrl} alt="Signature" className="h-8 object-contain mb-1" />
                      ) : (
                        <div className="w-16 h-8 bg-slate-100 rounded flex flex-col gap-0.5 p-1">
                          <div className="h-full bg-slate-300 w-1/4"></div>
                          <div className="h-full bg-slate-300 w-3/4"></div>
                          <div className="h-full bg-slate-300 w-1/2"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-[7px] font-bold text-slate-300 uppercase text-right">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              )}

              {template === 'badge' && (
                <div className="flex flex-col h-full bg-white">
                  <div className="h-40 bg-slate-900 relative p-6 flex flex-col justify-end">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <h2 className="text-white font-black text-2xl leading-none mb-1">{data.studentName.toUpperCase()}</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{data.classSec}</p>
                  </div>

                  <div className="flex-grow p-6 flex flex-col">
                    <div className="flex gap-4 mb-8">
                      <div className="w-24 h-24 bg-slate-100 border-4 border-white shadow-xl -mt-12 relative z-10">
                        {data.photoUrl ? <img src={data.photoUrl} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="pt-2">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Blood Group</p>
                        <p className="text-sm font-black text-red-600">{data.bloodGrp}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Parent Information</p>
                        <p className="text-xs font-bold text-slate-800">{data.fatherName}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Contact Details</p>
                        <p className="text-xs font-bold text-slate-800">{data.contact}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Residential Address</p>
                        <p className="text-[10px] text-slate-600 leading-tight">{data.address}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-end">
                      <div className="flex flex-col">
                        {data.signUrl && (
                          <img src={data.signUrl} alt="Signature" className="h-6 object-contain mb-1" />
                        )}
                        <div className="text-[8px] font-black text-slate-900">{data.schoolName}</div>
                      </div>
                      <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-[8px] font-bold">2024</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Settings */}
        <div className="lg:col-span-3 glass-panel p-5 h-fit">
          <h2 className="font-bold text-white border-b border-white/15 pb-2 mb-4 flex items-center gap-2">
            <LayoutIcon size={18} className="text-[#00d2ff]" /> Templates
          </h2>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            {(['classic', 'modern', 'corporate', 'badge'] as IdTemplate[]).map((t) => (
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

          <h2 className="font-bold text-white border-b border-white/15 pb-2 mb-4">Colors & Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Theme Colors</label>
              <div className="flex gap-4">
                <div>
                  <div className="text-[10px] text-white/50 mb-1">Primary</div>
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
                </div>
                <div>
                  <div className="text-[10px] text-white/50 mb-1">Secondary</div>
                  <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15">
              <label className="block text-xs font-medium text-white/60 mb-2">A4 Print Layout</label>
              <select className="input-glass rounded p-2 w-full text-sm">
                <option className="text-slate-900">2 x 4 (8 Cards/Page)</option>
                <option className="text-slate-900">3 x 3 (9 Cards/Page)</option>
              </select>
            </div>

            <button className="w-full py-2.5 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm border border-white/15">
              <Plus size={16} /> Add to Print List
            </button>

            <div className="pt-4 border-t border-white/15">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-white">Students List</span>
                <span className="bg-[#7b61ff] text-white text-xs px-2 py-0.5 rounded-full">0</span>
              </div>
              <p className="text-xs text-white/50 text-center py-4 bg-black/10 rounded border border-dashed border-white/15">
                No students added yet. Fill details and click "+ Add to Print List"
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-12 glass-panel p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <LayoutIcon className="text-[#00d2ff]" /> How to Use ID Card Maker
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center font-bold mb-3">1</div>
            <h4 className="font-semibold text-white text-sm mb-1">Fill Details</h4>
            <p className="text-xs text-white/60">Enter student information and upload photo in the left panel. The preview updates instantly.</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center font-bold mb-3">2</div>
            <h4 className="font-semibold text-white text-sm mb-1">Customize Colors</h4>
            <p className="text-xs text-white/60">Change Primary and Secondary colors to match the school's branding in the right panel.</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center font-bold mb-3">3</div>
            <h4 className="font-semibold text-white text-sm mb-1">Generate PDF</h4>
            <p className="text-xs text-white/60">Click "Print / Save PDF" to download a high-quality printable version of the ID card.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
