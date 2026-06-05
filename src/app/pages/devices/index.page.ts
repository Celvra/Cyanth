// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { blogConfig } from '../../core/config';
import type { Device } from '../../core/devices.config';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-devices',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="devices-page content-animate-enter">
      <div class="page-header">
        <h1 class="page-title">
          <span class="material-symbols-outlined">devices</span>
          {{ 'devices.title' | t }}
        </h1>
        <p class="page-subtitle">{{ 'devices.subtitle' | t }}</p>
      </div>

      <div class="device-grid">
        @for (device of devices; track device.name; let i = $index) {
          <div class="device-card" [style.animation-delay.ms]="i * 60">
            <div class="device-icon-wrap">
              <span class="material-symbols-outlined device-icon">{{ device.icon || 'devices' }}</span>
            </div>
            <div class="device-info">
              <div class="device-name-row">
                <span class="device-name">{{ device.name }}</span>
                <span class="device-category">{{ 'devices.category.' + device.category | t }}</span>
              </div>
              <span class="device-model">{{ device.brand }} {{ device.model }}</span>
              <p class="device-desc">{{ device.description }}</p>
              <div class="device-meta">
                <span class="material-symbols-outlined meta-icon">calendar_today</span>
                <span class="meta-text">{{ device.acquiredDate }}</span>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <span class="material-symbols-outlined">inbox</span>
            <p>{{ 'devices.empty' | t }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .devices-page {
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

    .device-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .device-card {
      display: flex;
      gap: 16px;
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 20px;
      transition: box-shadow 0.2s var(--m3-easing-standard);
      animation: fade-in-up 0.4s var(--m3-easing-decelerate) both;
    }

    .device-card:hover {
      box-shadow: var(--md-sys-elevation-level1);
    }

    .device-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--md-sys-shape-corner-medium);
      background-color: var(--md-sys-color-primary-container);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .device-icon {
      font-size: 24px;
      color: var(--md-sys-color-on-primary-container);
    }

    .device-info {
      flex: 1;
      min-width: 0;
    }

    .device-name-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 2px;
    }

    .device-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .device-category {
      padding: 2px 8px;
      border-radius: var(--md-sys-shape-corner-full);
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      font-size: 11px;
      font-weight: 500;
    }

    .device-model {
      display: block;
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 6px;
    }

    .device-desc {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.5;
      margin: 0 0 8px 0;
    }

    .device-meta {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-icon {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .meta-text {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
      font-family: 'JetBrains Mono', monospace;
    }

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
export default class DevicesComponent {
  devices: Device[] = blogConfig.devices.items;
}
