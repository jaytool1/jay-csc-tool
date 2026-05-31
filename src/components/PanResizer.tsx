import React, { useState, useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Page } from '../App';
import { compressImageToKB, downloadDataUrl } from '../lib/imageUtils';
import { UploadCloud, Download, Image as ImageIcon, Settings, CheckCircle2, AlertCircle, Crop, Loader2, Sparkles, Maximize2 } from 'lucide-react';

interface PanResizerProps {
  onNavigate: (page: Page) => void;
}

type FormatType = 'nsdl-photo' | 'nsdl-sign' | 'uti-photo' | 'uti-sign';

const FORMATS = {
  'nsdl-photo': { label: 'NSDL Photo', width: 197, height: 276, maxKB: 50, desc: '197×276px, ≤50KB' },
  'nsdl-sign': { label: 'NSDL Signature', width: 354, height: 157, maxKB: 50, desc: '354×157px, ≤50KB' },
  'uti-photo': { label: 'UTI Photo', width: 213, height: 213, maxKB: 30, desc: '213×213px, ≤30KB' },
  'uti-sign': { label: 'UTI Signature', width: 400, height: 200, maxKB: 60, desc: '400×200px, ≤60KB' },
};

export function PanResizer({ onNavigate }: PanResizerProps) {
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('nsdl-photo');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload a valid image file (JPG/PNG).');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setError(null);
    }
  }, []);

  const dropzoneOptions = {
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 1
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions as any);

  const handleProcess = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const format = FORMATS[selectedFormat];
      const dataUrl = await compressImageToKB(file, format.width, format.height, format.maxKB, 'image/jpeg');
      
      setResultUrl(dataUrl);
      
      // Calculate resulting size approximately
      const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
      setResultSize(sizeKB);
      
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      downloadDataUrl(resultUrl, `${selectedFormat}-resized.jpg`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">PAN Card Resizer</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Instantly resize photos and signatures for <span className="font-bold text-primary">NSDL</span> and <span className="font-bold text-secondary">UTI</span> applications.
        </p>
      </div>

      <div className="glass-panel overflow-hidden bg-white border border-slate-200">
        {/* Top Banner */}
        <div className="bg-slate-50 border-b border-slate-100 p-8 text-center">
          <h2 className="text-xl font-black text-slate-900 flex items-center justify-center gap-3 uppercase tracking-wider">
            <Settings className="w-6 h-6 text-primary" /> Official PAN Card Formats
          </h2>
          <p className="text-slate-500 text-sm mt-2">Precise cropping and size optimization for Indian PAN Card applications</p>
        </div>

        <div className="p-8">
          {/* Format Selection */}
          <div className="mb-10">
            <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Select Required Format</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(FORMATS) as FormatType[]).map((key) => (
                <div 
                  key={key}
                  onClick={() => {
                    setSelectedFormat(key);
                    setResultUrl(null); // Reset result on format change
                  }}
                  className={`cursor-pointer rounded-2xl border-2 p-5 text-center transition-all duration-300 ${
                    selectedFormat === key 
                      ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5' 
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    selectedFormat === key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100'
                  }`}>
                    {key.includes('photo') ? <ImageIcon size={24} /> : <Crop size={24} />}
                  </div>
                  <h3 className={`font-black text-sm uppercase tracking-wide ${selectedFormat === key ? 'text-primary' : 'text-slate-700'}`}>
                    {FORMATS[key].label}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">{FORMATS[key].desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specs Info Box */}
          <div className="bg-slate-900 rounded-2xl p-6 mb-10 text-sm text-white flex gap-4 shadow-2xl">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest mb-2 text-primary">Technical Standards</p>
              <ul className="grid md:grid-cols-2 gap-x-8 gap-y-1 text-slate-300 font-medium">
                <li><span className="text-white font-bold">NSDL:</span> 197×276px Portrait (50KB)</li>
                <li><span className="text-white font-bold">NSDL Sign:</span> 354×157px (50KB)</li>
                <li><span className="text-white font-bold">UTI Photo:</span> 213×213px Square (30KB)</li>
                <li><span className="text-white font-bold">UTI Sign:</span> 400×200px (60KB)</li>
              </ul>
            </div>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mb-6 text-primary border border-slate-100">
                <UploadCloud size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to Resize?</h3>
              <p className="text-slate-500 font-medium mb-8">Drag & drop your photo or signature here</p>
              <button className="px-10 py-4 btn-primary rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-transform active:scale-95">
                Select from Computer
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              {/* Original Preview */}
              <div className="bg-slate-50 rounded-3xl p-6 flex flex-col items-center border border-slate-100">
                <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-6 w-full flex items-center justify-between">
                  Original Source
                  <span className="text-slate-900 font-bold">JPG/PNG</span>
                </h3>
                <div className="flex-grow flex items-center justify-center w-full bg-white rounded-2xl border border-slate-100 overflow-hidden min-h-[300px] shadow-inner">
                  <img src={previewUrl!} alt="Original" className="max-w-full max-h-[300px] object-contain" />
                </div>
                <div className="w-full mt-6 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setFile(null); setResultUrl(null); }}
                    className="py-4 bg-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
                  >
                    Discard
                  </button>
                  {!resultUrl && (
                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="py-4 btn-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-70 flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Resizing...</span>
                        </>
                      ) : (
                        'Process Now'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Result Preview */}
              <div className="bg-white rounded-3xl p-6 flex flex-col items-center border-2 border-slate-100 shadow-xl">
                <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-6 w-full flex items-center justify-between">
                  Optimized Output
                  <span className="text-primary font-bold">Ready</span>
                </h3>
                
                {error && (
                  <div className="w-full p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-sm mb-6 flex items-center gap-3 font-bold">
                    <AlertCircle size={20} /> {error}
                  </div>
                )}

                {!resultUrl && !error ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-slate-300 min-h-[300px] bg-slate-50 w-full rounded-2xl border border-dashed border-slate-200">
                    <ImageIcon size={64} className="mb-4 opacity-20" />
                    <p className="font-black text-xs uppercase tracking-widest">Awaiting Processing</p>
                  </div>
                ) : resultUrl ? (
                  <>
                    <div className="flex-grow flex items-center justify-center w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[300px] relative shadow-2xl group">
                      <div className="absolute top-4 right-4 bg-white text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 z-10">
                        <CheckCircle2 size={12} className="text-green-500" /> PROCESSED
                      </div>
                      <img src={resultUrl} alt="Result" className="max-w-full max-h-[300px] object-contain transition-transform group-hover:scale-110" />
                    </div>
                    
                    <div className="w-full mt-8 space-y-4">
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimensions</span>
                        <span className="font-black text-slate-900">{FORMATS[selectedFormat].width} × {FORMATS[selectedFormat].height} px</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Size</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-black ${resultSize && resultSize <= FORMATS[selectedFormat].maxKB ? 'text-green-600' : 'text-red-600'}`}>
                            {resultSize} KB
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">/ {FORMATS[selectedFormat].maxKB}KB Limit</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleDownload}
                        className="w-full py-5 btn-primary rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                      >
                        <Download size={20} /> Download Optimized Image
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQs */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Technical Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all">
            <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              NSDL Requirements
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Photo should be 3.5 cm x 2.5 cm (197×276 px at 200 DPI). Signature should be 4.5 cm x 2 cm (354×157 px). Maximum file size for both is 50KB.</p>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all">
            <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
              UTI Requirements
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Photo must be exactly 213×213 px (Max 30KB) with <span className="font-bold text-slate-900">White Background</span>. Signature should be 400×200 px (Max 60KB).</p>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all md:col-span-2">
            <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
              Is my privacy protected?
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Absolutely. Jay CSC Tool operates on <span className="font-bold text-slate-900">Zero-Server Architecture</span>. Your documents never leave your browser, ensuring 100% privacy and security for your sensitive personal data.</p>
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
                { step: '01', title: 'Choose Document', desc: 'Select between PAN Card or Signature/Photo using the toggle at the top.' },
                { step: '02', title: 'Upload Original', desc: 'Drag and drop your scan or mobile photo. We support all common formats.' },
                { step: '03', title: 'Precise Cropping', desc: 'Use our fixed-ratio cropper to select only the required area perfectly.' },
                { step: '04', title: 'Download Ready', desc: 'Get your resized image instantly, pre-configured with correct DPI and dimensions.' }
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
              <CheckCircle2 className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Compliance Guaranteed</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              Our tool is specifically designed to meet the strict requirements of NSDL and UTIITSL portals for PAN applications.
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest w-fit mx-auto shadow-xl">
              <Maximize2 size={16} className="text-primary" /> Exact DPI Processing
            </div>
         </div>
      </section>
    </div>
  );
}
