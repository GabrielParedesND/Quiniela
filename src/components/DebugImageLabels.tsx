'use client';

import { useEffect, useState } from 'react';

/**
 * Debug overlay that adds floating labels to image spaces.
 * Only visible when NEXT_PUBLIC_DEBUG_LABELS=true
 * 
 * Usage: Add <DebugImageLabels /> anywhere in the layout.
 * It will scan the DOM for known image containers and add labels.
 */

const ENABLED = process.env.NEXT_PUBLIC_DEBUG_LABELS === 'true';

interface LabelConfig {
  selector: string;
  label: string;
  size: string;
  color: string;
}

const LABELS: LabelConfig[] = [
  // Navbar logo
  { selector: 'nav img[alt="Logo"]', label: '① Logo Principal\n96×96px', size: '96×96', color: '#3b82f6' },
  // Ad banner (dashboard)
  { selector: '#ad-container-main', label: '② Ad Banner Dashboard\n728×90px (IAB Leaderboard)', size: '728×90', color: '#ef4444' },
  // User card background
  { selector: '[class*="rounded-3xl"] img[aria-hidden="true"]', label: '④ Card Usuario (fondo)\n400×150px', size: '400×150', color: '#8b5cf6' },
  // Sponsor master
  { selector: '[alt="Patrocinador master"]', label: '⑥ Sponsor Master\n200×80px', size: '200×80', color: '#f59e0b' },
  // Ad banner (landing)
  { selector: '#ad-container-landing', label: '⑩ Ad Banner Landing\n728×90px (IAB Leaderboard)', size: '728×90', color: '#ef4444' },
  // Lateral left
  { selector: '#ad-container-lateral-left', label: '⑪ Lateral Izq.\n160×600px (Wide Skyscraper)', size: '160×600', color: '#ec4899' },
  // Lateral right
  { selector: '#ad-container-lateral-right', label: '⑫ Lateral Der.\n160×600px (Wide Skyscraper)', size: '160×600', color: '#ec4899' },
  // Footer logo
  { selector: 'footer img[alt="Logo"]', label: '① Logo Footer\n160w', size: '160w', color: '#3b82f6' },
  // Background image
  { selector: 'img[aria-hidden="true"][class*="fixed"]', label: '③ Fondo Pantalla\n1920×1080px', size: '1920×1080', color: '#10b981' },
];

export default function DebugImageLabels() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!ENABLED) return;
    setMounted(true);

    const addLabels = () => {
      // Remove existing labels
      document.querySelectorAll('[data-debug-label]').forEach(el => el.remove());

      for (const config of LABELS) {
        const elements = document.querySelectorAll(config.selector);
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const parent = htmlEl.parentElement;
          if (!parent) return;

          // Make parent relative if not already positioned
          const parentPos = getComputedStyle(parent).position;
          if (parentPos === 'static') {
            parent.style.position = 'relative';
          }

          const label = document.createElement('div');
          label.setAttribute('data-debug-label', 'true');
          label.style.cssText = `
            position: absolute;
            top: 4px;
            left: 4px;
            z-index: 9999;
            background: ${config.color};
            color: white;
            font-size: 9px;
            font-weight: 800;
            font-family: monospace;
            padding: 3px 6px;
            border-radius: 4px;
            white-space: pre-line;
            line-height: 1.3;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            max-width: 200px;
          `;
          label.textContent = config.label;

          // For fixed/absolute elements, add to the element itself
          const elPos = getComputedStyle(htmlEl).position;
          if (elPos === 'fixed' || elPos === 'absolute') {
            htmlEl.style.position = elPos; // keep original
            htmlEl.appendChild(label);
          } else {
            parent.appendChild(label);
          }
        });
      }
    };

    // Run after a delay to ensure DOM is ready
    const timer = setTimeout(addLabels, 1500);
    // Re-run on route changes
    const observer = new MutationObserver(() => {
      clearTimeout(rerunTimer);
      rerunTimer = setTimeout(addLabels, 500);
    });
    let rerunTimer: ReturnType<typeof setTimeout>;
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      clearTimeout(rerunTimer);
      observer.disconnect();
      document.querySelectorAll('[data-debug-label]').forEach(el => el.remove());
    };
  }, []);

  if (!ENABLED || !mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        zIndex: 99999,
        background: '#1e293b',
        color: '#f8fafc',
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '6px 10px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      🏷️ Debug Labels ON
    </div>
  );
}
