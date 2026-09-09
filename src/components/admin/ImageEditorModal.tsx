import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Sun, 
  Contrast, 
  Sliders, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Crop, 
  ZoomIn, 
  ZoomOut,
  Image as ImageIcon 
} from 'lucide-react';

interface ImageEditorModalProps {
  imageUrl: string;
  filename?: string;
  originalFileId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedBase64: string, filename: string) => Promise<void>;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  imageUrl,
  filename = 'edited_image.jpg',
  originalFileId,
  isOpen,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor controls state
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '4:3' | '16:9' | '3:2'>('free');

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImageObj(img);
      setLoading(false);
      resetControls();
    };
    img.onerror = () => {
      setLoading(false);
    };
  }, [isOpen, imageUrl]);

  const resetControls = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(100);
    setAspectRatio('free');
  };

  // Render to canvas whenever controls change
  useEffect(() => {
    if (!imageObj || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate crop / aspect ratio dimensions
    let srcW = imageObj.naturalWidth;
    let srcH = imageObj.naturalHeight;
    let cropW = srcW;
    let cropH = srcH;
    let cropX = 0;
    let cropY = 0;

    if (aspectRatio === '1:1') {
      const size = Math.min(srcW, srcH);
      cropW = size;
      cropH = size;
      cropX = (srcW - size) / 2;
      cropY = (srcH - size) / 2;
    } else if (aspectRatio === '16:9') {
      const targetRatio = 16 / 9;
      if (srcW / srcH > targetRatio) {
        cropW = srcH * targetRatio;
        cropH = srcH;
        cropX = (srcW - cropW) / 2;
        cropY = 0;
      } else {
        cropW = srcW;
        cropH = srcW / targetRatio;
        cropX = 0;
        cropY = (srcH - cropH) / 2;
      }
    } else if (aspectRatio === '4:3') {
      const targetRatio = 4 / 3;
      if (srcW / srcH > targetRatio) {
        cropW = srcH * targetRatio;
        cropH = srcH;
        cropX = (srcW - cropW) / 2;
        cropY = 0;
      } else {
        cropW = srcW;
        cropH = srcW / targetRatio;
        cropX = 0;
        cropY = (srcH - cropH) / 2;
      }
    } else if (aspectRatio === '3:2') {
      const targetRatio = 3 / 2;
      if (srcW / srcH > targetRatio) {
        cropW = srcH * targetRatio;
        cropH = srcH;
        cropX = (srcW - cropW) / 2;
        cropY = 0;
      } else {
        cropW = srcW;
        cropH = srcW / targetRatio;
        cropX = 0;
        cropY = (srcH - cropH) / 2;
      }
    }

    const isRotatedSideways = rotation % 180 !== 0;
    canvas.width = isRotatedSideways ? cropH : cropW;
    canvas.height = isRotatedSideways ? cropW : cropH;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`;

    // Center transform
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const scaleZoom = zoom / 100;
    ctx.scale(scaleZoom, scaleZoom);

    // Draw
    ctx.drawImage(
      imageObj,
      cropX,
      cropY,
      cropW,
      cropH,
      -cropW / 2,
      -cropH / 2,
      cropW,
      cropH
    );

    ctx.restore();
  }, [imageObj, brightness, contrast, saturation, grayscale, rotation, flipH, flipV, zoom, aspectRatio]);

  const handleSave = async () => {
    if (!canvasRef.current) return;
    try {
      setSaving(true);
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.92);
      await onSave(base64, filename);
      onClose();
    } catch (err) {
      console.error('Error saving edited image:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0B1F3A] text-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4A84F]/20 flex items-center justify-center text-[#D4A84F]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Galaxy Media Studio Editor</h3>
              <p className="text-xs text-slate-400">Crop, adjust, transform, and store directly into MongoDB GridFS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Left Canvas & Right Controls */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left: Canvas Area */}
          <div className="lg:col-span-8 bg-slate-950 p-6 flex flex-col items-center justify-center overflow-auto min-h-[360px] max-h-[60vh] lg:max-h-full">
            {loading ? (
              <div className="flex flex-col items-center text-slate-400 gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-[#D4A84F]" />
                <span className="text-sm font-medium">Loading image asset...</span>
              </div>
            ) : (
              <div className="relative border border-slate-800 rounded-lg shadow-xl overflow-hidden max-w-full max-h-full flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[50vh] object-contain"
                />
              </div>
            )}
          </div>

          {/* Right: Controls Sidebar */}
          <div className="lg:col-span-4 bg-[#0F294D] p-5 overflow-y-auto border-l border-slate-800 space-y-5 text-xs">
            
            {/* Aspect Ratio / Crop */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-[#D4A84F]" /> Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['free', '1:1', '4:3', '16:9', '3:2'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 px-1 rounded text-center font-bold text-[11px] transition ${
                      aspectRatio === ratio
                        ? 'bg-[#D4A84F] text-[#0B1F3A]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {ratio === 'free' ? 'Free' : ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Transform / Rotate / Flip */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-[#D4A84F]" /> Rotate & Flip
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setRotation((r) => (r - 90) % 360)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-200 transition"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-200 transition"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFlipH((f) => !f)}
                  className={`p-2 rounded-lg flex items-center justify-center transition ${
                    flipH ? 'bg-[#D4A84F] text-[#0B1F3A]' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFlipV((f) => !f)}
                  className={`p-2 rounded-lg flex items-center justify-center transition ${
                    flipV ? 'bg-[#D4A84F] text-[#0B1F3A]' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Adjustments */}
            <div className="space-y-3.5 pt-2 border-t border-slate-800">
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#D4A84F]" /> Color & Light Adjustments
              </label>

              {/* Brightness */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span className="flex items-center gap-1"><Contrast className="w-3 h-3 text-blue-400" /> Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span>Saturation</span>
                  <span>{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

              {/* Grayscale */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span>B&W / Grayscale</span>
                  <span>{grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grayscale}
                  onChange={(e) => setGrayscale(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>

              {/* Zoom */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3 text-emerald-400" /> Scale / Zoom</span>
                  <span>{zoom}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="150"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#D4A84F] cursor-pointer"
                />
              </div>
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={resetControls}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Adjustments
            </button>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#08172c] border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 bg-[#D4A84F] hover:bg-[#c0953e] text-[#0B1F3A] rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#D4A84F]/20 disabled:opacity-50 transition"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving to GridFS...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes to MongoDB GridFS
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
