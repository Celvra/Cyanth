// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { PostFrontmatter } from '../../../core/models/post.model';

interface PostItem {
  slug: string;
  frontmatter: PostFrontmatter;
}

interface CalDay {
  num: number;
  currentMonth: boolean;
  isToday: boolean;
  hasPost: boolean;
}

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="widget">
      <!-- Header with month navigation -->
      <div class="header">
        <button class="nav-btn" (click)="calPrev()">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="month-title">{{ calYear() }}年{{ calMonth() }}月</span>
        <button class="nav-btn" (click)="calNext()">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <!-- Weekday row -->
      <div class="weekdays">
        @for (d of weekdays; track d) {
          <span class="wd">{{ d }}</span>
        }
      </div>

      <!-- Day grid -->
      <div class="days">
        @for (day of calDays(); track $index) {
          <span class="day" [class.today]="day.isToday" [class.has-post]="day.hasPost" [class.out]="!day.currentMonth">
            {{ day.num || '' }}
          </span>
        }
      </div>

      <!-- Recent posts -->
      <div class="recent">
        @for (post of posts().slice(0, 3); track post.slug) {
          <a [routerLink]="'/posts/' + post.slug" class="recent-item">
            <span class="recent-title">{{ post.frontmatter.title }}</span>
            <span class="recent-date">{{ formatDate(post.frontmatter.published) }}</span>
          </a>
        }
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
      padding: 16px;
    }

    /* ─── Header ─────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .month-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }

    .nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--md-sys-shape-corner-full);
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      font-family: inherit;
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .nav-btn:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }

    /* ─── Weekdays ───────────────────────────────────── */
    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 4px;
    }

    .wd {
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
      padding: 4px 0;
    }

    /* ─── Day Grid ───────────────────────────────────── */
    .days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      margin-bottom: 12px;
    }

    .day {
      position: relative;
      text-align: center;
      font-size: 13px;
      padding: 6px 0;
      border-radius: var(--md-sys-shape-corner-full);
      color: var(--md-sys-color-on-surface);
      transition: background-color 0.15s var(--m3-easing-standard);
    }

    .day.out {
      color: var(--md-sys-color-outline);
      opacity: 0.4;
    }

    .day.today {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      font-weight: 600;
    }

    .day.has-post::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--md-sys-color-primary);
    }

    .day.today.has-post::after {
      background-color: var(--md-sys-color-on-primary);
    }

    /* ─── Recent Posts ───────────────────────────────── */
    .recent {
      margin-top: auto;
      border-top: 1px solid var(--md-sys-color-outline-variant);
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .recent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: inherit;
      padding: 4px 0;
      border-radius: var(--md-sys-shape-corner-small);
      transition: opacity 0.15s var(--m3-easing-standard);
    }

    .recent-item:hover {
      opacity: 0.7;
    }

    .recent-title {
      flex: 1;
      font-size: 13px;
      color: var(--md-sys-color-on-surface);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .recent-date {
      flex-shrink: 0;
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class CalendarWidgetComponent {
  posts = input.required<PostItem[]>();

  readonly weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  private now = new Date();
  calOffset = signal(0);

  private postDates = computed(() => {
    const s = new Set<string>();
    for (const p of this.posts()) {
      if (p.frontmatter.published) {
        const d = new Date(p.frontmatter.published);
        s.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    }
    return s;
  });

  calYear = computed(() => {
    const d = new Date(this.now.getFullYear(), this.now.getMonth() + this.calOffset(), 1);
    return d.getFullYear();
  });

  calMonth = computed(() => new Date(this.now.getFullYear(), this.now.getMonth() + this.calOffset(), 1).getMonth() + 1);

  calDays = computed<CalDay[]>(() => {
    const year = this.calYear();
    const month = this.calMonth() - 1;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const dates = this.postDates();
    const days: CalDay[] = [];

    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ num: prevDays - i, currentMonth: false, isToday: false, hasPost: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
      days.push({ num: d, currentMonth: true, isToday, hasPost: dates.has(`${year}-${month}-${d}`) });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ num: d, currentMonth: false, isToday: false, hasPost: false });
    }

    return days;
  });

  calPrev(): void {
    this.calOffset.update(v => v - 1);
  }

  calNext(): void {
    this.calOffset.update(v => v + 1);
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
}
