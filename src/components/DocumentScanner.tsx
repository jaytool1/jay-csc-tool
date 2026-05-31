import React, { useState, useRef, useCallback } from 'react';
import { Page } from '../App';
import { UploadCloud, Printer, Download, Image as ImageIcon, CheckCircle2, RotateCw, Settings2, Crop as CropIcon, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { detectCardInImage } from '../services/geminiService';

interface DocumentScannerProps {
  onNavigate: (page: Page) => void;
}

type Step = 1 | 2 | 3;
type Side = 'front' | 'back';

interface ImageState {
  originalUrl: string | null;
  croppedUrl: string | null;
  brightness: number;
  contrast: number;
  sharpness: number;
  rotation: number;
  resultRotation: number;
  showBorder: boolean;
  autoCrop?: Crop;
}

const defaultImageState: ImageState = {
  originalUrl: null,
  croppedUrl: null,
  brightness: 100,
  contrast: 100,
  sharpness: 0,
  rotation: 0,
  resultRotation: 0,
  showBorder: true,
};

export function DocumentScanner({ onNavigate }: DocumentScannerProps) {
  const [step, setStep] = useState<Step>(1);
  const [frontImage, setFrontImage] = useState<ImageState>({ ...defaultImageState });
  const [backImage, setBackImage] = useState<ImageState>({ ...defaultImageState });
  const [currentEditSide, setCurrentEditSide] = useState<Side>('front');
  const [isDetectingFront, setIsDetectingFront] = useState(false);
  const [isDetectingBack, setIsDetectingBack] = useState(false);
  
  // Crop state
  const [crop, setCrop] = useState<Crop>();

  // Sync autoCrop to current crop state if it arrives late
  React.useEffect(() => {
    const currentState = currentEditSide === 'front' ? frontImage : backImage;
    if (currentState.autoCrop && step === 2) {
      setCrop(currentState.autoCrop);
    }
  }, [frontImage.autoCrop, backImage.autoCrop, step, currentEditSide]);
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [lockAspect, setLockAspect] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Aspect ratio for standard ID card (85.6mm / 54mm)
  const ID_CARD_ASPECT = 85.6 / 54;

  // Print settings
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [cardSize, setCardSize] = useState<'standard' | 'large' | 'xlarge'>('large');
  const [showBorders, setShowBorders] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const onDropFront = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setFrontImage(prev => ({ ...prev, originalUrl: url }));
      
      // Auto Detection
      setIsDetectingFront(true);
      const reader = new FileReader();
      reader.onerror = () => setIsDetectingFront(false);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const result = await detectCardInImage(base64, file.type);
          if (result) {
            setFrontImage(prev => ({ ...prev, autoCrop: { ...result, unit: '%' } }));
          }
        } catch (error) {
          console.error("Front detect error:", error);
        } finally {
          setIsDetectingFront(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const onDropBack = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setBackImage(prev => ({ ...prev, originalUrl: url }));

      // Auto Detection
      setIsDetectingBack(true);
      const reader = new FileReader();
      reader.onerror = () => setIsDetectingBack(false);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const result = await detectCardInImage(base64, file.type);
          if (result) {
            setBackImage(prev => ({ ...prev, autoCrop: { ...result, unit: '%' } }));
          }
        } catch (error) {
          console.error("Back detect error:", error);
        } finally {
          setIsDetectingBack(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps: getFrontProps, getInputProps: getFrontInputProps } = useDropzone({
    onDrop: onDropFront,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 1
  } as any);

  const { getRootProps: getBackProps, getInputProps: getBackInputProps } = useDropzone({
    onDrop: onDropBack,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 1
  } as any);

  const handleStartScanning = () => {
    if (frontImage.originalUrl) {
      setStep(2);
      setCurrentEditSide('front');
      // Reset crop
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const currentImgState = currentEditSide === 'front' ? frontImage : backImage;

    // Use auto-crop if available
    if (currentImgState.autoCrop) {
      setCrop(currentImgState.autoCrop);
      return;
    }
    
    // Initialize crop with aspect ratio if locked
    if (lockAspect) {
      let newWidth = width;
      let newHeight = width / ID_CARD_ASPECT;
      
      if (newHeight > height) {
        newHeight = height;
        newWidth = height * ID_CARD_ASPECT;
      }
      
      const x = (width - newWidth) / 2;
      const y = (height - newHeight) / 2;
      
      setCrop({
        unit: 'px',
        x,
        y,
        width: newWidth,
        height: newHeight
      });
    } else {
      setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
    }
  };

  const getEffectiveAspect = () => {
    if (!lockAspect) return undefined;
    const rotation = (currentImgState.rotation % 360 + 360) % 360;
    const isPortrait = (rotation >= 45 && rotation < 135) || (rotation >= 225 && rotation < 315);
    return isPortrait ? (1 / ID_CARD_ASPECT) : ID_CARD_ASPECT;
  };

  const snapToEdges = () => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    
    if (lockAspect) {
      const currentAspect = getEffectiveAspect() || ID_CARD_ASPECT;
      let targetWidth = width;
      let targetHeight = width / currentAspect;
      
      if (targetHeight > height) {
        targetHeight = height;
        targetWidth = height * currentAspect;
      }
      
      const x = (width - targetWidth) / 2;
      const y = (height - targetHeight) / 2;
      
      setCrop({
        unit: 'px',
        x,
        y,
        width: targetWidth,
        height: targetHeight
      });
    } else {
      setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
    }
  };

  const handleCropChange = (c: Crop) => {
    // Threshold for snapping to edges (in percent)
    const threshold = 2;
    let newCrop = { ...c };

    if (newCrop.unit === '%') {
      if (newCrop.x < threshold) newCrop.x = 0;
      if (newCrop.y < threshold) newCrop.y = 0;
      if (100 - (newCrop.x + newCrop.width) < threshold) newCrop.width = 100 - newCrop.x;
      if (100 - (newCrop.y + newCrop.height) < threshold) newCrop.height = 100 - newCrop.y;
    }

    setCrop(newCrop);
  };

  const handleConfirmEdit = async () => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = imgRef.current;
    
    if (!ctx) return;

    const currentImgState = currentEditSide === 'front' ? frontImage : backImage;

    // Use high quality settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const sharpenValue = currentImgState.sharpness / 100;
    // Improved filter string with white background context
    const filterString = `brightness(${currentImgState.brightness}%) contrast(${currentImgState.contrast + (currentImgState.sharpness / 2)}%) saturate(${100 + (currentImgState.sharpness / 4)}%)`;

    if (completedCrop?.width && completedCrop?.height) {
      // Draw cropped version
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      
      // Ensure white background for JPEG exports to prevent black areas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.filter = filterString;
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentImgState.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
      ctx.restore();
    } else {
      // Draw full image if no crop
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Ensure white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.filter = filterString;
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentImgState.rotation * Math.PI) / 180);
      ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
      ctx.restore();
    }

    const finalUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    if (currentEditSide === 'front') {
      setFrontImage(prev => ({ ...prev, croppedUrl: finalUrl, showBorder: currentImgState.showBorder }));
      // Also update global showBorders for consistency if needed, 
      // but the user wants it per-card or globally? 
      // Usually users want consistency so we'll sync with global state too.
      setShowBorders(currentImgState.showBorder);
      
      if (backImage.originalUrl) {
        setCurrentEditSide('back');
        setCrop(undefined);
        setCompletedCrop(undefined);
      } else {
        setStep(3);
      }
    } else {
      setBackImage(prev => ({ ...prev, croppedUrl: finalUrl, showBorder: currentImgState.showBorder }));
      setShowBorders(currentImgState.showBorder);
      setStep(3);
    }
  };

  // Canvas drawing for crop preview
  React.useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio;

      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      // Fill white background for preview canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      const currentImgState = currentEditSide === 'front' ? frontImage : backImage;
      const filterString = `brightness(${currentImgState.brightness}%) contrast(${currentImgState.contrast + (currentImgState.sharpness / 2)}%) saturate(${100 + (currentImgState.sharpness / 4)}%)`;
      ctx.filter = filterString;

      ctx.translate(canvas.width / 2 / pixelRatio, canvas.height / 2 / pixelRatio);
      ctx.rotate((currentImgState.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2 / pixelRatio, -canvas.height / 2 / pixelRatio);

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );
    }
  }, [completedCrop, currentEditSide, frontImage, backImage]);

  const updateCurrentEdit = (updates: Partial<ImageState>) => {
    if (currentEditSide === 'front') {
      setFrontImage(prev => ({ ...prev, ...updates }));
    } else {
      setBackImage(prev => ({ ...prev, ...updates }));
    }
  };

  const generatePrintCanvas = async () => {
    // 300 DPI for high quality A4
    const dpi = 300;
    const mmToInch = 1 / 25.4;
    const widthPx = Math.round(210 * mmToInch * dpi);
    const heightPx = Math.round(297 * mmToInch * dpi);

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    const getMMtoPX = (mm: number) => Math.round(mm * mmToInch * dpi);
    
    let cardW, cardH;
    switch(cardSize) {
      case 'standard': cardW = 85; cardH = 54; break;
      case 'xlarge': cardW = 125; cardH = 79; break;
      case 'large': 
      default: cardW = 105; cardH = 66; break;
    }
    const cardWPx = getMMtoPX(cardW);
    const cardHPx = getMMtoPX(cardH);

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    };

    try {
      const frontImg = frontImage.croppedUrl ? await loadImage(frontImage.croppedUrl) : null;
      const backImg = backImage.croppedUrl ? await loadImage(backImage.croppedUrl) : null;

      const gapPx = getMMtoPX(10); // 10mm gap
      const topMarginPx = getMMtoPX(25);

      const drawCard = (img: HTMLImageElement, x: number, y: number, resultRotation: number = 0) => {
        ctx.save();
        
        const rotation = (resultRotation % 360 + 360) % 360;
        const isPortrait = rotation === 90 || rotation === 270;
        
        // Final card dimensions on paper
        const finalW = isPortrait ? cardHPx : cardWPx;
        const finalH = isPortrait ? cardWPx : cardHPx;

        if (showBorders) {
          ctx.strokeStyle = '#cccccc';
          ctx.lineWidth = getMMtoPX(0.2);
          ctx.strokeRect(x - 1, y - 1, finalW + 2, finalH + 2);
        }

        ctx.translate(x + finalW / 2, y + finalH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Draw the image. Since we rotated the canvas, width/height for drawImage 
        // are always the card's logical W/H (before rotation swap)
        ctx.drawImage(img, -cardWPx / 2, -cardHPx / 2, cardWPx, cardHPx);
        
        ctx.restore();
      };

      if (layout === 'vertical') {
        const xFront = (widthPx - ( ( (frontImage.resultRotation % 180) === 90) ? cardHPx : cardWPx )) / 2;
        if (frontImg) drawCard(frontImg, xFront, topMarginPx, frontImage.resultRotation);
        
        const frontH = ( (frontImage.resultRotation % 180) === 90) ? cardWPx : cardHPx;
        const xBack = (widthPx - ( ( (backImage.resultRotation % 180) === 90) ? cardHPx : cardWPx )) / 2;
        if (backImg) drawCard(backImg, xBack, topMarginPx + frontH + gapPx, backImage.resultRotation);
      } else {
        const frontW = ( (frontImage.resultRotation % 180) === 90) ? cardHPx : cardWPx;
        const backW = ( (backImage.resultRotation % 180) === 90) ? cardHPx : cardWPx;
        const totalW = frontW + (backImg ? backW + gapPx : 0);
        const startX = (widthPx - totalW) / 2;
        
        if (frontImg) drawCard(frontImg, startX, topMarginPx, frontImage.resultRotation);
        if (backImg) drawCard(backImg, startX + frontW + gapPx, topMarginPx, backImage.resultRotation);
      }

      return canvas;
    } catch (e) {
      console.error("Canvas generation failed", e);
      return null;
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const canvas = await generatePrintCanvas();
      if (!canvas) throw new Error("Could not generate canvas");
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save('Document_Print.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadJPG = async () => {
    setIsGenerating(true);
    
    try {
      const canvas = await generatePrintCanvas();
      if (!canvas) throw new Error("Could not generate canvas");
      
      const link = document.createElement('a');
      link.download = 'Document_Print.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Error downloading JPG:', error);
      alert('Error downloading JPG. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentImgState = currentEditSide === 'front' ? frontImage : backImage;

  const getDimensions = () => {
    switch(cardSize) {
      case 'standard': return { width: '85mm', height: '54mm' };
      case 'xlarge': return { width: '125mm', height: '79mm' };
      case 'large': 
      default: return { width: '105mm', height: '66mm' };
    }
  };
  const dims = getDimensions();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Custom styles for ReactCrop handles */}
      <style>{`
        .ReactCrop__drag-handle {
          width: 12px !important;
          height: 12px !important;
          background-color: #7b61ff !important;
          border-radius: 50% !important;
          border: 2px solid white !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        }
        .ReactCrop__drag-handle:after {
          display: none !important;
        }
        .ReactCrop__crop-selection {
          border: 2px solid #7b61ff !important;
          box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-[900] text-slate-900 mb-4 tracking-tight">WhatsApp Print Tool</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">
          Scan, crop, and print WhatsApp images perfectly on A4 paper. 100% Secure & Private.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-center items-center mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-slate-300'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all ${step >= 1 ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-slate-200 bg-slate-50'}`}>1</div>
          <span className="ml-3 font-bold hidden sm:block uppercase tracking-wider text-xs">Upload</span>
        </div>
        <div className={`w-16 h-1 mx-4 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-slate-100'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-slate-300'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all ${step >= 2 ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-slate-200 bg-slate-50'}`}>2</div>
          <span className="ml-3 font-bold hidden sm:block uppercase tracking-wider text-xs">Crop & Edit</span>
        </div>
        <div className={`w-16 h-1 mx-4 rounded-full transition-colors ${step >= 3 ? 'bg-primary' : 'bg-slate-100'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-slate-300'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all ${step >= 3 ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-slate-200 bg-slate-50'}`}>3</div>
          <span className="ml-3 font-bold hidden sm:block uppercase tracking-wider text-xs">Export</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="glass-panel p-10 bg-white">
          <div className="grid md:grid-cols-2 gap-10 mb-10">
            {/* Front Side */}
            <div>
              <h3 className="text-xl font-[800] text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                <ImageIcon className="text-primary" /> Front Side
              </h3>
              <div 
                {...getFrontProps()} 
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all h-72 flex flex-col items-center justify-center relative overflow-hidden group ${frontImage.originalUrl ? 'border-primary/50 bg-primary/5 shadow-inner shadow-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
              >
                <input {...getFrontInputProps()} />
                {frontImage.originalUrl ? (
                  <>
                    <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-[900] text-slate-900 uppercase tracking-widest">Image Loaded</span>
                    </div>
                    <img src={frontImage.originalUrl} alt="Front" className="max-h-full object-contain z-10 transition-transform hover:scale-105 duration-500" />
                    {isDetectingFront && (
                      <div className="absolute inset-0 bg-white/80 z-40 flex flex-col items-center justify-center text-primary backdrop-blur-sm">
                        <Loader2 className="animate-spin mb-4 text-primary" size={48} />
                        <span className="text-sm font-[900] flex items-center gap-3 tracking-widest bg-white px-6 py-3 rounded-2xl border border-primary/20 shadow-xl">
                          <Sparkles size={20} className="text-amber-500" /> AI ANALYZING EDGES...
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDetectingFront(false);
                          }}
                          className="mt-8 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-white transition-all shadow-lg"
                        >
                          Skip AI & Continue
                        </button>
                      </div>
                    )}
                    {frontImage.autoCrop && !isDetectingFront && (
                      <div className="absolute top-6 right-6 z-30 bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg scale-90 sm:scale-100">
                        <CheckCircle2 size={14} /> AI READY
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-[4px]">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 border border-white/30">
                        <RotateCw className="text-white" />
                      </div>
                      <span className="text-white text-xs font-black uppercase tracking-widest">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white text-primary rounded-2xl flex items-center justify-center mb-6 shadow-md border border-slate-100 group-hover:scale-110 transition-transform">
                      <UploadCloud size={40} />
                    </div>
                    <p className="text-slate-900 font-black text-lg tracking-tight mb-2">Click or drag front image</p>
                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">JPG, PNG, WEBP UP TO 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Back Side */}
            <div>
              <h3 className="text-xl font-[800] text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
                <ImageIcon className="text-primary" /> Back Side <span className="text-slate-400 text-sm font-medium tracking-normal">(Optional)</span>
              </h3>
              <div 
                {...getBackProps()} 
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all h-72 flex flex-col items-center justify-center relative overflow-hidden group ${backImage.originalUrl ? 'border-primary/50 bg-primary/5 shadow-inner shadow-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
              >
                <input {...getBackInputProps()} />
                {backImage.originalUrl ? (
                  <>
                    <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-[900] text-slate-900 uppercase tracking-widest">Image Loaded</span>
                    </div>
                    <img src={backImage.originalUrl} alt="Back" className="max-h-full object-contain z-10 transition-transform hover:scale-105 duration-500" />
                    {isDetectingBack && (
                      <div className="absolute inset-0 bg-white/80 z-40 flex flex-col items-center justify-center text-primary backdrop-blur-sm">
                        <Loader2 className="animate-spin mb-4 text-primary" size={48} />
                        <span className="text-sm font-[900] flex items-center gap-3 tracking-widest bg-white px-6 py-3 rounded-2xl border border-primary/20 shadow-xl">
                          <Sparkles size={20} className="text-amber-500" /> AI ANALYZING EDGES...
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDetectingBack(false);
                          }}
                          className="mt-8 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-white transition-all shadow-lg"
                        >
                          Skip AI & Continue
                        </button>
                      </div>
                    )}
                    {backImage.autoCrop && !isDetectingBack && (
                      <div className="absolute top-6 right-6 z-30 bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg scale-90 sm:scale-100">
                        <CheckCircle2 size={14} /> AI READY
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-[4px]">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 border border-white/30">
                        <RotateCw className="text-white" />
                      </div>
                      <span className="text-white text-xs font-black uppercase tracking-widest">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white text-primary rounded-2xl flex items-center justify-center mb-6 shadow-md border border-slate-100 group-hover:scale-110 transition-transform">
                      <UploadCloud size={40} />
                    </div>
                    <p className="text-slate-900 font-black text-lg tracking-tight mb-2">Click or drag back image</p>
                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">JPG, PNG, WEBP UP TO 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {(frontImage.autoCrop || backImage.autoCrop) && (
              <div className="text-primary text-sm font-black flex items-center gap-3 animate-pulse uppercase tracking-wider bg-primary/5 px-6 py-2 rounded-full border border-primary/20">
                <Sparkles size={18} className="text-amber-500" /> AI HAS DETECTED EDGES. PROCEED TO CROP.
              </div>
            )}
            <button 
              onClick={handleStartScanning}
              disabled={!frontImage.originalUrl || isDetectingFront || isDetectingBack}
              className="px-10 py-5 btn-primary rounded-2xl font-[900] text-xl disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 leading-none"
            >
              START EDITING <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Edit/Crop */}
      {step === 2 && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel: Adjustments */}
          <div className="lg:col-span-3 glass-panel p-6 h-fit bg-white">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 tracking-tight">
              <Settings2 className="text-primary" /> Adjustments ({currentEditSide === 'front' ? 'Front' : 'Back'})
            </h3>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 tracking-widest uppercase">
                    <span>BRIGHTNESS</span>
                    <span className="text-primary">{currentImgState.brightness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" max="150" 
                    value={currentImgState.brightness} 
                    onChange={(e) => updateCurrentEdit({ brightness: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>
  
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 tracking-widest uppercase">
                    <span>CONTRAST</span>
                    <span className="text-primary">{currentImgState.contrast}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" max="150" 
                    value={currentImgState.contrast} 
                    onChange={(e) => updateCurrentEdit({ contrast: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>
  
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 tracking-widest uppercase">
                    <span>CLARITY</span>
                    <span className="text-primary">{currentImgState.sharpness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={currentImgState.sharpness} 
                    onChange={(e) => updateCurrentEdit({ sharpness: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 tracking-widest uppercase">
                  <span>FINE ROTATE</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateCurrentEdit({ rotation: currentImgState.rotation - 1 })}
                      className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded hover:border-primary transition-colors"
                    >
                      -
                    </button>
                    <span className="text-primary w-8 text-center">{currentImgState.rotation}°</span>
                    <button 
                      onClick={() => updateCurrentEdit({ rotation: currentImgState.rotation + 1 })}
                      className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded hover:border-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="-180" max="180" 
                  value={currentImgState.rotation} 
                  onChange={(e) => updateCurrentEdit({ rotation: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary mb-4" 
                />
                <div className="grid grid-cols-4 gap-2">
                  {[-45, -5, 5, 45].map(deg => (
                    <button
                      key={deg}
                      onClick={() => updateCurrentEdit({ rotation: currentImgState.rotation + deg })}
                      className="text-[9px] font-bold py-1 bg-white border border-slate-100 rounded-lg hover:border-primary transition-all text-slate-500 hover:text-primary"
                    >
                      {deg > 0 ? `+${deg}°` : `${deg}°`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Show Side Border</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={currentImgState.showBorder} 
                      onChange={(e) => {
                        updateCurrentEdit({ showBorder: e.target.checked });
                        setShowBorders(e.target.checked);
                      }} 
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Lock Aspect Ratio</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <button 
                  onClick={snapToEdges}
                  className="w-full py-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl font-black text-xs uppercase tracking-widest border border-primary/20 transition-all flex items-center justify-center gap-2 mb-3"
                >
                  <CropIcon size={16} /> Snap to Edges
                </button>

                <button 
                  onClick={() => {
                    const newRotation = currentImgState.rotation + 90;
                    if (currentEditSide === 'front') {
                      setFrontImage(prev => ({ ...prev, rotation: newRotation }));
                    } else {
                      setBackImage(prev => ({ ...prev, rotation: newRotation }));
                    }
                    // Re-calculate snap with new rotation
                    setTimeout(snapToEdges, 0); 
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw size={16} /> Rotate & Snap
                </button>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 space-y-3">
              <button 
                onClick={() => updateCurrentEdit({ brightness: 100, contrast: 100, rotation: 0 })}
                className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Reset All
              </button>
              <button 
                onClick={handleConfirmEdit}
                className="w-full py-4 btn-primary rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20"
              >
                {currentEditSide === 'front' && backImage.originalUrl ? 'Next: Scan Back' : 'Finish & Export'}
              </button>
            </div>
          </div>

          {/* Right Panel: Crop Area */}
          <div className="lg:col-span-9 glass-panel p-8 flex flex-col items-center justify-center min-h-[600px] bg-slate-950 relative overflow-hidden group">
            <div className="absolute top-8 left-8 z-20 flex flex-col items-start bg-slate-900/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
              <h2 className="text-xl font-black text-white flex items-center gap-3 mb-1 uppercase tracking-tight">
                <CropIcon className="text-primary" size={24} /> 
                Crop {currentEditSide} Side
              </h2>
              <div className="text-primary font-black text-[10px] tracking-widest uppercase flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Align document boundary
              </div>
            </div>
            
            <div className="max-w-full max-h-[65vh] overflow-auto mt-12">
              {currentImgState.originalUrl && (
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={getEffectiveAspect()}
                  className="max-w-full"
                  ruleOfThirds
                >
                  <img
                    ref={imgRef}
                    src={currentImgState.originalUrl}
                    alt="Crop me"
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[60vh] object-contain"
                    style={{
                      transform: `rotate(${currentImgState.rotation}deg)`,
                      filter: `brightness(${currentImgState.brightness}%) contrast(${currentImgState.contrast + (currentImgState.sharpness / 2)}%) saturate(${100 + (currentImgState.sharpness / 4)}%)`
                    }}
                  />
                </ReactCrop>
              )}
            </div>
            
            {/* Hidden canvas for generating cropped image */}
            <canvas ref={previewCanvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* Step 3: Export */}
      {step === 3 && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel: Options */}
          <div className="lg:col-span-3 glass-panel p-8 h-fit bg-white border border-slate-200">
            <h3 className="font-black text-slate-900 mb-8 border-b border-slate-100 pb-4 text-xs uppercase tracking-widest">Layout Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button 
                onClick={() => setLayout('vertical')}
                className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                  layout === 'vertical' 
                    ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-5 h-8 border-[2.5px] border-current rounded-md"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Vertical</span>
              </button>
              <button 
                onClick={() => setLayout('horizontal')}
                className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                  layout === 'horizontal' 
                    ? 'bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-8 h-5 border-[2.5px] border-current rounded-md"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Horizontal</span>
              </button>
            </div>

            <h3 className="font-black text-slate-900 mb-4 border-b border-slate-100 pb-4 text-xs uppercase tracking-widest">Card Dimensions</h3>
            <div className="relative mb-10">
              <select 
                value={cardSize} 
                onChange={(e) => setCardSize(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
              >
                <option value="standard">Standard ID (85x54mm)</option>
                <option value="large">Service Size (105x66mm)</option>
                <option value="xlarge">Large Print (125x79mm)</option>
              </select>
            </div>

            <h3 className="font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 text-xs uppercase tracking-widest">Global Settings</h3>
            <div className="flex items-center justify-between mb-12">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Show Cut Borders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showBorders} onChange={(e) => setShowBorders(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="space-y-4">
              <button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
              >
                <Download size={18} /> SAVE AS PDF
              </button>
              <button 
                onClick={downloadJPG}
                disabled={isGenerating}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-3 transition-all border border-slate-200 disabled:opacity-50"
              >
                <ImageIcon size={18} /> SAVE AS JPG
              </button>
              <button 
                onClick={handlePrint}
                className="w-full py-4 btn-primary rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                <Printer size={18} /> PRINT NOW
              </button>
              
              <button 
                onClick={() => {
                  setStep(1);
                  setFrontImage({ ...defaultImageState });
                  setBackImage({ ...defaultImageState });
                }}
                className="w-full py-6 mt-6 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-all block border-t border-slate-100"
              >
                ↺ SCAN NEW DOCUMENT
              </button>
            </div>
          </div>

          {/* Right Panel: A4 Preview */}
          <div className="lg:col-span-9 glass-panel bg-slate-200/50 p-10 flex justify-center overflow-auto h-[850px] shadow-inner shadow-slate-900/5">
            {/* A4 Paper Container (210mm x 297mm) */}
            <div 
              ref={printRef}
              id="print-section"
              className="bg-white relative shadow-2xl transition-all"
              style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                padding: '20mm',
                boxSizing: 'border-box',
                boxShadow: '0 40px 60px -15px rgba(0,0,0,0.15)'
              }}
            >
              <div className={`flex ${layout === 'vertical' ? 'flex-col items-center gap-8' : 'flex-row justify-center gap-4'} mt-10`}>
                {frontImage.croppedUrl && (
                  <div className="relative group p-1">
                    <img 
                      src={frontImage.croppedUrl} 
                      alt="Front" 
                      className={`object-contain transition-transform duration-300 ${showBorders ? 'border border-gray-300 shadow-sm' : ''}`}
                      style={{ 
                        width: ( (frontImage.resultRotation % 180) === 0 ) ? dims.width : dims.height, 
                        height: ( (frontImage.resultRotation % 180) === 0 ) ? dims.height : dims.width,
                        transform: `rotate(${frontImage.resultRotation}deg)`
                      }} 
                    />
                    <div className="absolute -top-4 -right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <button 
                        onClick={() => setFrontImage(p => ({...p, resultRotation: (p.resultRotation + 90) % 360}))}
                        className="bg-white text-slate-900 p-2 rounded-full shadow-lg hover:bg-slate-100 border border-slate-200"
                        title="Rotate Front"
                      >
                        <RotateCw size={16} />
                      </button>
                    </div>
                  </div>
                )}
                {backImage.croppedUrl && (
                  <div className="relative group p-1">
                    <img 
                      src={backImage.croppedUrl} 
                      alt="Back" 
                      className={`object-contain transition-transform duration-300 ${showBorders ? 'border border-gray-300 shadow-sm' : ''}`}
                      style={{ 
                        width: ( (backImage.resultRotation % 180) === 0 ) ? dims.width : dims.height, 
                        height: ( (backImage.resultRotation % 180) === 0 ) ? dims.height : dims.width,
                        transform: `rotate(${backImage.resultRotation}deg)`
                      }} 
                    />
                    <div className="absolute -top-4 -right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <button 
                        onClick={() => setBackImage(p => ({...p, resultRotation: (p.resultRotation + 90) % 360}))}
                        className="bg-white text-slate-900 p-2 rounded-full shadow-lg hover:bg-slate-100 border border-slate-200"
                        title="Rotate Back"
                      >
                        <RotateCw size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Section */}
      <section className="mt-32 max-w-7xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-10">
         <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
              <Sparkles className="text-primary" /> How to use?
            </h3>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Upload Both Sides', desc: 'Starting with Step 1, upload the front and back side of your document (Adhaar, PAN, Voter ID).' },
                { step: '02', title: 'Edit & Process', desc: 'In Step 2, crop each side precisely and adjust brightness/rotation to ensure text is clear.' },
                { step: '03', title: 'Preview Layout', desc: 'See your document automatically arranged for A4 printing in the final step.' },
                { step: '04', title: 'Print or Save', desc: 'Click the PRINT NOW button to save as PDF or send directly to your local printer.' }
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
              <Printer className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Professional Print Tool</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
              Perfectly scale and align identification documents for standard printing without wasting paper or ink.
            </p>
            <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest w-fit mx-auto shadow-xl">
              <CheckCircle2 size={16} className="text-primary" /> A4 Layout Optimized
            </div>
         </div>
      </section>
    </div>
  );
}
