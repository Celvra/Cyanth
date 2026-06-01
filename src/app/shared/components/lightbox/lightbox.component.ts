// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LightboxService } from '../../../core/services/lightbox.service';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lb.isOpen()) {
      <div class="lightbox-backdrop" (click)="lb.close()">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          @if (lb.loading()) {
            <div class="lightbox-spinner">
              <svg width="48" height="48" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="var(--md-sys-color-primary)"
                  stroke-width="4"
                  stroke-dasharray="90 150"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          }
          <img
            [src]="lb.imageSrc()"
            alt=""
            class="lightbox-image"
            [class.visible]="!lb.loading()"
            (load)="lb.loading.set(false)"
          />
          <button class="lightbox-close" (click)="lb.close()" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .lightbox-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background-color: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: m3-fade-in 0.3s var(--m3-easing-standard) both;
    }

    .lightbox-content {
      position: relative;
      max-width: 100vw;
      max-height: 100vh;
      cursor: default;
    }

    .lightbox-image {
      max-width: 100vw;
      max-height: 100vh;
      object-fit: contain;
      opacity: 0;
      transition: opacity 0.3s var(--m3-easing-standard);
    }

    .lightbox-image.visible {
      opacity: 1;
    }

    .lightbox-spinner {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lightbox-spinner svg {
      animation: spin 1.4s linear infinite;
    }

    .lightbox-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 48px;
      height: 48px;
      border-radius: var(--md-sys-shape-corner-full);
      border: none;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .lightbox-close:hover {
      background-color: rgba(0, 0, 0, 0.8);
    }
  `,
})
export class LightboxComponent {
  lb = inject(LightboxService);
}
