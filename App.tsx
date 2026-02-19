
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shirt,
  Sparkles,
  Key,
  Info,
  SlidersHorizontal,
  Image as ImageIcon,
  Plus,
  X,
  Download,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { AppMode, ImageData, FitStyle, GenerationResult, StylePreset } from './types';
import ImageUploader from './components/ImageUploader';
import ProcessModal from './components/ProcessModal';
import ComparisonSlider from './components/ComparisonSlider';
import { generateFitting } from './geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('single');
  const [personImage, setPersonImage] = useState<ImageData | undefined>();
  const [garments, setGarments] = useState<ImageData[]>([]);
  const [fitStyle, setFitStyle] = useState<FitStyle>('Standard');
  const [stylePreset, setStylePreset] = useState<StylePreset>('Studio');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (retryCountdown !== null && retryCountdown > 0) {
      timer = setInterval(() => {
        setRetryCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (retryCountdown === 0) {
      setRetryCountdown(null);
    }
    return () => clearInterval(timer);
  }, [retryCountdown]);

  const handleSetupKey = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
        window.location.reload();
      } else {
        setErrorMessage("API Key setup is managed via the .env file in this environment.");
      }
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const handleAddGarment = (image: ImageData) => {
    if (mode === 'single') {
      setGarments([image]);
    } else {
      setGarments(prev => [...prev, image]);
    }
  };

  const clearInputs = () => {
    setPersonImage(undefined);
    setGarments([]);
    setResults([]);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!personImage || garments.length === 0) {
      setErrorMessage("Please upload both a photo of yourself and at least one garment.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    const newResults: GenerationResult[] = garments.map(g => ({
      id: Math.random().toString(36).substr(2, 9),
      garmentName: g.name,
      imageUrl: '',
      originalImageUrl: personImage.base64,
      status: 'pending',
      preset: stylePreset
    }));
    setResults(newResults);

    for (let i = 0; i < garments.length; i++) {
      try {
        const resultUrl = await generateFitting(
          personImage,
          garments[i],
          fitStyle,
          stylePreset,
          (seconds) => setRetryCountdown(seconds)
        );

        setResults(prev => prev.map((res, idx) =>
          idx === i ? { ...res, status: 'success', imageUrl: resultUrl } : res
        ));
      } catch (err: any) {
        if (err.message === "RE-AUTH_REQUIRED") {
          setErrorMessage("Please select a valid API key with appropriate permissions.");
          handleSetupKey();
          break;
        }

        setResults(prev => prev.map((res, idx) =>
          idx === i ? { ...res, status: 'error', errorMessage: err.message } : res
        ));
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen custom-scrollbar">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between magic-glass px-6 py-4 rounded-[1.5rem] md:rounded-[2rem]">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40"
            >
              <Shirt className="text-white w-6 h-6" />
            </motion.div>
            <div className="hidden xs:block">
              <h1 className="font-black text-xl tracking-tight leading-none">V-FIT <span className="text-indigo-500 font-normal">AI</span></h1>
              <span className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em]">Next-Gen Virtual Fitting</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-colors py-2 px-4"
            >
              <Info className="w-4 h-4" />
              HOW IT WORKS
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSetupKey}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border border-white/10"
            >
              <Key className="w-3 h-3 text-indigo-400" />
              CONFIGURE
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-28 md:mt-32 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black flex items-center gap-3">
                <SlidersHorizontal className="text-indigo-400 w-5 h-5" />
                CONTROLS
              </h2>
              <div className="flex bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => { setMode('single'); clearInputs(); }}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'single' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  Solo
                </button>
                <button
                  onClick={() => { setMode('batch'); clearInputs(); }}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'batch' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  Batch
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <ImageUploader
                label="01. BASE SUBJECT"
                description="Upload a clear body shot"
                onImageSelect={setPersonImage}
                currentImage={personImage}
              />

              <ImageUploader
                label={mode === 'single' ? "02. GARMENT ITEM" : "02. ADD TO CATALOG"}
                description="Flat-lay or studio shot"
                onImageSelect={handleAddGarment}
                currentImage={mode === 'single' ? garments[0] : undefined}
              />

              <AnimatePresence>
                {mode === 'batch' && garments.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-wrap gap-3 p-4 bg-white/5 rounded-2xl border border-white/10"
                  >
                    {garments.map((g, idx) => (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={g.id}
                        className="relative group w-14 h-14"
                      >
                        <img src={`data:${g.mimeType};base64,${g.base64}`} className="w-full h-full object-cover rounded-xl border border-white/20 shadow-lg" />
                        <button
                          onClick={() => setGarments(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-4">DRAPE PREFERENCE</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Tight', 'Standard', 'Loose'] as FitStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => setFitStyle(style)}
                        className={`
                          py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                          ${fitStyle === style ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-4">MAGIC SCENE SELECTOR</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(['Studio', 'Street', 'Runway', 'Luxury', 'Vibrant'] as StylePreset[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setStylePreset(preset)}
                        className={`
                          py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                          ${stylePreset === preset ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}
                        `}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isProcessing || !personImage || garments.length === 0}
                onClick={handleGenerate}
                className={`
                  w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3
                  ${isProcessing ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30'}
                `}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    PROCESSING
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    LAUNCH V-FIT
                  </>
                )}
              </motion.button>
            </div>
          </motion.section>

          <AnimatePresence>
            {retryCountdown !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex items-center gap-4 backdrop-blur-md"
              >
                <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Rate Limit Active</p>
                  <p className="text-[10px] text-amber-500/70 font-bold">Auto-retry in {retryCountdown}s</p>
                </div>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-center gap-4 backdrop-blur-md"
              >
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest">System Error</p>
                  <p className="text-[10px] text-red-500/70 font-bold">{errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Preview/Result Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {results.length === 0 && !isProcessing ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 backdrop-blur-xl"
              >
                <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-8 animate-float">
                  <ImageIcon className="w-12 h-12 text-white/10" />
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Ready for fitting</h3>
                <p className="text-sm text-white/40 max-w-sm font-medium leading-relaxed">
                  Start your virtual session by uploading a base photo and items from your wardrobe.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {results.map((res) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={res.id}
                    className="glass-card group overflow-hidden"
                  >
                    <div className="aspect-[3/4] relative bg-white/5">
                      {res.status === 'pending' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="relative">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                            </div>
                          </div>
                          <div className="mt-8 text-center px-6">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Generative Tailoring</p>
                            <p className="text-[10px] text-white/20 mt-2 font-bold max-w-[200px]">Anchoring body features and material properties in latent space...</p>
                          </div>
                        </div>
                      ) : res.status === 'error' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                          <AlertCircle className="w-12 h-12 text-red-400/50 mb-6" />
                          <p className="text-xs font-black uppercase tracking-widest text-red-400">Generation Failed</p>
                          <p className="text-[10px] text-white/30 mt-2 font-bold">{res.errorMessage}</p>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleGenerate}
                            className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 transition-all"
                          >
                            RETRY SESSION
                          </motion.button>
                        </div>
                      ) : (
                        <div className="relative w-full h-full group">
                          {res.originalImageUrl ? (
                            <ComparisonSlider
                              beforeImage={res.originalImageUrl}
                              afterImage={res.imageUrl}
                            />
                          ) : (
                            <img
                              src={res.imageUrl}
                              alt="Result"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          )}

                          <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                            <div className="flex justify-between items-end pointer-events-auto">
                              <div className="flex-1 min-w-0 pr-4">
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">Style: {res.preset}</span>
                                <p className="text-white text-sm font-black truncate uppercase">{res.garmentName}</p>
                              </div>
                              <motion.a
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                href={res.imageUrl}
                                download={`vfit-${res.id}.png`}
                                className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/40"
                              >
                                <Download className="w-5 h-5" />
                              </motion.a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isProcessing && garments.length > results.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center p-8"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <ChevronRight className="w-5 h-5 text-white/20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Next item in queue</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating Action Button for Mobile Settings */}
      <motion.button
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        onClick={() => {
          const el = document.querySelector('section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="fixed bottom-6 right-6 lg:hidden w-16 h-16 bg-indigo-600 shadow-2xl rounded-3xl flex items-center justify-center text-white z-40"
      >
        <SlidersHorizontal className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default App;
