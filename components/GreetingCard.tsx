
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Copy, Check, Download, Image as ImageIcon, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { generateGreetingImage } from '../services/geminiService';

interface GreetingCardProps {
  content: string;
  context?: string;
  index: number;
  themes: string[];
  tone: string;
}

const GreetingCard: React.FC<GreetingCardProps> = ({ content, context, index, themes, tone }) => {
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cleanText = useMemo(() => content.replace(/[#*]/g, '').trim(), [content]);

  const fetchImage = async () => {
    setIsGeneratingImg(true);
    setError(null);
    try {
      // Staggering the start of each request based on its index to smooth out the burst
      await new Promise(resolve => setTimeout(resolve, index * 1800));
      
      const url = await generateGreetingImage(cleanText, themes, tone);
      setImageUrl(url);
    } catch (err: any) {
      console.error("Art generation failed:", err);
      if (err?.message?.includes('429') || err?.status === 'RESOURCE_EXHAUSTED') {
        setError("QUOTA_LIMIT");
      } else {
        setError("NETWORK_ERROR");
      }
    } finally {
      setIsGeneratingImg(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchImage();
    return () => { isMounted = false; };
  }, [cleanText, themes, tone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!imageUrl || !canvasRef.current) return;

    // Ensure fonts are loaded before drawing to canvas to prevent fallback font artifacts
    await Promise.all([
      document.fonts.load('italic 44px "Playfair Display"'),
      document.fonts.load('bold 18px "Inter"')
    ]);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;

      ctx.drawImage(img, 0, 0, 1024, 1024);
      
      // Gradient overlay for text clarity
      const grad = ctx.createLinearGradient(0, 0, 0, 1024);
      grad.addColorStop(0, 'rgba(0,0,0,0.2)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      const padding = 120;
      const maxWidth = 1024 - (padding * 2);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let fontSize = cleanText.length > 120 ? 34 : 44;
      ctx.font = `italic ${fontSize}px "Playfair Display", serif`;

      const words = cleanText.split(' ');
      let line = '';
      const lines = [];
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const lineHeight = fontSize * 1.5;
      let startY = (1024 - (lines.length * lineHeight)) / 2;

      lines.forEach((l) => {
        ctx.fillText(l.trim(), 512, startY + lineHeight / 2);
        startY += lineHeight;
      });

      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.letterSpacing = "4px";
      ctx.fillText('LUMINA STUDIO • BY BALAJIDUDDUKURI • 2026', 512, 940);

      const link = document.createElement('a');
      link.download = `lumina-2026-greeting-${index}.png`;
      link.href = canvas.toDataURL('image/png', 0.95);
      link.click();
    };
    img.src = imageUrl;
  };

  return (
    <div 
      className="bg-glass rounded-[2.5rem] group relative overflow-hidden transition-all duration-700 hover:scale-[1.02] border-white/5 hover:border-white/20 flex flex-col h-full min-h-[480px] shadow-2xl"
      style={{ animationDelay: `${index * 150}ms` }}
      role="article"
      aria-label={`Greeting card ${index + 1}`}
    >
      <div className="absolute inset-0 z-0">
        {imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="" 
              className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-1000 scale-100 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/20 via-[#020617]/80 to-[#020617]" />
          </>
        ) : error ? (
          <div className="w-full h-full bg-slate-900/60 flex flex-col items-center justify-center p-10 text-center">
            <AlertCircle className="text-amber-500/20 mb-4" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">
              {error === 'QUOTA_LIMIT' ? 'Studio Overloaded' : 'Visual Synthesis Halted'}
            </p>
            <button 
              onClick={(e) => { e.stopPropagation(); fetchImage(); }}
              className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/90 hover:bg-white/10 transition-all flex items-center gap-2"
              aria-label="Retry generating art"
            >
              <RefreshCw size={12} /> Retry Art
            </button>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-900/40 flex flex-col items-center justify-center gap-4">
             <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-amber-500/10 rounded-full animate-pulse" />
                <Loader2 className="animate-spin text-white/10 relative z-10" size={36} />
             </div>
             <p className="text-[8px] uppercase tracking-[0.4em] font-black text-white/10 animate-pulse">
               Generating Vision...
             </p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 p-10 flex flex-col h-full">
        <header className="flex justify-between items-center mb-8">
          <span className="text-[9px] font-black tracking-[0.4em] text-amber-500/90 uppercase px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-xl">
            {context || 'Greeting'}
          </span>
          <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <button 
              onClick={handleCopy}
              className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-all border border-white/10 group/btn"
              aria-label="Copy greeting to clipboard"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-white/40 group-hover/btn:text-white" />}
            </button>
            <button 
              onClick={handleDownload}
              disabled={!imageUrl}
              className="p-3 rounded-full bg-white/5 hover:bg-white/20 disabled:opacity-5 transition-all border border-white/10 group/btn"
              aria-label="Download greeting image"
            >
              <Download size={16} className="text-white/40 group-hover/btn:text-white" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col justify-center px-4">
          <p className="font-serif italic text-2xl md:text-3xl leading-[1.6] text-white/95 text-center drop-shadow-2xl">
            {cleanText}
          </p>
        </div>

        <footer className="mt-10 flex items-center gap-5 opacity-5 group-hover:opacity-30 transition-all duration-1000">
          <div className="h-px flex-1 bg-white/30" />
          <ImageIcon size={16} className="text-white" />
          <div className="h-px flex-1 bg-white/30" />
        </footer>
      </div>
    </div>
  );
};

export default GreetingCard;
