import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Page } from '../App';
import { 
  Printer, 
  Upload, 
  Download, 
  Plus, 
  Layout as LayoutIcon, 
  CreditCard as IdCard,
  School,
  UserCheck,
  Building2,
  Trash2,
  QrCode,
  Languages,
  Moon,
  Sun,
  Camera,
  Signature as SignIcon,
  FileSpreadsheet,
  AlertTriangle,
  Settings2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';

interface MultiIdMakerProps {
  onNavigate: (page: Page) => void;
}

type IdModule = 'school' | 'visitor';

interface BaseIdData {
  photoUrl: string | null;
  signUrl: string | null;
  logoUrl: string | null;
  idNumber: string;
}

interface SchoolData extends BaseIdData {
  studentName: string;
  fatherName: string;
  classSec: string;
  rollNo: string;
  schoolName: string;
  address: string;
  contact: string;
  validTill: string;
}

interface AadhaarData extends BaseIdData {
  name: string;
  dob: string;
  gender: string;
  address: string;
}

interface VisitorData extends BaseIdData {
  visitorName: string;
  companyName: string;
  purpose: string;
  personToMeet: string;
  entryDateTime: string;
  exitTime: string;
}

export function MultiIdMaker({ onNavigate }: MultiIdMakerProps) {
  const [activeModule, setActiveModule] = useState<IdModule>('school');
  const [selectedSchoolTemplate, setSelectedSchoolTemplate] = useState(1);
  const [selectedVisitorTemplate, setSelectedVisitorTemplate] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [schoolData, setSchoolData] = useState<SchoolData>({
    photoUrl: null,
    signUrl: null,
    logoUrl: null,
    idNumber: 'SCH-2024-001',
    studentName: 'Aaryan Sharma',
    fatherName: 'Rajesh Sharma',
    classSec: '10th B',
    rollNo: '24',
    schoolName: 'ST. XAVIER SENIOR SECONDARY SCHOOL',
    address: 'Vikas Nagar, Lucknow, UP',
    contact: '9876543210',
    validTill: 'Mar 2025',
  });

  const [aadhaarData, setAadhaarData] = useState<AadhaarData>({
    photoUrl: null,
    signUrl: null,
    logoUrl: null,
    idNumber: '1234 5678 9012',
    name: 'Rahul Verma',
    dob: '01/01/1995',
    gender: 'Male',
    address: 'Flat 402, Green Apartments, Mumbai, MH - 400001',
  });

  const [visitorData, setVisitorData] = useState<VisitorData>({
    photoUrl: null,
    signUrl: null,
    logoUrl: null,
    idNumber: 'VIS-4521',
    visitorName: 'Sanjay Gupta',
    companyName: 'Tech Solutions Inc.',
    purpose: 'Interview',
    personToMeet: 'Hiring Manager',
    entryDateTime: '2024-04-17 10:00 AM',
    exitTime: '01:00 PM',
  });

  const [themeColor, setThemeColor] = useState('#7b61ff');
  const cardRef = useRef<HTMLDivElement>(null);

  // Helpers
  const generateRandomId = (prefix: string, length: number) => {
    const chars = '0123456789';
    let res = prefix;
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, module: IdModule) => {
    const { name, value } = e.target;
    if (module === 'school') setSchoolData(p => ({ ...p, [name]: value }));
    else if (module === 'visitor') setVisitorData(p => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string, module: IdModule) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (module === 'school') setSchoolData(p => ({ ...p, [field]: url }));
      else if (module === 'visitor') setVisitorData(p => ({ ...p, [field]: url }));
    }
  };

  const downloadCard = async (format: 'pdf' | 'png') => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setError(null);

    try {
      // Ensure all images are loaded for capture
      const images = cardRef.current.getElementsByTagName('img');
      const loadPromises = Array.from(images).map((img: HTMLImageElement) => {
        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(loadPromises);

      // Add a small delay for any layout settled
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByClassName('animate-pulse');
          Array.from(elements).forEach(el => (el as HTMLElement).classList.remove('animate-pulse'));

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

      if (!canvas) throw new Error('Canvas generation failed');

      if (format === 'png') {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `ID_Card_${activeModule}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdfW = activeModule === 'visitor' ? 54 : 86;
        const pdfH = activeModule === 'visitor' ? 86 : 54;
        
        const pdf = new jsPDF({
          orientation: activeModule === 'visitor' ? 'p' : 'l',
          unit: 'mm',
          format: [pdfW, pdfH]
        });
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
        pdf.save(`ID_Card_${activeModule}_${Date.now()}.pdf`);
      }
    } catch (err: any) {
      console.error('Export Error Detail:', err);
      setError(`Export Error: ${err.message || 'Check photos & permissions'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveBg = async () => {
    const currentPhotoUrl = activeModule === 'school' ? schoolData.photoUrl : visitorData.photoUrl;
    
    if (!currentPhotoUrl) {
      setError('Please upload a photo first.');
      return;
    }

    setIsRemovingBg(true);
    setError(null);

    try {
      const response = await fetch(currentPhotoUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('size', 'auto');
      formData.append('image_file', blob);

      const apiKey = (import.meta as any).env.VITE_REMOVE_BG_API_KEY || 'yA5gVjJmSWbvpLEp7uuUdhE3'; // Fallback to provided key

      const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        throw new Error(errData?.errors?.[0]?.title || 'Failed to remove background');
      }

      const resultBlob = await apiResponse.blob();
      const resultUrl = URL.createObjectURL(resultBlob);

      if (activeModule === 'school') setSchoolData(p => ({ ...p, photoUrl: resultUrl }));
      else if (activeModule === 'visitor') setVisitorData(p => ({ ...p, photoUrl: resultUrl }));

      alert('Background removed successfully!');
    } catch (err: any) {
      console.error('RemoveBG Error:', err);
      setError(`Background removal failed: ${err.message}`);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('Bulk Data:', results.data);
        alert(`Successfully loaded ${results.data.length} records. Processing logic can be added here.`);
      },
      error: (err) => setError('CSV parsing failed.')
    });
  };

  const getQRData = () => {
    if (activeModule === 'school') return `ID:${schoolData.idNumber}|Name:${schoolData.studentName}|School:${schoolData.schoolName}`;
    return `ID:${visitorData.idNumber}|Visitor:${visitorData.visitorName}|Purpose:${visitorData.purpose}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-[1600px] mx-auto flex flex-col h-screen">
        
        {/* Top Header / Module Toggle */}
        <header className={`px-6 py-4 border-b ${isDarkMode ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-white'} backdrop-blur-md sticky top-0 z-30 flex items-center justify-between`}>
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
              <IdCard className="text-[#7b61ff]" /> ADVANCED ID <span className="text-white/40">GEN</span>
            </h1>
            <nav className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-hidden">
              <button 
                onClick={() => setActiveModule('school')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeModule === 'school' ? 'bg-[#7b61ff] text-white shadow-lg' : 'hover:bg-white/5 text-white/40'}`}
              >
                <School size={14} /> School
              </button>
              <button 
                onClick={() => setActiveModule('visitor')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeModule === 'visitor' ? 'bg-emerald-500 text-white shadow-lg' : 'hover:bg-white/5 text-white/40'}`}
              >
                <UserCheck size={14} /> Visitor
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold">
              <Languages size={18} /> {language === 'en' ? 'ENG' : 'HIN'}
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            <button onClick={() => downloadCard('png')} disabled={isGenerating} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold flex items-center gap-2">
              <Download size={14} /> PNG
            </button>
            <button onClick={() => downloadCard('pdf')} disabled={isGenerating} className="px-6 py-2 btn-primary rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#7b61ff]/20">
              {isGenerating ? 'GEN...' : <><Printer size={14} /> PDF</>}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Form Fields */}
          <aside className={`w-[400px] flex-shrink-0 border-r ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-gray-200 bg-gray-50'} overflow-y-auto p-6 scrollbar-hide`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Settings2 size={16} /> Configuration
              </h2>
              <button 
                onClick={() => {
                  const newId = generateRandomId(activeModule === 'school' ? 'SCH-' : 'VIS-', 5);
                  if(activeModule === 'school') setSchoolData(p => ({ ...p, idNumber: newId }));
                  else setVisitorData(p => ({ ...p, idNumber: newId }));
                }}
                className="text-[10px] font-black uppercase bg-white/5 px-2 py-1 rounded text-[#7b61ff]"
              >
                Auto-Gen ID
              </button>
            </div>

            {/* Template Selection */}
            <section className="mb-8">
              <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4 flex items-center gap-2">
                <LayoutIcon size={14} /> Premium Templates
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(t => (
                  <button
                    key={t}
                    onClick={() => activeModule === 'school' ? setSelectedSchoolTemplate(t) : setSelectedVisitorTemplate(t)}
                    className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-xs font-black ${
                      (activeModule === 'school' ? selectedSchoolTemplate : selectedVisitorTemplate) === t
                        ? 'border-[#7b61ff] bg-[#7b61ff]/10 text-white shadow-lg'
                        : 'border-white/5 bg-white/5 text-white/20 hover:border-white/20'
                    }`}
                  >
                    T{t}
                  </button>
                ))}
              </div>
            </section>

              {/* Error Message Display */}
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-500" />
                  <p className="text-[10px] font-bold text-red-200 uppercase">{error}</p>
                </div>
              )}

              <div className="space-y-6">
              {activeModule === 'school' && (
                <>
                  <div className="space-y-4">
                    <FieldGroup label="School Name">
                      <input name="schoolName" value={schoolData.schoolName} onChange={(e) => handleInputChange(e, 'school')} className="w-full input-glass" />
                    </FieldGroup>
                    <FieldGroup label="Student Name">
                      <input name="studentName" value={schoolData.studentName} onChange={(e) => handleInputChange(e, 'school')} className="w-full input-glass" />
                    </FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup label="Class/Section">
                        <input name="classSec" value={schoolData.classSec} onChange={(e) => handleInputChange(e, 'school')} className="w-full input-glass" />
                      </FieldGroup>
                      <FieldGroup label="Roll No">
                        <input name="rollNo" value={schoolData.rollNo} onChange={(e) => handleInputChange(e, 'school')} className="w-full input-glass" />
                      </FieldGroup>
                    </div>
                    <FieldGroup label="Father's Name">
                      <input name="fatherName" value={schoolData.fatherName} onChange={(e) => handleInputChange(e, 'school')} className="w-full input-glass" />
                    </FieldGroup>
                    <FieldGroup label="Valid Till">
                      <input name="validTill" value={schoolData.validTill} onChange={(e) => handleInputChange(e, 'school')} className="w-full input-glass" />
                    </FieldGroup>
                    <FieldGroup label="Address">
                      <textarea name="address" value={schoolData.address} onChange={(e) => handleInputChange(e, 'school')} className="w-full input-glass h-20" />
                    </FieldGroup>
                  </div>
                </>
              )}

              {activeModule === 'visitor' && (
                <>
                  <div className="space-y-4">
                    <FieldGroup label="Visitor Name">
                      <input name="visitorName" value={visitorData.visitorName} onChange={(e) => handleInputChange(e, 'visitor')} className="w-full input-glass" />
                    </FieldGroup>
                    <FieldGroup label="Company Representing">
                      <input name="companyName" value={visitorData.companyName} onChange={(e) => handleInputChange(e, 'visitor')} className="w-full input-glass" />
                    </FieldGroup>
                    <FieldGroup label="Purpose of Visit">
                      <input name="purpose" value={visitorData.purpose} onChange={(e) => handleInputChange(e, 'visitor')} className="w-full input-glass" />
                    </FieldGroup>
                    <FieldGroup label="Whom to Meet?">
                      <input name="personToMeet" value={visitorData.personToMeet} onChange={(e) => handleInputChange(e, 'visitor')} className="w-full input-glass" />
                    </FieldGroup>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup label="Entry Time">
                        <input name="entryDateTime" value={visitorData.entryDateTime} onChange={(e) => handleInputChange(e, 'visitor')} className="w-full input-glass text-[10px]" />
                      </FieldGroup>
                      <FieldGroup label="Expected Exit">
                        <input name="exitTime" value={visitorData.exitTime} onChange={(e) => handleInputChange(e, 'visitor')} className="w-full input-glass" />
                      </FieldGroup>
                    </div>
                  </div>
                </>
              )}

              {/* Shared Uploads */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <UploadBox label="Photo" icon={<Camera size={16} />} onUpload={(e) => handleImageUpload(e, 'photoUrl', activeModule)} hasImage={!!(activeModule === 'school' ? schoolData.photoUrl : visitorData.photoUrl)} />
                <UploadBox label="Signature" icon={<SignIcon size={16} />} onUpload={(e) => handleImageUpload(e, 'signUrl', activeModule)} hasImage={!!(activeModule === 'school' ? schoolData.signUrl : visitorData.signUrl)} />
                {activeModule === 'school' && (
                  <UploadBox label="School Logo" icon={<School size={16} />} onUpload={(e) => handleImageUpload(e, 'logoUrl', activeModule)} hasImage={!!schoolData.logoUrl} />
                )}
              </div>
            </div>
          </aside>

          {/* Center Area: Preview Canvas */}
          <main className="flex-1 p-12 flex flex-col items-center justify-center relative overflow-auto scrollbar-hide">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-[4px]">
              <div className="w-12 h-[1px] bg-white/10"></div>
              Live Identity Preview
              <div className="w-12 h-[1px] bg-white/10"></div>
            </div>

            {/* The Actual ID Card Render Container */}
            <div 
              className={`shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-[1.02] bg-white`}
              style={activeModule === 'visitor' ? { width: '320px', height: '510px' } : { width: '510px', height: '320px' }}
            >
              <div 
                ref={cardRef} 
                className={`w-full h-full relative overflow-hidden bg-white text-slate-900 border border-slate-200`}
                style={{ fontFamily: 'sans-serif' }}
              >
                {/* School ID Template (Landscape) */}
                {activeModule === 'school' && (
                  <div className="w-full h-full shadow-inner overflow-hidden">
                    {/* Template 1: Premium Executive Academy */}
                    {selectedSchoolTemplate === 1 && (
                      <div className="flex flex-col h-full bg-white relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-bl-[120px] -z-0"></div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform rotate-12 scale-150">
                          <School size={120} />
                        </div>
                        <div className="h-16 flex items-center px-6 gap-4 bg-white/80 backdrop-blur-sm relative z-10 border-b border-slate-100">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 border border-slate-100 shadow-sm flex items-center justify-center">
                            {schoolData.logoUrl ? (
                              <img src={schoolData.logoUrl} className="w-full h-full object-contain" />
                            ) : (
                              <School size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[11px] font-black uppercase tracking-widest leading-none drop-shadow-sm" style={{ color: themeColor }}>{schoolData.schoolName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="h-[1px] w-4 bg-slate-200"></span>
                              <p className="text-[6px] font-bold text-slate-400 uppercase tracking-[3px]">Official Identity Card</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 flex p-6 gap-8 relative z-10">
                          <div className="w-[110px] flex flex-col items-center">
                            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border-[3px] border-white shadow-[0_15px_35px_rgba(0,0,0,0.1)] bg-slate-100 group">
                              {schoolData.photoUrl ? (
                                <img src={schoolData.photoUrl} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Camera size={32} className="text-slate-300" /></div>
                              )}
                            </div>
                            <div className="mt-4 w-full h-10 flex items-center justify-center p-2 bg-slate-50/50 rounded-lg border border-slate-100 border-dashed">
                              {schoolData.signUrl && <img src={schoolData.signUrl} className="h-6 object-contain" />}
                            </div>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div>
                              <h4 className="text-2xl font-black text-slate-900 uppercase leading-none tracking-tight mb-1">{schoolData.studentName}</h4>
                              <div className="h-1 w-8 rounded-full" style={{ backgroundColor: themeColor }}></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                              <div className="flex flex-col border-l-2 pl-3" style={{ borderLeftColor: themeColor + '33' }}>
                                <span className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mb-0.5">Registration</span>
                                <span className="font-bold text-[10px] text-slate-700">{schoolData.rollNo}</span>
                              </div>
                              <div className="flex flex-col border-l-2 pl-3" style={{ borderLeftColor: themeColor + '33' }}>
                                <span className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mb-0.5">Class/Grade</span>
                                <span className="font-bold text-[10px] text-slate-700">{schoolData.classSec}</span>
                              </div>
                              <div className="flex flex-col border-l-2 pl-3" style={{ borderLeftColor: themeColor + '33' }}>
                                <span className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mb-0.5">Parent</span>
                                <span className="font-bold text-[10px] text-slate-700 truncate">{schoolData.fatherName}</span>
                              </div>
                              <div className="flex flex-col border-l-2 pl-3" style={{ borderLeftColor: themeColor + '33' }}>
                                <span className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mb-0.5">Emergency</span>
                                <span className="font-bold text-[10px] text-slate-700">{schoolData.contact}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col border-t border-slate-100 pt-3 relative backdrop-blur-sm">
                              <span className="text-slate-400 font-bold uppercase text-[6px] tracking-widest mb-1">Residential Address</span>
                              <p className="font-bold text-[8px] leading-relaxed text-slate-600 line-clamp-2">{schoolData.address}</p>
                              <div className="absolute right-0 bottom-0 opacity-10 grayscale scale-75">
                                <QRCodeSVG value={getQRData()} size={40} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="h-1 w-full" style={{ backgroundColor: themeColor }}></div>
                      </div>
                    )}

                    {/* Template 2: Creative Vision (Bold & Modern) */}
                    {selectedSchoolTemplate === 2 && (
                      <div className="flex flex-col h-full bg-[#FCFCFD] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-900 transform skew-x-12 translate-x-1/2 -z-0"></div>
                        <div className="absolute top-0 left-0 p-8 opacity-5">
                          <Plus size={100} className="text-slate-900" />
                        </div>
                        
                        <div className="p-8 flex h-full gap-8 relative z-10">
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                               <div className="flex items-center gap-3 mb-8">
                                  <div className="p-2 bg-slate-900 rounded-lg">
                                    {schoolData.logoUrl ? <img src={schoolData.logoUrl} className="h-5 w-5 object-contain" /> : <School size={20} className="text-white" />}
                                  </div>
                                  <h2 className="text-xs font-black tracking-widest text-slate-900 leading-none flex flex-col">
                                    {schoolData.schoolName}
                                    <span className="text-[6px] text-slate-400 mt-1 tracking-[4px]">ACADEMIC EXCELLENCE</span>
                                  </h2>
                               </div>
                               
                               <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-10 overflow-hidden text-ellipsis whitespace-nowrap">{schoolData.studentName}</h3>
                               
                               <div className="space-y-6">
                                  <div className="flex gap-10">
                                     <div><p className="text-[6px] font-black text-slate-300 uppercase mb-1">Grade</p><p className="text-xs font-black">{schoolData.classSec}</p></div>
                                     <div><p className="text-[6px] font-black text-slate-300 uppercase mb-1">Student ID</p><p className="text-xs font-black">#{schoolData.idNumber.slice(-4)}</p></div>
                                  </div>
                                  <div>
                                     <p className="text-[6px] font-black text-slate-300 uppercase mb-1">Valid Until</p>
                                     <p className="text-[9px] font-black px-3 py-1 bg-slate-100 rounded-full inline-block">{schoolData.validTill}</p>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                               <QRCodeSVG value={getQRData()} size={42} />
                               <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-tight">Digital Sync ID<br/>Scan for Access</div>
                            </div>
                          </div>
                          
                          <div className="w-[180px] flex flex-col items-center justify-center relative">
                             <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden border-8 border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                                {schoolData.photoUrl ? (
                                  <img src={schoolData.photoUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-slate-800 flex items-center justify-center"><UserCheck size={64} className="text-slate-700" /></div>
                                )}
                             </div>
                             <div className="absolute -bottom-4 right-0 bg-white p-3 rounded-2xl shadow-lg border border-slate-50">
                                {schoolData.signUrl ? <img src={schoolData.signUrl} className="h-4 object-contain" /> : <SignIcon size={20} className="text-slate-200" />}
                             </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template 3: Heritage University (Gold & Elite) */}
                    {selectedSchoolTemplate === 3 && (
                      <div className="flex flex-col h-full bg-[#0F172A] text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent"></div>
                        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-amber-500/10 blur-[60px]"></div>
                        
                        <div className="p-8 h-full flex flex-col relative z-10">
                          <div className="flex justify-between items-start mb-10">
                             <div className="flex items-center gap-3">
                                {schoolData.logoUrl && <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md border border-white/5"><img src={schoolData.logoUrl} className="h-6 w-6 object-contain" /></div>}
                                <div>
                                   <h2 className="text-[9px] font-black tracking-[4px] text-amber-500 uppercase">{schoolData.schoolName}</h2>
                                   <p className="text-[6px] font-bold text-white/40 tracking-[2px]">ESTABLISHED HERITAGE</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] font-mono text-white/30 tracking-[3px] uppercase">Tier 01 Card</p>
                             </div>
                          </div>

                          <div className="flex gap-10 flex-1">
                             <div className="w-1/3 flex flex-col items-center">
                                <div className="w-full aspect-square rounded-full border-[3px] border-amber-500/30 p-2 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-slate-900/40">
                                   <div className="w-full h-full rounded-full overflow-hidden grayscale contrast-125">
                                      {schoolData.photoUrl && <img src={schoolData.photoUrl} className="w-full h-full object-cover" />}
                                   </div>
                                </div>
                                <div className="mt-8">
                                   <QRCodeSVG value={getQRData()} size={50} bgColor="transparent" fgColor="#f59e0b" />
                                </div>
                             </div>
                             
                             <div className="flex-1 flex flex-col">
                                <div className="mb-6">
                                   <p className="text-[10px] font-serif italic text-amber-500/60 mb-2 underline decoration-amber-500/20 underline-offset-4">Distinguished Scholar</p>
                                   <h3 className="text-3xl font-serif font-black tracking-tight">{schoolData.studentName}</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-y-6 flex-1">
                                   <div className="space-y-1">
                                      <p className="text-[6px] text-white/30 font-bold tracking-widest">ID NUMBER</p>
                                      <p className="text-xs font-mono text-amber-100">{schoolData.idNumber}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[6px] text-white/30 font-bold tracking-widest">MAJOR/DEPT</p>
                                      <p className="text-xs font-mono text-amber-100">{schoolData.classSec}</p>
                                   </div>
                                   <div className="col-span-2 space-y-1">
                                      <p className="text-[6px] text-white/30 font-bold tracking-widest">RESIDENCE</p>
                                      <p className="text-[9px] font-serif text-white/60 leading-tight italic truncate">{schoolData.address}</p>
                                   </div>
                                </div>
                                
                                <div className="mt-auto flex justify-between items-end border-t border-white/5 pt-4">
                                   <div className="h-6 w-24 border-b border-white/20 relative">
                                      {schoolData.signUrl && <img src={schoolData.signUrl} className="h-6 absolute bottom-1 rotate-[-2deg]" />}
                                      <p className="absolute -bottom-3 left-0 text-[5px] text-white/20 uppercase">Registrar</p>
                                   </div>
                                   <div className="text-[8px] font-black text-amber-500 px-3 py-1 rounded bg-amber-500/10">EXPIRES: {schoolData.validTill}</div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template 4: Future Tech (Glassmorphism) */}
                    {selectedSchoolTemplate === 4 && (
                      <div className="flex flex-col h-full bg-[#eff6ff] relative overflow-hidden p-8">
                        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-blue-500/20 blur-[80px]"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-[200px] h-[200px] rounded-full bg-purple-500/20 blur-[60px]"></div>
                        
                        <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-[32px] h-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 flex gap-8">
                           <div className="w-1/3 flex flex-col items-center justify-between">
                              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative">
                                 {schoolData.photoUrl ? (
                                    <img src={schoolData.photoUrl} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-300"><School size={48} /></div>
                                 )}
                                 <div className="absolute inset-0 ring-1 ring-inset ring-white/20"></div>
                              </div>
                              <div className="p-3 bg-white/60 rounded-xl border border-white shadow-sm w-full flex items-center justify-center">
                                 <QRCodeSVG value={getQRData()} size={50} />
                              </div>
                           </div>
                           
                           <div className="flex-1 flex flex-col">
                              <div className="flex items-center gap-3 mb-6">
                                 <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    {schoolData.logoUrl ? <img src={schoolData.logoUrl} className="h-6 w-6 object-contain invert grayscale brightness-200" /> : <School size={16} className="text-white" />}
                                 </div>
                                 <h2 className="text-[9px] font-black text-slate-800 tracking-widest">{schoolData.schoolName}</h2>
                              </div>
                              
                              <div className="flex-1">
                                 <p className="text-[10px] font-black text-blue-600 mb-1">STUDENT NAME</p>
                                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">{schoolData.studentName}</h3>
                                 
                                 <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                       <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Grade</p>
                                       <p className="text-sm font-black text-slate-700">{schoolData.classSec}</p>
                                    </div>
                                    <div>
                                       <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Index Number</p>
                                       <p className="text-sm font-black text-slate-700">{schoolData.rollNo}</p>
                                    </div>
                                 </div>
                                 
                                 <div className="p-4 bg-white/20 border border-white rounded-2xl">
                                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact/Medical</p>
                                    <p className="text-xs font-black text-slate-700">{schoolData.contact}</p>
                                 </div>
                              </div>
                              
                              <div className="mt-auto pt-6 flex justify-between items-center border-t border-white/30">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 pulse"></div>
                                    <p className="text-[8px] font-black text-slate-400">STATUS: ACTIVE</p>
                                 </div>
                                 <p className="text-[10px] font-black text-slate-900">{schoolData.validTill}</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Template 5: Minimalist Zen (Soft & Premium) */}
                    {selectedSchoolTemplate === 5 && (
                      <div className="flex h-full bg-[#fdfdfd] p-10 font-sans">
                        <div className="flex-1 flex flex-col">
                           <div className="flex items-center gap-4 mb-12">
                              {schoolData.logoUrl && <img src={schoolData.logoUrl} className="h-10 w-10 object-contain grayscale" />}
                              <div className="h-8 w-[2px] bg-slate-100"></div>
                              <h2 className="text-xs font-bold text-slate-400 tracking-[5px] uppercase">{schoolData.schoolName}</h2>
                           </div>
                           
                           <div className="flex-1 space-y-12">
                              <div>
                                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">{schoolData.studentName}</h3>
                                 <div className="flex gap-4">
                                    <span className="px-3 py-1 bg-slate-950 text-white text-[8px] font-bold rounded-lg uppercase tracking-widest italic">{schoolData.classSec} Student</span>
                                    <span className="px-3 py-1 border border-slate-200 text-slate-400 text-[8px] font-bold rounded-lg uppercase tracking-widest">ID #{schoolData.rollNo}</span>
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-12">
                                 <div className="space-y-4">
                                    <div><p className="text-[7px] font-bold text-slate-300 uppercase mb-1">Guardian Name</p><p className="text-xs font-black text-slate-800">{schoolData.fatherName}</p></div>
                                    <div><p className="text-[7px] font-bold text-slate-300 uppercase mb-1">Primary Contact</p><p className="text-xs font-black text-slate-800">{schoolData.contact}</p></div>
                                 </div>
                                 <div className="flex items-end justify-end">
                                    <QRCodeSVG value={getQRData()} size={60} />
                                 </div>
                              </div>
                           </div>
                           
                           <div className="mt-auto text-[8px] font-bold text-slate-200 tracking-[10px] uppercase">
                              Secured Academic Personal Identification
                           </div>
                        </div>
                        
                        <div className="w-[180px] h-full ml-10 flex flex-col">
                           <div className="flex-1 rounded-[40px] overflow-hidden shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] bg-slate-50 relative group">
                              {schoolData.photoUrl ? (
                                 <img src={schoolData.photoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-200"><UserCheck size={80} /></div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                           </div>
                           <div className="mt-8 h-12 flex flex-col items-center justify-center border border-slate-50 rounded-2xl bg-white italic">
                              {schoolData.signUrl && <img src={schoolData.signUrl} className="h-6 object-contain" />}
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Visitor Pass (Portrait Badge) */}
                {activeModule === 'visitor' && (
                  <div className="w-full h-full">
                    {/* Template 1: Standard Modern */}
                    {selectedVisitorTemplate === 1 && (
                      <div className="flex flex-col h-full bg-white">
                        <div className="bg-slate-900 text-white p-6 text-center">
                          <h2 className="text-3xl font-black uppercase tracking-widest leading-none">VISITOR</h2>
                          <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-[5px]">ENTRY PASS</p>
                        </div>

                        <div className="p-8 flex-1 flex flex-col items-center">
                          <div className="w-32 h-32 rounded-full border-8 border-white shadow-xl bg-slate-100 -mt-20 relative z-10 overflow-hidden flex items-center justify-center mb-6">
                            {visitorData.photoUrl ? (
                              <img src={visitorData.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                            ) : (
                              <UserCheck size={48} className="text-slate-300" />
                            )}
                          </div>

                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight text-center mb-1">{visitorData.visitorName}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-8">{visitorData.companyName}</p>

                          <div className="w-full space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Purpose</span>
                              <span className="text-xs font-bold text-slate-800">{visitorData.purpose}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-[8px] font-bold text-slate-400 uppercase">To Meet</span>
                              <span className="text-xs font-bold text-slate-800">{visitorData.personToMeet}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">In Time</span>
                                <span className="text-[10px] font-black text-emerald-600 block">{visitorData.entryDateTime}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Exit Time</span>
                                <span className="text-[10px] font-black text-red-500 block">{visitorData.exitTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto w-full flex justify-between items-center py-4">
                            <div className="flex-1">
                              <QRCodeSVG value={getQRData()} size={50} />
                              <p className="text-[8px] font-bold text-slate-300 mt-2">SCAN FOR LOGS</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[20px] font-black text-slate-900 leading-none">#{visitorData.idNumber.split('-')[1] || visitorData.idNumber}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Pass Index</p>
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-emerald-500"></div>
                      </div>
                    )}

                    {/* Template 2: Security Priority Red */}
                    {selectedVisitorTemplate === 2 && (
                       <div className="flex flex-col h-full bg-slate-50 border-r-[20px] border-red-600">
                          <div className="bg-red-600 p-4 text-white">
                             <h2 className="text-2xl font-black italic tracking-tighter">SECURE ACCESS</h2>
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                             <div className="flex gap-6 mb-8">
                                <div className="w-24 h-32 rounded border-2 border-slate-200 overflow-hidden bg-white shrink-0">
                                   {visitorData.photoUrl && <img src={visitorData.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
                                </div>
                                <div className="flex-1">
                                   <div className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded w-fit mb-2">ESCORT REQUIRED</div>
                                   <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{visitorData.visitorName}</h3>
                                   <p className="text-[10px] font-bold text-slate-400">{visitorData.companyName}</p>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-y-6 text-slate-800">
                                <div className="border-l-2 border-red-600 pl-3">
                                   <p className="text-[7px] text-slate-400 font-bold uppercase">To See</p>
                                   <p className="text-xs font-black">{visitorData.personToMeet}</p>
                                </div>
                                <div className="border-l-2 border-slate-200 pl-3">
                                   <p className="text-[7px] text-slate-400 font-bold uppercase">Purpose</p>
                                   <p className="text-xs font-black">{visitorData.purpose}</p>
                                </div>
                                <div className="border-l-2 border-slate-200 pl-3">
                                   <p className="text-[7px] text-slate-400 font-bold uppercase">Valid Until</p>
                                   <p className="text-xs font-black">{visitorData.exitTime}</p>
                                </div>
                                <div className="border-l-2 border-slate-200 pl-3">
                                   <p className="text-[7px] text-slate-400 font-bold uppercase">Ref ID</p>
                                   <p className="text-xs font-black">{visitorData.idNumber}</p>
                                </div>
                             </div>

                             <div className="mt-auto flex justify-between items-end bg-white p-4 rounded-xl border border-slate-100 italic">
                                <div>
                                   <p className="text-[8px] font-bold text-slate-300">AUTHORIZED BY</p>
                                   <div className="h-6 w-24 border-b border-slate-200"></div>
                                </div>
                                <QRCodeSVG value={getQRData()} size={40} />
                             </div>
                          </div>
                       </div>
                    )}

                    {/* Template 3: Event VIP (Gold) */}
                    {selectedVisitorTemplate === 3 && (
                       <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
                          <div className="h-1/3 bg-gradient-to-b from-[#f59e0b]/20 to-transparent flex flex-col items-center justify-center relative overflow-hidden">
                             <div className="absolute top-0 w-full h-1 bg-[#f59e0b]"></div>
                             <h2 className="text-4xl font-black tracking-[10px] text-[#f59e0b] -mb-2">V.I.P</h2>
                             <p className="text-[8px] font-bold tracking-[8px] text-white/40 uppercase">EXECUTIVE GUEST</p>
                          </div>
                          <div className="px-8 -mt-10 relative z-10 flex flex-col items-center flex-1">
                             <div className="w-32 h-32 rounded-2xl border-4 border-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.3)] overflow-hidden bg-black mb-6">
                                {visitorData.photoUrl && <img src={visitorData.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
                             </div>
                             
                             <h3 className="text-2xl font-black tracking-tight mb-1">{visitorData.visitorName}</h3>
                             <p className="text-xs text-[#f59e0b] uppercase font-black">{visitorData.companyName}</p>
                             
                             <div className="mt-8 grid grid-cols-2 w-full gap-4 text-center">
                                <div className="p-3 border border-white/5 rounded-2xl bg-white/5">
                                   <p className="text-[7px] text-white/30 uppercase mb-1">Time In</p>
                                   <p className="text-xs font-black">10:00 (Auto)</p>
                                </div>
                                <div className="p-3 border border-white/5 rounded-2xl bg-[#f59e0b]/10">
                                   <p className="text-[7px] text-[#f59e0b] uppercase mb-1">Access</p>
                                   <p className="text-xs font-black">ALL AREAS</p>
                                </div>
                             </div>

                             <div className="mt-auto mb-8 p-4 bg-white rounded-2xl">
                                <QRCodeSVG value={getQRData()} size={80} />
                             </div>
                          </div>
                       </div>
                    )}

                    {/* Template 4: Corporate Minimalist */}
                    {selectedVisitorTemplate === 4 && (
                       <div className="flex h-full bg-white font-sans">
                          <div className="w-16 h-full bg-slate-900 flex items-center justify-center">
                             <p className="rotate-[-90deg] whitespace-nowrap text-xs font-black text-white/20 tracking-[10px]">RECEPTION PASS</p>
                          </div>
                          <div className="flex-1 p-8 flex flex-col">
                             <div className="flex justify-between items-start mb-12">
                                <div>
                                   <p className="text-[10px] font-black text-[#7b61ff]">VISITOR LOG</p>
                                   <h2 className="text-2xl font-black text-slate-900 border-b-4 border-slate-900 inline-block">BOARDING</h2>
                                </div>
                                <div className="text-right">
                                   <p className="text-[20px] font-black leading-none">№ {visitorData.idNumber.slice(-3)}</p>
                                   <p className="text-[8px] font-bold text-slate-400">INDEX ID</p>
                                </div>
                             </div>

                             <div className="flex flex-col items-center mb-10">
                                <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-xl overflow-hidden mb-4">
                                   {visitorData.photoUrl && <img src={visitorData.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{visitorData.visitorName}</h3>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">{visitorData.companyName}</p>
                             </div>

                             <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-bold border-b border-slate-50 pb-2">
                                   <span className="text-slate-300 uppercase italic">Visiting:</span>
                                   <span className="text-slate-900">{visitorData.personToMeet}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold border-b border-slate-50 pb-2">
                                   <span className="text-slate-300 uppercase italic">Entry:</span>
                                   <span className="text-slate-900">{visitorData.entryDateTime}</span>
                                </div>
                             </div>

                             <div className="mt-auto flex justify-center">
                                <QRCodeSVG value={getQRData()} size={50} />
                             </div>
                          </div>
                       </div>
                    )}

                    {/* Template 5: Modern Grid Lab */}
                    {selectedVisitorTemplate === 5 && (
                       <div className="flex flex-col h-full bg-slate-900 text-white relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                          <div className="p-6 h-full flex flex-col relative z-10">
                             <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-md mb-8">
                                <div>
                                   <h2 className="text-base font-black italic tracking-tighter">LAB_ACCESS</h2>
                                   <p className="text-[8px] font-bold text-cyan-400 tracking-widest uppercase">Research Wing</p>
                                </div>
                                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                                   <QRCodeSVG value={getQRData()} size={30} />
                                </div>
                             </div>

                             <div className="flex-1 flex flex-col items-center">
                                <div className="w-40 h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-3xl mb-6 p-2">
                                   <div className="w-full h-full rounded-2xl bg-black overflow-hidden relative">
                                      {visitorData.photoUrl && <img src={visitorData.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
                                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-cyan-500/50 to-transparent"></div>
                                   </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-center leading-none tracking-tight mb-2 uppercase">{visitorData.visitorName}</h3>
                                <div className="px-4 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-widest">{visitorData.purpose}</div>
                                
                                <div className="mt-auto w-full grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                                   <div className="p-4 bg-white/5"><p className="text-[7px] text-white/30 uppercase mb-1">Floor</p><p className="text-xs font-mono">B-4</p></div>
                                   <div className="p-4 bg-white/5"><p className="text-[7px] text-white/30 uppercase mb-1">Clearance</p><p className="text-xs font-mono">L3</p></div>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Actions Overlay */}
            <div className="flex gap-4 mt-12">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Theme Accent</span>
                <div className="flex gap-2 p-2 bg-white/5 rounded-full border border-white/5">
                  {['#7b61ff', '#00d2ff', '#ff7b61', '#10b981', '#f59e0b'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setThemeColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${themeColor === c ? 'scale-110 border-white ring-4 ring-white/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar: Tools & Analytics */}
          <aside className={`w-[320px] flex-shrink-0 border-l ${isDarkMode ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-white'} overflow-y-auto p-6 scrollbar-hide`}>
            <div className="space-y-10">
              
              {/* Bulk Actions */}
              <section>
                <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4 flex items-center gap-2">
                  <FileSpreadsheet size={14} /> Bulk Generator
                </h3>
                <div className="glass-panel p-5 bg-white/5 border-dashed border-2 hover:bg-white/10 transition-colors cursor-pointer relative">
                  <input type="file" accept=".csv" onChange={handleBulkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-white mb-1">Import CSV Data</p>
                    <p className="text-[10px] text-white/40">Generate hundreds of IDs in one click</p>
                  </div>
                </div>
              </section>

              {/* Advanced Features */}
              <section>
                <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">AI Magic Tools</h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleRemoveBg}
                    disabled={isRemovingBg}
                    className={`w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-left flex items-center justify-between group ${isRemovingBg ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white mb-0.5">
                        {isRemovingBg ? 'Removing Background...' : 'Background Remover'}
                      </p>
                      <p className="text-[10px] text-white/40">Clean portrait photos instantly</p>
                    </div>
                    {isRemovingBg ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#7b61ff] border-t-transparent"></div>
                    ) : (
                      <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                    )}
                  </button>
                  <button className="w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-left flex items-center justify-between group opacity-50 cursor-not-allowed">
                    <div>
                      <p className="text-xs font-bold text-white mb-0.5">Smart Crop (AI)</p>
                      <p className="text-[10px] text-white/40">Auto-align faces in frame</p>
                    </div>
                    <ChevronRight size={14} className="text-white/20" />
                  </button>
                </div>
              </section>

              {/* Template Management (Mock) */}
              <section>
                <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-4">Saved Designs</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center group relative overflow-hidden">
                    <img src="https://picsum.photos/seed/id1/200/200" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform" />
                    <button className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">LOAD</button>
                  </div>
                  <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center group relative overflow-hidden">
                    <img src="https://picsum.photos/seed/id2/200/200" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform" />
                    <button className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">LOAD</button>
                  </div>
                </div>
              </section>

              {/* Analytics Summary */}
              <section className="bg-[#7b61ff]/10 p-5 rounded-2xl border border-[#7b61ff]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#7b61ff]/20 flex items-center justify-center text-[#7b61ff]"><Plus size={16} /></div>
                  <h4 className="text-xs font-black uppercase tracking-widest">Usage Stats</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-black text-white leading-none">1.2k</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase mt-1">IDs Printed</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-white leading-none">42</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase mt-1">Saved Lists</p>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>

        {/* Status Bar */}
        <footer className={`px-6 py-2 border-t ${isDarkMode ? 'border-white/10 bg-black/60' : 'border-gray-200 bg-white'} text-[10px] font-bold tracking-widest text-white/40 flex justify-between items-center z-30`}>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> ENGINE BRAVO RUNNING</span>
            <span>SYSTEM_V_5.02</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#7b61ff]">SESSION ACTIVE</span>
            <span>AUTOSAVE ON</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Sub-components
function FieldGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 leading-none">{label}</label>
      {children}
    </div>
  );
}

function UploadBox({ label, icon, onUpload, hasImage }: { label: string, icon: React.ReactNode, onUpload: (e: any) => void, hasImage: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase text-white/40 ml-1 leading-none">{label}</label>
      <div className={`relative border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-3 transition-all cursor-pointer ${hasImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'}`}>
        <input type="file" accept="image/*" onChange={onUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className={hasImage ? 'text-emerald-500' : 'text-white/40'}>{icon}</div>
        <span className={`text-[10px] font-bold uppercase ${hasImage ? 'text-emerald-200' : 'text-white/60'}`}>
          {hasImage ? 'Change Image' : 'Click to Upload'}
        </span>
      </div>
    </div>
  );
}
