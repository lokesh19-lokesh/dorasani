import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

// Key assets to preload for application readiness
const ESSENTIAL_ASSETS = [
  '/assets/preloader/bg_temple_desktop.jpg',
  '/assets/preloader/bg_temple_mobile.jpg',
  '/assets/preloader/woman_standing_transparent.png',
  '/assets/preloader/woman_walking_transparent.png',
  '/assets/brand/dorasani_full_logo.png',
  '/assets/hero/desktop/h1.png',
  '/assets/hero/mobile/h1.png',
  '/assets/hero/ShopbyCategoryhomepage.png',
];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete, forceShow = false }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Weaving Sacred Threads...');
  const [isExiting, setIsExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bgDesktopRef = useRef<HTMLDivElement>(null);
  const bgMobileRef = useRef<HTMLDivElement>(null);
  const characterWrapRef = useRef<HTMLDivElement>(null);
  const womanWalkingRef = useRef<HTMLImageElement>(null);
  const womanStandingRef = useRef<HTMLImageElement>(null);
  const brandCardRef = useRef<HTMLDivElement>(null);
  const petalsContainerRef = useRef<HTMLDivElement>(null);
  const loadingBlockRef = useRef<HTMLDivElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const ambientTweenRef = useRef<gsap.core.Tween | null>(null);

  // Screen size detection
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Lock scroll while preloader is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Exit transition: Fade out preloader content first, then fade out solid background
  const handleExit = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    if (ambientTweenRef.current) {
      ambientTweenRef.current.kill();
    }

    if (containerRef.current) {
      const exitTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          if (onComplete) onComplete();
        },
      });

      // 1. Fade out card, character and loading bar cleanly
      exitTl.to([brandCardRef.current, characterWrapRef.current, loadingBlockRef.current, petalsContainerRef.current], {
        opacity: 0,
        y: -15,
        duration: 0.4,
        ease: 'power2.in',
      });

      // 2. Fade out the background to reveal homepage cleanly with zero text overlap
      exitTl.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      });
    } else {
      document.body.style.overflow = '';
      if (onComplete) onComplete();
    }
  }, [isExiting, onComplete]);

  // Asset preloading and progress coordination
  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = ESSENTIAL_ASSETS.length;
    let isCancelled = false;

    // Minimum display time for luxury cinematic immersion (2.5s)
    const startTime = Date.now();
    const minDuration = 2500;

    const updateStatus = (percent: number) => {
      if (percent < 35) {
        setStatusText('Weaving Sacred Threads...');
      } else if (percent < 70) {
        setStatusText('Adorning with Antique Gold Zari...');
      } else if (percent < 95) {
        setStatusText('Gathering Fragrant Temple Lotuses...');
      } else {
        setStatusText('Welcome to Divine Elegance');
      }
    };

    const handleAssetDone = () => {
      loadedCount++;
      const currentRaw = (loadedCount / totalAssets) * 100;
      
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(1, elapsed / minDuration);
      const computedProgress = Math.min(100, Math.round(Math.min(currentRaw, timeRatio * 100)));

      if (!isCancelled) {
        setProgress(computedProgress);
        updateStatus(computedProgress);
      }

      if (loadedCount >= totalAssets) {
        const remainingTime = Math.max(0, minDuration - (Date.now() - startTime));
        const isHoldMode = typeof window !== 'undefined' && window.location.search.includes('hold_preloader=1');

        setTimeout(() => {
          if (!isCancelled) {
            setProgress(100);
            updateStatus(100);
            if (!isHoldMode) {
              setTimeout(handleExit, 500);
            }
          }
        }, remainingTime);
      }
    };

    ESSENTIAL_ASSETS.forEach((src) => {
      const img = new Image();
      img.onload = handleAssetDone;
      img.onerror = handleAssetDone;
      img.src = src;
    });

    const failsafeTimeout = setTimeout(() => {
      if (!isCancelled) {
        setProgress(100);
        updateStatus(100);
        const isHoldMode = typeof window !== 'undefined' && window.location.search.includes('hold_preloader=1');
        if (!isHoldMode) {
          setTimeout(handleExit, 300);
        }
      }
    }, 5000);

    return () => {
      isCancelled = true;
      clearTimeout(failsafeTimeout);
    };
  }, [handleExit]);

  // GSAP Choreography
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (containerRef.current) {
        gsap.to(containerRef.current, { opacity: 1, duration: 0.3 });
      }
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      timelineRef.current = tl;

      // 1. Temple-background reveal
      tl.fromTo(
        [bgDesktopRef.current, bgMobileRef.current],
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1.0, duration: 1.4, ease: 'power2.out' }
      );

      // 2. Woman walking entrance from right side
      if (womanWalkingRef.current && womanStandingRef.current) {
        tl.fromTo(
          womanWalkingRef.current,
          { opacity: 0, x: isMobile ? 25 : 50, scale: 0.96 },
          { opacity: 1, x: 0, scale: 1, duration: 1.1, ease: 'power2.out' },
          '-=1.0'
        );

        // Crossfade to standing holding lotus bowl
        tl.to(
          womanWalkingRef.current,
          { opacity: 0, duration: 0.6, ease: 'power1.inOut' },
          '+=0.2'
        );
        tl.fromTo(
          womanStandingRef.current,
          { opacity: 0, scale: 0.99 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'power1.inOut' },
          '<'
        );

        // Gentle breathing animation on character
        ambientTweenRef.current = gsap.to(characterWrapRef.current, {
          y: -7,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      // 3. Royal Brand Card Reveal with high contrast
      if (brandCardRef.current) {
        tl.fromTo(
          brandCardRef.current,
          { opacity: 0, y: 20, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' },
          '-=1.2'
        );
      }

      // 4. Loading Bar Reveal
      if (loadingBlockRef.current) {
        tl.fromTo(
          loadingBlockRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.8'
        );
      }

      // 5. Floating Petals Animation
      if (petalsContainerRef.current) {
        const petals = petalsContainerRef.current.querySelectorAll('.petal');
        petals.forEach((petal, i) => {
          gsap.fromTo(
            petal,
            {
              y: -40,
              x: 'random(-20, 20)',
              opacity: 0,
              rotation: 'random(-45, 45)',
            },
            {
              y: '100vh',
              x: '+=random(-60, 60)',
              opacity: 'random(0.4, 0.85)',
              rotation: '+=random(180, 360)',
              duration: 'random(4.5, 7.5)',
              delay: i * 0.2,
              repeat: -1,
              ease: 'none',
            }
          );
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
      if (ambientTweenRef.current) ambientTweenRef.current.kill();
    };
  }, [isMobile]);

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Welcome to DORASANI"
      aria-modal="true"
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#FAF5EE] select-none pointer-events-auto"
      style={{ touchAction: 'none' }}
    >
      {/* ─── DESKTOP PANORAMIC TEMPLE BACKGROUND (Visible on >= 768px) ─── */}
      <div
        ref={bgDesktopRef}
        className="hidden md:block absolute inset-0 w-full h-full bg-[#FAF5EE]"
      >
        <img
          src="/assets/preloader/bg_temple_desktop.jpg"
          alt="DORASANI Sacred Temple Courtyard"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft, warm ambient vignettes to frame the artwork */}
        <div className="absolute inset-0 bg-radial-[at_30%_40%] from-transparent via-[#FAF5EE]/30 to-[#FAF5EE]/70 pointer-events-none" />
      </div>

      {/* ─── MOBILE VERTICAL PORTRAIT TEMPLE BACKGROUND (Visible on < 768px) ─── */}
      <div
        ref={bgMobileRef}
        className="block md:hidden absolute inset-0 w-full h-full bg-[#FAF5EE]"
      >
        <img
          src="/assets/preloader/bg_temple_mobile.jpg"
          alt="DORASANI Temple Corridor"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-radial-[at_50%_25%] from-transparent via-[#FAF5EE]/25 to-[#FAF5EE]/65 pointer-events-none" />
      </div>

      {/* ─── FLOATING LOTUS & ROSE PETAL PARTICLES ─── */}
      <div
        ref={petalsContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden z-20"
      >
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="petal absolute w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0"
            style={{
              left: `${(idx * 8.5 + 5) % 92}%`,
              top: '-5%',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-xs"
            >
              <path
                d="M12 2C8 6 4 11 4 16C4 19.5 7.5 22 12 22C16.5 22 20 19.5 20 16C20 11 16 6 12 2Z"
                fill={idx % 2 === 0 ? '#F472B6' : '#FB7185'}
                fillOpacity="0.8"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* ─── CHARACTER COMPOSITION (WOMAN IN PISTACHIO GREEN SILK SAREE) ─── */}
      <div
        ref={characterWrapRef}
        className={`absolute z-10 pointer-events-none ${
          isMobile
            ? 'inset-x-0 bottom-0 h-[68vh] flex items-end justify-center'
            : 'right-[3%] lg:right-[7%] xl:right-[11%] bottom-0 h-[88vh] max-h-[920px] aspect-[9/16] flex items-end'
        }`}
      >
        {/* Walking Pose */}
        <img
          ref={womanWalkingRef}
          src="/assets/preloader/woman_walking_transparent.png"
          alt="Graceful Woman in Pastel Pistachio Green Saree"
          className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-2xl"
        />

        {/* Standing Pose (Holding auspicious lotus urli bowl) */}
        <img
          ref={womanStandingRef}
          src="/assets/preloader/woman_standing_transparent.png"
          alt="Woman in Pastel Pistachio Green Silk Saree #D0E9C0"
          className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-2xl opacity-0"
        />
      </div>

      {/* ─── ROYAL BRAND WELCOME CARD (HIGH CONTRAST & CRYSTAL CLEAR READABILITY) ─── */}
      <div
        ref={brandCardRef}
        className={`absolute z-30 ${
          isMobile
            ? 'inset-x-4 top-5 sm:top-8 flex flex-col items-center'
            : 'left-[5%] lg:left-[8%] xl:left-[11%] top-1/2 -translate-y-[56%] max-w-[480px] lg:max-w-[530px]'
        }`}
      >
        {/* Luminous Parchment Card with Antique Gold Borders */}
        <div className="w-full bg-[#FAF5EE]/95 md:bg-[#FAF5EE]/92 backdrop-blur-md border border-[#D8C7B5] shadow-2xl rounded-2xl p-5 sm:p-7 lg:p-8 relative overflow-hidden">
          {/* Subtle Corner Accents */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C29336]/60" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C29336]/60" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C29336]/60" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C29336]/60" />

          {/* Authentic Dorasani Lotus Icon & Heritage Badge */}
          <div className="flex items-center gap-2.5 mb-2.5 justify-center md:justify-start">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-[#D8C7B5] shadow-xs flex items-center justify-center p-1.5 shrink-0">
              <svg
                viewBox="0 0 100 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-[#143D24]"
              >
                <path
                  d="M50 5C45 25 30 45 10 50C30 55 45 75 50 75C55 75 70 55 90 50C70 45 55 25 50 5Z"
                  fill="#143D24"
                />
                <path
                  d="M50 20C46 33 36 47 25 50C36 53 46 67 50 67C54 67 64 53 75 50C64 47 54 33 50 20Z"
                  fill="#C29336"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <div className="text-left">
              <span className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#C29336] uppercase font-serif">
                ESTD • SOUTH INDIA
              </span>
              <span className="block text-[9px] text-[#647268] tracking-wider uppercase">
                Royal Temple Weaves
              </span>
            </div>
          </div>

          {/* Welcome Greeting */}
          <p className="font-serif italic text-lg sm:text-xl lg:text-2xl text-[#285A3C] tracking-wide text-center md:text-left mt-1">
            Welcome to
          </p>

          {/* DORASANI Regal Title */}
          <h1 className="font-serif-royal font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-[#133820] leading-none tracking-[0.24em] mt-1 text-center md:text-left drop-shadow-xs">
            DORASANI
          </h1>

          {/* Tagline */}
          <p className="text-[10px] sm:text-[11px] lg:text-xs tracking-[0.22em] uppercase text-[#4A5A50] mt-2 font-medium text-center md:text-left">
            Where Heritage Meets Divine Elegance
          </p>

          {/* Antique Gold Flourish Divider */}
          <div className="flex items-center gap-2.5 my-3 sm:my-3.5 justify-center md:justify-start">
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-[#C29336] to-[#C29336]" />
            <span className="text-[#C29336] text-xs">❖</span>
            <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent via-[#C29336] to-[#C29336]" />
          </div>

          {/* Pastel Pistachio Saree Badge */}
          <div className="inline-flex items-center gap-2 bg-[#D0E9C0]/85 border border-[#BCD8AA] px-3 py-1 rounded-full text-[10px] sm:text-[11px] text-[#1A3B2B] shadow-2xs mx-auto md:mx-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D0E9C0] border border-[#1A3B2B]/40 shrink-0" />
            <span className="font-medium">Pastel Pistachio Silk Collection</span>
          </div>
        </div>
      </div>

      {/* ─── ELEGANT GOLDEN LOADING INDICATOR & CONTROLS ─── */}
      <div
        ref={loadingBlockRef}
        className="absolute inset-x-0 bottom-5 sm:bottom-7 lg:bottom-9 z-30 flex flex-col items-center justify-center px-6 pointer-events-none"
      >
        <div className="w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] bg-[#FAF5EE]/95 backdrop-blur-md border border-[#D8C7B5] shadow-lg rounded-full px-4 py-2 sm:px-5 sm:py-2.5 flex flex-col items-center gap-1.5">
          {/* Progress Bar Track */}
          <div className="w-full h-[4px] bg-[#E8DCCF] rounded-full overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#C29336] via-[#E2C475] to-[#C29336] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(194,147,54,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Label & Percentage Counter */}
          <div className="w-full flex items-center justify-between text-[10px] sm:text-[11.5px] text-[#18482C] font-serif tracking-wide">
            <span className="italic text-[#285A3C] font-medium truncate max-w-[80%]">
              {statusText}
            </span>
            <span className="font-semibold tabular-nums text-[#C29336]">
              {progress}%
            </span>
          </div>
        </div>

        {/* Skip Button for Accessibility */}
        <button
          onClick={handleExit}
          className="mt-2.5 text-[10.5px] sm:text-[11px] text-[#18482C]/85 hover:text-[#18482C] underline underline-offset-4 tracking-wider uppercase transition-colors pointer-events-auto cursor-pointer focus:outline-hidden font-medium"
          aria-label="Skip introduction"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
