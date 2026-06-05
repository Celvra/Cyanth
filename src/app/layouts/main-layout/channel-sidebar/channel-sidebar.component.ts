// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Output,
  EventEmitter,
  signal,
  inject,
  HostListener,
  Renderer2,
  ViewChild,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import type { ElementRef, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { blogConfig } from '../../../core/config';
import { ThemeService } from '../../../core/services/theme.service';
import { TypewriterService } from '../../../core/services/typewriter.service';
import type { Locale } from '../../../core/services/i18n.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-channel-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, MatProgressSpinner],
  template: `
    <!-- Banner -->
    <div
      class="sidebar-banner"
      [class.banner-image]="config.banner.mode === 'image'"
      [class.banner-loaded]="bannerLoaded()"
      [style.background-image]="bannerLoaded() ? bannerBg() : 'none'"
      [style.background-position]="config.banner.mode === 'image' ? config.banner.imagePosition : null"
    >
      @if (config.banner.mode === 'image' && !bannerLoaded()) {
        <div class="banner-spinner-wrap">
          <mat-spinner diameter="28" />
        </div>
      }
      <div class="banner-overlay">
        <span class="banner-title">{{ config.site.title }}</span>
        <div class="banner-subtitle" #subtitleEl [class.visible]="!!typewriter.displayHtml()">
          <div class="subtitle-inner" [innerHTML]="typewriter.displayHtml()"></div>
        </div>
      </div>
    </div>

    <!-- Navigation channels -->
    <div class="sidebar-content custom-scrollbar">
      <div class="channel-group">
        <button class="group-header" (click)="infoExpanded.set(!infoExpanded())">
          <span class="material-symbols-outlined expand-icon" [class.expanded]="infoExpanded()"> expand_more </span>
          <span class="group-label">{{ 'nav.navigation' | t }}</span>
        </button>
        @if (infoExpanded()) {
          <div class="group-items">
            @for (channel of config.navChannels; track channel.id) {
              <a
                [routerLink]="channel.href"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: channel.href === '/' }"
                class="channel-item"
                (click)="navigate.emit()"
              >
                <span class="material-symbols-outlined item-icon">{{ channel.icon }}</span>
                <span class="item-label">{{ channel.label | t }}</span>
              </a>
            }
          </div>
        }
      </div>
    </div>

    <!-- Bottom user area -->
    <div class="sidebar-footer">
      <div class="user-info">
        <img
          [src]="config.profile.avatar"
          [alt]="config.profile.name"
          class="user-avatar avatar-breathing"
          (error)="onAvatarError($event)"
        />
        <div class="user-details">
          <span class="user-name">{{ config.profile.name }}</span>
          <span class="user-status">{{ config.profile.guestLabel }}</span>
        </div>
      </div>
      <div class="footer-actions">
        <div class="lang-wrapper">
          <button class="action-btn" (click)="toggleLangMenu($event)" [attr.aria-label]="'Switch language'">
            <span class="material-symbols-outlined">translate</span>
          </button>
        </div>
        <button class="action-btn" (click)="themeService.cycleDarkMode()" [attr.aria-label]="'theme.toggle' | t">
          <span class="material-symbols-outlined">
            {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .sidebar-banner {
      height: 120px;
      background-color: var(--md-sys-color-surface-container-high);
      background-image: linear-gradient(
        135deg,
        var(--md-sys-color-primary-container),
        var(--md-sys-color-tertiary-container)
      );
      background-size: cover;
      background-repeat: no-repeat;
      flex-shrink: 0;
      position: relative;
      border-radius: 0 var(--md-sys-shape-corner-large) 0 0;
      transition: background-color 0.8s var(--m3-easing-standard);
    }

    .sidebar-banner.banner-image {
      background-color: var(--md-sys-color-surface-container);
      opacity: 0;
      transition: opacity 0.4s var(--m3-easing-standard);
    }

    .sidebar-banner.banner-image.banner-loaded {
      opacity: 1;
    }

    .banner-spinner-wrap {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }

    .banner-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px 16px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.4));
    }

    .banner-image .banner-overlay {
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
    }

    .banner-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .banner-subtitle {
      font-size: 12px;
      line-height: 1.5;
      color: var(--md-sys-color-on-surface-variant);
      height: 0;
      opacity: 0;
      margin-top: 0;
      pointer-events: none;
      word-break: break-word;
      transition:
        height 0.3s var(--m3-easing-standard),
        opacity 0.3s var(--m3-easing-standard),
        margin-top 0.3s var(--m3-easing-standard);
    }

    .banner-subtitle.visible {
      opacity: 1;
      margin-top: 4px;
      pointer-events: auto;
    }

    .typewriter-cursor {
      animation: blink 0.8s step-end infinite;
      color: var(--md-sys-color-primary);
      font-weight: 300;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 16px;
    }

    .channel-group {
      margin-bottom: 4px;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 4px;
      width: 100%;
      padding: 6px 8px;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .group-header:hover {
      color: var(--md-sys-color-on-surface);
    }

    .expand-icon {
      font-size: 18px;
      transition: transform 0.2s var(--m3-easing-standard);
    }

    .expand-icon.expanded {
      transform: rotate(0deg);
    }

    .expand-icon:not(.expanded) {
      transform: rotate(-90deg);
    }

    .group-label {
      font-family: 'Google Sans Flex', 'Noto Sans SC', system-ui, sans-serif;
    }

    .group-items {
      animation: m3-slide-down 0.2s var(--m3-easing-standard) both;
    }

    .channel-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      margin: 2px 8px;
      border-radius: var(--md-sys-shape-corner-full);
      color: var(--md-sys-color-on-surface-variant);
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .channel-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .channel-item.active {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }

    .item-icon {
      font-size: 20px;
    }

    .item-label {
      font-size: 14px;
      font-weight: 500;
    }

    /* ─── Footer ──────────────────────────────────── */
    .sidebar-footer {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid var(--md-sys-color-outline-variant);
      overflow: visible;
      border-radius: 0 0 var(--md-sys-shape-corner-large) 0;
      transition: border-color 0.8s var(--m3-easing-standard);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding-left: 4px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
      animation: breathing 2s infinite;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-status {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--md-sys-shape-corner-full);
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      flex-shrink: 0;
    }

    .action-btn:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .action-btn .material-symbols-outlined {
      font-size: 20px;
    }

    .lang-wrapper {
      position: relative;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-full);
    }
  `,
})
export class ChannelSidebarComponent implements AfterViewInit {
  @Output() navigate = new EventEmitter<void>();
  @ViewChild('subtitleEl') subtitleEl!: ElementRef<HTMLElement>;

