// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { blogConfig } from '../../../core/config';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TocService } from '../../../core/services/toc.service';
import { MusicPlayerComponent } from '../../../shared/components/music-player/music-player.component';
import type { Subscription } from 'rxjs';
import { filter } from 'rxjs';

@Component({
  selector: 'app-member-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MusicPlayerComponent],
  template: `
    <div class="member-sidebar custom-scrollbar">
      <!-- TOC Section (mobile only) -->
      @if (toc.headings().length > 0) {
        <div class="section toc-section">
          <h3 class="toc-header-sticky">
            <span class="material-symbols-outlined" style="font-size:18px">toc</span>
            {{ 'post.contents' | t }}
          </h3>
          <nav class="toc-list">
            @for (h of toc.headings(); track h.slug) {
              <button
                class="toc-item"
                [class.active]="toc.activeHeading() === h.slug"
                [style.padding-left.px]="(h.depth - 1) * 12 + 12"
                (click)="scrollToHeading(h.slug)"
              >
                @if (toc.activeHeading() === h.slug) {
                  <div class="toc-indicator"></div>
                }
                <span class="toc-text">{{ h.text }}</span>
              </button>
            }
          </nav>
          <div class="toc-footer">
            @if (config.comments.enabled) {
              <button class="toc-item toc-special" (click)="scrollToComments()">
                <span class="material-symbols-outlined toc-footer-icon">chat_bubble</span>
                <span class="toc-text">{{ 'post.comments' | t }}</span>
              </button>
            }
            <button class="toc-item toc-special" (click)="scrollToTop()">
              <span class="material-symbols-outlined toc-footer-icon">arrow_upward</span>
              <span class="toc-text">{{ 'post.back_to_top' | t }}</span>
            </button>
          </div>
        </div>
      }

      <!-- Music Player (hidden on post page) -->
      <div class="mobile-music-container" [class.hidden-on-post]="isPostPage()">
        <app-music-player />
      </div>

      <!-- Admin Section -->
      <div class="section">
        <h3 class="section-title">{{ 'member.admin' | t }} - 1</h3>
        <div class="member-item">
          <div class="member-avatar-wrapper">
            <img
              [src]="config.profile.avatar"
              [alt]="config.profile.name"
              class="member-avatar"
              (error)="onAvatarError($event)"
            />
          </div>
          <div class="member-info">
            <span class="member-name" style="color: var(--md-sys-color-error);">
              {{ config.profile.name }}
            </span>
            <span class="member-status">{{ config.profile.status }}</span>
          </div>
        </div>
      </div>

      <!-- Friends Section -->
      @if (config.friendLinks.length > 0) {
        <div class="section">
          <h3 class="section-title">{{ 'member.friends' | t }} - {{ config.friendLinks.length }}</h3>
          @for (friend of config.friendLinks; track friend.name) {
            <div class="member-item">
              @if (friend.link) {
                <a [href]="friend.link" target="_blank" rel="noopener noreferrer" class="member-link">
                  <div class="member-avatar-wrapper">
                    <img
                      [src]="friend.avatar"
                      [alt]="friend.name"
                      class="member-avatar"
                      (error)="onAvatarError($event)"
                    />
                  </div>
                  <div class="member-info">
                    <span class="member-name">{{ friend.name }}</span>
                    <span class="member-status">{{ friend.bio }}</span>
                  </div>
                </a>
              } @else {
                <div class="member-link">
                  <div class="member-avatar-wrapper">
                    <img
                      [src]="friend.avatar"
                      [alt]="friend.name"
                      class="member-avatar"
                      (error)="onAvatarError($event)"
                    />
                  </div>
                  <div class="member-info">
                    <span class="member-name">{{ friend.name }}</span>
                    <span class="member-status">{{ friend.bio }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Social Links Section -->
      @if (config.socialLinks.length > 0) {
        <div class="section">
          <h3 class="section-title">{{ 'member.links' | t }}</h3>
          @for (link of config.socialLinks; track link.platform) {
            <a [href]="link.url" target="_blank" rel="noopener noreferrer" class="social-item">
              <span class="material-symbols-outlined social-icon">{{ link.icon }}</span>
              <span class="social-label">{{ link.platform }}</span>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .member-sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      padding: 12px;
    }

    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 8px;
      padding: 0 8px;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 8px;
      border-radius: var(--md-sys-shape-corner-full);
      cursor: pointer;
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .member-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .member-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
      width: 100%;
    }

    .member-avatar-wrapper {
      flex-shrink: 0;
    }

    .member-avatar {
      width: 32px;
      height: 32px;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
    }

    .member-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .member-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .member-status {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .social-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: var(--md-sys-shape-corner-full);
      color: var(--md-sys-color-on-surface-variant);
      text-decoration: none;
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .social-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .social-icon {
      font-size: 20px;
    }

    .social-label {
      font-size: 14px;
      font-weight: 500;
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

    /* ─── TOC ────────────────────────────────────────── */
    .toc-section {
      display: none;
      flex-direction: column;
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      max-height: 40vh;
    }

    .toc-header-sticky {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 16px 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface-variant);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      flex-shrink: 0;
    }

    .toc-list {
      padding: 8px 0;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    .toc-item {
      display: block;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 6px 16px;
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      position: relative;
      font-family: inherit;
      border-radius: var(--md-sys-shape-corner-small);
      transition: all 0.15s var(--m3-easing-standard);
    }

    .toc-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .toc-item.active {
      color: var(--md-sys-color-on-surface);
      font-weight: 500;
    }

    .toc-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      border-radius: 0 var(--md-sys-shape-corner-full) var(--md-sys-shape-corner-full) 0;
      background-color: var(--md-sys-color-primary);
    }

    .toc-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .toc-footer {
      border-top: 1px solid var(--md-sys-color-outline-variant);
      padding: 4px 0;
      flex-shrink: 0;
    }

    .toc-special {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toc-footer-icon {
      font-size: 16px;
      color: var(--md-sys-color-primary);
    }

    .mobile-music-container {
      border-radius: var(--md-sys-shape-corner-large);
      overflow: hidden;
      flex-shrink: 0;
      opacity: 1;
      transition: opacity 0.3s var(--m3-easing-standard);
    }
    .mobile-music-container.hidden-on-post {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      transition:
        max-height 0.3s var(--m3-easing-standard),
        opacity 0.2s var(--m3-easing-standard);
    }

    @media (max-width: 1023px) {
      .toc-section {
        display: flex;
      }
      .mobile-music-container {
        margin-bottom: 16px;
      }
      .mobile-music-container.hidden-on-post {
        max-height: 800px;
        opacity: 1;
      }
    }
  `,
})
export class MemberSidebarComponent implements OnInit, OnDestroy {
  config = blogConfig;
  toc = inject(TocService);
  private router = inject(Router);
  private routerSub?: Subscription;

  isPostPage = signal(false);

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.checkRoute(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private checkRoute(url: string): void {
    const path = url.split('?')[0]?.split('#')[0] ?? '';
    const isPost = path.startsWith('/posts/');
    this.isPostPage.set(isPost);
    if (!isPost) {
      this.toc.headings.set([]);
      this.toc.activeHeading.set('');
    }
  }

  scrollToHeading(slug: string): void {
    const el = document.getElementById(slug);
    const c = document.getElementById('main-scroll-container');
    if (!el || !c) {
      return;
    }
    const top = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 80;
    c.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${slug}`);
  }

  scrollToComments(): void {
    const el = document.getElementById('comment-section');
    const c = document.getElementById('main-scroll-container');
    if (!el || !c) {
      return;
    }
    const top = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 80;
    c.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', '#comments');
  }

  scrollToTop(): void {
    const c = document.getElementById('main-scroll-container');
    if (!c) {
      return;
    }
    c.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
