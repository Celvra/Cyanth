// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { blogConfig } from '../../../core/config';
import footerHtml from '../../../../content/footer.html?raw';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (config.footer.enabled) {
      <footer class="site-footer">
        <span class="footer-text">{{ config.footer.text }}</span>
        @if (footerHtml) {
          <span class="footer-sep">·</span>
          <span class="footer-custom" [innerHTML]="footerHtml"></span>
        }
      </footer>
    }
  `,
  styles: `
    .site-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 12px 20px;
      font-size: 11px;
      color: var(--md-sys-color-outline);
      user-select: none;
    }

    .footer-text {
      opacity: 0.7;
    }

    .footer-sep {
      opacity: 0.4;
    }

    .footer-custom {
      opacity: 0.7;
    }
  `,
})
export class FooterComponent {
  config = blogConfig;
  footerHtml = footerHtml.trim();
}
