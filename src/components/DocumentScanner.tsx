import React, { useState, useRef, useCallback } from 'react';
import { Page } from '../App';
import { UploadCloud, Printer, Download, Image as ImageIcon, CheckCircle2, RotateCw, Settings2, Crop as CropIcon, Loader2, Sparkles } from 'lucide-react';
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

  const snapToEdges = () => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    
    if (lockAspect) {
      let targetWidth = width;
      let targetHeight = width / ID_CARD_ASPECT;
      
      if (targetHeight > height) {
        targetHeight = height;
        targetWidth = height * ID_CARD_ASPECT;
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

    const sharpenValue = currentImgState.sharpness / 100;
    const filterString = `brightness(${currentImgState.brightness}%) contrast(${currentImgState.contrast + (currentImgState.sharpness / 2)}%) saturate(${100 + (currentImgState.sharpness / 4)}%)`;

    if (completedCrop?.width && completedCrop?.height) {
      // Draw cropped version
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      
      ctx.imageSmoothingQuality = 'high';
      ctx.filter = filterString;
      
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
    } else {
      // Draw full image if no crop
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.filter = filterString;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentImgState.rotation * Math.PI) / 180);
      ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
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

      const drawCard = (img: HTMLImageElement, x: number, y: number) => {
        if (showBorders) {
          ctx.strokeStyle = '#cccccc'; // Light gray hex
          ctx.lineWidth = getMMtoPX(0.2);
          ctx.strokeRect(x - 1, y - 1, cardWPx + 2, cardHPx + 2);
        }
        ctx.drawImage(img, x, y, cardWPx, cardHPx);
      };

      if (layout === 'vertical') {
        const x = (widthPx - cardWPx) / 2;
        if (frontImg) drawCard(frontImg, x, topMarginPx);
        if (backImg) drawCard(backImg, x, topMarginPx + cardHPx + gapPx);
      } else {
        const totalW = cardWPx * 2 + gapPx;
        const startX = (widthPx - totalW) / 2;
        if (frontImg) drawCard(frontImg, startX, topMarginPx);
        if (backImg) drawCard(backImg, startX + cardWPx + gapPx, topMarginPx);
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
      pdf.save('Aadhar_Print.pdf');
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
      link.download = 'Aadhar_Print.jpg';
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
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-4">Aadhar / Document Print Tool</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Scan, crop, and print Aadhar cards perfectly on A4 paper. 100% Secure & Private.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-center items-center mb-10">
        <div className={`flex items-center ${step >= 1 ? 'text-[#00d2ff]' : 'text-white/40'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-[#00d2ff] bg-[#00d2ff]/20' : 'border-white/20'}`}>1</div>
          <span className="ml-2 font-medium hidden sm:block">Upload</span>
        </div>
        <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-[#00d2ff]' : 'bg-white/20'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-[#00d2ff]' : 'text-white/40'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-[#00d2ff] bg-[#00d2ff]/20' : 'border-white/20'}`}>2</div>
          <span className="ml-2 font-medium hidden sm:block">Crop & Edit</span>
        </div>
        <div className={`w-16 h-0.5 mx-4 ${step >= 3 ? 'bg-[#00d2ff]' : 'bg-white/20'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-[#00d2ff]' : 'text-white/40'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? 'border-[#00d2ff] bg-[#00d2ff]/20' : 'border-white/20'}`}>3</div>
          <span className="ml-2 font-medium hidden sm:block">Export</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="glass-panel p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Front Side */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="text-[#00d2ff]" /> Front Side
              </h3>
              <div 
                {...getFrontProps()} 
                className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:bg-white/5 transition-colors h-64 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <input {...getFrontInputProps()} />
                {frontImage.originalUrl ? (
                  <>
                    <img src={frontImage.originalUrl} alt="Front" className="max-h-full object-contain z-10" />
                    {isDetectingFront && (
                      <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-[#00d2ff]">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <span className="text-sm font-bold flex items-center gap-2">
                          <Sparkles size={16} /> AI SMART DETECTING...
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDetectingFront(false);
                          }}
                          className="mt-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white/80"
                        >
                          Skip AI Detect
                        </button>
                      </div>
                    )}
                    {frontImage.autoCrop && !isDetectingFront && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (step === 2) setCrop(frontImage.autoCrop);
                        }}
                        className="absolute top-4 right-4 z-20 bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md hover:bg-[#00d2ff]/30 transition-all pointer-events-auto"
                      >
                        <Sparkles size={12} /> AI READY
                      </button>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                      <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center mb-4">
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-white font-medium">Click or drag front image</p>
                    <p className="text-white/50 text-sm mt-2">JPG, PNG up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Back Side */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="text-[#00d2ff]" /> Back Side <span className="text-white/40 text-sm font-normal">(Optional)</span>
              </h3>
              <div 
                {...getBackProps()} 
                className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:bg-white/5 transition-colors h-64 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <input {...getBackInputProps()} />
                {backImage.originalUrl ? (
                  <>
                    <img src={backImage.originalUrl} alt="Back" className="max-h-full object-contain z-10" />
                    {isDetectingBack && (
                      <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-[#00d2ff]">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <span className="text-sm font-bold flex items-center gap-2">
                          <Sparkles size={16} /> AI SMART DETECTING...
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDetectingBack(false);
                          }}
                          className="mt-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white/80"
                        >
                          Skip AI Detect
                        </button>
                      </div>
                    )}
                    {backImage.autoCrop && !isDetectingBack && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (step === 2) setCrop(backImage.autoCrop);
                        }}
                        className="absolute top-4 right-4 z-20 bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md hover:bg-[#00d2ff]/30 transition-all pointer-events-auto"
                      >
                        <Sparkles size={12} /> AI READY
                      </button>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                      <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white/10 text-[#00d2ff] rounded-full flex items-center justify-center mb-4">
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-white font-medium">Click or drag back image</p>
                    <p className="text-white/50 text-sm mt-2">JPG, PNG up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            {(frontImage.autoCrop || backImage.autoCrop) && (
              <div className="text-[#00d2ff] text-sm font-medium flex items-center gap-2 animate-pulse">
                <Sparkles size={16} /> AI has detected your document edges. Press Start to review.
              </div>
            )}
            <button 
              onClick={handleStartScanning}
              disabled={!frontImage.originalUrl || isDetectingFront || isDetectingBack}
              className="px-8 py-4 btn-primary rounded-xl font-bold text-lg disabled:opacity-50 flex items-center gap-2"
            >
              START SCANNING <CheckCircle2 />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Edit/Crop */}
      {step === 2 && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel: Adjustments */}
          <div className="lg:col-span-3 glass-panel p-6 h-fit">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2 border-b border-white/15 pb-4">
              <Settings2 className="text-[#00d2ff]" /> Adjustments ({currentEditSide === 'front' ? 'Front' : 'Back'})
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-white/60 mb-2">
                  <span>BRIGHTNESS</span>
                  <span>{currentImgState.brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="150" 
                  value={currentImgState.brightness} 
                  onChange={(e) => updateCurrentEdit({ brightness: parseInt(e.target.value) })}
                  className="w-full accent-[#00d2ff]" 
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-white/60 mb-2">
                  <span>CONTRAST</span>
                  <span>{currentImgState.contrast}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="150" 
                  value={currentImgState.contrast} 
                  onChange={(e) => updateCurrentEdit({ contrast: parseInt(e.target.value) })}
                  className="w-full accent-[#00d2ff]" 
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-white/60 mb-2">
                  <span>SHARPEN (Clarity)</span>
                  <span>{currentImgState.sharpness}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={currentImgState.sharpness} 
                  onChange={(e) => updateCurrentEdit({ sharpness: parseInt(e.target.value) })}
                  className="w-full accent-[#00d2ff]" 
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-white/60 mb-2">
                  <span>FINE ROTATE</span>
                  <span>{currentImgState.rotation}°</span>
                </div>
                <input 
                  type="range" 
                  min="-180" max="180" 
                  value={currentImgState.rotation} 
                  onChange={(e) => updateCurrentEdit({ rotation: parseInt(e.target.value) })}
                  className="w-full accent-[#00d2ff]" 
                />
              </div>

              <div className="pt-4 border-t border-white/15">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-white/60">SHOW SIDE BORDER</span>
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
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00d2ff]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-white/60">LOCK ASPECT RATIO</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00d2ff]"></div>
                  </label>
                </div>
                
                <button 
                  onClick={snapToEdges}
                  className="w-full py-2 bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 text-[#00d2ff] rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-[#00d2ff]/30 mb-3"
                >
                  <CropIcon size={18} /> Snap to Edges
                </button>

                <button 
                  onClick={() => updateCurrentEdit({ rotation: currentImgState.rotation + 90 })}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCw size={18} /> Rotate 90°
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 space-y-3">
              <button 
                onClick={() => updateCurrentEdit({ brightness: 100, contrast: 100, rotation: 0 })}
                className="w-full py-3 bg-black/20 text-white rounded-lg font-medium hover:bg-black/40 transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={handleConfirmEdit}
                className="w-full py-3 btn-primary rounded-lg font-bold"
              >
                {currentEditSide === 'front' && backImage.originalUrl ? 'Confirm & Scan Back' : 'Confirm & Finish'}
              </button>
            </div>
          </div>

          {/* Right Panel: Crop Area */}
          <div className="lg:col-span-9 glass-panel p-4 flex flex-col items-center justify-center min-h-[500px] bg-black/40">
            <div className="text-white/60 mb-4 flex items-center gap-2">
              <CropIcon size={18} /> Drag corners to align card
            </div>
            
            <div className="max-w-full max-h-[60vh] overflow-auto">
              {currentImgState.originalUrl && (
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={lockAspect ? ID_CARD_ASPECT : undefined}
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
          <div className="lg:col-span-3 glass-panel p-6 h-fit">
            <h3 className="font-bold text-white mb-6 border-b border-white/15 pb-4">Layout Options</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button 
                onClick={() => setLayout('vertical')}
                className={`py-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors ${
                  layout === 'vertical' ? 'bg-[#7b61ff]/20 border-[#7b61ff] text-white' : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="w-4 h-6 border-2 border-current rounded-sm"></div>
                <span className="text-xs font-bold">VERTICAL</span>
              </button>
              <button 
                onClick={() => setLayout('horizontal')}
                className={`py-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors ${
                  layout === 'horizontal' ? 'bg-[#7b61ff]/20 border-[#7b61ff] text-white' : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/5'
                }`}
              >
                <div className="w-6 h-4 border-2 border-current rounded-sm"></div>
                <span className="text-xs font-bold">HORIZONTAL</span>
              </button>
            </div>

            <h3 className="font-bold text-white mb-4 border-b border-white/15 pb-4">Card Size</h3>
            <select 
              value={cardSize} 
              onChange={(e) => setCardSize(e.target.value as any)}
              className="input-glass rounded p-2 w-full text-sm mb-8"
            >
              <option value="standard" className="text-slate-900">Standard (85x54mm)</option>
              <option value="large" className="text-slate-900">Large (105x66mm)</option>
              <option value="xlarge" className="text-slate-900">Extra Large (125x79mm)</option>
            </select>

            <h3 className="font-bold text-white mb-4 border-b border-white/15 pb-4">Settings</h3>
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium text-white/80">SHOW BORDERS</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showBorders} onChange={(e) => setShowBorders(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d2ff]"></div>
              </label>
            </div>

            <div className="space-y-3">
              <button 
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={18} /> DOWNLOAD PDF
              </button>
              <button 
                onClick={downloadJPG}
                disabled={isGenerating}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <ImageIcon size={18} /> DOWNLOAD JPG
              </button>
              <button 
                onClick={handlePrint}
                className="w-full py-3 btn-primary rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Printer size={18} /> PRINT NOW
              </button>
              
              <button 
                onClick={() => {
                  setStep(1);
                  setFrontImage({ ...defaultImageState });
                  setBackImage({ ...defaultImageState });
                }}
                className="w-full py-3 mt-4 text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                ↺ SCAN NEW DOCUMENT
              </button>
            </div>
          </div>

          {/* Right Panel: A4 Preview */}
          <div className="lg:col-span-9 glass-panel bg-black/20 p-8 flex justify-center overflow-auto h-[800px]">
            {/* A4 Paper Container (210mm x 297mm) */}
            <div 
              ref={printRef}
              id="print-section"
              className="bg-white relative print-container"
              style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                padding: '20mm',
                boxSizing: 'border-box',
                boxShadow: 'none'
              }}
            >
              <div className={`flex ${layout === 'vertical' ? 'flex-col items-center gap-8' : 'flex-row justify-center gap-4'} mt-10`}>
                {frontImage.croppedUrl && (
                  <img 
                    src={frontImage.croppedUrl} 
                    alt="Front" 
                    className={`object-contain ${showBorders ? 'border border-gray-300 shadow-sm' : ''}`}
                    style={{ 
                      width: dims.width, 
                      height: dims.height 
                    }} 
                  />
                )}
                {backImage.croppedUrl && (
                  <img 
                    src={backImage.croppedUrl} 
                    alt="Back" 
                    className={`object-contain ${showBorders ? 'border border-gray-300 shadow-sm' : ''}`}
                    style={{ 
                      width: dims.width, 
                      height: dims.height 
                    }} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
