"use client";

import React, { useState, useEffect, useRef } from "react";

interface RandomLetterSwapProps {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: {
    duration?: number;
    type?: string;
  };
  onClick?: () => void;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function RandomLetterSwap({
  label,
  className = "",
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring" },
  onClick,
}: RandomLetterSwapProps) {
  const [displayText, setDisplayText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRefs = useRef<(NodeJS.Timeout | number)[]>([]);

  const totalDuration = transition.duration || 0.6;

  const triggerSwap = () => {
    // Clear existing timers
    intervalRefs.current.forEach(clearTimeout);
    intervalRefs.current = [];

    const letters = label.split("");

    letters.forEach((char, index) => {
      if (char === " ") return;

      const delay = index * staggerDuration * 1000;
      const duration = (totalDuration * 1000) - delay;
      const stepTime = 40;
      const steps = Math.max(1, Math.floor(duration / stepTime));

      let step = 0;
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          step++;
          if (step >= steps) {
            clearInterval(interval);
            setDisplayText((prev) => {
              const arr = prev.split("");
              arr[index] = label[index];
              return arr.join("");
            });
          } else {
            const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
            setDisplayText((prev) => {
              const arr = prev.split("");
              arr[index] = randomChar;
              return arr.join("");
            });
          }
        }, stepTime);
      }, delay);

      intervalRefs.current.push(timer);
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    triggerSwap();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setDisplayText(label);
  };

  useEffect(() => {
    setDisplayText(label);
  }, [label]);

  return (
    <span
      className={`inline-block transition-colors duration-200 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {displayText}
    </span>
  );
}
