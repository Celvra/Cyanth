// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnInit } from '@angular/core';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectContentFiles } from '@analogjs/content';
import type { PostFrontmatter } from '../../core/models/post.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface PostItem {
  slug: string;
  frontmatter: PostFrontmatter;
}

interface YearGroup {
  year: number;
  posts: PostItem[];
}

@Component({
  selector: 'app-archive',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="archive-page content-animate-enter">
      <div class="page-header">
        <h1 class="page-title">
          <span class="material-symbols-outlined">archive</span>
          {{ 'archive.title' | t }}
        </h1>
        <p class="page-subtitle">{{ totalPosts }}{{ 'archive.total' | t }}</p>
      </div>

      @for (group of yearGroups; track group.year) {
        <div class="year-group">
          <h2 class="year-title">{{ group.year }}</h2>
          <div class="year-posts">
            @for (post of group.posts; track post.slug) {
              <a [routerLink]="'/posts/' + post.slug" class="archive-item">
                <span class="item-date">{{ formatDate(post.frontmatter.published) }}</span>
                <span class="item-title">{{ post.frontmatter.title }}</span>
                @if (post.frontmatter.category) {
                  <span class="item-chip">{{ post.frontmatter.category }}</span>
                }
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .archive-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 4px 0;
    }

    .page-title .material-symbols-outlined {
      font-size: 28px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .page-subtitle {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0;
    }

    .year-group {
      margin-bottom: 32px;
    }

    .year-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .year-posts {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .archive-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: var(--md-sys-shape-corner-medium);
      text-decoration: none;
      color: var(--md-sys-color-on-surface);
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .archive-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .item-date {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      min-width: 70px;
      font-family: 'JetBrains Mono', monospace;
    }

    .item-title {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
    }

    .item-chip {
      padding: 2px 8px;
      border-radius: var(--md-sys-shape-corner-small);
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-size: 11px;
      font-weight: 500;
    }
  `,
})
export default class ArchiveComponent implements OnInit {
  yearGroups: YearGroup[] = [];
  totalPosts = 0;

  private contentFiles = injectContentFiles<PostFrontmatter>();

  ngOnInit(): void {
    const posts: PostItem[] = this.contentFiles
      .filter(f => f.filename.includes('/articles/'))
      .map(f => ({
        slug: (f.slug || (f.filename.replace(/\.md$/, '').split('/').pop() ?? '')).replace(/\s+/g, '-').toLowerCase(),
        frontmatter: f.attributes,
      }))
      .filter(p => !p.frontmatter.draft)
      .sort((a, b) => {
        if (a.frontmatter.pinned !== b.frontmatter.pinned) {
          return a.frontmatter.pinned ? -1 : 1;
        }
        return new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime();
      });

    this.totalPosts = posts.length;

    const groups = new Map<number, PostItem[]>();
    for (const post of posts) {
      const year = new Date(post.frontmatter.published).getFullYear();
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)?.push(post);
    }

    this.yearGroups = Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, posts]) => ({ year, posts }));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
  }
}
