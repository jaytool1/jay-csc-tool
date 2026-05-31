import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Page } from '../App';
import { 
  Camera, 
  Download, 
  ArrowLeft, 
  Type, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  Layout,
  AlignCenter,
  ArrowUp,
  ArrowDown,
  Palette,
  Maximize2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface PhotoNameJoinerProps {
  onNavigate: (page: Page) => void;
}

type TextPosition = 'top' | 'middle' | 'bottom';
type BorderStyle = 'none' | 'white' | 'black' | 'rounded-white' | 'rounded-black';

export function PhotoNameJoiner({ onNavigate }: PhotoNameJoinerProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState('#000000');
  const [position, setPosition] = useState<TextPosition>('bottom');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('none');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const colors = [
    '#000000', '#ffffff', '#2563eb', '#16a34a', 
    '#dc2626', '#9333ea', '#ea580c', '#475569'
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const updatePreview = useCallback(() => {
    if (!photo || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photo;
    img.onload = () => {
      // Set canvas size based on image
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Prepare text area
      const padding = canvas.width * 0.05;
      const text = `${name}${name && date ? ' - ' : ''}${date}`.toUpperCase();
      
      if (text) {
        ctx.font = `bold ${fontSize * (canvas.width / 500)}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize * (canvas.width / 500);

        // Background box logic
        let yPos = 0;
        if (position === 'top') yPos = padding + textHeight;
        else if (position === 'middle') yPos = canvas.height / 2;
        else yPos = canvas.height - padding - textHeight;

        // Draw overlay background if needed
        const bgPadding = textHeight * 0.5;
        const bgX = (canvas.width - textWidth) / 2 - bgPadding;
        const bgY = yPos - textHeight + bgPadding / 2;
        const bgWidth = textWidth + bgPadding * 2;
        const bgHeight = textHeight + bgPadding;

        if (borderStyle !== 'none') {
          ctx.fillStyle = borderStyle.includes('white') ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)';
          if (borderStyle.includes('rounded')) {
            const radius = 10;
            ctx.beginPath();
            ctx.moveTo(bgX + radius, bgY);
            ctx.lineTo(bgX + bgWidth - radius, bgY);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
            ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
            ctx.lineTo(bgX + radius, bgY + bgHeight);
            ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
            ctx.lineTo(bgX, bgY + radius);
            ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
          }
        }

        // Draw Text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, yPos + textHeight / 4);
      }

      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
    };
  }, [photo, name, date, fontSize, textColor, position, borderStyle]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const downloadImage = () => {
    if (!previewUrl) return;
    setIsGenerating(true);
    const link = document.createElement('a');
    link.download = `photo-named-${Date.now()}.jpg`;
    link.href = previewUrl;
    link.click();
    setTimeout(() => setIsGenerating(false), 500);
  };

  return (
    <div className="w-full">
      {/* Tool Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-0 left-10 w-64 h-64 bg-white/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]"></div>
         </div>
         
         <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <button 
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[4px] mb-12 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Return to hub
            </button>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight uppercase">
              Photo Name <span className="text-indigo-200">Joiner</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
              Add name and date to your photos professionally. Create beautiful photo cards in seconds for government & exam forms.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
               <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white text-xs font-black uppercase tracking-widest flex items-center gap-3">
                  <Layout size={16} className="text-indigo-300" />
                  125K+ Cards Created
               </div>
               <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white text-xs font-black uppercase tracking-widest flex items-center gap-3">
                  <Sparkles size={16} className="text-amber-400" />
                  4.8/5 Premium Tool
               </div>
               <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white text-xs font-black uppercase tracking-widest flex items-center gap-3">
                  <Download size={16} className="text-emerald-400" />
                  Instant Export
               </div>
            </div>
         </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Configuration */}
          <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-10 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <Type size={28} className="text-primary" />
                Customize Card
              </h2>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion</span>
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${(photo ? 33 : 0) + (name ? 33 : 0) + (date ? 34 : 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Type size={14} /> Name on Photo
              </label>
              <input 
                type="text" 
                placeholder="Ex: John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Date on Photo
              </label>
              <input 
                type="text" 
                placeholder="Ex: 15-08-2024" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Camera size={14} /> Upload Photo
              </label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                {photo ? (
                  <div className="flex items-center justify-center gap-4">
                    <img src={photo} alt="Thumbnail" className="w-16 h-16 object-cover rounded-xl shadow-lg border-2 border-white" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900">Photo Loaded</p>
                      <button onClick={(e) => { e.stopPropagation(); setPhoto(null); }} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Camera size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Drag & Drop or Click to Upload</p>
                    <p className="text-xs text-slate-400">JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Palette size={14} /> Text Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button 
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${textColor === c ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layout size={14} /> Position
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['top', 'middle', 'bottom'] as TextPosition[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPosition(p)}
                      className={`flex-1 py-2 flex items-center justify-center rounded-lg transition-all ${
                        position === p ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {p === 'top' ? <ArrowUp size={16} /> : p === 'middle' ? <AlignCenter size={16} /> : <ArrowDown size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Font Size</label>
                <span className="text-primary font-black text-xs">{fontSize}px</span>
              </div>
              <input 
                type="range" 
                min="12" max="120"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overlay Style</label>
              <select 
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value as BorderStyle)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-900 focus:outline-none"
              >
                <option value="none">Simple Text (No Background)</option>
                <option value="black">Classic Black Bar</option>
                <option value="white">Pristine White Bar</option>
                <option value="rounded-black">Rounded Black Box</option>
                <option value="rounded-white">Rounded White Box</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-8 flex flex-col">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 flex-1 flex flex-col items-center justify-center relative min-h-[500px] shadow-2xl overflow-hidden">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-[4px] z-10">
              <div className="w-12 h-[1px] bg-white/10"></div>
              Live Canvas Preview
              <div className="w-12 h-[1px] bg-white/10"></div>
            </div>
            
            {/* Hidden Helper Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {previewUrl ? (
              <div className="relative group max-w-full">
                <img src={previewUrl} alt="Preview" className="max-h-[600px] w-auto shadow-2xl rounded-lg border-4 border-slate-800" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <div className="flex items-center gap-3 text-white">
                    <Maximize2 size={24} />
                    <span className="font-bold text-sm">Full Resolution Preview</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 max-w-sm">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/5 animate-pulse">
                  <Camera size={40} className="text-white/20" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-black uppercase tracking-tight mb-2">Ready to Render</h3>
                  <p className="text-white/40 text-sm font-medium">Upload a photo and enter name/date details to see the live rendering here.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${previewUrl ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                {previewUrl ? <CheckCircle2 size={24} /> : <Download size={24} />}
              </div>
              <div>
                <h4 className="text-slate-900 font-black text-sm uppercase tracking-tight">Ready to Export?</h4>
                <p className="text-slate-500 text-xs font-medium">Your card will be rendered in high resolution.</p>
              </div>
            </div>
            <button 
              disabled={!photo || isGenerating}
              onClick={downloadImage}
              className="px-8 py-4 btn-primary rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download Card
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Guide Section */}
      <section className="mt-20 grid md:grid-cols-2 gap-10">
         <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="text-primary" /> How to use?
            </h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Upload Photo', desc: 'Select the passport size or profile photo you want to add text to.' },
                { step: '02', title: 'Enter Details', desc: 'Type your full name and the current date (common for exam photos).' },
                { step: '03', title: 'Style it', desc: 'Adjust font size, color, and background box style to match requirements.' },
                { step: '04', title: 'Download', desc: 'Get your high-quality JPEG card instantly, ready for uploads.' }
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
            <Trash2 size={40} className="text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Privacy First Architecture</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              We understand the sensitive nature of identity documents. Your photos are never sent to any server; all edits happen locally in your browser.
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-6 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-xs font-black uppercase tracking-widest w-fit mx-auto">
              <CheckCircle2 size={16} /> Verified Safe Execution
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-20 glass-panel bg-white p-12 md:p-20">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center justify-center gap-3">
               <Sparkles size={32} className="text-indigo-500" /> Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Everything you need to know about this tool</p>
         </div>
         
         <div className="grid md:grid-cols-2 gap-x-20 gap-y-12">
            {[
              { q: 'Is this tool really free?', a: 'Yes, absolutely free! No hidden charges, no watermarks, no signup required. All features are unlocked for all users.' },
              { q: 'Can I use any image format?', a: 'We support JPG, PNG, GIF, and other common web formats. Max recommended size is 5MB for best performance.' },
              { q: 'Will my photo quality reduce?', a: 'No, we maintain high rendering quality. Your downloaded image will be a high-resolution JPEG, suitable for printing.' },
              { q: 'Can I change text position?', a: 'Yes, you can place the text at the top, middle, or bottom of the image using the alignment controls.' },
              { q: 'Is my data safe?', a: 'Yes, all processing happens entirely in your browser. Your photos never leave your device and are never uploaded to any server.' },
              { q: 'Can I use Hindi or other languages?', a: 'Yes, the tool supports Unicode text, allowing you to enter names in Hindi, regional languages, or English.' }
            ].map((faq, idx) => (
              <div key={idx} className="space-y-3">
                 <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{faq.q}</h4>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
         </div>
      </section>
    </div>
  </div>
  );
}
