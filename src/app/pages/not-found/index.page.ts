// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="not-found-page content-animate-enter">
      <div class="not-found-content">
        <span class="material-symbols-outlined ghost-icon">sentiment_very_dissatisfied</span>
        <h1 class="title">{{ 'notfound.title' | t }}</h1>
        <p class="subtitle">{{ 'notfound.message' | t }}</p>
        <a routerLink="/" class="back-btn">
          <span class="material-symbols-outlined">home</span>
          {{ 'notfound.back' | t }}
        </a>
      </div>
    </div>
  `,
  styles: `
    .not-found-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .not-found-content {
      text-align: center;
    }

    .ghost-icon {
      font-size: 64px;
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 16px;
    }

    .title {
      font-size: 48px;
      font-weight: 700;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 16px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0 0 24px 0;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 24px;
      border-radius: var(--md-sys-shape-corner-full);
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: box-shadow 0.2s var(--m3-easing-standard);
    }

    .back-btn:hover {
      box-shadow: var(--md-sys-elevation-level1);
    }
  `,
})
export default class NotFoundComponent {}
