// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';
import { blogConfig } from '../config';

@Injectable({ providedIn: 'root' })
export class TypewriterService {
  private cfg = blogConfig.typewriter;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private sanitizer = inject(DomSanitizer);

  displayHtml = signal<SafeHtml>('');
  private pool: string[] = [];
  private currentIndex = 0;
  private charIndex = 0;
  private deleting = false;
  private started = false;

  async init(): Promise<void> {
    if (!this.isBrowser || this.started || !this.cfg.enabled) {
      return;
    }
    this.started = true;
    await this.buildPool();
    if (this.pool.length === 0) {
      return;
    }
    this.tick();
  }

  private async buildPool(): Promise<void> {
    this.pool = [...this.cfg.texts];

    if (this.cfg.api && this.cfg.apiFetchCount > 0) {
      try {
        const fetched = await Promise.allSettled(
          Array.from({ length: this.cfg.apiFetchCount }, async () => {
            const r = await fetch(this.cfg.api);
            return r.text();
          }),
        );
        for (const result of fetched) {
          if (result.status === 'fulfilled') {
            const text = result.value.trim();
            if (text) {
              this.pool.push(text);
            }
          }
        }
      } catch {
        /* ignore */
      }
    }

    // shuffle
    for (let i = this.pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = this.pool[i];
      const b = this.pool[j];
      if (a !== undefined && b !== undefined) {
        this.pool[i] = b;
        this.pool[j] = a;
      }
    }
  }

  private tick(): void {
    const current = this.pool[this.currentIndex] ?? '';

    if (!this.deleting) {
      this.charIndex++;
      this.render(current.slice(0, this.charIndex));

      if (this.charIndex >= current.length) {
        this.deleting = true;
        setTimeout(() => this.tick(), this.cfg.pauseDuration);
        return;
      }

      setTimeout(() => this.tick(), this.cfg.typingSpeed);
    } else {
      this.charIndex--;
      this.render(current.slice(0, this.charIndex));

      if (this.charIndex <= 0) {
        this.deleting = false;
        this.currentIndex = (this.currentIndex + 1) % this.pool.length;
        setTimeout(() => this.tick(), this.cfg.deletePause);
        return;
      }

      setTimeout(() => this.tick(), this.cfg.deletingSpeed);
    }
  }

  private render(text: string): void {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = escaped.replace(/\n/g, '<br>') + '<span class="typewriter-cursor">|</span>';
    this.displayHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }
}
