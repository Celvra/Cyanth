// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy, inject, effect, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';
import type { PostFrontmatter } from '../core/models/post.model';
import { blogConfig } from '../core/config';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ThemeService } from '../core/services/theme.service';
import { SearchService } from '../core/services/search.service';
import { CalendarWidgetComponent } from '../shared/components/calendar-widget/calendar-widget.component';
import { StatsWidgetComponent } from '../shared/components/stats-widget/stats-widget.component';

interface PostItem {
  slug: string;
  frontmatter: PostFrontmatter;
}

interface TagStat {
  label: string;
  count: number;
  type: 'category' | 'tag';
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, MatProgressSpinner, CalendarWidgetComponent, StatsWidgetComponent],
  template: `
    <div class="home-page content-animate-enter">
      <div class="welcome-header">
        <h1 class="page-title">
          <span class="material-symbols-outlined title-icon">tag</span>
          {{ 'home.title' | t }}
        </h1>
      </div>

      @if (config.github.username) {
        <div class="github-chart" [class.loaded]="chartLoaded">
          <img [src]="githubChartUrl" alt="GitHub contributions" class="chart-img" (load)="chartLoaded = true" />
        </div>
      }

      <!-- Tag bar -->
      @if (tagStats().length > 0) {
        <div class="tag-bar">
          <button class="tag-pill" [class.active]="!filterActive()" (click)="clearFilter()">
            {{ 'home.all' | t }} <span class="tag-count">{{ posts.length }}</span>
          </button>
          @for (stat of tagStats(); track stat.label; let i = $index) {
            @if (i < 8 || tagBarExpanded()) {
              <button
                class="tag-pill"
                [class.active]="filterLabel() === stat.label && filterType() === stat.type"
                (click)="setFilter(stat)"
              >
                {{ stat.label }} <span class="tag-count">{{ stat.count }}</span>
              </button>
            }
          }
          @if (tagStats().length > 8) {
            <button class="tag-more" (click)="tagBarExpanded.set(!tagBarExpanded())">
              {{ (tagBarExpanded() ? 'tag.less' : 'tag.more') | t }}
              <span class="material-symbols-outlined" style="font-size:16px">{{
                tagBarExpanded() ? 'expand_less' : 'expand_more'
              }}</span>
            </button>
          }
        </div>
      }

      <!-- Post grid -->
      <div class="post-grid">
        @for (post of filteredPosts(); track post.slug; let i = $index) {
          <a [routerLink]="'/posts/' + post.slug" class="post-card" [style.animation-delay.ms]="i * 60">
            @if (post.frontmatter.cover) {
              <div class="card-cover img-placeholder">
                <div class="img-spinner-wrap">
                  <mat-spinner diameter="32" />
                </div>
                <img
                  [src]="post.frontmatter.cover"
                  alt=""
                  class="cover-img"
                  loading="lazy"
                  (load)="onImgLoad($event)"
                  (error)="onImgError($event)"
                />
              </div>
            }
            <div class="card-body">
              <h2 class="card-title">{{ post.frontmatter.title }}</h2>
              <div class="card-meta">
                @if (post.frontmatter.pinned) {
                  <span class="meta-pinned">
                    <span class="material-symbols-outlined" style="font-size:14px">push_pin</span>
                    {{ 'home.pinned' | t }}
                  </span>
                }
                <span class="meta-date">
                  <span class="material-symbols-outlined meta-icon">calendar_today</span>
                  {{ formatDate(post.frontmatter.published) }}
                </span>
                @if (post.frontmatter.category) {
                  <span class="meta-category">
                    <span class="material-symbols-outlined meta-icon">folder</span>
                    {{ post.frontmatter.category }}
                  </span>
                }
              </div>
              @if (post.frontmatter.description) {
                <p class="card-desc">{{ post.frontmatter.description }}</p>
              }
              @if ((post.frontmatter.tags?.length ?? 0) > 0) {
                <div class="card-tags">
                  @for (tag of post.frontmatter.tags; track tag) {
                    <span class="tag-chip">#{{ tag }}</span>
                  }
                </div>
              }
            </div>
          </a>
        } @empty {
          <div class="empty-state">
            <span class="material-symbols-outlined empty-icon">article</span>
            <p>{{ 'home.no_posts' | t }}</p>
          </div>
        }
      </div>

      <!-- Widgets row -->
      <div class="widgets-row">
        <app-calendar-widget [posts]="posts" />
        <app-stats-widget />
      </div>
    </div>
  `,
  styles: `
    .home-page {
      max-width: 1100px;
      margin: 0 auto;
      padding-bottom: 32px;
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

    /* ─── Widgets Row ────────────────────────────────────── */
    .widgets-row {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 16px;
      margin-top: 20px;
      margin-bottom: 20px;
      align-items: stretch;
    }
    @media (max-width: 768px) {
      .widgets-row {
        grid-template-columns: 1fr;
      }
    }

    /* Tag Bar */
    .tag-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 4px 0;
    }
    .tag-bar::-webkit-scrollbar {
      display: none;
    }
    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: none;
      border-radius: var(--md-sys-shape-corner-full);
      background-color: var(--md-sys-color-surface-container-low);
      color: var(--md-sys-color-on-surface-variant);
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      white-space: nowrap;
      cursor: pointer;
      transition: background-color 0.15s var(--m3-easing-standard);
      user-select: none;
    }
    .tag-pill:hover {
      background-color: color-mix(
        in srgb,
        var(--md-sys-color-on-surface-variant) 8%,
        var(--md-sys-color-surface-container-low)
      );
    }
    .tag-pill.active {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }
    .tag-count {
      font-size: 11px;
      opacity: 0.6;
      font-weight: 400;
    }
    .tag-more {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 6px 12px;
      border: none;
      border-radius: var(--md-sys-shape-corner-full);
      background-color: transparent;
      color: var(--md-sys-color-primary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      font-family: inherit;
      transition: background-color 0.15s var(--m3-easing-standard);
    }
    .tag-more:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
    }

    /* Post Grid */
    .post-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 1024px) {
      .post-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 600px) {
      .post-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    /* Card */
    .post-card {
      display: flex;
      flex-direction: column;
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition:
        box-shadow 0.2s var(--m3-easing-standard),
        transform 0.2s var(--m3-easing-standard);
      animation: fade-in-up 0.4s var(--m3-easing-decelerate) both;
    }
    .post-card:hover {
      box-shadow: var(--md-sys-elevation-level2);
      transform: translateY(-2px);
    }
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-cover {
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background-color: var(--md-sys-color-surface-container);
    }
    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s var(--m3-easing-standard);
    }
    .post-card:hover .cover-img {
      transform: scale(1.05);
    }

    .card-body {
      display: flex;
      flex-direction: column;
      padding: 14px 16px 16px;
      flex: 1;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 8px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
    }
    .meta-icon {
      font-size: 14px;
      vertical-align: middle;
    }
    .meta-pinned {
      color: var(--md-sys-color-primary);
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-weight: 500;
    }
    .meta-date,
    .meta-category {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .card-desc {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.5;
      margin: 0 0 10px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: auto;
    }
    .tag-chip {
      padding: 3px 10px;
      border-radius: var(--md-sys-shape-corner-full);
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-size: 12px;
      font-weight: 500;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px 16px;
      color: var(--md-sys-color-on-surface-variant);
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
  `,
})
export default class HomeComponent implements OnInit {
  config = blogConfig;
  posts: PostItem[] = [];
  githubChartUrl = '';
  chartLoaded = false;
  tagBarExpanded = signal(false);
  filterLabel = signal('');
  filterType = signal<'category' | 'tag' | ''>('');
  filterActive = computed(() => !!this.filterLabel());
  private themeService = inject(ThemeService);
  private searchService = inject(SearchService);
  private contentFiles = injectContentFiles<PostFrontmatter>();

