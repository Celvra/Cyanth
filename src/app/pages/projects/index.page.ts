// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { blogConfig } from '../../core/config';
import type { Project } from '../../core/projects.config';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-projects',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="projects-page content-animate-enter">
      <div class="page-header">
        <h1 class="page-title">
          <span class="material-symbols-outlined">deployed_code</span>
          {{ 'projects.title' | t }}
        </h1>
        <p class="page-subtitle">{{ 'projects.subtitle' | t }}</p>
      </div>

      <div class="timeline">
        @for (project of projects; track project.name; let i = $index; let last = $last) {
          <div class="timeline-item" [style.animation-delay.ms]="i * 80">
            <div class="timeline-connector">
              <div
                class="timeline-dot"
                [class.active]="project.status === 'active'"
                [class.wip]="project.status === 'wip'"
              ></div>
              @if (!last) {
                <div class="timeline-line"></div>
              }
            </div>

            <div class="project-card">
              <div class="card-header">
                <div class="card-title-row">
                  <h2 class="project-name">{{ project.name }}</h2>
                  <span
                    class="status-badge"
                    [class.active]="project.status === 'active'"
                    [class.wip]="project.status === 'wip'"
                    [class.archived]="project.status === 'archived'"
                  >
                    {{ 'projects.status.' + project.status | t }}
                  </span>
                </div>
                <span class="project-date">{{ project.date }}</span>
              </div>

              <p class="project-desc">{{ project.description }}</p>

              <div class="tech-stack">
                @for (tech of project.techStack; track tech) {
                  <span class="tech-chip">{{ tech }}</span>
                }
              </div>

              @if (project.links.length > 0) {
                <div class="project-links">
                  @for (link of project.links; track link.url) {
                    <a [href]="link.url" target="_blank" rel="noopener noreferrer" class="link-btn">
                      <span class="material-symbols-outlined">{{ link.icon }}</span>
                      <span>{{ link.label }}</span>
                    </a>
                  }
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <span class="material-symbols-outlined">inbox</span>
            <p>{{ 'projects.empty' | t }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .projects-page {
      max-width: 720px;
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

    /* ─── Timeline ──────────────────────────────────── */
    .timeline {
      display: flex;
      flex-direction: column;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      animation: fade-in-up 0.4s var(--m3-easing-decelerate) both;
    }

    .timeline-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 20px;
      padding-top: 20px;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: var(--md-sys-color-outline);
      flex-shrink: 0;
      position: relative;
    }

    .timeline-dot.active {
      background-color: var(--md-sys-color-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
    }

    .timeline-dot.wip {
      background-color: var(--md-sys-color-tertiary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--md-sys-color-tertiary) 20%, transparent);
    }

    .timeline-line {
      width: 2px;
      flex: 1;
      background-color: var(--md-sys-color-outline-variant);
      margin-top: 4px;
    }

    /* ─── Project Card ──────────────────────────────── */
    .project-card {
      flex: 1;
      min-width: 0;
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 20px;
      margin-bottom: 16px;
      transition: box-shadow 0.2s var(--m3-easing-standard);
    }

    .project-card:hover {
      box-shadow: var(--md-sys-elevation-level1);
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .project-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: var(--md-sys-shape-corner-full);
      font-size: 11px;
      font-weight: 500;
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
    }

    .status-badge.active {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .status-badge.wip {
      background-color: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
    }

    .status-badge.archived {
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
    }

    .project-date {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      font-family: 'JetBrains Mono', monospace;
    }

    .project-desc {
      font-size: 14px;
      line-height: 1.6;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0 0 12px 0;
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .tech-chip {
      padding: 3px 10px;
      border-radius: var(--md-sys-shape-corner-small);
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-size: 12px;
      font-weight: 500;
    }

    .project-links {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 14px;
      border-radius: 16px;
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .link-btn:hover {
      background-color: color-mix(
        in srgb,
        var(--md-sys-color-on-surface) 8%,
        var(--md-sys-color-surface-container-highest)
      );
    }

    .link-btn .material-symbols-outlined {
      font-size: 16px;
    }

    /* ─── Empty State ───────────────────────────────── */
    .empty-state {
      text-align: center;
      padding: 64px 16px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .empty-state .material-symbols-outlined {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
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
  `,
})
export default class ProjectsComponent {
  projects: Project[] = blogConfig.projects.items;
}
