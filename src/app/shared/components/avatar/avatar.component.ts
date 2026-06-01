// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src && !imgError) {
      <img [src]="src" [alt]="alt" class="avatar" [class.breathing]="breathing" (error)="imgError = true" />
    } @else {
      <div class="avatar-fallback" [class.breathing]="breathing">
        <svg viewBox="0 0 24 24" fill="currentColor" class="avatar-svg">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
          />
        </svg>
      </div>
    }
  `,
  styles: `
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
    }

    .avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: var(--md-sys-shape-corner-full);
      background-color: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface-variant);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar-svg {
      width: 100%;
      height: 100%;
    }

    .breathing {
      animation: breathing 2s infinite;
    }
  `,
})
export class AvatarComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() breathing = false;

  imgError = false;
}
