
import React from 'react';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProcessModal: React.FC<ProcessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Subject Anchoring Technology</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <i className="fa-solid fa-xmark text-slate-500 text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 rounded-2xl flex gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <i className="fa-solid fa-anchor text-white"></i>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">What is Subject Anchoring?</h3>
              <p className="text-sm text-indigo-800/80 leading-relaxed">
                Our AI uses specialized multi-part instructions to "anchor" your physical features, pose, and facial details while swapping clothing items in a high-fidelity latent space.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 border border-slate-200 rounded-xl">
              <i className="fa-solid fa-user-check text-indigo-500 mb-2"></i>
              <p className="font-medium">Maintains Identity</p>
              <p className="text-xs text-slate-500">Your face and features remain 100% consistent.</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl">
              <i className="fa-solid fa-person-walking text-indigo-500 mb-2"></i>
              <p className="font-medium">Pose Retention</p>
              <p className="text-xs text-slate-500">Keeps your exact body positioning.</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800 mb-2 text-sm uppercase tracking-wider">Tips for Success</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <i className="fa-solid fa-circle-check text-green-500 mt-1 shrink-0"></i>
                <span>Use clear, well-lit photos with a simple background.</span>
              </li>
              <li className="flex gap-2">
                <i className="fa-solid fa-circle-check text-green-500 mt-1 shrink-0"></i>
                <span>Avoid hands covering your clothing area.</span>
              </li>
              <li className="flex gap-2">
                <i className="fa-solid fa-circle-check text-green-500 mt-1 shrink-0"></i>
                <span>Garment photos should be flat-lays or high-contrast studio shots.</span>
              </li>
            </ul>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Got it, let's fit!
        </button>
      </div>
    </div>
  );
};

export default ProcessModal;
