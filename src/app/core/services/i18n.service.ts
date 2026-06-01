// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { zhCN } from '../i18n/zh-CN';
import { enUS } from '../i18n/en-US';
import { blogConfig } from '../config';

export type Locale = 'zh-CN' | 'en-US';

const STORAGE_KEY = 'blog-locale';
const locales: Record<Locale, Record<string, string>> = { 'zh-CN': zhCN, 'en-US': enUS };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private _locale = signal<Locale>(blogConfig.i18n.defaultLocale);
  readonly locale = this._locale.asReadonly();

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored) {
        this._locale.set(stored);
      }
    }
  }

  t(key: string): string {
    return locales[this._locale()][key] ?? locales['en-US'][key] ?? key;
  }

  setLocale(locale: Locale): void {
    this._locale.set(locale);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }

  cycleLocale(): void {
    const next: Locale = this._locale() === 'zh-CN' ? 'en-US' : 'zh-CN';
    this.setLocale(next);
  }
}
