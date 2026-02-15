import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Starfield from '@/components/Starfield';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { lang, t, isRTL, toggleLanguage } = useLanguage();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a1a]">
      {/* Background Image */}
      <Starfield
        starCount={2000}
        speed={0.1}
        backgroundColor="#0a0a1a"
      />


      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        {/* Language Switcher (Replaces Logo) */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="
              group relative overflow-hidden
              flex items-center gap-2 px-5 py-2.5
              bg-black/40 backdrop-blur-md
              border border-cyan-500/30
              rounded-full
              transition-all duration-300
              hover:border-cyan-400 hover:bg-cyan-500/10
              hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]
              active:scale-95
            "
          >
            <Globe className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-space font-bold text-cyan-400 text-sm tracking-widest group-hover:text-white transition-colors">
              {lang.toUpperCase()}
            </span>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </button>
        </div>


        {/* Brand Name (Right) - Hidden on Mobile */}
        <div className={`hidden md:block transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <Logo />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        {/* Hero Title */}
        <div className={`text-center transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className={`${isRTL ? 'font-arabic tracking-normal pb-4' : 'font-space tracking-wider'} text-7xl md:text-9xl lg:text-[10rem] font-black mb-8`}>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(123,44,191,0.6)] animate-gradient-x py-2">
              {t.hero}
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`flex items-center gap-3 mb-12 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <p className="font-body text-xl md:text-2xl text-white/90 tracking-wide">
            {t.subtitle}
          </p>
        </div>

        {/* CTA Button */}
        <div className={`transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Button
            onClick={onEnter}
            className="group relative px-12 py-7 text-lg font-space font-bold tracking-widest bg-transparent border-2 border-cyan-400/50 text-cyan-400 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400 rounded-full transition-all duration-500 pulse-glow"
          >
            <span className="relative z-10 flex items-center gap-3">
              {t.launch}
              {isRTL ? (
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              )}
            </span>
          </Button>
        </div>


      </main>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a1a] to-transparent" />
    </div>
  );
}