import { FC } from 'react';

export const Logo: FC = () => {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl px-6 py-2">
                <h1 className="font-space text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                    JERRY
                </h1>
                {/* Glitch layers */}
                <h1 className="absolute top-0 left-0 w-full h-full font-space text-4xl font-black tracking-widest text-cyan-500 opacity-50 animate-glitch-1 mix-blend-screen pointer-events-none px-6 py-2" aria-hidden="true">
                    JERRY
                </h1>
                <h1 className="absolute top-0 left-0 w-full h-full font-space text-4xl font-black tracking-widest text-red-500 opacity-50 animate-glitch-2 mix-blend-screen pointer-events-none px-6 py-2" aria-hidden="true">
                    JERRY
                </h1>
            </div>
        </div>
    );
};
