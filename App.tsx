
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, ImageData, FitStyle, GenerationResult } from './types';
import ImageUploader from './components/ImageUploader';
import ProcessModal from './components/ProcessModal';
import { generateFitting } from './geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('single');
  const [personImage, setPersonImage] = useState<ImageData | undefined>();
  const [garments, setGarments] = useState<ImageData[]>([]);
  const [fitStyle, setFitStyle] = useState<FitStyle>('Standard');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manage retry countdown timer
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
        window.location.reload(); // Refresh to ensure updated environment
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
      status: 'pending'
    }));
    setResults(newResults);

    // Run generations
    for (let i = 0; i < garments.length; i++) {
      try {
        const resultUrl = await generateFitting(
          personImage,
          garments[i],
          fitStyle,
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <i className="fa-solid fa-shirt text-white text-sm sm:text-base"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg sm:text-xl tracking-tight">V-Fit <span className="text-indigo-600">AI</span></h1>
            <p className="hidden sm:block text-[10px] uppercase font-bold text-slate-400 tracking-widest">Virtual Fitting Room</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <i className="fa-solid fa-circle-info"></i>
            How it works
          </button>
          <button
            onClick={handleSetupKey}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-key text-slate-400"></i>
            Setup API Key
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
          <section className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <i className="fa-solid fa-sliders text-indigo-500"></i>
              Fitting Settings
            </h2>

            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => { setMode('single'); clearInputs(); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'single' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Single Item
              </button>
              <button
                onClick={() => { setMode('batch'); clearInputs(); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'batch' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Catalog Mode
              </button>
            </div>

            <div className="space-y-6">
              <ImageUploader
                label="Step 1: Your Photo"
                description="Use a full-body or upper-body shot"
                onImageSelect={setPersonImage}
                currentImage={personImage}
              />

              <ImageUploader
                label={mode === 'single' ? "Step 2: Garment Image" : "Step 2: Add Garments"}
                description="Flat-lay or ghost mannequin preferred"
                onImageSelect={handleAddGarment}
                currentImage={mode === 'single' ? garments[0] : undefined}
              />

              {mode === 'batch' && garments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {garments.map((g, idx) => (
                    <div key={idx} className="relative group w-12 h-12">
                      <img src={`data:${g.mimeType};base64,${g.base64}`} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                      <button
                        onClick={() => setGarments(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100"
                      >
                        <i className="fa-solid fa-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-50">
                <label className="text-sm font-semibold text-slate-700 block mb-3">Fit & Drape Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Tight', 'Standard', 'Loose'] as FitStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setFitStyle(style)}
                      className={`
                        py-2 px-3 text-xs font-bold rounded-xl border transition-all
                        ${fitStyle === style ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}
                      `}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={isProcessing || !personImage || garments.length === 0}
                onClick={handleGenerate}
                className={`
                  w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                  ${isProcessing ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-[0.98]'}
                `}
              >
                {isProcessing ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Start Fitting
                  </>
                )}
              </button>
            </div>
          </section>

          {retryCountdown !== null && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-pulse">
                <i className="fa-solid fa-hourglass-half"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Rate limit reached</p>
                <p className="text-xs text-amber-700">Retrying automatically in {retryCountdown}s...</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <i className="fa-solid fa-circle-exclamation"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-red-800">Error</p>
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Results */}
        <div className="lg:col-span-8">
          {results.length === 0 && !isProcessing ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] h-[600px] flex flex-col items-center justify-center text-slate-400">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <i className="fa-solid fa-images text-4xl text-slate-200"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-600">Your results will appear here</h3>
              <p className="text-sm mt-2 max-w-xs text-center">Upload your photo and garments on the left to begin the magic of AI subject anchoring.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {results.map((res) => (
                <div key={res.id} className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 group">
                  <div className="aspect-[3/4] relative bg-slate-50">
                    {res.status === 'pending' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="relative">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <i className="fa-solid fa-scissors text-indigo-400 animate-bounce text-sm sm:text-base"></i>
                          </div>
                        </div>
                        <p className="mt-4 text-xs sm:text-sm font-bold text-indigo-600 animate-pulse text-center">Tailoring {res.garmentName}...</p>
                        <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Anchoring Subject</p>
                      </div>
                    ) : res.status === 'error' ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                        <i className="fa-solid fa-triangle-exclamation text-3xl sm:text-4xl text-red-300 mb-4"></i>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">Something went wrong</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-2">{res.errorMessage}</p>
                        <button
                          onClick={handleGenerate}
                          className="mt-4 sm:mt-6 text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700"
                        >
                          Retry Generation
                        </button>
                      </div>
                    ) : (
                      <>
                        <img
                          src={res.imageUrl}
                          alt="Fitting result"
                          className="w-full h-full object-cover transition-transform duration-700 sm:group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 backdrop-blur px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm">
                          <p className="text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">AI Fitting • {fitStyle}</p>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/60 to-transparent translate-y-4 sm:group-hover:translate-y-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                          <div className="flex justify-between items-center">
                            <p className="text-white text-xs sm:text-sm font-semibold truncate pr-4">{res.garmentName}</p>
                            <a
                              href={res.imageUrl}
                              download={`vfit-${res.id}.png`}
                              className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center text-slate-900 hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                              <i className="fa-solid fa-download text-sm sm:text-base"></i>
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && garments.length > results.length && (
                <div className="bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
                  <p className="text-slate-400 font-medium text-sm sm:text-base text-center px-4">Queueing next items...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating helper for mobile */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-white shadow-2xl rounded-2xl flex items-center justify-center border border-slate-100 z-50"
      >
        <i className="fa-solid fa-info text-indigo-600"></i>
      </button>
    </div>
  );
};

export default App;
