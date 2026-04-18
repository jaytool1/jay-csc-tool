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
  AlertCircle
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
      <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-2">
        <button 
          onClick={() => { setActiveTool('merge'); setError(null); }}
          className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'merge' ? 'bg-[#7b61ff] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Combine size={18} /> Merge PDF
        </button>
        <button 
          onClick={() => { setActiveTool('split'); setError(null); }}
          className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'split' ? 'bg-[#00d2ff] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Scissors size={18} /> Split PDF
        </button>
        <button 
          onClick={() => { setActiveTool('rotate'); setError(null); }}
          className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTool === 'rotate' ? 'bg-[#ff7b61] text-white shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <RotateCw size={18} /> Rotate PDF
        </button>
      </div>

      {error && (
        <div className="glass-panel p-4 mb-6 border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-200 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tool Content */}
      <div className="space-y-8">
        {activeTool === 'merge' ? (
          <>
            <div 
              {...getMergeRootProps()} 
              className={`glass-panel p-12 border-2 border-dashed transition-all cursor-pointer text-center ${
                isMergeDragActive ? 'border-[#7b61ff] bg-[#7b61ff]/10' : 'border-white/15 hover:border-white/30'
              }`}
            >
              <input {...getMergeInputProps()} />
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7b61ff]">
                <Upload size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Upload PDFs to Merge</h2>
              <p className="text-white/60">Drag & drop multiple PDF files here, or click to select</p>
            </div>

            {mergeFiles.length > 0 && (
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <FileCheck className="text-green-400" /> Files to Merge ({mergeFiles.length})
                  </h3>
                  <button 
                    onClick={handleMerge}
                    disabled={isProcessing || mergeFiles.length < 2}
                    className="px-8 py-2 btn-primary rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? 'Merging...' : <><Combine size={18} /> Merge PDFs Now</>}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {mergeFiles.map((f, index) => (
                    <div key={f.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-8 h-8 bg-[#7b61ff]/20 text-[#7b61ff] rounded flex items-center justify-center font-bold text-xs shrink-0">
                          {index + 1}
                        </div>
                        <div className="truncate">
                          <p className="text-white font-medium truncate">{f.name}</p>
                          <p className="text-white/40 text-[10px] uppercase font-bold">{f.pageCount} Pages • Document</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => moveMergeFile(index, 'up')} className="p-2 text-white/40 hover:text-white transition-colors" disabled={index === 0}><MoveUp size={16} /></button>
                        <button onClick={() => moveMergeFile(index, 'down')} className="p-2 text-white/40 hover:text-white transition-colors" disabled={index === mergeFiles.length - 1}><MoveDown size={16} /></button>
                        <button onClick={() => removeMergeFile(f.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors ml-2"><Trash2 size={16} /></button>
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
                className={`glass-panel p-12 border-2 border-dashed transition-all cursor-pointer text-center ${
                  isSingleDragActive ? `border-[${activeTool === 'split' ? '#00d2ff' : '#ff7b61'}] bg-white/5` : 'border-white/15 hover:border-white/30'
                }`}
              >
                <input {...getSingleInputProps()} />
                <div className={`w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 ${activeTool === 'split' ? 'text-[#00d2ff]' : 'text-[#ff7b61]'}`}>
                  <FileText size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Upload PDF to {activeTool === 'split' ? 'Split' : 'Rotate'}</h2>
                <p className="text-white/60">Drag & drop a single PDF file here</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className="glass-panel p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                        <FileText size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white font-bold truncate">{pdfFile.name}</p>
                        <p className="text-white/40 text-xs">{pdfFile.pageCount} Pages</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => { setPdfFile(null); setError(null); }}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors mb-4"
                    >
                      Choose Different Library
                    </button>

                    <button 
                      onClick={activeTool === 'split' ? handleSplit : handleRotate}
                      disabled={isProcessing}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${activeTool === 'split' ? 'bg-[#00d2ff]' : 'bg-[#ff7b61]'} text-white shadow-lg disabled:opacity-50`}
                    >
                      {activeTool === 'split' ? (
                        isProcessing ? 'Splitting...' : <><Scissors size={18} /> Split Pages (Individual PDFs)</>
                      ) : (
                        isProcessing ? 'Rotating...' : <><Download size={18} /> Download Rotated PDF</>
                      )}
                    </button>
                    {activeTool === 'split' && (
                      <p className="text-[10px] text-white/40 mt-3 text-center uppercase tracking-widest font-black">Creates 1 PDF per page</p>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 glass-panel p-6 bg-black/20 overflow-auto max-h-[70vh]">
                  <h3 className="font-bold text-white mb-6 flex items-center justify-between">
                    <span>Page Preview ({pdfFile.pageCount} total)</span>
                    {activeTool === 'rotate' && (
                      <span className="text-xs font-normal text-white/40">Click pages to rotate 90° clockwise</span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Array.from({ length: pdfFile.pageCount }).map((_, i) => (
                      <div 
                        key={i} 
                        onClick={() => activeTool === 'rotate' && setPageRotation(i)}
                        className={`group relative aspect-[1/1.4] bg-white/5 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                          activeTool === 'rotate' ? 'cursor-pointer border-white/10 hover:border-[#ff7b61]' : 'border-white/5'
                        }`}
                      >
                        <div 
                          className="flex flex-col items-center gap-2 transition-transform duration-300"
                          style={activeTool === 'rotate' ? { transform: `rotate(${rotateValues[i]}deg)` } : {}}
                        >
                          <FileText size={48} className="text-white/20" />
                          <span className="text-white font-black text-xl">PDF</span>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/50 text-[10px] text-white/80 px-2 py-1 rounded font-bold">
                          Page {i + 1}
                        </div>
                        {activeTool === 'rotate' && rotateValues[i] > 0 && (
                          <div className="absolute top-2 right-2 bg-[#ff7b61] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                            {rotateValues[i]}°
                          </div>
                        )}
                        {activeTool === 'rotate' && (
                          <div className="absolute inset-0 bg-[#ff7b61]/0 group-hover:bg-[#ff7b61]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <RotateCw size={24} className="text-[#ff7b61]" />
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
    </div>
  );
}
