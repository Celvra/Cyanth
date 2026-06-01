// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';
import type { PostFrontmatter } from '../core/models/post.model';
import { blogConfig } from '../core/config';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { ThemeService } from '../core/services/theme.service';

interface PostItem {
  slug: string;
  frontmatter: PostFrontmatter;
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="home-page content-animate-enter">
      <!-- Welcome header -->
      <div class="welcome-header">
        <h1 class="page-title">
          <span class="material-symbols-outlined title-icon">tag</span>
          {{ 'home.title' | t }}
        </h1>
      </div>

      <!-- GitHub contribution chart -->
      @if (config.github.username) {
        <div class="github-chart" [class.loaded]="chartLoaded">
          <img [src]="githubChartUrl" alt="GitHub contributions" class="chart-img" (load)="chartLoaded = true" />
        </div>
      }

      <!-- Post list -->
      <div class="post-list">
        @for (post of posts; track post.slug) {
          <article class="post-card">
            <div class="post-header">
              <img [src]="config.profile.avatar" alt="" class="post-avatar" />
              <div class="post-meta">
                <span class="post-author">{{ config.profile.name }}</span>
                @if (post.frontmatter.category) {
                  <span class="post-badge">{{ post.frontmatter.category }}</span>
                }
              </div>
              <span class="post-date">{{ formatDate(post.frontmatter.published) }}</span>
            </div>

            <div class="post-body">
              <a [routerLink]="'/posts/' + post.slug" class="post-title-link">
                <h2 class="post-title">{{ post.frontmatter.title }}</h2>
              </a>
              @if (post.frontmatter.description) {
                <p class="post-desc">{{ post.frontmatter.description }}</p>
              }
              @if (post.frontmatter.cover) {
                <img [src]="post.frontmatter.cover" alt="" class="post-cover" />
              }
            </div>

            @if (post.frontmatter.tags.length > 0 || post.frontmatter.category) {
              <div class="post-footer">
                @if (post.frontmatter.category) {
                  <span class="chip">{{ post.frontmatter.category }}</span>
                }
                @for (tag of post.frontmatter.tags; track tag) {
                  <span class="chip">{{ tag }}</span>
                }
              </div>
            }
          </article>
        } @empty {
          <div class="empty-state">
            <span class="material-symbols-outlined empty-icon">article</span>
            <p>{{ 'home.no_posts' | t }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .home-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .welcome-header {
      margin-bottom: 24px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }

    .title-icon {
      font-size: 24px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .github-chart {
      margin-bottom: 24px;
      border-radius: var(--md-sys-shape-corner-medium);
      overflow: hidden;
      background-color: var(--md-sys-color-surface-container-low);
      padding: 16px;
      opacity: 0;
      transform: translateY(16px);
    }
    .github-chart.loaded {
      animation: chart-in 0.5s var(--m3-easing-decelerate) forwards;
    }

    @keyframes chart-in {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chart-img {
      width: 100%;
      height: auto;
    }

    .post-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .post-card {
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 16px;
      transition: box-shadow 0.2s var(--m3-easing-standard);
    }

    .post-card:hover {
      box-shadow: var(--md-sys-elevation-level1);
    }

    .post-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .post-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .post-author {
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      font-size: 14px;
    }

    .post-badge {
      padding: 2px 8px;
      border-radius: var(--md-sys-shape-corner-small);
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-size: 11px;
      font-weight: 500;
    }

    .post-date {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .post-title-link {
      text-decoration: none;
      color: inherit;
    }

    .post-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--md-sys-color-primary);
      margin: 0 0 8px 0;
    }

    .post-title:hover {
      text-decoration: underline;
    }

    .post-desc {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.6;
      margin: 0 0 12px 0;
    }

    .post-cover {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: var(--md-sys-shape-corner-medium);
      margin-bottom: 12px;
    }

    .post-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      border-radius: var(--md-sys-shape-corner-small);
      border: 1px solid var(--md-sys-color-outline);
      color: var(--md-sys-color-on-surface-variant);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .chip:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
  `,
})
export default class HomeComponent implements OnInit {
  config = blogConfig;
  posts: PostItem[] = [];
  githubChartUrl = '';
  chartLoaded = false;
  private themeService = inject(ThemeService);

  private contentFiles = injectContentFiles<PostFrontmatter>();

  constructor() {
    if (this.config.github.username) {
      effect(() => {
        const color = this.themeService.seedColor().replace('#', '');
        this.githubChartUrl = `https://ghchart.rshah.org/${color}/${this.config.github.username}`;
      });
    }
  }

  ngOnInit(): void {
    this.posts = this.contentFiles
      .map(f => ({
        slug: f.filename.replace(/\.md$/, '').split('/').pop() ?? '',
        frontmatter: f.attributes,
      }))
      .filter(p => !p.frontmatter.draft)
      .sort((a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime());
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
