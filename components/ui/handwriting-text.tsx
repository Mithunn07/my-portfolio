"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Text that writes itself, then inks in. No dependencies.
 *
 * Three things make this behave like handwriting rather than like a fade:
 *
 * 1. The font is parsed from its raw TTF and the glyphs converted to paths. A web font
 * renders as filled shapes with no outline, so there is nothing to stroke and nothing
 * to animate — the conversion is what makes a pen stroke possible at all.
 *
 * 2. Every contour is its own <path>. An SVG dash pattern RESTARTS at each subpath, so a
 * single path holding the whole word cannot be drawn progressively: one long dash just
 * makes each letter fully present or fully absent. Splitting them and staggering the
 * delays is what produces a pen crossing the word left to right.
 *
 * 3. The weight comes from one filled copy of the entire word underneath, faded in as the
 * stroke finishes. The fill must be a single path: a counter — the hole in an `e` or
 * an `a` — is a separate contour, and it only reads as a hole when the fill rule sees
 * it together with the outer contour. Fill the split paths individually and every
 * letter becomes a blob.
 *
 * The glyph parsing is done by opentype.js, loaded from a CDN as a plain <script> at
 * first use rather than imported as a package. That keeps the component installable
 * anywhere with no dependency to add, and a <script> tag sidesteps the ESM/CJS interop
 * that a bundled import of this particular library tends to trip over. It is fetched once
 * per page and cached by the browser.
 *
 * If either the library or the font fails to load, the component renders the text as an
 * ordinary <span> — it degrades to plain text rather than to nothing.
 *
 * Colour comes from `currentColor`, so `className="text-emerald-600"` styles it.
 */

const OPENTYPE_CDN =
  "https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js";
const DEFAULT_FONT_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/shadowsintolight/ShadowsIntoLight.ttf";

export interface HandwritingTextProps {
  /** A single phrase to write. Ignored when `words` is given. */
  text?: string;
  /** Cycle through these, rewriting on each change. */
  words?: string[];
  /** Milliseconds each word is held before the next one starts. */
  interval?: number;
  /** URL of a .ttf or .otf. Must be CORS-readable; self-host for production. */
  fontUrl?: string;
  /** Seconds for the pen to cross the whole word. */
  duration?: number;
  /** Seconds before the pen starts. */
  delay?: number;
  /** Stroke weight, in units of a 100px em. */
  strokeWidth?: number;
  /** Ink the letters in once drawn. Set false to leave them as outlines. */
  fill?: boolean;
  /** CSS height of the rendered word; width follows the glyphs. */
  height?: string;
  className?: string;
}

type Geometry = {
  full: string;
  contours: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

// The library, loaded once per page.
let libPromise: Promise<any> | null = null;

function loadOpentype(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const existing = (window as any).opentype;
  if (existing) return Promise.resolve(existing);
  if (!libPromise) {
    libPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = OPENTYPE_CDN;
      script.async = true;
      script.onload = () => resolve((window as any).opentype);
      script.onerror = () => {
        libPromise = null;
        reject(new Error("Failed to load opentype.js"));
      };
      document.head.appendChild(script);
    });
  }
  return libPromise;
}

// Font cache by URL to avoid re-fetching across instances
const fontCache = new Map<string, any>();

function loadFont(url: string): Promise<any> {
  if (fontCache.has(url)) return Promise.resolve(fontCache.get(url)!);
  return loadOpentype().then(
    (ot) =>
      new Promise((resolve, reject) => {
        ot.load(url, (err: any, font: any) => {
          if (err || !font) reject(err || new Error("Font load failed"));
          else {
            fontCache.set(url, font);
            resolve(font);
          }
        });
      })
  );
}

export function HandwritingText({
  text = "✦ DEVELOPED AND BUILT BY MITHUN &",
  words,
  interval = 3000,
  fontUrl = DEFAULT_FONT_URL,
  duration = 2,
  delay = 0,
  strokeWidth = 1.8,
  fill = true,
  height = "25px",
  className = "",
}: HandwritingTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const currentText = words ? words[wordIndex % words.length] : text;
  const [geom, setGeom] = useState<Geometry | null>(null);
  const [injected, setInjected] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let active = true;
    loadFont(fontUrl)
      .then((font) => {
        if (!active) return;
        const fontSize = 100;
        const fontPath = font.getPath(currentText, 0, 0, fontSize);
        const bbox = fontPath.getBoundingBox();
        const fullD = fontPath.toPathData(3);
        const contours = fullD.split(/(?=[MZ])/).filter((c) => c.trim().length > 0);

        setGeom({
          full: fullD,
          contours,
          x: bbox.x1 - 5,
          y: bbox.y1 - 5,
          w: Math.ceil(bbox.x2 - bbox.x1 + 10),
          h: Math.ceil(bbox.y2 - bbox.y1 + 10),
        });
      })
      .catch(() => {
        if (active) setGeom(null);
      });

    return () => {
      active = false;
    };
  }, [currentText, fontUrl]);

  useEffect(() => {
    if (!words || words.length <= 1) return;
    const timer = setInterval(() => {
      setWordIndex((prev) => prev + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  useEffect(() => {
    if (!geom || !containerRef.current) return;
    setInjected(false);

    const svg = containerRef.current.querySelector("svg");
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll("path.contour-stroke")) as SVGPathElement[];
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      const contourDelay = delay + (i / Math.max(1, paths.length)) * (duration * 0.7);
      const contourDur = duration * 0.4;
      p.style.transition = `stroke-dashoffset ${contourDur}s cubic-bezier(0.4, 0, 0.2, 1) ${contourDelay}s`;
    });

    const frame = requestAnimationFrame(() => {
      paths.forEach((p) => {
        p.style.strokeDashoffset = "0";
      });
      setInjected(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [geom, duration, delay]);

  if (!geom) {
    return <span className={className}>{currentText}</span>;
  }

  return (
    <span
      ref={containerRef}
      className={`inline-block vertical-middle ${className}`}
      style={{ height }}
    >
      <svg
        viewBox={`${geom.x} ${geom.y} ${geom.w} ${geom.h}`}
        style={{ height: "100%", width: "auto", overflow: "visible" }}
      >
        {fill && (
          <path
            d={geom.full}
            fill="currentColor"
            style={{
              opacity: injected ? 1 : 0,
              transition: `opacity 0.6s ease-in ${delay + duration * 0.7}s`,
            }}
          />
        )}
        {geom.contours.map((c, idx) => (
          <path
            key={idx}
            d={c}
            className="contour-stroke"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </span>
  );
}
