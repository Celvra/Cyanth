// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component, Output, EventEmitter, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { blogConfig } from '../../../core/config';
import { I18nService } from '../../../core/services/i18n.service';
import { SearchService } from '../../../core/services/search.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, TranslatePipe],
  template: `
    <header class="top-bar">
      <!-- Mobile hamburger -->
      <button class="icon-btn mobile-only" (click)="menuClick.emit()" [attr.aria-label]="'topbar.open_menu' | t">
        <span class="material-symbols-outlined">menu</span>
      </button>

      <!-- Channel name -->
      <div class="channel-name">
        <span class="material-symbols-outlined hashtag">tag</span>
        <span class="channel-label">{{ currentPageId() }}</span>
      </div>

      <!-- Spacer -->
      <div class="spacer"></div>

      <!-- Search (MD3 Search Bar) -->
      <div class="search-bar" [class.focused]="searchFocused()">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          type="text"
          class="search-input"
          [placeholder]="'topbar.search' | t"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          (focus)="searchFocused.set(true)"
          (blur)="searchFocused.set(false)"
        />
        @if (searchQuery()) {
          <button class="search-clear" (click)="clearSearch()" [attr.aria-label]="'topbar.clear_search' | t">
            <span class="material-symbols-outlined">close</span>
          </button>
        }
      </div>

      <!-- GitHub link -->
      @if (config.github.username) {
        <a
          class="icon-btn"
          [href]="'https://github.com/' + config.github.username"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
        </a>
      }

      <!-- RSS button -->
      <button class="icon-btn" (click)="rssDialogOpen.set(true)" aria-label="RSS">
        <span class="material-symbols-outlined">rss_feed</span>
      </button>

      <!-- Mobile member button -->
      <button class="icon-btn mobile-tablet-only" (click)="memberClick.emit()" [attr.aria-label]="'topbar.members' | t">
        <span class="material-symbols-outlined">people</span>
      </button>
    </header>

    <!-- RSS Dialog -->
    @if (rssDialogOpen()) {
      <div class="dialog-backdrop" (click)="closeRssDialog()">
        <div class="dialog" [class.closing]="rssDialogClosing()" (click)="$event.stopPropagation()">
          <div class="dialog-icon">
            <span class="material-symbols-outlined">rss_feed</span>
          </div>
          <h3 class="dialog-title">RSS</h3>
          <p class="dialog-desc">{{ 'topbar.rss_desc' | t }}</p>
          <div class="dialog-links">
            <div class="dialog-link-row">
              <span class="material-symbols-outlined link-icon">rss_feed</span>
              <a class="dialog-link" [href]="siteOrigin + '/feed.xml'" target="_blank" rel="noopener">feed.xml</a>
              <button class="link-copy" (click)="copyLink(siteOrigin + '/feed.xml')">
                <span class="material-symbols-outlined">content_copy</span>
              </button>
            </div>
            <div class="dialog-link-row">
              <span class="material-symbols-outlined link-icon">sitemap</span>
              <a class="dialog-link" [href]="siteOrigin + '/sitemap.xml'" target="_blank" rel="noopener">sitemap.xml</a>
              <button class="link-copy" (click)="copyLink(siteOrigin + '/sitemap.xml')">
                <span class="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          </div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn-confirm" (click)="closeRssDialog()">
              {{ 'topbar.cancel' | t }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .top-bar {
      display: flex;
      align-items: center;
      height: var(--layout-top-bar-height);
      padding: 0 16px;
      background-color: color-mix(in srgb, var(--md-sys-color-surface) 80%, transparent);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      flex-shrink: 0;
      gap: 8px;
      border-radius: 0 0 var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large);
      transition:
        background-color 0.8s var(--m3-easing-standard),
        border-color 0.8s var(--m3-easing-standard);
    }

    .channel-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .hashtag {
      font-size: 20px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .spacer {
      flex: 1;
    }

    /* ─── MD3 Search Bar ──────────────────────────── */
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 12px 0 16px;
      background-color: var(--md-sys-color-surface-container-high);
      border-radius: var(--md-sys-shape-corner-full);
      max-width: 280px;
      width: 100%;
      border: 2px solid transparent;
      transition: all 0.2s var(--m3-easing-standard);
    }

    .search-bar:hover {
      background-color: var(--md-sys-color-surface-container-highest);
    }

    .search-bar.focused {
      background-color: var(--md-sys-color-surface-container-highest);
      border-color: var(--md-sys-color-primary);
    }

    .search-icon {
      font-size: 20px;
      color: var(--md-sys-color-on-surface-variant);
      flex-shrink: 0;
      transition: color 0.2s var(--m3-easing-standard);
    }

    .search-bar.focused .search-icon {
      color: var(--md-sys-color-primary);
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface);
      font-size: 14px;
      font-family: inherit;
      outline: none;
      min-width: 0;
      line-height: 1;
    }

    .search-input::placeholder {
      color: var(--md-sys-color-on-surface-variant);
    }

    .search-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: var(--md-sys-shape-corner-full);
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
    }

    .search-clear:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 12%, transparent);
    }

    .search-clear .material-symbols-outlined {
      font-size: 18px;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--md-sys-shape-corner-full);
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      flex-shrink: 0;
    }

    .icon-btn:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .mobile-only {
      display: none;
    }
    .mobile-tablet-only {
      display: none;
    }

    @media (max-width: 767px) {
      .mobile-only {
        display: flex;
      }
      .mobile-tablet-only {
        display: flex;
      }
      .search-bar {
        display: none;
      }
    }

    @media (min-width: 768px) and (max-width: 1279px) {
      .mobile-tablet-only {
        display: flex;
      }
    }

    /* ─── RSS Dialog ──────────────────────────────── */
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: m3-fade-in 0.2s var(--m3-easing-standard) both;
    }
    .dialog {
      background-color: var(--md-sys-color-surface-container-high);
      border-radius: var(--md-sys-shape-corner-extra-large);
      padding: 24px;
      min-width: 280px;
      max-width: 400px;
      animation: m3-scale-enter 0.25s var(--m3-easing-decelerate) both;
    }
    .dialog.closing {
      animation: m3-scale-exit 0.2s var(--m3-easing-accelerate) both;
    }
    .dialog-icon {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    .dialog-icon .material-symbols-outlined {
      font-size: 24px;
      color: var(--md-sys-color-secondary);
    }
    .dialog-title {
      font-size: 24px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 16px;
      text-align: left;
    }

    @keyframes m3-scale-enter {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes m3-scale-exit {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.9);
      }
    }
    .dialog-desc {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0 0 16px;
      line-height: 1.5;
    }
    .dialog-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }
    .dialog-link-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: var(--md-sys-shape-corner-medium);
      background-color: var(--md-sys-color-surface-container);
    }
    .link-icon {
      font-size: 18px;
      color: var(--md-sys-color-on-surface-variant);
      flex-shrink: 0;
    }
    .dialog-link {
      flex: 1;
      font-size: 13px;
      color: var(--md-sys-color-primary);
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dialog-link:hover {
      text-decoration: underline;
    }
    .link-copy {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--md-sys-shape-corner-full);
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      flex-shrink: 0;
      transition: background-color 0.15s var(--m3-easing-standard);
    }
    .link-copy:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }
    .link-copy .material-symbols-outlined {
      font-size: 18px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .dialog-btn {
      height: 40px;
      padding: 0 24px;
      border: none;
      border-radius: var(--md-sys-shape-corner-full);
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.15s var(--m3-easing-standard);
    }
    .dialog-btn-confirm {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }
    .dialog-btn-confirm:hover {
      opacity: 0.9;
    }
  `,
})
export class TopBarComponent {
  @Output() menuClick = new EventEmitter<void>();
  @Output() memberClick = new EventEmitter<void>();

  config = blogConfig;
  i18n = inject(I18nService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get siteOrigin(): string {
    return this.isBrowser ? window.location.origin : this.config.site.siteURL;
  }
  private searchService = inject(SearchService);
  searchQuery = signal('');
  searchFocused = signal(false);
  rssDialogOpen = signal(false);
  rssDialogClosing = signal(false);

  currentPageId = signal('Home');

  closeRssDialog(): void {
    this.rssDialogClosing.set(true);
    setTimeout(() => {
      this.rssDialogOpen.set(false);
      this.rssDialogClosing.set(false);
    }, 200);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchService.setQuery(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchService.setQuery('');
  }

  copyLink(url: string): void {
    void navigator.clipboard.writeText(url);
  }
}
