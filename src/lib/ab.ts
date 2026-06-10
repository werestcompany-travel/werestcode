'use client';

/**
 * Lightweight A/B testing framework.
 *
 * Variant assignment is sticky per browser (localStorage) and reported to
 * GA4 as custom events, so results are analysed in GA4 (Explore → free-form,
 * segment by `exp_variant`). No backend or DB required.
 *
 * Usage:
 *   const variant = useExperiment('hero_cta_v1', ['control', 'urgent']);
 *   ...
 *   <button onClick={() => trackExperimentConversion('hero_cta_v1', 'search_clicked')}>
 *
 * Events sent to GA4:
 *   - `experiment_view`       { exp_id, exp_variant }   (once per session per experiment)
 *   - `experiment_conversion` { exp_id, exp_variant, exp_goal, value? }
 */

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

const STORAGE_PREFIX = 'werest_ab_';
const VIEWED_PREFIX  = 'werest_ab_viewed_';

/** Get (or assign) the sticky variant for an experiment. Client-side only. */
export function getVariant(experimentId: string, variants: string[], weights?: number[]): string {
  if (typeof window === 'undefined' || variants.length === 0) return variants[0] ?? 'control';

  const key = STORAGE_PREFIX + experimentId;
  const existing = localStorage.getItem(key);
  if (existing && variants.includes(existing)) return existing;

  // Weighted (or uniform) random assignment
  let chosen = variants[0];
  if (weights && weights.length === variants.length) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < variants.length; i++) {
      r -= weights[i];
      if (r <= 0) { chosen = variants[i]; break; }
    }
  } else {
    chosen = variants[Math.floor(Math.random() * variants.length)];
  }

  localStorage.setItem(key, chosen);
  return chosen;
}

/** Report that the user has seen the experiment surface (deduped per session). */
function reportView(experimentId: string, variant: string) {
  const seenKey = VIEWED_PREFIX + experimentId;
  if (sessionStorage.getItem(seenKey)) return;
  sessionStorage.setItem(seenKey, '1');
  trackEvent('experiment_view', { exp_id: experimentId, exp_variant: variant });
}

/**
 * React hook: returns the assigned variant for this browser.
 * Returns `variants[0]` (control) during SSR / first paint to avoid hydration
 * mismatch, then flips to the assigned variant after mount.
 */
export function useExperiment(experimentId: string, variants: string[], weights?: number[]): string {
  const [variant, setVariant] = useState(variants[0] ?? 'control');

  useEffect(() => {
    const v = getVariant(experimentId, variants, weights);
    setVariant(v);
    reportView(experimentId, v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  return variant;
}

/** Record a conversion for an experiment (e.g. 'search_clicked', 'booking_completed'). */
export function trackExperimentConversion(experimentId: string, goal: string, value?: number) {
  if (typeof window === 'undefined') return;
  const variant = localStorage.getItem(STORAGE_PREFIX + experimentId);
  if (!variant) return; // user was never enrolled
  trackEvent('experiment_conversion', {
    exp_id:      experimentId,
    exp_variant: variant,
    exp_goal:    goal,
    ...(value !== undefined ? { value } : {}),
  });
}
