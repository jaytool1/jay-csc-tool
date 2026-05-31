import React, { useState, useCallback } from 'react';
import { Page } from '../App';
import { 
  FileText, 
  Combine, 
  Scissors, 
  RotateCw, 
  Download, 
  Upload, 
  Trash2, 
  MoveUp, 
  MoveDown,
  FileCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  FileType
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, degrees } from 'pdf-lib';

interface PdfToolsProps {
  onNavigate: (page: Page) => void;
  initialTool?: 'merge' | 'split' | 'rotate';
}

export function PdfTools({ onNavigate, initialTool = 'merge' }: PdfToolsProps) {
  const [activeTool, setActiveTool] = useState<'merge' | 'split' | 'rotate'>(initialTool);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<{ id: string, file: File, name: string, pageCount: number }[]>([]);

  // Split/Rotate State
  const [pdfFile, setPdfFile] = useState<{ file: File, name: string, pageCount: number } | null>(null);
  const [rotateValues, setRotateValues] = useState<number[]>([]); // Array of rotation values per page

  // Dropzone for Merge
  const onMergeDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    for (const file of acceptedFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        setMergeFiles(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          pageCount
        }]);
      } catch (err) {
        setError(`Failed to load ${file.name}. It might be password protected or corrupted.`);
      }
    }
  }, []);

  const { getRootProps: getMergeRootProps, getInputProps: getMergeInputProps, isDragActive: isMergeDragActive } = useDropzone({
    onDrop: onMergeDrop,
    accept: { 'application/pdf': ['.pdf'] }
  } as any);

  // Dropzone for Single PDF (Split/Rotate)
  const onSingleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setError(null);
    const file = acceptedFiles[0];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      setPdfFile({ file, name: file.name, pageCount });
      setRotateValues(new Array(pageCount).fill(0));
    } catch (err) {
      setError(`Failed to load PDF. It might be password protected or corrupted.`);
    }
  }, []);

  const { getRootProps: getSingleRootProps, getInputProps: getSingleInputProps, isDragActive: isSingleDragActive } = useDropzone({
    onDrop: onSingleDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  } as any);

  const removeMergeFile = (id: string) => {
    setMergeFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex >= 0 && nextIndex < mergeFiles.length) {
      const newFiles = [...mergeFiles];
      [newFiles[index], newFiles[nextIndex]] = [newFiles[nextIndex], newFiles[index]];
      setMergeFiles(newFiles);
    }
  };

  // Logic Functions
  const handleMerge = async () => {
    if (mergeFiles.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const f of mergeFiles) {
        const pdfBytes = await f.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      downloadBlob(pdfBytes, 'merged_document.pdf');
    } catch (err) {
      setError('Error merging PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplit = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      // For simplicity, we split into individual pages in this tool
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const newPdfBytes = await newPdf.save();
        downloadBlob(newPdfBytes, `page_${i + 1}_of_${pdfFile.name}`);
      }
    } catch (err) {
      setError('Error splitting PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    try {
      const pdfBytes = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      pages.forEach((page, index) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotateValues[index]));
      });

      const savedBytes = await pdfDoc.save();
      downloadBlob(savedBytes, `rotated_${pdfFile.name}`);
    } catch (err) {
      setError('Error rotating PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBlob = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const setPageRotation = (pageIndex: number) => {
    const newRotations = [...rotateValues];
    newRotations[pageIndex] = (newRotations[pageIndex] + 90) % 360;
    setRotateValues(newRotations);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => { setActiveTool('merge'); setError(null); }}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'merge' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Combine size={14} /> Merge PDF
        </button>
        <button 
          onClick={() => { setActiveTool('split'); setError(null); }}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'split' ? 'bg-white text-secondary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scissors size={14} /> Split PDF
        </button>
        <button 
          onClick={() => { setActiveTool('rotate'); setError(null); }}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'rotate' ? 'bg-white text-[#ff7b61] shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <RotateCw size={14} /> Rotate PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 mb-6 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold shadow-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tool Content */}
      <div className="space-y-8">
        {activeTool === 'merge' ? (
          <>
            <div 
              {...getMergeRootProps()} 
              className={`glass-panel p-16 border-2 border-dashed transition-all cursor-pointer text-center bg-white ${
                isMergeDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 bg-slate-50/30'
              }`}
            >
              <input {...getMergeInputProps()} />
              <div className="w-20 h-20 bg-white shadow-lg border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Upload size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Combine Multiple PDFs</h2>
              <p className="text-slate-500 font-medium">Drag & drop files to merge them into a single presentation-ready document</p>
            </div>

            {mergeFiles.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <FileCheck className="text-green-500" /> Loaded Documents ({mergeFiles.length})
                  </h3>
                  <button 
                    onClick={handleMerge}
                    disabled={isProcessing || mergeFiles.length < 2}
                    className="px-10 py-3 btn-primary rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20 transition-all active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Merging...</span>
                      </>
                    ) : (
                      <><Combine size={18} /> Merge PDFs Now</>
                    )}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {mergeFiles.map((f, index) => (
                    <div key={f.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all hover:shadow-lg group">
                      <div className="flex items-center gap-5 overflow-hidden">
                        <div className="w-10 h-10 bg-white shadow-sm text-primary rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        <div className="truncate">
                          <p className="text-slate-900 font-black truncate text-sm uppercase tracking-tight">{f.name}</p>
                          <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-0.5">{f.pageCount} Pages • Single File</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                        <button onClick={() => moveMergeFile(index, 'up')} className="p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-20" disabled={index === 0}><MoveUp size={16} /></button>
                        <button onClick={() => moveMergeFile(index, 'down')} className="p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-20" disabled={index === mergeFiles.length - 1}><MoveDown size={16} /></button>
                        <div className="w-px h-4 bg-slate-100"></div>
                        <button onClick={() => removeMergeFile(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {!pdfFile ? (
              <div 
                {...getSingleRootProps()} 
                className={`glass-panel p-16 border-2 border-dashed transition-all cursor-pointer text-center bg-white ${
                  isSingleDragActive ? `border-${activeTool === 'split' ? 'secondary' : '[#ff7b61]'} bg-slate-50` : 'border-slate-200 hover:border-slate-400 bg-slate-50/30'
                }`}
              >
                <input {...getSingleInputProps()} />
                <div className={`w-20 h-20 bg-white shadow-lg border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 ${activeTool === 'split' ? 'text-secondary' : 'text-[#ff7b61]'}`}>
                  <FileText size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Upload PDF to {activeTool === 'split' ? 'Split' : 'Rotate'}</h2>
                <p className="text-slate-500 font-medium">Select a document to modify its pages</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-5 mb-8 border-b border-slate-100 pb-6">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <FileText size={28} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-slate-900 font-black truncate uppercase tracking-tight">{pdfFile.name}</p>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{pdfFile.pageCount} Pages Total</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => { setPdfFile(null); setError(null); }}
                      className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all mb-4 border border-slate-200"
                    >
                      Change Document
                    </button>

                    <button 
                      onClick={activeTool === 'split' ? handleSplit : handleRotate}
                      disabled={isProcessing}
                      className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 ${activeTool === 'split' ? 'bg-secondary' : 'bg-[#ff7b61]'} text-white shadow-xl shadow-opacity-20 disabled:opacity-50 transition-all active:scale-[0.98]`}
                    >
                      {activeTool === 'split' ? (
                        isProcessing ? 'Splitting...' : <><Scissors size={18} /> Split Individually</>
                      ) : (
                        isProcessing ? 'Rotating...' : <><Download size={18} /> Save Rotated PDF</>
                      )}
                    </button>
                    {activeTool === 'split' && (
                      <p className="text-[10px] text-slate-400 mt-4 text-center uppercase tracking-[0.2em] font-black">Creates one PDF per page</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 bg-slate-950 rounded-[2.5rem] p-10 overflow-auto max-h-[75vh] shadow-2xl">
                  <h3 className="font-black text-white mb-8 pb-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="uppercase tracking-widest text-xs">Dynamic Preview ({pdfFile.pageCount} pages)</span>
                    {activeTool === 'rotate' && (
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 animate-pulse">
                        Click items to rotate 90° clockwise
                      </span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: pdfFile.pageCount }).map((_, i) => (
                      <div 
                        key={i} 
                        onClick={() => activeTool === 'rotate' && setPageRotation(i)}
                        className={`group relative aspect-[1/1.4] bg-white/5 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center overflow-hidden shadow-sm ${
                          activeTool === 'rotate' ? 'cursor-pointer border-white/5 hover:border-[#ff7b61] hover:bg-white/10' : 'border-white/5'
                        }`}
                      >
                        <div 
                          className="flex flex-col items-center gap-4 transition-transform duration-500 ease-out"
                          style={activeTool === 'rotate' ? { transform: `rotate(${rotateValues[i]}deg)` } : {}}
                        >
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white/20 backdrop-blur-sm group-hover:text-white transition-colors">
                            <FileText size={40} />
                          </div>
                          <span className="text-white font-black text-lg tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">PDF</span>
                        </div>
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[10px] text-white font-black px-4 py-1.5 rounded-full border border-white/10 shadow-xl">
                          PG {i + 1}
                        </div>
                        {activeTool === 'rotate' && rotateValues[i] > 0 && (
                          <div className="absolute top-4 right-4 bg-[#ff7b61] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl animate-in zoom-in-50">
                            {rotateValues[i]}°
                          </div>
                        )}
                        {activeTool === 'rotate' && (
                          <div className="absolute inset-0 bg-[#ff7b61]/0 group-hover:bg-[#ff7b61]/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <div className="w-12 h-12 bg-[#ff7b61] text-white rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-300">
                                <RotateCw size={24} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Guide Section */}
      <section className="mt-24 grid md:grid-cols-2 gap-10">
         <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="text-primary" /> How to use?
            </h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Upload PDFs', desc: 'Securely select your PDF files. All processing happens locally in your browser.' },
                { step: '02', title: 'Arrange Pages', desc: 'Drag and drop to reorder pages or files. Use rotation controls for individual pages.' },
                { step: '03', title: 'Clean Up', desc: 'Remove unnecessary pages using the trash icon to keep your target file lean.' },
                { step: '04', title: 'Save Document', desc: 'Click the primary action button to merge, split, or rotate and download your file.' }
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
            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Privacy Secured</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              We never upload your PDFs. Your private data stays private throughout the entire editing process.
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest w-fit mx-auto shadow-xl">
              <FileType size={16} className="text-primary" /> Multi-File Support
            </div>
         </div>
      </section>
    </div>
  );
}
