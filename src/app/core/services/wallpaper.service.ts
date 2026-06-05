// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { sourceColorFromImage, hexFromArgb } from '@material/material-color-utilities';
import { ThemeService } from './theme.service';
import { blogConfig } from '../config';

const KEY_URL = 'blog-wallpaper-url';
const KEY_COLOR = 'blog-wallpaper-color';
const KEY_DATE = 'blog-wallpaper-date';
const KEY_SRC = 'blog-wallpaper-source';

@Injectable({ providedIn: 'root' })
export class WallpaperService {
  private isBrowser: boolean;
  private wallpaperUrl = signal<string | null>(null);
  private wallpaperSource = signal<string | null>(null);
  private loading = signal(false);
  private hidden = signal(false);

  readonly url = this.wallpaperUrl.asReadonly();
  readonly source = this.wallpaperSource.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly isHidden = this.hidden.asReadonly();

  private readonly theme = inject(ThemeService);

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  async loadWallpaper(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    const cached = this.getCached();
    if (cached) {
      this.wallpaperUrl.set(cached.url);
      this.wallpaperSource.set(cached.source);
      this.theme.setSeedColor(cached.color);
      this.renderBackground(cached.url);
      return;
    }

    this.loading.set(true);

    try {
      const target = blogConfig.theme.wallpaperApi;
      const fetchUrl = blogConfig.corsProxy ? `${blogConfig.corsProxy}/?url=${encodeURIComponent(target)}` : target;
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const sourceUrl = res.headers.get('X-Wallpaper-Source') ?? '';
      const blob = await res.blob();
      const img = await this.loadImageFromBlob(blob);
      const color = (await this.extractAccentColor(img)) ?? blogConfig.theme.defaultSeedColor;
      const dataUrl = this.compressImage(img);

      this.setCache(dataUrl, color, sourceUrl);
      this.wallpaperUrl.set(dataUrl);
      this.wallpaperSource.set(sourceUrl);
      this.theme.setSeedColor(color);
      this.renderBackground(dataUrl);
    } catch (e) {
      console.warn('Wallpaper load failed, using default theme:', e);
      this.theme.setSeedColor(blogConfig.theme.defaultSeedColor);
    } finally {
      this.loading.set(false);
      setTimeout(() => this.hidden.set(true), 500);
    }
  }

  refreshWallpaper(): void {
    if (!this.isBrowser) {
      return;
    }
    this.clearCache();
    void this.loadWallpaper();
  }

  private renderBackground(dataUrl: string): void {
    if (!this.isBrowser) {
      return;
    }
    const existing = document.getElementById('wallpaper-bg');
    if (existing) {
      existing.remove();
    }

    const isDark = this.theme.isDark();
    const blur = blogConfig.theme.backgroundBlur;
    const brightness = blogConfig.theme.backgroundBrightness;

    const bg = document.createElement('div');
    bg.id = 'wallpaper-bg';
    bg.setAttribute('aria-hidden', 'true');
    Object.assign(bg.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '-1',
      backgroundImage: `url(${dataUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: isDark ? `brightness(${brightness}) blur(${blur}px)` : `blur(${blur}px)`,
      transform: 'scale(1.1)',
      opacity: '0',
      transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
    });

    document.body.insertBefore(bg, document.body.firstChild);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bg.style.opacity = '1';
      });
    });
  }

  private getCached(): { url: string; color: string; source: string } | null {
    try {
      if (localStorage.getItem(KEY_DATE) !== this.today()) {
        return null;
      }
      const url = localStorage.getItem(KEY_URL);
      const color = localStorage.getItem(KEY_COLOR);
      const source = localStorage.getItem(KEY_SRC) ?? '';
      if (url && color) {
        return { url, color, source };
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  private setCache(url: string, color: string, source: string): void {
    try {
      localStorage.setItem(KEY_DATE, this.today());
      localStorage.setItem(KEY_URL, url);
      localStorage.setItem(KEY_COLOR, color);
      localStorage.setItem(KEY_SRC, source);
    } catch {
      /* ignore */
    }
  }

  private clearCache(): void {
    try {
      localStorage.removeItem(KEY_URL);
      localStorage.removeItem(KEY_COLOR);
      localStorage.removeItem(KEY_DATE);
      localStorage.removeItem(KEY_SRC);
    } catch {
      /* ignore */
    }
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private compressImage(img: HTMLImageElement): string {
    const MAX = 1920;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w > MAX || h > MAX) {
      const ratio = Math.min(MAX / w, MAX / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, w, h);
    }
    return canvas.toDataURL('image/jpeg', 0.7);
  }

  private async loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  private async extractAccentColor(img: HTMLImageElement): Promise<string | null> {
    try {
      const argb = await sourceColorFromImage(img);
      return hexFromArgb(argb);
    } catch {
      return null;
    }
  }
}
