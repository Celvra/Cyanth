// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { blogConfig } from '../../core/config';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MarkdownService } from '../../core/services/markdown.service';
import aboutContent from '../../../content/about/about.md?raw';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="about-page content-animate-enter">
      <div class="page-header">
        <h1 class="page-title">
          <span class="material-symbols-outlined">info</span>
          {{ 'about.title' | t }}
        </h1>
      </div>

      <!-- Profile card -->
      <div class="profile-card">
        <div class="profile-header">
          <img
            [src]="config.profile.avatar"
            [alt]="config.profile.name"
            class="profile-avatar"
            (error)="onAvatarError($event)"
          />
          <div class="profile-info">
            <h2 class="profile-name">{{ config.profile.name }}</h2>
            <span class="profile-badge">{{ config.profile.badge }}</span>
          </div>
        </div>

        <div class="profile-body">
          <div class="info-row">
            <span class="material-symbols-outlined info-icon">person</span>
            <span class="info-label">{{ 'about.bio' | t }}</span>
            <span class="info-value">{{ config.profile.bio }}</span>
          </div>
          <div class="info-row">
            <span class="material-symbols-outlined info-icon">code</span>
            <span class="info-label">{{ 'about.tech_stack' | t }}</span>
            <span class="info-value">{{ config.about.techStack }}</span>
          </div>
          <div class="info-row">
            <span class="material-symbols-outlined info-icon">calendar_today</span>
            <span class="info-label">{{ 'about.created' | t }}</span>
            <span class="info-value">{{ config.about.createdDate }}</span>
          </div>
        </div>
      </div>

      <!-- Social links -->
      @if (config.socialLinks.length > 0) {
        <div class="links-section">
          <h3 class="section-title">{{ 'about.social_links' | t }}</h3>
          <div class="links-list">
            @for (link of config.socialLinks; track link.platform) {
              <a [href]="link.url" target="_blank" rel="noopener noreferrer" class="link-item">
                <span class="material-symbols-outlined link-icon">{{ link.icon }}</span>
                <span class="link-label">{{ link.platform }}</span>
                <span class="material-symbols-outlined link-arrow">open_in_new</span>
              </a>
            }
          </div>
        </div>
      }

      @if (aboutContent) {
        <div class="markdown-section">
          <div class="markdown-content" [innerHTML]="renderedMarkdown()"></div>
        </div>
      }
    </div>
  `,
  styles: `
    .about-page {
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
      margin: 0;
    }

    .page-title .material-symbols-outlined {
      font-size: 28px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .profile-card {
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 24px;
      margin-bottom: 24px;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }

    .profile-avatar {
      width: 64px;
      height: 64px;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .profile-name {
      font-size: 22px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }

    .profile-badge {
      padding: 4px 10px;
      border-radius: var(--md-sys-shape-corner-small);
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      font-size: 12px;
      font-weight: 500;
    }

    .profile-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .info-icon {
      font-size: 20px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .info-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
      min-width: 80px;
    }

    .info-value {
      font-size: 14px;
      color: var(--md-sys-color-on-surface);
    }

    .links-section {
      margin-bottom: 24px;
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 20px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0 0 12px 0;
    }

    .links-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .link-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--md-sys-shape-corner-medium);
      text-decoration: none;
      color: var(--md-sys-color-on-surface);
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .link-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    .link-icon {
      font-size: 20px;
      color: var(--md-sys-color-primary);
    }

    .link-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    .link-arrow {
      font-size: 18px;
      color: var(--md-sys-color-on-surface-variant);
    }

    /* ─── Markdown Content ─────────────────────────────── */
    .markdown-section {
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 24px;
    }

    .markdown-content {
      font-size: 15px;
      line-height: 1.75;
      color: var(--md-sys-color-on-surface);
    }

    .markdown-content :deep(h2) {
      font-size: 20px;
      font-weight: 600;
      margin: 24px 0 12px;
      color: var(--md-sys-color-on-surface);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      padding-bottom: 8px;
    }

    .markdown-content :deep(h2:first-child) {
      margin-top: 0;
    }

    .markdown-content :deep(h3) {
      font-size: 17px;
      font-weight: 600;
      margin: 20px 0 8px;
      color: var(--md-sys-color-on-surface);
    }

    .markdown-content :deep(p) {
      margin: 8px 0;
    }

    .markdown-content :deep(ul),
    .markdown-content :deep(ol) {
      padding-left: 24px;
      margin: 8px 0;
    }

    .markdown-content :deep(li) {
      margin: 4px 0;
    }

    .markdown-content :deep(strong) {
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .markdown-content :deep(a) {
      color: var(--md-sys-color-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .markdown-content :deep(code) {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      padding: 2px 6px;
      border-radius: var(--md-sys-shape-corner-extra-small);
      background-color: var(--md-sys-color-surface-container-highest);
    }

    .markdown-content :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
    }

    .markdown-content :deep(th),
    .markdown-content :deep(td) {
      padding: 8px 12px;
      border: 1px solid var(--md-sys-color-outline-variant);
      text-align: left;
    }

    .markdown-content :deep(th) {
      font-weight: 600;
      background-color: var(--md-sys-color-surface-container);
    }

    .markdown-content :deep(blockquote) {
      margin: 12px 0;
      padding: 8px 16px;
      border-left: 3px solid var(--md-sys-color-primary);
      background-color: color-mix(in srgb, var(--md-sys-color-primary) 5%, transparent);
      border-radius: 0 var(--md-sys-shape-corner-small) var(--md-sys-shape-corner-small) 0;
    }
  `,
})
export default class AboutComponent {
  config = blogConfig;
  private md = inject(MarkdownService);

  aboutContent = aboutContent;
  renderedMarkdown = computed(() => this.md.render(aboutContent));

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
