'use client';

import { useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';

/**
 * Applies a data-lang attribute to <html> whenever the language changes.
 * CSS in globals.css uses this to switch to Sarabun for Thai.
 */
export default function FontSwitcher() {
  const { lang } = useLocale();

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  return null;
}
