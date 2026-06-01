// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, Input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { blogConfig } from '../../../core/config';

@Component({
  selector: 'app-comments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (enabled) {
      <section id="comment-section" class="comment-section">
        <div id="tcomment"></div>
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .comment-section {
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 24px;
      margin-top: 24px;
    }
  `,
})
export class CommentsComponent implements OnInit {
  @Input() url = '';

  enabled = blogConfig.comments.enabled;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    if (!this.isBrowser || !this.enabled || !this.url) {
      return;
    }
    const cfg = blogConfig.comments.twikoo;
    if (!cfg.envId) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.42/dist/twikoo.all.min.js';
    script.onload = () => {
      const w: Record<string, unknown> = window as unknown as Record<string, unknown>;
      // eslint-disable-next-line no-unused-vars
      const twikoo = w['twikoo'] as { init: (opts: Record<string, string>) => void } | undefined;
      twikoo?.init({
        envId: cfg.envId,
        el: '#tcomment',
        region: cfg.region || '',
        path: this.url,
      });
    };
    document.head.appendChild(script);
  }
}
