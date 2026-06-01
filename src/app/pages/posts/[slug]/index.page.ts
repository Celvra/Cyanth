// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnInit, OnDestroy } from '@angular/core';
import { Component, ChangeDetectionStrategy, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectContent, injectContentFiles, MarkdownComponent } from '@analogjs/content';
import type { PostFrontmatter } from '../../../core/models/post.model';
import { blogConfig } from '../../../core/config';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import type { TocHeading } from '../../../core/services/toc.service';
import { TocService } from '../../../core/services/toc.service';
import { MusicPlayerComponent } from '../../../shared/components/music-player/music-player.component';
import { CommentsComponent } from '../../../shared/components/comments/comments.component';
import { LightboxService } from '../../../core/services/lightbox.service';
import * as Prism from 'prismjs';

interface ContentPost {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

@Component({
  selector: 'app-post',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MarkdownComponent, RouterLink, TranslatePipe, MusicPlayerComponent, CommentsComponent],
  template: `
    @if (post(); as p) {
      <div class="reading-progress" [style.width.%]="readingProgress()"></div>
      <div class="post-layout content-animate-enter" [attr.data-slug]="p.slug">
        <div class="post-main">
          <a routerLink="/" class="back-link">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>{{ 'post.back' | t }}</span>
          </a>

          <article class="post-article">
            <header class="post-header">
              <img [src]="config.profile.avatar" alt="" class="post-avatar" />
              <div class="post-meta">
                <span class="post-author">{{ config.profile.name }}</span>
                <div class="post-meta-row">
                  @if (p.frontmatter.category) {
                    <span class="post-badge">{{ p.frontmatter.category }}</span>
                  }
                  <span class="post-date">{{ formatDate(p.frontmatter.published) }}</span>
                  <span class="post-date">&middot; {{ readingTime(p.content) }} {{ 'post.min_read' | t }}</span>
                </div>
              </div>
            </header>

            <h1 class="post-title">{{ p.frontmatter.title }}</h1>

            @if (p.frontmatter.description) {
              <p class="post-description">{{ p.frontmatter.description }}</p>
            }

            @if (p.frontmatter.cover) {
              <img [src]="p.frontmatter.cover" alt="" class="post-cover" />
            }

            <div class="prose" id="post-content">
              <analog-markdown [content]="p.content" />
            </div>

            @if (p.frontmatter.tags.length > 0) {
              <div class="post-footer">
                <span class="footer-label">{{ 'post.tags' | t }}</span>
                <div class="footer-tags">
                  @for (tag of p.frontmatter.tags; track tag) {
                    <a [routerLink]="'/tags/' + tag" class="chip">{{ tag }}</a>
                  }
                </div>
              </div>
            }
          </article>

          @if (config.copyright.enabled) {
            <div class="copyright-section">
              <div class="copyright-title">{{ p.frontmatter.title }}</div>
              <a class="copyright-url" [href]="postUrl()" target="_blank">{{ postUrl() }}</a>
              <div class="copyright-meta">
                <div class="copyright-field">
                  <span class="copyright-label">{{ 'copyright.author' | t }}</span>
                  <span class="copyright-value">{{ config.profile.name }}</span>
                </div>
                <div class="copyright-field">
                  <span class="copyright-label">{{ 'copyright.published' | t }}</span>
                  <span class="copyright-value">{{ formatDate(p.frontmatter.published) }}</span>
                </div>
                <div class="copyright-field">
                  <span class="copyright-label">{{ 'copyright.license' | t }}</span>
                  @if (config.copyright.licenseUrl) {
                    <a [href]="config.copyright.licenseUrl" target="_blank" class="copyright-license">{{
                      config.copyright.license
                    }}</a>
                  } @else {
                    <span class="copyright-value">{{ config.copyright.license }}</span>
                  }
                </div>
              </div>
              <span class="material-symbols-outlined copyright-icon">copyright</span>
            </div>
          }

          <nav class="post-nav">
            @if (prevPost(); as prev) {
              <a [routerLink]="'/posts/' + prev.slug" class="nav-card nav-prev">
                <div class="nav-direction">
                  <span class="material-symbols-outlined">arrow_back</span>
                  <span>{{ 'post.previous' | t }}</span>
                </div>
                <span class="nav-title">{{ prev.frontmatter.title }}</span>
              </a>
            }
            @if (nextPost(); as next) {
              <a [routerLink]="'/posts/' + next.slug" class="nav-card nav-next">
                <div class="nav-direction">
                  <span>{{ 'post.next' | t }}</span>
                  <span class="material-symbols-outlined">arrow_forward</span>
                </div>
                <span class="nav-title">{{ next.frontmatter.title }}</span>
              </a>
            }
          </nav>

          <app-comments [url]="postUrl()" />
        </div>

        @if (toc.headings().length > 0) {
          <aside class="right-sidebar">
            <div class="toc-sidebar">
              <div class="toc-header">
                <span class="material-symbols-outlined">toc</span>
                <span>{{ 'post.contents' | t }}</span>
              </div>
              <nav class="toc-list">
                @for (h of toc.headings(); track h.slug) {
                  <button
                    class="toc-item"
                    [class.active]="toc.activeHeading() === h.slug"
                    [style.padding-left.px]="(h.depth - 1) * 12 + 8"
                    [attr.data-slug]="h.slug"
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
                    <span class="material-symbols-outlined back-top-icon">chat_bubble</span>
                    <span class="toc-text">{{ 'post.comments' | t }}</span>
                  </button>
                }
                <button class="toc-item toc-special" (click)="scrollToTop()">
                  <span class="material-symbols-outlined back-top-icon">arrow_upward</span>
                  <span class="toc-text">{{ 'post.back_to_top' | t }}</span>
                </button>
              </div>
            </div>
            <div class="right-sidebar-player">
              <app-music-player />
            </div>
          </aside>
        }

        <!-- Mobile TOC drawer -->
        @if (toc.drawerOpen()) {
          <div class="mobile-toc-backdrop" (click)="toc.drawerOpen.set(false)"></div>
          <div class="mobile-toc-sheet">
            <div class="mobile-toc-header">
              <span>{{ 'post.contents' | t }}</span>
              <button class="mobile-toc-close" (click)="toc.drawerOpen.set(false)">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav class="mobile-toc-list">
              @for (h of toc.headings(); track h.slug) {
                <button
                  class="mobile-toc-item"
                  [class.active]="toc.activeHeading() === h.slug"
                  [style.padding-left.px]="(h.depth - 1) * 16 + 16"
                  (click)="scrollToHeading(h.slug); toc.drawerOpen.set(false)"
                >
                  <span>{{ h.text }}</span>
                </button>
              }
            </nav>
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .post-layout {
      display: flex;
      gap: 24px;
      max-width: 1100px;
      margin: 0 auto;
      position: relative;
    }

    .reading-progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background-color: var(--md-sys-color-primary);
      z-index: 1000;
      transition: width 0.1s linear;
      border-radius: 0 2px 2px 0;
    }

    .post-main {
      flex: 1;
      min-width: 0;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px 8px 12px;
      border-radius: var(--md-sys-shape-corner-full);
      color: var(--md-sys-color-primary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
      transition: background-color 0.15s var(--m3-easing-standard);
    }
    .back-link:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-primary) 12%, transparent);
    }
    .back-link .material-symbols-outlined {
      font-size: 20px;
    }

    .post-article {
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 32px;
      margin-bottom: 24px;
    }

    .post-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .post-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
      background: var(--md-sys-color-surface-container-highest);
    }
    .post-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .post-author {
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      font-size: 15px;
    }
    .post-meta-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .post-badge {
      padding: 2px 10px;
      border-radius: var(--md-sys-shape-corner-small);
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .post-date {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      white-space: nowrap;
    }

    .post-title {
      font-size: 32px;
      font-weight: 700;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 12px;
      line-height: 1.3;
    }

    .post-description {
      font-size: 16px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.6;
      margin: 0 0 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .post-cover {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      border-radius: var(--md-sys-shape-corner-medium);
      margin-bottom: 24px;
    }

    .post-footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--md-sys-color-outline-variant);
    }
    .footer-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .footer-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      height: 32px;
      padding: 0 16px;
      border-radius: var(--md-sys-shape-corner-small);
      border: 1px solid var(--md-sys-color-outline);
      color: var(--md-sys-color-on-surface-variant);
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.15s var(--m3-easing-standard);
    }
    .chip:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    /* ─── Copyright ────────────────────────────────────── */
    .copyright-section {
      position: relative;
      overflow: hidden;
      padding: 20px 24px;
      margin-bottom: 24px;
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
    }
    .copyright-title {
      font-weight: 700;
      font-size: 15px;
      color: color-mix(in srgb, var(--md-sys-color-on-surface) 75%, transparent);
      margin-bottom: 4px;
    }
    .copyright-url {
      display: block;
      font-size: 13px;
      color: var(--md-sys-color-primary);
      text-decoration: none;
      margin-bottom: 12px;
      word-break: break-all;
    }
    .copyright-url:hover {
      text-decoration: underline;
    }
    .copyright-meta {
      display: flex;
      gap: 24px;
    }
    .copyright-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .copyright-label {
      font-size: 12px;
      color: color-mix(in srgb, var(--md-sys-color-on-surface) 30%, transparent);
    }
    .copyright-value {
      font-size: 14px;
      color: color-mix(in srgb, var(--md-sys-color-on-surface) 75%, transparent);
    }
    .copyright-license {
      font-size: 14px;
      color: var(--md-sys-color-primary);
      text-decoration: none;
    }
    .copyright-license:hover {
      text-decoration: underline;
    }
    .copyright-icon {
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 120px;
      color: color-mix(in srgb, var(--md-sys-color-on-surface) 5%, transparent);
      pointer-events: none;
    }

    /* ─── Prev/Next ──────────────────────────────────── */
    .post-nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .nav-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px;
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      text-decoration: none;
      color: var(--md-sys-color-on-surface);
      transition: all 0.2s var(--m3-easing-standard);
      min-height: 80px;
      animation: nav-enter 0.3s var(--m3-easing-decelerate) both;
    }
    .nav-card:nth-child(2) {
      animation-delay: 0.08s;
    }
    .nav-card:hover {
      box-shadow: var(--md-sys-elevation-level1);
      background-color: var(--md-sys-color-surface-container-low);
    }
    .nav-next {
      text-align: right;
      align-items: flex-end;
    }
    .nav-direction {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
    }
    .nav-direction .material-symbols-outlined {
      font-size: 18px;
    }
    .nav-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--md-sys-color-primary);
      line-height: 1.4;
    }

    /* ─── TOC Sidebar ────────────────────────────────── */
    .right-sidebar {
      width: 240px;
      flex-shrink: 0;
      position: sticky;
      top: 24px;
      align-self: flex-start;
      height: calc(100vh - 48px);
      max-height: calc(100vh - 48px);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .toc-sidebar {
      flex-shrink: 0;
      max-height: 35vh;
    }
    .right-sidebar-player {
      flex: 1;
      min-height: 0;
    }

    .toc-sidebar {
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      display: flex;
      flex-direction: column;
      max-height: 35vh;
    }
    .toc-header {
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
    .toc-header .material-symbols-outlined {
      font-size: 18px;
    }
    .toc-list {
      padding: 8px 0;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
      scroll-behavior: smooth;
    }
    .toc-list::-webkit-scrollbar {
      width: 4px;
    }
    .toc-list::-webkit-scrollbar-track {
      background: transparent;
    }
    .toc-list::-webkit-scrollbar-thumb {
      background: var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-full);
    }
    .toc-list::-webkit-scrollbar {
      width: 4px;
    }
    .toc-list::-webkit-scrollbar-track {
      background: transparent;
    }
    .toc-list::-webkit-scrollbar-thumb {
      background: var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-full);
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
      transition: all 0.15s var(--m3-easing-standard);
      font-family: inherit;
      border-radius: var(--md-sys-shape-corner-small);
      scroll-margin-top: 8px;
    }
    .toc-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }
    .toc-item.active {
      color: var(--md-sys-color-primary);
      font-weight: 600;
      background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
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
      flex-shrink: 0;
      border-top: 1px solid var(--md-sys-color-outline-variant);
      padding: 4px 0;
    }
    .toc-special {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      font-family: inherit;
      font-size: 13px;
      border-radius: var(--md-sys-shape-corner-small);
      transition: background-color 0.15s var(--m3-easing-standard);
    }
    .toc-special:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }
    .toc-special:last-child {
      border-radius: 0 0 var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large);
    }
    .back-top-icon {
      font-size: 18px;
    }

    @media (max-width: 1023px) {
      .right-sidebar {
        display: none;
      }
      .post-article {
        padding: 24px;
      }
      .post-title {
        font-size: 26px;
      }
    }
    @media (max-width: 767px) {
      .post-article {
        padding: 16px;
      }
      .post-title {
        font-size: 22px;
      }
      .post-nav {
        grid-template-columns: 1fr;
      }
      .post-header {
        gap: 10px;
        margin-bottom: 16px;
      }
      .post-avatar {
        width: 36px;
        height: 36px;
      }
      .post-author {
        font-size: 14px;
      }
      .post-meta-row {
        gap: 6px;
      }
      .post-badge {
        font-size: 11px;
        padding: 1px 8px;
      }
      .post-date {
        font-size: 12px;
      }
    }

    /* ─── Mobile TOC ─────────────────────────────────── */
    .mobile-toc-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 200;
    }

    .mobile-toc-sheet {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 60vh;
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large) 0 0;
      z-index: 201;
      overflow-y: auto;
      animation: m3-enter 0.25s var(--m3-easing-decelerate) both;
    }

    .mobile-toc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      font-size: 15px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      position: sticky;
      top: 0;
      background: inherit;
    }

    .mobile-toc-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--md-sys-shape-corner-full);
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
    }

    .mobile-toc-list {
      padding: 8px 0 16px;
    }

    .mobile-toc-item {
      display: block;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 10px 16px;
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      font-family: inherit;
      transition: background-color 0.15s;
    }

    .mobile-toc-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .mobile-toc-item.active {
      color: var(--md-sys-color-primary);
      font-weight: 500;
    }

    @media (max-width: 1023px) {
      .mobile-toc-backdrop {
        display: block;
      }
      .mobile-toc-sheet {
        display: block;
      }
    }

    .comment-container {
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 24px;
    }

    @keyframes nav-enter {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export default class PostComponent implements OnInit, OnDestroy {
  config = blogConfig;
  toc = inject(TocService);
  private lightbox = inject(LightboxService);

  private isBrowser: boolean;
  private observer: IntersectionObserver | null = null;
  private _isScrolling = false;

  private _contentFile = toSignal(injectContent<PostFrontmatter>({ param: 'slug', subdirectory: 'articles' }));

  private _allPosts = injectContentFiles<PostFrontmatter>()
    .map(
      f =>
        ({
          slug: f.slug || (f.filename.replace(/\.md$/, '').split('/').pop() ?? ''),
          frontmatter: f.attributes,
          content: f.content ?? '',
        }) as ContentPost,
    )
    .filter(p => !p.frontmatter.draft)
    .sort((a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime());

  post = computed(() => {
    const cf = this._contentFile();
    if (!cf) {
      return null;
    }
    return {
      slug: cf.slug || (this.isBrowser ? (window.location.pathname.split('/').filter(Boolean).pop() ?? '') : ''),
      frontmatter: cf.attributes as PostFrontmatter,
      content: String(cf.content ?? ''),
    };
  });

  readingProgress = signal(0);

  postUrl = computed(() => {
    const p = this.post();
    if (!p) {
      return '';
    }
    return this.config.site.siteURL + '/posts/' + p.slug;
  });

  prevPost = computed(() => {
    const p = this.post();
    if (!p) {
      return null;
    }
    const idx = this._allPosts.findIndex(x => x.slug === p.slug);
    return idx > 0 ? (this._allPosts[idx - 1] ?? null) : null;
  });

  nextPost = computed(() => {
    const p = this.post();
    if (!p) {
      return null;
    }
    const idx = this._allPosts.findIndex(x => x.slug === p.slug);
    return idx < this._allPosts.length - 1 ? (this._allPosts[idx + 1] ?? null) : null;
  });

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    effect(() => {
      const p = this.post();
      if (p) {
        this.toc.headings.set(this.extractHeadings(p.content));
      }
    });

    // Re-trigger animation when post slug changes
    effect(() => {
      const slug = this.post()?.slug;
      if (slug && this.isBrowser) {
        // Reset scroll position immediately when slug changes
        const container = document.getElementById('main-scroll-container');
        if (container) {
          container.scrollTop = 0;
        }

        setTimeout(() => {
          const el = document.querySelector('.post-layout') as HTMLElement;
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- querySelector can return null
          if (!el) {
            return;
          }

          el.style.transition = 'none';
          el.style.opacity = '0';
          el.style.transform = 'translateY(12px)';

          // Force layout recalculation
          void el.offsetWidth;

          requestAnimationFrame(() => {
            el.style.transition =
              'opacity 0.4s var(--m3-easing-decelerate), transform 0.4s var(--m3-easing-decelerate)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';

            setTimeout(() => {
              el.style.transition = '';
              el.style.opacity = '';
              el.style.transform = '';
              this.injectCopyButtons();
              Prism.highlightAll();

              // Reset TOC active state
              this.setupObserver();
              const h = this.toc.headings();
              const first = h[0];
              if (first) {
                this.toc.activeHeading.set(first.slug);
              }
            }, 400);
          });
        }, 50);
      }
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    setTimeout(() => {
      this.setupObserver();

      const container = document.getElementById('main-scroll-container');
      if (container) {
        container.addEventListener('scroll', this.onScroll);
      }

      this.injectCopyButtons();
    }, 100);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (!this.isBrowser) {
      return;
    }
    const c = document.getElementById('main-scroll-container');
    if (c) {
      c.removeEventListener('scroll', this.onScroll);
    }
  }

  private onScroll = (): void => {
    const c = document.getElementById('main-scroll-container');
    if (!c) {
      return;
    }
    const v = c.scrollTop / Math.max(1, c.scrollHeight - c.clientHeight);
    this.readingProgress.set(Math.min(100, Math.max(0, v * 100)));

    if (this._isScrolling) {
      return;
    }

    const h = this.toc.headings();
    const firstH = h[0];
    if (!firstH) {
      return;
    }

    // Determine active heading by checking which one is closest to top
    let newActive = firstH.slug;

    // If at the very top, always activate first heading
    if (c.scrollTop <= 10) {
      newActive = firstH.slug;
    } else {
      for (const heading of h) {
        const el = document.getElementById(heading.slug);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            newActive = heading.slug;
          }
        }
      }
    }

    if (this.toc.activeHeading() !== newActive) {
      this.toc.activeHeading.set(newActive);
      this.scrollTocToActive();
    }

    const lastH = h[h.length - 1];
    if (c.scrollTop + c.clientHeight >= c.scrollHeight - 100 && lastH) {
      this.toc.activeHeading.set(lastH.slug);
      this.scrollTocToActive();
    }
  };

  private scrollTocToActive(): void {
    // Wait for Angular to render the .active class
    setTimeout(() => {
      const activeItem = document.querySelector('.toc-sidebar .toc-item.active') as HTMLElement;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- querySelector can return null
      if (!activeItem) {
        return;
      }

      activeItem.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }, 50);
  }

  scrollToHeading(slug: string): void {
    const el = document.getElementById(slug);
    const c = document.getElementById('main-scroll-container');
    if (!el || !c) {
      return;
    }
    this.toc.activeHeading.set(slug);
    this._isScrolling = true;
    const top = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 80;
    c.scrollTo({ top, behavior: 'smooth' });
    setTimeout(() => {
      this._isScrolling = false;
    }, 800);
  }

  scrollToTop(): void {
    const c = document.getElementById('main-scroll-container');
    if (!c) {
      return;
    }
    this._isScrolling = true;
    this.toc.activeHeading.set(this.toc.headings()[0]?.slug ?? '');
    c.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      this._isScrolling = false;
    }, 800);
  }

  scrollToComments(): void {
    const el = document.getElementById('comment-section');
    const c = document.getElementById('main-scroll-container');
    if (!el || !c) {
      return;
    }
    this._isScrolling = true;
    const top = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 80;
    c.scrollTo({ top, behavior: 'smooth' });
    setTimeout(() => {
      this._isScrolling = false;
    }, 800);
  }

  formatDate(d: string): string {
    if (!d) {
      return '';
    }
    const dt = new Date(d);
    if (isNaN(dt.getTime())) {
      return d;
    }
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  readingTime(content: string): number {
    if (!content) {
      return 1;
    }
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  private extractHeadings(html: string): TocHeading[] {
    const r: TocHeading[] = [];
    const re = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const depth = m[1];
      const slug = m[2];
      const raw = m[3];
      if (!depth || !slug || raw === undefined) {
        continue;
      }
      const text = raw
        .replace(/<[^>]*>/g, '')
        .replace(/#$/, '')
        .trim();
      if (text) {
        r.push({ depth: +depth, text, slug });
      }
    }
    return r;
  }

  private setupObserver(): void {
    if (!this.isBrowser) {
      return;
    }
    this.observer?.disconnect();

    setTimeout(() => {
      const c = document.getElementById('main-scroll-container');
      if (!c) {
        return;
      }
      this.observer = new IntersectionObserver(
        entries => {
          if (this._isScrolling) {
            return;
          }
          for (const e of entries) {
            if (e.isIntersecting) {
              this.toc.activeHeading.set(e.target.id);
              this.scrollTocToActive();
            }
          }
        },
        { root: c, rootMargin: '-80px 0px -40% 0px', threshold: 0 },
      );

      for (const h of this.toc.headings()) {
        const el = document.getElementById(h.slug);
        if (el) {
          this.observer.observe(el);
        }
      }
    }, 100);
  }

  private injectCopyButtons(): void {
    const pres = document.querySelectorAll('.prose pre');
    pres.forEach(pre => {
      const preEl = pre as HTMLElement;
      if (!preEl.querySelector('.code-copy-btn')) {
        const btn = document.createElement('button');
        btn.className = 'code-copy-btn';
        btn.setAttribute('aria-label', 'Copy code');
        btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
        btn.addEventListener('click', () => {
          const code = preEl.querySelector('code');
          if (code) {
            void navigator.clipboard.writeText(code.textContent ?? '').then(() => {
              btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
              btn.classList.add('copied');
              setTimeout(() => {
                btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
                btn.classList.remove('copied');
              }, 2000);
            });
          }
        });
        preEl.appendChild(btn);
      }

      const code = preEl.querySelector('code');
      if (code && !code.className.includes('language-') && code.className.includes('hljs')) {
        return;
      }
      if (code && !code.className.includes('language-')) {
        code.classList.add('language-none');
      }
    });

    try {
      Prism.highlightAll();
    } catch (e) {
      console.error('Prism highlighting failed:', e);
    }

    const imgs = document.querySelectorAll('.prose img');
    imgs.forEach(img => {
      const el = img as HTMLImageElement;
      if (el.dataset['errorHandled']) {
        return;
      }
      el.dataset['errorHandled'] = 'true';
      el.addEventListener('error', () => {
        el.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'img-fallback';
        fallback.innerHTML = '<span class="material-symbols-outlined">broken_image</span><span>Image not found</span>';
        el.parentNode?.insertBefore(fallback, el);
      });
      el.addEventListener('click', () => {
        this.lightbox.open(el.src);
      });
    });
  }
}