  config = blogConfig;
  bannerBg = (): string | null => {
    if (this.config.banner.mode === 'image' && this.config.banner.image) {
      return `url(${this.config.banner.image})`;
    }
    return null;
  };
  bannerLoaded = signal(false);
  infoExpanded = signal(true);
  langMenuOpen = signal(false);
  langMenuPos = signal({ x: 0, y: 0 });
  i18n = inject(I18nService);
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private langMenuEl: HTMLElement | null = null;
  themeService = inject(ThemeService);
  typewriter = inject(TypewriterService);

  constructor() {
    void this.typewriter.init();
    if (this.isBrowser && this.config.banner.mode === 'image' && this.config.banner.image) {
      const img = new Image();
      img.onload = () => {
        this.bannerLoaded.set(true);
        this.cdr.detectChanges();
      };
      img.onerror = () => {
        this.bannerLoaded.set(true); // hide spinner even on error
        this.cdr.detectChanges();
      };
      img.src = this.config.banner.image;
    } else if (this.config.banner.mode !== 'image') {
      this.bannerLoaded.set(true);
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    const el = this.subtitleEl.nativeElement;

    const updateHeight = (): void => {
      requestAnimationFrame(() => {
        const inner = el.querySelector<HTMLElement>('.subtitle-inner');
        if (!inner) {
          return;
        }
        const h = inner.scrollHeight;
        if (h > 0) {
          this.renderer.setStyle(el, 'height', `${h}px`);
        } else {
          this.renderer.removeStyle(el, 'height');
        }
      });
    };

    const observer = new MutationObserver(() => {
      updateHeight();
      this.cdr.detectChanges();
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });

    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.lang-wrapper') && !target.closest('.lang-menu')) {
      this.closeLangMenu();
    }
  }

  toggleLangMenu(e: Event): void {
    e.stopPropagation();
    if (this.langMenuOpen()) {
      this.closeLangMenu();
      return;
    }
    const btn = (e.target as HTMLElement).closest('button');
    if (!btn) {
      return;
    }
    const rect = btn.getBoundingClientRect();
    const menuW = 140;
    const menuH = 90;
    let x = rect.right - menuW;
    if (x + menuW > window.innerWidth - 8) {
      x = window.innerWidth - menuW - 8;
    }
    let y = rect.top - menuH;
    if (y < 8) {
      y = rect.bottom + 8;
    }
    this.langMenuPos.set({ x, y });
    this.langMenuOpen.set(true);
    this.createLangMenu();
  }

  private createLangMenu(): void {
    this.removeLangMenu();
    const el = this.renderer.createElement('div') as HTMLElement;
    el.className = 'lang-menu';
    el.style.cssText = `position:fixed;left:${this.langMenuPos().x}px;top:${this.langMenuPos().y}px;min-width:140px;padding:4px;background-color:var(--md-sys-color-surface-container);border-radius:var(--md-sys-shape-corner-small);box-shadow:var(--md-sys-elevation-level2);z-index:99999;animation:m3-scale-enter 0.15s var(--m3-easing-decelerate) both;transform-origin:bottom left;`;

    const zhBtn = this.renderer.createElement('button') as HTMLElement;
    zhBtn.className = 'lang-item' + (this.i18n.locale() === 'zh-CN' ? ' active' : '');
    zhBtn.innerHTML = '<span class="lang-flag">CN</span><span>简体中文</span>';
    zhBtn.onclick = () => {
      this.i18n.setLocale('zh-CN');
      this.closeLangMenu();
    };

    const enBtn = this.renderer.createElement('button') as HTMLElement;
    enBtn.className = 'lang-item' + (this.i18n.locale() === 'en-US' ? ' active' : '');
    enBtn.innerHTML = '<span class="lang-flag">EN</span><span>English</span>';
    enBtn.onclick = () => {
      this.i18n.setLocale('en-US');
      this.closeLangMenu();
    };

    this.renderer.appendChild(el, zhBtn);
    this.renderer.appendChild(el, enBtn);
    this.renderer.appendChild(document.body, el);
    this.langMenuEl = el;
  }

  private removeLangMenu(): void {
    if (this.langMenuEl) {
      this.langMenuEl.remove();
      this.langMenuEl = null;
    }
  }

  private closeLangMenu(): void {
    this.langMenuOpen.set(false);
    this.removeLangMenu();
  }

  setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
    this.closeLangMenu();
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
