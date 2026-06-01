// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SchemeTonalSpot, Hct, argbFromHex, hexFromArgb } from '@material/material-color-utilities';
import { blogConfig } from '../config';

export type DarkMode = 'auto' | 'light' | 'dark';

const STORAGE_SEED = 'blog-theme-seed';
const STORAGE_DARK = 'blog-theme-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isBrowser: boolean;
  private currentSeed = signal(blogConfig.theme.defaultSeedColor);
  private darkMode = signal<DarkMode>(blogConfig.theme.defaultDarkMode);
  private _isDark = signal(false);

  readonly seedColor = this.currentSeed.asReadonly();
  readonly isDark = this._isDark.asReadonly();
  readonly mode = this.darkMode.asReadonly();

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    if (this.isBrowser) {
      this.darkMode.set(this.readDarkMode());
      this.initialize();
    }
  }

  private initialize(): void {
    const mode = this.darkMode();
    this._isDark.set(mode === 'auto' ? this.getSystemDark() : mode === 'dark');
    this.applyTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.darkMode() === 'auto') {
        this._isDark.set(e.matches);
        this.applyTheme();
      }
    });
  }

  setSeedColor(color: string): void {
    this.currentSeed.set(color);
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_SEED, color);
      } catch {
        /* ignore */
      }
    }
    this.applyTheme();
  }

  setDarkMode(mode: DarkMode): void {
    this.darkMode.set(mode);
    if (this.isBrowser) {
      try {
        if (mode === 'auto') {
          localStorage.removeItem(STORAGE_DARK);
        } else {
          localStorage.setItem(STORAGE_DARK, mode);
        }
      } catch {
        /* ignore */
      }
    }
    this._isDark.set(mode === 'auto' ? this.getSystemDark() : mode === 'dark');
    this.applyTheme();
  }

  cycleDarkMode(): void {
    const next: DarkMode = this._isDark() ? 'light' : 'dark';
    this.setDarkMode(next);
  }

  private applyTheme(): void {
    if (!this.isBrowser) {
      return;
    }
    const palette = this.generatePalette(this.currentSeed(), this._isDark());
    const root = document.documentElement;
    for (const [key, value] of Object.entries(palette)) {
      root.style.setProperty(key, value);
    }
    root.style.colorScheme = this._isDark() ? 'dark' : 'light';
  }

  private generatePalette(seedHex: string, isDark: boolean): Record<string, string> {
    const argb = argbFromHex(seedHex);
    const hct = Hct.fromInt(argb);
    const s = new SchemeTonalSpot(hct, isDark, 0);

    return {
      '--md-sys-color-primary': hexFromArgb(s.primary),
      '--md-sys-color-on-primary': hexFromArgb(s.onPrimary),
      '--md-sys-color-primary-container': hexFromArgb(s.primaryContainer),
      '--md-sys-color-on-primary-container': hexFromArgb(s.onPrimaryContainer),
      '--md-sys-color-secondary': hexFromArgb(s.secondary),
      '--md-sys-color-on-secondary': hexFromArgb(s.onSecondary),
      '--md-sys-color-secondary-container': hexFromArgb(s.secondaryContainer),
      '--md-sys-color-on-secondary-container': hexFromArgb(s.onSecondaryContainer),
      '--md-sys-color-tertiary': hexFromArgb(s.tertiary),
      '--md-sys-color-on-tertiary': hexFromArgb(s.onTertiary),
      '--md-sys-color-tertiary-container': hexFromArgb(s.tertiaryContainer),
      '--md-sys-color-on-tertiary-container': hexFromArgb(s.onTertiaryContainer),
      '--md-sys-color-error': hexFromArgb(s.error),
      '--md-sys-color-on-error': hexFromArgb(s.onError),
      '--md-sys-color-error-container': hexFromArgb(s.errorContainer),
      '--md-sys-color-on-error-container': hexFromArgb(s.onErrorContainer),
      '--md-sys-color-surface': hexFromArgb(s.surface),
      '--md-sys-color-on-surface': hexFromArgb(s.onSurface),
      '--md-sys-color-surface-variant': hexFromArgb(s.surfaceVariant),
      '--md-sys-color-on-surface-variant': hexFromArgb(s.onSurfaceVariant),
      '--md-sys-color-surface-container-lowest': hexFromArgb(s.surfaceContainerLowest),
      '--md-sys-color-surface-container-low': hexFromArgb(s.surfaceContainerLow),
      '--md-sys-color-surface-container': hexFromArgb(s.surfaceContainer),
      '--md-sys-color-surface-container-high': hexFromArgb(s.surfaceContainerHigh),
      '--md-sys-color-surface-container-highest': hexFromArgb(s.surfaceContainerHighest),
      '--md-sys-color-surface-dim': hexFromArgb(s.surfaceDim),
      '--md-sys-color-surface-bright': hexFromArgb(s.surfaceBright),
      '--md-sys-color-outline': hexFromArgb(s.outline),
      '--md-sys-color-outline-variant': hexFromArgb(s.outlineVariant),
      '--md-sys-color-inverse-surface': hexFromArgb(s.inverseSurface),
      '--md-sys-color-inverse-on-surface': hexFromArgb(s.inverseOnSurface),
      '--md-sys-color-inverse-primary': hexFromArgb(s.inversePrimary),
      '--md-sys-color-background': hexFromArgb(s.background),
      '--md-sys-color-on-background': hexFromArgb(s.onBackground),
      '--md-sys-color-shadow': hexFromArgb(s.shadow),
      '--md-sys-color-scrim': hexFromArgb(s.scrim),
      '--md-sys-color-surface-tint': hexFromArgb(s.surfaceTint),
    };
  }

  private readDarkMode(): DarkMode {
    try {
      const stored = localStorage.getItem(STORAGE_DARK);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      /* ignore */
    }
    return blogConfig.theme.defaultDarkMode;
  }

  private getSystemDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
