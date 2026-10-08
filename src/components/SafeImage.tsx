import React, { useState } from "react";
import { Compass } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = "",
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1E3A5F] via-[#18283E] to-[#141413] text-[#F8F7F4] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Compass className="w-8 h-8 text-amber-300/80 mb-2 shrink-0" />
        <span className="font-serif-display text-lg font-medium tracking-wide">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
