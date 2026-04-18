import React, { useState, useCallback } from 'react';
import { Page } from '../App';
import { FileImage, FileType, Download, Upload, Trash2, MoveUp, MoveDown, Maximize, Minimize } from 'lucide-react';
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTool('pdf')}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTool === 'pdf' ? 'bg-[#7b61ff] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <FileType size={18} /> Image to PDF
          </button>
          <button 
            onClick={() => setActiveTool('resize')}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTool === 'resize' ? 'bg-[#00d2ff] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Maximize size={18} /> Image Resizer
          </button>
        </div>
        
        {activeTool === 'pdf' && pdfImages.length > 0 && (
          <button 
            onClick={generatePdf}
            disabled={isGeneratingPdf}
            className="px-8 py-2 btn-primary rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {isGeneratingPdf ? 'Converting...' : <><Download size={18} /> Download PDF</>}
          </button>
        )}
      </div>

      {activeTool === 'pdf' ? (
        <div className="space-y-8">
          <div 
            {...getPdfRootProps()} 
            className={`glass-panel p-12 border-2 border-dashed transition-all cursor-pointer text-center ${
              isPdfDragActive ? 'border-[#7b61ff] bg-[#7b61ff]/10' : 'border-white/15 hover:border-white/30'
            }`}
          >
            <input {...getPdfInputProps()} />
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7b61ff]">
              <Upload size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Upload Images to Convert</h2>
            <p className="text-white/60">Drag & drop images here, or click to select files</p>
            <p className="text-xs text-white/40 mt-2">Supports JPG, PNG, WEBP</p>
          </div>

          {pdfImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pdfImages.map((img, index) => (
                <div key={img.id} className="glass-panel p-2 relative group">
                  <img src={img.preview} alt="Preview" className="w-full aspect-[3/4] object-cover rounded" />
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => removePdfImage(img.id)} className="p-1 bg-red-500 text-white rounded shadow-lg"><Trash2 size={14} /></button>
                    <button onClick={() => movePdfImage(index, 'up')} className="p-1 bg-slate-800 text-white rounded shadow-lg"><MoveUp size={14} /></button>
                    <button onClick={() => movePdfImage(index, 'down')} className="p-1 bg-slate-800 text-white rounded shadow-lg"><MoveDown size={14} /></button>
                  </div>
                  <div className="mt-2 text-[10px] text-white/60 truncate px-1">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div 
              {...getResizeRootProps()} 
              className={`glass-panel p-12 border-2 border-dashed transition-all cursor-pointer text-center ${
                isResizeDragActive ? 'border-[#00d2ff] bg-[#00d2ff]/10' : 'border-white/15 hover:border-white/30'
              }`}
            >
              <input {...getResizeInputProps()} />
              {resizeImage ? (
                <div className="relative">
                  <img src={resizeImage.preview} alt="To resize" className="max-h-48 mx-auto rounded shadow-lg mb-4" />
                  <p className="text-sm text-white font-medium">{resizeImage.file.name}</p>
                  <p className="text-xs text-white/60">{(resizeImage.file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#00d2ff]">
                    <Maximize size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Upload Image to Resize</h2>
                  <p className="text-white/60">Drag & drop an image here</p>
                </>
              )}
            </div>

            <div className="glass-panel p-6">
              <h3 className="font-bold text-white mb-4">Resize Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Target File Size</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={targetSize} 
                      onChange={(e) => setTargetSize(Number(e.target.value))}
                      className="input-glass rounded p-2 flex-grow text-white"
                      placeholder="Enter size"
                    />
                    <select 
                      value={sizeUnit} 
                      onChange={(e) => setSizeUnit(e.target.value as 'KB' | 'MB')}
                      className="input-glass rounded p-2 bg-slate-800 text-white border-white/15"
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={handleResize}
                  disabled={!resizeImage || isResizing}
                  className="w-full py-3 bg-[#00d2ff] text-white rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResizing ? 'Processing...' : <><Minimize size={18} /> Resize Image Now</>}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 flex flex-col items-center justify-center bg-black/20 min-h-[400px]">
            {resizedResult ? (
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <img src={resizedResult.url} alt="Resized" className="max-h-[400px] rounded shadow-2xl border border-white/10" />
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                    SUCCESS
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold">Resized Successfully!</p>
                  <p className="text-white/60 text-sm">New Size: {(resizedResult.size / 1024).toFixed(1)} KB</p>
                </div>
                <a 
                  href={resizedResult.url} 
                  download={`resized_${resizeImage?.file.name}`}
                  className="inline-flex items-center gap-2 px-8 py-3 btn-primary rounded-lg font-bold"
                >
                  <Download size={18} /> Download Resized Image
                </a>
              </div>
            ) : (
              <div className="text-center text-white/40">
                <FileImage size={48} className="mx-auto mb-4 opacity-20" />
                <p>Resized preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