  tagStats = computed(() => {
    const map = new Map<string, TagStat>();
    for (const p of this.posts) {
      if (p.frontmatter.category) {
        const key = `c:${p.frontmatter.category}`;
        const existing = map.get(key);
        if (existing) {
          existing.count++;
        } else {
          map.set(key, { label: p.frontmatter.category, count: 1, type: 'category' });
        }
      }
      for (const tag of p.frontmatter.tags) {
        const key = `t:${tag}`;
        const existing = map.get(key);
        if (existing) {
          existing.count++;
        } else {
          map.set(key, { label: tag, count: 1, type: 'tag' });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'category' ? -1 : 1;
      }
      return b.count - a.count;
    });
  });

  filteredPosts = computed(() => {
    let result = this.posts;
    const q = this.searchService.searchQuery().toLowerCase();
    if (q) {
      result = result.filter(
        p =>
          p.frontmatter.title.toLowerCase().includes(q) ||
          (p.frontmatter.description ?? '').toLowerCase().includes(q) ||
          (p.frontmatter.category?.toLowerCase().includes(q) ?? false) ||
          p.frontmatter.tags.some(t => t.toLowerCase().includes(q)),
      );
    }
    const label = this.filterLabel();
    const type = this.filterType();
    if (label) {
      if (type === 'category') {
        result = result.filter(p => p.frontmatter.category === label);
      } else {
        result = result.filter(p => p.frontmatter.tags.includes(label));
      }
    }
    return result;
  });

  setFilter(stat: TagStat): void {
    if (this.filterLabel() === stat.label && this.filterType() === stat.type) {
      this.filterLabel.set('');
      this.filterType.set('');
    } else {
      this.filterLabel.set(stat.label);
      this.filterType.set(stat.type);
    }
  }

  clearFilter(): void {
    this.filterLabel.set('');
    this.filterType.set('');
  }

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
      .filter(f => f.filename.includes('/articles/'))
      .map(f => ({
        slug: (f.slug || (f.filename.replace(/\.md$/, '').split('/').pop() ?? '')).replace(/\s+/g, '-').toLowerCase(),
        frontmatter: f.attributes,
      }))
      .filter(p => !p.frontmatter.draft && p.frontmatter.title)
      .sort((a, b) => {
        if (a.frontmatter.pinned !== b.frontmatter.pinned) {
          return a.frontmatter.pinned ? -1 : 1;
        }
        return new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime();
      });
    this.searchService.setPosts(this.posts);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onImgLoad(event: Event): void {
    const el = event.target as HTMLImageElement;
    el.parentElement?.classList.add('loaded');
  }

  onImgError(event: Event): void {
    const el = event.target as HTMLImageElement;
    el.parentElement?.classList.add('error');
  }
}
