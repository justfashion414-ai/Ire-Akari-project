import React, { useState, useEffect, useRef } from 'react';
import { Upload, RefreshCw, Palmtree } from 'lucide-react';

interface EditableImageProps {
  src?: string;
  alt?: string;
  className?: string;
  imageKey?: string;
  children?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  [key: string]: any; // Catch-all for any other native image attributes passed down
}

// Global cache for custom images to prevent duplicate network requests
let globalImagesCache: Record<string, string> | null = null;
let globalFetchPromise: Promise<Record<string, string>> | null = null;

// Helper to fetch custom images from server once and cache them
function fetchCustomImages(): Promise<Record<string, string>> {
  if (globalImagesCache) {
    return Promise.resolve(globalImagesCache);
  }
  if (globalFetchPromise) {
    return globalFetchPromise;
  }
  globalFetchPromise = fetch('/api/images')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .then((data) => {
      globalImagesCache = data;
      return data;
    })
    .catch((err) => {
      console.warn('Could not load custom images from server, falling back to local storage:', err);
      return {};
    });
  return globalFetchPromise;
}

// Helper to save image to server
async function saveImageToServer(key: string, base64: string | null) {
  if (globalImagesCache) {
    if (base64) {
      globalImagesCache[key] = base64;
    } else {
      delete globalImagesCache[key];
    }
  }
  try {
    await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, base64 }),
    });
  } catch (err) {
    console.error('Failed to persist image to server:', err);
  }
}

export default function EditableImage({ src = '', alt, className, imageKey, children, ...props }: EditableImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Use the custom key or fallback to default src
  const key = imageKey || src || 'logo-default';

  // Retrieve customized image from local storage first (instant load),
  // then check server-side persisted storage for permanent sync.
  useEffect(() => {
    if (!key) return;

    // 1. Check local storage for instant render
    const localStored = localStorage.getItem(`editable-image-${key}`);
    if (localStored) {
      setCurrentSrc(localStored);
    } else {
      setCurrentSrc(src || '');
    }

    // 2. Fetch server-side persisted images to keep in sync
    fetchCustomImages().then((serverImages) => {
      const serverStored = serverImages[key];
      if (serverStored) {
        if (serverStored !== localStored) {
          localStorage.setItem(`editable-image-${key}`, serverStored);
          setCurrentSrc(serverStored);
        }
      } else if (localStored) {
        // If it is in local storage but not on server (e.g., server restarted or first sync), upload it!
        saveImageToServer(key, localStored);
      }
    });
  }, [src, key]);

  // Synchronize dynamic updates across different instances of the same image in the tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `editable-image-${key}`) {
        setCurrentSrc(e.newValue || src || '');
      }
    };

    const handleLocalUpdate = (e: CustomEvent<{ key: string; value: string | null }>) => {
      if (e.detail.key === key) {
        setCurrentSrc(e.detail.value || src || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('editable-image-update' as any, handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('editable-image-update' as any, handleLocalUpdate);
    };
  }, [key, src]);

  // Convert uploaded image file to Base64 and store it
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        // Save locally
        localStorage.setItem(`editable-image-${key}`, base64);
        setCurrentSrc(base64);

        // Save to server (permanent code/system persistence)
        saveImageToServer(key, base64);

        // Notify other instances of the same image about the change
        window.dispatchEvent(
          new CustomEvent('editable-image-update', {
            detail: { key, value: base64 },
          })
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    localStorage.removeItem(`editable-image-${key}`);
    setCurrentSrc(src || '');

    // Reset on server
    saveImageToServer(key, null);

    window.dispatchEvent(
      new CustomEvent('editable-image-update', {
        detail: { key, value: null },
      })
    );
  };

  const isCustomized = currentSrc ? (src ? currentSrc !== src : true) : false;

  return (
    <div
      className="relative w-full h-full group/editable select-none overflow-hidden flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children && !isCustomized ? (
        <div className={className}>
          {children}
        </div>
      ) : (
        <img
          src={currentSrc || src}
          alt={alt}
          className={`${className || ''} transition-all duration-300`}
          {...props}
        />
      )}

      {/* Sleek, interactive upload overlay with brand logo */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover/editable:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 z-30 pointer-events-none group-hover/editable:pointer-events-auto">
        <div className="flex items-center gap-1.5 mb-1 bg-estate-secondary/90 px-2 py-1 rounded-full border border-white/10 shadow-sm scale-95">
          <Palmtree className="w-3.5 h-3.5 text-estate-accent" strokeWidth={3} />
          <span className="text-[9px] uppercase font-mono font-black text-white tracking-widest">
            Ire-Akari
          </span>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-estate-accent text-estate-secondary rounded-full hover:bg-estate-cream hover:text-estate-primary shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center border border-estate-accent"
          title="Upload image"
        >
          <Upload className="w-5 h-5 text-estate-secondary" strokeWidth={3} />
        </button>

        <span className="text-[10px] uppercase font-mono font-black text-white bg-estate-secondary/90 px-2 py-1 rounded border border-white/15 tracking-wider shadow-md">
          Upload Photo
        </span>

        {isCustomized && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 mt-1.5 px-2 py-1 bg-rose-500/85 hover:bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded transition-all duration-300 hover:scale-105 shadow cursor-pointer"
            title="Restore default"
          >
            <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Hidden input to receive user file upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden select-none pointer-events-none"
      />
    </div>
  );
}
