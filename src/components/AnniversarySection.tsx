import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Flower, Flower2, Sparkles, PartyPopper, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, Film } from 'lucide-react';
import EditableImage from './EditableImage';

const DEFAULT_ANNIVERSARY_PHOTOS = [
  { id: 'ann-1', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', caption: '30th Anniversary Dinner Gala & Fundraiser', category: 'Jubilee' },
  { id: 'ann-2', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', caption: 'Ire-Akari Annual Sports Day Carnival', category: 'Community' },
  { id: 'ann-3', url: 'https://images.unsplash.com/photo-1472653425572-fa511b1ea9be?auto=format&fit=crop&w=800&q=80', caption: 'Cultural Heritage & Traditional Dance Festival', category: 'Culture' },
  { id: 'ann-4', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', caption: 'Zone Two Botanical Tree-Planting Initiative', category: 'Greenery' },
  { id: 'ann-5', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80', caption: 'Grand Lantern Walk & Harmattan Festival', category: 'Festival' },
];

export default function AnniversarySection() {
  const anniversaryPhotos = DEFAULT_ANNIVERSARY_PHOTOS;

  const N = anniversaryPhotos.length;
  const [centerIndex, setCenterIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Video controller states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Autoplay handler with muted by default
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Start strictly muted by default for guaranteed autoplay
    video.muted = true;
    setIsMuted(true);
    
    video.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn("Muted autoplay failed or blocked. User action required to start video:", err);
        setIsPlaying(false);
      });
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Auto-play interval to move the images from left to right in a loop
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % N);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, N]);

  const handleNext = () => {
    setCenterIndex((prev) => (prev + 1) % N);
  };

  const handlePrev = () => {
    setCenterIndex((prev) => (prev - 1 + N) % N);
  };

  // Generate falling flowers/petals for celebration effect
  const fallingFlowers = Array.from({ length: 22 }).map((_, idx) => {
    const isFlower2 = idx % 2 === 0;
    const size = 16 + (idx % 3) * 8;
    const left = (idx * 4.7) % 100;
    const duration = 8 + (idx % 4) * 2;
    const delay = (idx % 5) * 1.8;
    const colors = [
      'text-estate-accent',
      'text-rose-400',
      'text-pink-400',
      'text-emerald-400',
      'text-amber-500'
    ];
    const color = colors[idx % colors.length];

    return {
      id: idx,
      isFlower2,
      size,
      left,
      duration,
      delay,
      color
    };
  });

  // Calculate coordinates and styling dynamically for each offset position
  const getCardStyles = (offset: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    switch (offset) {
      case 0: // Center slot: Bold, bigger, higher, fully active
        return {
          left: '50%',
          x: '-50%',
          scale: isMobile ? 1.1 : 1.25,
          y: isMobile ? -10 : -25, // Lifted higher
          opacity: 1,
          zIndex: 30,
          brightness: '100%',
        };
      case 1: // Left slot: Standard standing portrait, shifted left
        return {
          left: isMobile ? '12%' : '24%',
          x: '-50%',
          scale: isMobile ? 0.8 : 0.95,
          y: 0,
          opacity: 0.9,
          zIndex: 20,
          brightness: '75%',
        };
      case -1: // Right slot: Standard standing portrait, shifted right
        return {
          left: isMobile ? '88%' : '76%',
          x: '-50%',
          scale: isMobile ? 0.8 : 0.95,
          y: 0,
          opacity: 0.9,
          zIndex: 20,
          brightness: '75%',
        };
      case 2: // Offscreen left (Entering slot)
        return {
          left: isMobile ? '-25%' : '0%',
          x: '-50%',
          scale: 0.7,
          y: 20,
          opacity: 0,
          zIndex: 10,
          brightness: '50%',
        };
      case -2: // Offscreen right (Exiting slot)
        return {
          left: isMobile ? '125%' : '100%',
          x: '-50%',
          scale: 0.7,
          y: 20,
          opacity: 0,
          zIndex: 10,
          brightness: '50%',
        };
      default:
        return {
          left: '50%',
          x: '-50%',
          scale: 0.5,
          y: 50,
          opacity: 0,
          zIndex: 5,
          brightness: '30%',
        };
    }
  };

  return (
    <section 
      className="relative py-24 bg-estate-secondary text-white overflow-hidden border-y-4 border-estate-accent"
      id="estate-anniversary-section"
    >
      {/* Falling Flowers Celebration Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {fallingFlowers.map((f) => (
          <div
            key={f.id}
            className="animate-fall-sway opacity-0"
            style={{
              left: `${f.left}%`,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
            }}
          >
            {f.isFlower2 ? (
              <Flower2 
                className={`${f.color}`} 
                style={{ width: f.size, height: f.size }} 
                strokeWidth={2.5}
              />
            ) : (
              <Flower 
                className={`${f.color}`} 
                style={{ width: f.size, height: f.size }} 
                strokeWidth={2.5}
              />
            )}
          </div>
        ))}
      </div>

      {/* Decorative Golden Rays background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-estate-accent/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-30">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-estate-accent/20 border-2 border-estate-accent rounded-full text-estate-accent mb-4 animate-bounce">
            <PartyPopper className="w-5 h-5 text-estate-accent" strokeWidth={3} />
            <span className="text-xs font-mono font-black uppercase tracking-[0.2em]">30th Anniversary Jubilee</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight text-estate-cream mb-6">
            Three Decades of Legacy
          </h2>

          <p className="text-estate-clay text-base md:text-lg font-medium leading-relaxed">
            August marks the historic **30th Anniversary** of <span className="text-estate-accent font-black">Ire-Akari Estate</span>. Established in <span className="text-estate-accent font-black">1996</span>, our premium sanctuary celebrates 30 years of serene environments, good security, steady electricity, and strong return on investment.
          </p>
        </div>

        {/* Golden Frame Portrait Video Player */}
        <div className="flex flex-col items-center justify-center mb-16 relative z-30">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-estate-accent/10 border border-estate-accent/30 rounded-full text-estate-accent text-xs font-mono">
            <Film className="w-3.5 h-3.5 text-estate-accent animate-pulse" />
            <span>IRE-AKARI MEMORIAL DOCUMENTARY VIDEO</span>
          </div>
          
          <div className="relative w-full max-w-[300px] sm:max-w-[340px] aspect-[9/16] rounded-[24px] overflow-hidden border-4 border-estate-accent shadow-[0_0_40px_rgba(224,166,66,0.3)] bg-slate-950 group/video transition-all duration-300 hover:scale-[1.02]">
            {/* The Video Element */}
            <video
              ref={videoRef}
              src="https://res.cloudinary.com/qgvszym1/video/upload/v1784929959/Untitled_video_3_1_cafnet.mp4"
              className="w-full h-full object-cover cursor-pointer"
              loop
              playsInline
              muted
              onClick={togglePlay}
            />

            {/* Premium Overlay UI when hovered */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
              
              {/* Top Row: Video info / sound status */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <span className="text-[10px] uppercase font-mono tracking-wider bg-estate-accent text-estate-secondary font-black px-2.5 py-1 rounded shadow">
                  Anniversary
                </span>
                
                <button
                  onClick={toggleMute}
                  className="p-2 bg-estate-secondary/90 hover:bg-estate-accent text-white hover:text-estate-secondary rounded-full border border-white/10 shadow-lg cursor-pointer transition-all duration-300"
                  title={isMuted ? "Unmute sound" : "Mute sound"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" strokeWidth={2.5} />
                  ) : (
                    <Volume2 className="w-4 h-4 text-estate-accent animate-bounce" strokeWidth={2.5} />
                  )}
                </button>
              </div>

              {/* Center Play/Pause Overlay Action */}
              <div className="flex items-center justify-center pointer-events-auto">
                <button
                  onClick={togglePlay}
                  className="p-5 bg-estate-accent text-estate-secondary rounded-full hover:scale-110 hover:bg-white transition-all duration-300 shadow-2xl cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-estate-secondary text-estate-secondary" strokeWidth={3} />
                  ) : (
                    <Play className="w-6 h-6 fill-estate-secondary text-estate-secondary translate-x-0.5" strokeWidth={3} />
                  )}
                </button>
              </div>

              {/* Bottom Row: Info */}
              <div className="flex flex-col gap-1 text-left select-none pointer-events-none">
                <p className="text-white font-display font-black text-sm tracking-wide leading-tight">
                  Ire-Akari 30th Anniversary Video
                </p>
                <p className="text-[10px] font-mono text-estate-accent font-bold">
                  Documentary, Memories & Celebrations
                </p>
              </div>
            </div>

            {/* Smart Persistent Overlay badging (when NOT hovered) */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-auto block group-hover/video:hidden">
              <button
                onClick={toggleMute}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-estate-secondary/95 border border-white/10 rounded-full text-white text-[10px] font-mono font-black shadow-lg hover:bg-estate-accent hover:text-estate-secondary transition-all"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" strokeWidth={3} />
                    <span>TAP TO UNMUTE</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-estate-accent" strokeWidth={3} />
                    <span>AUDIO ON</span>
                  </>
                )}
              </button>
            </div>

            {/* Persistent pause cover state */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-15 pointer-events-none">
                <div className="p-4 bg-estate-secondary/90 border border-estate-accent rounded-full pointer-events-auto cursor-pointer hover:scale-105 transition-all" onClick={togglePlay}>
                  <Play className="w-8 h-8 text-estate-accent fill-estate-accent translate-x-0.5" strokeWidth={3} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3-Card Interactive Cinematic Carousel */}
        <div 
          className="relative w-full h-[480px] sm:h-[540px] md:h-[580px] bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-sm flex items-center justify-center select-none"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Edge Gradients for Cinematic fading */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-estate-secondary to-transparent z-15 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-estate-secondary to-transparent z-15 pointer-events-none" />

          {/* Canvas for rendering the 3 visible standing portraits */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {anniversaryPhotos.map((photo, index) => {
              // Calculate relative offset of card in loop
              let offset = (index - centerIndex) % N;
              if (offset > 2) offset -= N;
              if (offset < -2) offset += N;

              const style = getCardStyles(offset);

              return (
                <motion.div
                  key={photo.id}
                  style={{
                    position: 'absolute',
                    left: style.left,
                    x: style.x,
                    zIndex: style.zIndex,
                  }}
                  animate={{
                    scale: style.scale,
                    y: style.y,
                    opacity: style.opacity,
                    filter: `brightness(${style.brightness})`,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 140,
                    damping: 17,
                  }}
                  className={`w-[170px] sm:w-[210px] md:w-[260px] aspect-[9/16] sm:aspect-[2/3] rounded-2xl overflow-hidden bg-estate-clay shadow-2xl transition-all duration-500 border-4 cursor-pointer select-none ${
                    offset === 0 
                      ? 'border-estate-accent shadow-[0_25px_55px_rgba(224,166,66,0.4)]' 
                      : 'border-white/20 hover:border-white/50 shadow-md'
                  }`}
                  onClick={() => {
                    if (offset !== 0) {
                      setCenterIndex(index);
                    }
                  }}
                >
                  <div className="relative w-full h-full">
                    {/* Replaced standard img with EditableImage to support in-screen upload */}
                    <EditableImage
                      src={photo.url}
                      alt={photo.caption}
                      imageKey={`anniversary-${photo.id}`}
                      className="w-full h-full object-cover select-none"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    
                    {/* Elegant Vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                    
                    {/* Photo Title in Frame (only fully visible when active or hovered) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left z-10 pointer-events-none select-none">
                      <span className="text-[10px] uppercase tracking-widest text-estate-accent font-mono font-black mb-1 block">
                        {photo.category}
                      </span>
                      <p className="text-xs sm:text-sm font-black text-white leading-tight font-display line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Carousel Progress indicator dots */}
        <div className="flex justify-center gap-2.5 mt-6">
          {anniversaryPhotos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCenterIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === centerIndex ? 'w-8 bg-estate-accent' : 'w-2.5 bg-white/25 hover:bg-white/50'
              }`}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
