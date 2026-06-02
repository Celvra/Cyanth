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

@Component({
  selector: 'app-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="tag-page content-animate-enter">
      <div class="page-header">
        <h1 class="page-title">
          <span class="material-symbols-outlined">label</span>
          {{ 'tag.title' | t }}{{ tagName }}
        </h1>
        <p class="page-subtitle">{{ posts.length }}{{ 'tag.posts' | t }}</p>
      </div>

      <div class="post-list">
        @for (post of posts; track post.slug) {
          <a [routerLink]="'/posts/' + post.slug" class="archive-item">
            <span class="item-date">{{ formatDate(post.frontmatter.published) }}</span>
            <span class="item-title">{{ post.frontmatter.title }}</span>
            @if (post.frontmatter.category) {
              <span class="item-chip">{{ post.frontmatter.category }}</span>
            }
          </a>
        } @empty {
          <div class="empty-state">
            <p>{{ 'tag.empty' | t }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .tag-page {
      max-width: 800px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 24px;
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
    .post-list {
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
      min-width: 50px;
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
    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: var(--md-sys-color-on-surface-variant);
    }
  `,
})
export default class TagComponent implements OnInit {
  tagName = '';
  posts: { slug: string; frontmatter: PostFrontmatter }[] = [];

  private contentFiles = injectContentFiles<PostFrontmatter>();

  ngOnInit(): void {
    const segments = window.location.pathname.split('/').filter(Boolean);
    this.tagName = decodeURIComponent(segments[segments.length - 1] ?? '');

    this.posts = this.contentFiles
      .map(f => ({
        slug: f.slug || (f.filename.replace(/\.md$/, '').split('/').pop() ?? ''),
        frontmatter: f.attributes,
      }))
      .filter(p => !p.frontmatter.draft && p.frontmatter.tags.includes(this.tagName))
      .sort((a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime());
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }
}
