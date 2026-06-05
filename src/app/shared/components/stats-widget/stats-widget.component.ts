// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { getHolidays } from '../../../core/holidays';

@Component({
  selector: 'app-stats-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="widget">
      <!-- Holiday countdown hero -->
      @if (nextHoliday()) {
        <div class="countdown-hero">
          <div class="countdown-ring">
            <svg class="ring-svg" viewBox="0 0 100 100">
              <circle class="ring-track" cx="50" cy="50" r="42" />
              <circle
                class="ring-fill"
                cx="50"
                cy="50"
                r="42"
                [style.stroke-dasharray]="ringCircumference"
                [style.stroke-dashoffset]="ringOffset()"
              />
            </svg>
            <div class="ring-center">
              <span class="countdown-number">{{ nextHoliday()!.daysLeft }}</span>
              <span class="countdown-unit">{{ 'home.days' | t }}</span>
            </div>
          </div>
          <div class="countdown-info">
            <span class="countdown-label">{{ 'home.next_holiday' | t }}</span>
            <span class="countdown-name">{{ nextHoliday()!.name }}</span>
            <span class="countdown-date">{{ nextHoliday()!.dateStr }}</span>
          </div>
        </div>
      }

      <!-- Time progress section -->
      <div class="progress-section">
        <div class="progress-row">
          <div class="progress-header">
            <span class="progress-label">{{ 'home.year_left' | t }}</span>
            <span class="progress-pct">{{ yearPct() }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill year-fill" [style.width.%]="yearPct()"></div>
          </div>
          <span class="progress-detail">{{ yearDaysLeft() }} {{ 'home.days' | t }}</span>
        </div>

        <div class="progress-row">
          <div class="progress-header">
            <span class="progress-label">{{ 'home.month_left' | t }}</span>
            <span class="progress-pct">{{ monthPct() }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill month-fill" [style.width.%]="monthPct()"></div>
          </div>
          <span class="progress-detail">{{ monthDaysLeft() }} {{ 'home.days' | t }}</span>
        </div>

        <div class="progress-row">
          <div class="progress-header">
            <span class="progress-label">{{ 'home.week_left' | t }}</span>
            <span class="progress-pct">{{ weekPct() }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill week-fill" [style.width.%]="weekPct()"></div>
          </div>
          <span class="progress-detail">{{ weekDaysLeft() }} {{ 'home.days' | t }}</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .widget {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--md-sys-color-surface-container-low);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 20px;
      gap: 20px;
    }

    /* ─── Countdown Hero ─────────────────────────────── */
    .countdown-hero {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .countdown-ring {
      position: relative;
      width: 96px;
      height: 96px;
      flex-shrink: 0;
    }

    .ring-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-track {
      fill: none;
      stroke: var(--md-sys-color-surface-container-highest);
      stroke-width: 6;
    }

    .ring-fill {
      fill: none;
      stroke: var(--md-sys-color-primary);
      stroke-width: 6;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.8s var(--m3-easing-standard);
    }

    .ring-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .countdown-number {
      font-size: 26px;
      font-weight: 700;
      color: var(--md-sys-color-primary);
      line-height: 1;
    }

    .countdown-unit {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
      margin-top: 2px;
    }

    .countdown-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .countdown-label {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
      letter-spacing: 0.3px;
    }

    .countdown-name {
      font-size: 20px;
      font-weight: 700;
      color: var(--md-sys-color-on-surface);
      line-height: 1.2;
    }

    .countdown-date {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }

    /* ─── Progress Section ───────────────────────────── */
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: auto;
    }

    .progress-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .progress-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .progress-label {
      font-size: 13px;
      color: var(--md-sys-color-on-surface);
      font-weight: 500;
    }

    .progress-pct {
      font-size: 13px;
      font-weight: 700;
      color: var(--md-sys-color-primary);
      font-variant-numeric: tabular-nums;
    }

    .progress-track {
      height: 6px;
      border-radius: 3px;
      background-color: var(--md-sys-color-surface-container-highest);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s var(--m3-easing-standard);
    }

    .year-fill {
      background-color: var(--md-sys-color-primary);
    }

    .month-fill {
      background-color: var(--md-sys-color-tertiary);
    }

    .week-fill {
      background-color: var(--md-sys-color-secondary);
    }

    .progress-detail {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
      text-align: right;
    }
  `,
})
export class StatsWidgetComponent {
  /* ─── Holiday countdown ───────────────────────────── */
  nextHoliday = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const holidays = getHolidays(year);
    for (const h of holidays) {
      if (h.date >= now) {
        const daysLeft = Math.ceil((h.date.getTime() - now.getTime()) / 86400000);
        return {
          name: h.name,
          daysLeft,
          dateStr: `${h.date.getFullYear()}-${String(h.date.getMonth() + 1).padStart(2, '0')}-${String(h.date.getDate()).padStart(2, '0')}`,
        };
      }
    }
    const next = new Date(year + 1, 0, 1);
    return {
      name: '元旦',
      daysLeft: Math.ceil((next.getTime() - now.getTime()) / 86400000),
      dateStr: `${year + 1}-01-01`,
    };
  });

  /* Ring progress (max 60 days for visual scaling) */
  private readonly maxDays = 60;
  readonly ringCircumference = 2 * Math.PI * 42;

  ringOffset = computed(() => {
    const h = this.nextHoliday();
    const ratio = Math.min(h.daysLeft / this.maxDays, 1);
    return this.ringCircumference * (1 - ratio);
  });

  /* ─── Time progress ──────────────────────────────── */
  yearPct = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 1000) / 10;
  });

  yearDaysLeft = computed(() =>
    Math.ceil((new Date(new Date().getFullYear() + 1, 0, 1).getTime() - new Date().getTime()) / 86400000),
  );

  monthPct = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 1000) / 10;
  });

  monthDaysLeft = computed(() =>
    Math.ceil(
      (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() - new Date().getTime()) / 86400000,
    ),
  );

  weekPct = computed(() => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 1000) / 10;
  });

  weekDaysLeft = computed(() => 7 - new Date().getDay());
}
