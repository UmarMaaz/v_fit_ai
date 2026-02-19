
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, X, UserCheck, Accessibility, CheckCircle2, Sparkles } from 'lucide-react';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProcessModal: React.FC<ProcessModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="magic-glass rounded-[2rem] w-full max-w-xl overflow-hidden relative"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic text-white flex items-center gap-3">
                    <Sparkles className="text-indigo-400 w-8 h-8" />
                    Generative Engine
                  </h2>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">Subject Anchoring Technology</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors">
                  <X className="text-white/40 w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-indigo-600/20 rounded-3xl border border-indigo-500/20">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/40">
                      <Anchor className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-indigo-100 uppercase tracking-widest text-xs mb-2">Advanced Anchoring</h3>
                      <p className="text-sm text-indigo-100/70 leading-relaxed font-medium">
                        Our AI processes your photo to "anchor" focal points—ensuring your physical identity and body pose remain 100% consistent while swapping clothing in a neural latent space.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-colors">
                    <UserCheck className="text-indigo-400 w-6 h-6 mb-3" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-white mb-1">Identity Lock</p>
                    <p className="text-[10px] text-white/40 font-bold leading-tight uppercase">Face and skin tone retention enabled.</p>
                  </div>
                  <div className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-colors">
                    <Accessibility className="text-indigo-400 w-6 h-6 mb-3" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-white mb-1">Pose Mapping</p>
                    <p className="text-[10px] text-white/40 font-bold leading-tight uppercase">Precise body limb alignment architecture.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h4 className="font-black text-white/40 mb-4 text-[10px] uppercase tracking-[0.3em]">Operational Guidelines</h4>
                  <ul className="space-y-3">
                    {[
                      "High-contrast studio-style garment shots perform best.",
                      "Avoid hands obscuring the primary torso/leg areas.",
                      "Neutral backgrounds increase anchoring precision."
                    ].map((tip, i) => (
                      <li key={i} className="flex gap-3 items-center">
                        <CheckCircle2 className="text-indigo-500 w-4 h-4 shrink-0" />
                        <span className="text-[11px] font-bold text-white/70 uppercase">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full mt-10 bg-white text-slate-900 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-50 transition-colors shadow-xl"
              >
                PROCEED TO SESSION
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProcessModal;
