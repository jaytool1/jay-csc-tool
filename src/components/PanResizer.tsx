import React, { useState, useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Page } from '../App';
import { compressImageToKB, downloadDataUrl } from '../lib/imageUtils';
import { UploadCloud, Download, Image as ImageIcon, Settings, CheckCircle2, AlertCircle, Crop } from 'lucide-react';

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
        <h1 className="text-3xl font-bold text-white mb-4">PAN Card Photo & Signature Resizer</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Instantly resize photos and signatures for <span className="font-semibold text-[#00d2ff]">NSDL</span> and <span className="font-semibold text-[#7b61ff]">UTI</span> PAN card applications. 100% Free & Private.
        </p>
      </div>

      <div className="glass-panel overflow-hidden">
        {/* Top Banner */}
        <div className="bg-black/20 border-b border-white/15 p-6 text-white text-center">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            <Settings className="w-5 h-5 text-[#00d2ff]" /> NSDL & UTI PAN Card Resizer
          </h2>
          <p className="text-white/60 text-sm mt-1">Photo & Signature Resizer with Perfect Crop & Size</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Format Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-white/80 mb-3">Select PAN Card Format</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.keys(FORMATS) as FormatType[]).map((key) => (
                <div 
                  key={key}
                  onClick={() => {
                    setSelectedFormat(key);
                    setResultUrl(null); // Reset result on format change
                  }}
                  className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                    selectedFormat === key 
                      ? 'border-[#7b61ff] bg-[#7b61ff]/10 shadow-sm' 
                      : 'border-white/15 bg-black/10 hover:bg-white/5'
                  }`}
                >
                  <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    selectedFormat === key ? 'bg-[#7b61ff]/20 text-[#7b61ff]' : 'bg-white/10 text-white/60'
                  }`}>
                    {key.includes('photo') ? <ImageIcon size={20} /> : <Crop size={20} />}
                  </div>
                  <h3 className={`font-bold text-sm ${selectedFormat === key ? 'text-white' : 'text-white/80'}`}>
                    {FORMATS[key].label}
                  </h3>
                  <p className="text-xs text-white/50 mt-1">{FORMATS[key].desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specs Info Box */}
          <div className="bg-[#7b61ff]/10 border border-[#7b61ff]/30 rounded-xl p-4 mb-8 text-sm text-white/80 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#00d2ff] shrink-0" />
            <div>
              <p className="font-semibold text-white mb-1">Official Specifications:</p>
              <ul className="list-disc pl-4 space-y-1 text-white/70">
                <li><strong className="text-white">NSDL Photo:</strong> 197×276px, max 50KB. <strong className="text-white">Sign:</strong> 354×157px, max 50KB.</li>
                <li><strong className="text-white">UTI Photo:</strong> 213×213px, max 30KB. <strong className="text-white">Sign:</strong> 400×200px, max 60KB.</li>
              </ul>
            </div>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-[#7b61ff] bg-[#7b61ff]/10' : 'border-white/15 bg-black/10 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto w-16 h-16 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload Photo or Signature</h3>
              <p className="text-white/50 text-sm mb-4">Click to browse or drag & drop here</p>
              <button className="px-6 py-2 btn-primary rounded-lg font-medium transition-colors">
                Select Image
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Preview */}
              <div className="glass-panel bg-black/10 p-4 flex flex-col items-center">
                <h3 className="font-semibold text-white/80 mb-4 w-full border-b border-white/15 pb-2">Original Image</h3>
                <div className="flex-grow flex items-center justify-center w-full bg-black/20 rounded-lg overflow-hidden min-h-[200px]">
                  <img src={previewUrl!} alt="Original" className="max-w-full max-h-[300px] object-contain" />
                </div>
                <div className="w-full mt-4 flex gap-2">
                  <button 
                    onClick={() => { setFile(null); setResultUrl(null); }}
                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                  >
                    Change Image
                  </button>
                  {!resultUrl && (
                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 btn-primary rounded-lg font-medium disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? 'Processing...' : 'Resize Now'}
                    </button>
                  )}
                </div>
              </div>

              {/* Result Preview */}
              <div className="glass-panel bg-black/10 p-4 flex flex-col items-center">
                <h3 className="font-semibold text-white/80 mb-4 w-full border-b border-white/15 pb-2">Result</h3>
                
                {error && (
                  <div className="w-full p-4 bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                {!resultUrl && !error ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-white/40 min-h-[200px]">
                    <ImageIcon size={48} className="mb-2 opacity-20" />
                    <p>Click "Resize Now" to process</p>
                  </div>
                ) : resultUrl ? (
                  <>
                    <div className="flex-grow flex items-center justify-center w-full bg-white/5 border border-white/15 rounded-lg overflow-hidden min-h-[200px] relative">
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ready
                      </div>
                      <img src={resultUrl} alt="Result" className="max-w-full max-h-[300px] object-contain" />
                    </div>
                    
                    <div className="w-full mt-4 space-y-3">
                      <div className="flex justify-between text-sm px-2">
                        <span className="text-white/60">Dimensions:</span>
                        <span className="font-semibold text-white">{FORMATS[selectedFormat].width} × {FORMATS[selectedFormat].height} px</span>
                      </div>
                      <div className="flex justify-between text-sm px-2">
                        <span className="text-white/60">File Size:</span>
                        <span className={`font-semibold ${resultSize && resultSize <= FORMATS[selectedFormat].maxKB ? 'text-emerald-400' : 'text-red-400'}`}>
                          ~{resultSize} KB <span className="text-white/40 text-xs">(Max {FORMATS[selectedFormat].maxKB}KB)</span>
                        </span>
                      </div>
                      <button 
                        onClick={handleDownload}
                        className="w-full px-4 py-3 btn-primary rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Download size={20} /> Download Image
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
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="glass-panel p-6">
            <h3 className="font-bold text-white mb-2">What is the NSDL PAN card photo size?</h3>
            <p className="text-white/60 text-sm">NSDL PAN card photo size should be 3.5 cm x 2.5 cm. At 200 DPI, this converts to 197×276 pixels portrait orientation with maximum file size of 50KB. The background should be white or light colored.</p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="font-bold text-white mb-2">What is the UTI PAN card photo size?</h3>
            <p className="text-white/60 text-sm">UTI PAN card photo size is 213×213 pixels square format with maximum file size of 30KB at 300 DPI. Must have white background only.</p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="font-bold text-white mb-2">Is this tool really free and safe?</h3>
            <p className="text-white/60 text-sm">Yes! It's completely free and 100% safe. All image processing happens locally in your browser. We never upload your photos to any server.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
