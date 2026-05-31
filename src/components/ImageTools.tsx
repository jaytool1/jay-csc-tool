import React, { useState, useCallback } from 'react';
import { Page } from '../App';
import { FileImage, FileType, Download, Upload, Trash2, MoveUp, MoveDown, Maximize, Minimize, Loader2, Check, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { jsPDF } from 'jspdf';

interface ImageToolsProps {
  onNavigate: (page: Page) => void;
  initialTool?: 'pdf' | 'resize';
}

export function ImageTools({ onNavigate, initialTool = 'pdf' }: ImageToolsProps) {
  const [activeTool, setActiveTool] = useState<'pdf' | 'resize'>(initialTool);
  
  // PDF Converter State
  const [pdfImages, setPdfImages] = useState<{ id: string, file: File, preview: string }[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Resizer State
  const [resizeImage, setResizeImage] = useState<{ file: File, preview: string } | null>(null);
  const [targetSize, setTargetSize] = useState<number>(500); // in KB
  const [sizeUnit, setSizeUnit] = useState<'KB' | 'MB'>('KB');
  const [isResizing, setIsResizing] = useState(false);
  const [resizedResult, setResizedResult] = useState<{ url: string, size: number } | null>(null);

  // PDF Dropzone
  const onPdfDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));
    setPdfImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: onPdfDrop,
    accept: { 'image/*': [] }
  } as any);

  // Resizer Dropzone
  const onResizeDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setResizeImage({
        file,
        preview: URL.createObjectURL(file)
      });
      setResizedResult(null);
    }
  }, []);

  const { getRootProps: getResizeRootProps, getInputProps: getResizeInputProps, isDragActive: isResizeDragActive } = useDropzone({
    onDrop: onResizeDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const removePdfImage = (id: string) => {
    setPdfImages(prev => prev.filter(img => img.id !== id));
  };

  const movePdfImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...pdfImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setPdfImages(newImages);
    }
  };

  const generatePdf = async () => {
    if (pdfImages.length === 0) return;
    setIsGeneratingPdf(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pdfImages.length; i++) {
        if (i > 0) pdf.addPage();
        
        const img = await loadImage(pdfImages[i].preview);
        const ratio = img.width / img.height;
        
        let imgWidth = pageWidth - 20; // 10mm margin
        let imgHeight = imgWidth / ratio;
        
        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = imgHeight * ratio;
        }
        
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        pdf.addImage(pdfImages[i].preview, 'JPEG', x, y, imgWidth, imgHeight);
      }
      
      pdf.save('converted_images.pdf');
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleResize = async () => {
    if (!resizeImage) return;
    setIsResizing(true);
    
    try {
      const targetSizeBytes = sizeUnit === 'KB' ? targetSize * 1024 : targetSize * 1024 * 1024;
      const img = await loadImage(resizeImage.preview);
      
      let bestBlob: Blob | null = null;
      let currentScale = 1.0;
      
      // Try different scales if quality reduction isn't enough
      while (currentScale > 0.1) {
        let minQuality = 0.01;
        let maxQuality = 0.98;
        let lastGoodBlob: Blob | null = null;

        // Binary search for quality at current scale
        for (let i = 0; i < 10; i++) {
          const quality = (minQuality + maxQuality) / 2;
          const canvas = document.createElement('canvas');
          canvas.width = img.width * currentScale;
          canvas.height = img.height * currentScale;
          const ctx = canvas.getContext('2d');
          if (!ctx) break;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const response = await fetch(dataUrl);
          const blob = await response.blob();

          if (blob.size <= targetSizeBytes) {
            lastGoodBlob = blob;
            minQuality = quality; // Try higher quality
          } else {
            maxQuality = quality; // Need lower quality
          }
        }

        if (lastGoodBlob) {
          bestBlob = lastGoodBlob;
          break; // Found a good one!
        }

        // If even lowest quality is too big, reduce scale
        currentScale -= 0.15;
      }

      if (bestBlob) {
        setResizedResult({
          url: URL.createObjectURL(bestBlob),
          size: bestBlob.size
        });
      } else {
        alert('Could not reach target size even at lowest quality/scale. Try a larger target size.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to resize image');
    } finally {
      setIsResizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTool('pdf')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTool === 'pdf' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileType size={16} /> Images to PDF
          </button>
          <button 
            onClick={() => setActiveTool('resize')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTool === 'resize' ? 'bg-white text-secondary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Maximize size={16} /> Ultra Resizer
          </button>
        </div>
        
        {activeTool === 'pdf' && pdfImages.length > 0 && (
          <button 
            onClick={generatePdf}
            disabled={isGeneratingPdf}
            className="px-10 py-3 btn-primary rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <><Download size={18} /> Export PDF</>
            )}
          </button>
        )}
      </div>

      {activeTool === 'pdf' ? (
        <div className="space-y-8">
          <div 
            {...getPdfRootProps()} 
            className={`glass-panel p-16 border-2 border-dashed transition-all cursor-pointer text-center bg-white ${
              isPdfDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 bg-slate-50/30'
            }`}
          >
            <input {...getPdfInputProps()} />
            <div className="w-20 h-20 bg-white shadow-lg border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
              <Upload size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Convert Images to PDF</h2>
            <p className="text-slate-500 font-medium">Select multiple images to combine into a single professional PDF</p>
            <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em]">Supports JPG • PNG • WEBP</p>
          </div>

          {pdfImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {pdfImages.map((img, index) => (
                <div key={img.id} className="bg-white border border-slate-200 p-2 rounded-2xl shadow-sm relative group hover:shadow-xl transition-all duration-300">
                  <img src={img.preview} alt="Preview" className="w-full aspect-[3/4] object-cover rounded-xl" />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                    <button onClick={() => removePdfImage(img.id)} className="p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
                    <button onClick={() => movePdfImage(index, 'up')} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors"><MoveUp size={16} /></button>
                    <button onClick={() => movePdfImage(index, 'down')} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors"><MoveDown size={16} /></button>
                  </div>
                  <div className="mt-3 px-2 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div 
              {...getResizeRootProps()} 
              className={`glass-panel p-12 border-2 border-dashed transition-all cursor-pointer text-center bg-white ${
                isResizeDragActive ? 'border-secondary bg-secondary/5' : 'border-slate-200 hover:border-secondary/50 bg-slate-50/30'
              }`}
            >
              <input {...getResizeInputProps()} />
              {resizeImage ? (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl inline-block border border-slate-100">
                    <img src={resizeImage.preview} alt="To resize" className="max-h-60 object-contain" />
                    <div className="absolute inset-0 bg-secondary/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-xs mx-auto">{resizeImage.file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Current Size: {(resizeImage.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-white shadow-lg border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-secondary">
                    <Maximize size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Upload to Resize</h2>
                  <p className="text-slate-500 font-medium">Compress images to exact file size limits</p>
                </>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm">
              <h3 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-xs border-b border-slate-100 pb-4">Compression Settings</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Target Output Size</label>
                  <div className="flex gap-4">
                    <input 
                      type="number" 
                      value={targetSize} 
                      onChange={(e) => setTargetSize(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 flex-grow text-slate-900 font-bold focus:ring-4 focus:ring-secondary/10 focus:outline-none transition-all"
                      placeholder="e.g. 50"
                    />
                    <select 
                      value={sizeUnit} 
                      onChange={(e) => setSizeUnit(e.target.value as 'KB' | 'MB')}
                      className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black text-xs uppercase tracking-widest cursor-pointer border-none"
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={handleResize}
                  disabled={!resizeImage || isResizing}
                  className="w-full py-5 bg-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-secondary/20 relative overflow-hidden active:scale-[0.98]"
                >
                  {isResizing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <><Minimize size={20} /> Resize Image Now</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/40 via-transparent to-transparent"></div>
            </div>

            {resizedResult ? (
              <div className="text-center space-y-10 relative z-10 w-full">
                <div className="relative inline-block group">
                  <div className="absolute -inset-4 bg-secondary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                  <img src={resizedResult.url} alt="Resized" className="max-h-[400px] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative z-10 mx-auto" />
                  <div className="absolute -top-4 -right-4 bg-white text-slate-900 text-[10px] font-black px-4 py-2 rounded-full shadow-2xl z-20 flex items-center gap-2">
                    <Check size={14} className="text-secondary" /> OPTIMIZED
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black text-2xl uppercase tracking-tight">Processing Complete</p>
                  <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Final Size: {(resizedResult.size / 1024).toFixed(1)} KB</p>
                </div>
                <a 
                  href={resizedResult.url} 
                  download={`resized_${resizeImage?.file.name}`}
                  className="inline-flex items-center gap-3 px-12 py-5 btn-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <Download size={20} /> Download Result
                </a>
              </div>
            ) : (
              <div className="text-center text-slate-700 relative z-10">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <FileImage size={48} className="opacity-20" />
                </div>
                <p className="font-black text-xs uppercase tracking-[0.3em] opacity-40">Output Preview Area</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guide Section */}
      <section className="mt-24 grid md:grid-cols-2 gap-10">
         <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="text-secondary" /> How to use?
            </h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Upload Image', desc: 'Drag and drop your JPG, PNG, or GIF files into the workspace area.' },
                { step: '02', title: 'Set Dimensions', desc: 'Enter your desired width and height, or use the maintain aspect ratio toggle.' },
                { step: '03', title: 'Optimize Quality', desc: 'Adjust the quality slider to find the perfect balance between file size and clarity.' },
                { step: '04', title: 'Export File', desc: 'Preview your changes in real-time and click download to save the processed file.' }
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <span className="text-secondary font-black text-lg">{item.step}</span>
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
         </div>

         <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col justify-center text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Maximize className="text-secondary" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">HD Image Engine</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              Our advanced resizing algorithm preserves details while minimizing storage footprint.
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest w-fit mx-auto shadow-xl">
              <Download size={16} className="text-secondary" /> Lossless Processing
            </div>
         </div>
      </section>
    </div>
  );
}
