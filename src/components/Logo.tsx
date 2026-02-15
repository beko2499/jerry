import type { FC } from 'react';

export const Logo: FC = () => {

    return (
        <div className="relative group flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
            <div className="relative z-10 p-2">
                {/* User Logo Image */}
                <img
                    src="/logo.png"
                    alt="Jerry Logo"
                    className="h-20 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] transform group-hover:scale-110 transition-transform duration-500 object-contain floating"
                />
            </div>
        </div>
    );
};
