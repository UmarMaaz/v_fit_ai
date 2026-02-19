
import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ChevronsLeftRight } from 'lucide-react';

interface ComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const position = ((x - rect.left) / rect.width) * 100;

        setSliderPosition(Math.max(0, Math.min(100, position)));
    };

    const onMouseDown = () => setIsDragging(true);
    const onMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', onMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', onMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden cursor-ew-resize select-none border border-white/10"
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
        >
            {/* Target Image (After) */}
            <img
                src={afterImage}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Source Image (Before) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Slider Line & Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-xl flex items-center justify-center z-10"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center -translate-x-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                    <ChevronsLeftRight className="w-6 h-6 text-slate-900" />
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full pointer-events-none">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Original</span>
            </div>
            <div className="absolute top-4 right-4 bg-indigo-600/60 backdrop-blur-md px-3 py-1 rounded-full pointer-events-none">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">V-Fit AI</span>
            </div>
        </div>
    );
};

export default ComparisonSlider;
