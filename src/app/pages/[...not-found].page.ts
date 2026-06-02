// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="not-found-page content-animate-enter">
      <div class="error-code">404</div>
      <h1 class="title">{{ 'notfound.title' | t }}</h1>
      <p class="subtitle">{{ 'notfound.message' | t }}</p>
      <div class="actions">
        <a routerLink="/" class="btn-filled">
          <span class="material-symbols-outlined">home</span>
          {{ 'notfound.back' | t }}
        </a>
        <button class="btn-tonal" (click)="location.back()">
          <span class="material-symbols-outlined">arrow_back</span>
          {{ 'notfound.goback' | t }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .not-found-page {
      max-width: 480px;
      padding: 80px 20px;
    }

    .error-code {
      font-size: 15vw;
      font-weight: 700;
      line-height: 1;
      color: var(--md-sys-color-primary);
      opacity: 0.15;
      margin-bottom: -8px;
      font-family: 'Google Sans Flex', sans-serif;
    }

    .title {
      font-size: 28px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-filled,
    .btn-tonal {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 24px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      border: none;
      font-family: inherit;
      transition: box-shadow 0.2s var(--m3-easing-standard);
    }

    .btn-filled .material-symbols-outlined,
    .btn-tonal .material-symbols-outlined {
      font-size: 18px;
    }

    .btn-filled {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    .btn-filled:hover {
      box-shadow: var(--md-sys-elevation-level1);
    }

    .btn-tonal {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }

    .btn-tonal:hover {
      box-shadow: var(--md-sys-elevation-level1);
    }
  `,
})
export default class NotFoundComponent {
  location = inject(Location);
}
