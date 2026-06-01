// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { blogConfig } from '../../../core/config';
import type { Subscription } from 'rxjs';
import { filter } from 'rxjs';

@Component({
  selector: 'app-nav-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Home / Avatar -->
    <a routerLink="/" class="nav-item" [class.active]="isHomeOrPost()">
      <div class="nav-pill"></div>
      <img
        [src]="config.profile.avatar"
        [alt]="config.profile.name"
        class="nav-avatar"
        (error)="onAvatarError($event)"
      />
    </a>

    <div class="nav-divider"></div>

    <!-- Navigation Items -->
    @for (channel of config.navChannels; track channel.id) {
      @if (channel.href === '/') {
        <!-- Skip home, handled above -->
      } @else {
        <a [routerLink]="channel.href" class="nav-item" routerLinkActive="active">
          <div class="nav-pill"></div>
          <span class="material-symbols-outlined nav-icon">{{ channel.icon }}</span>
        </a>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 100%;
    }

    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--md-sys-shape-corner-full);
      color: var(--md-sys-color-on-surface-variant);
      text-decoration: none;
      cursor: pointer;
      transition:
        border-radius 0.2s var(--m3-easing-emphasized),
        background-color 0.15s var(--m3-easing-standard),
        color 0.8s var(--m3-easing-standard);
    }

    .nav-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
      border-radius: var(--md-sys-shape-corner-large);
    }

    .nav-item.active {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      border-radius: var(--md-sys-shape-corner-large);
    }

    .nav-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
      transition: border-radius 0.2s var(--m3-easing-emphasized);
    }

    .nav-item:hover .nav-avatar,
    .nav-item.active .nav-avatar {
      border-radius: var(--md-sys-shape-corner-large);
    }

    .nav-icon {
      font-size: 24px;
    }

    .nav-pill {
      position: absolute;
      left: -16px;
      width: 4px;
      border-radius: 0 var(--md-sys-shape-corner-full) var(--md-sys-shape-corner-full) 0;
      background-color: var(--md-sys-color-primary);
      height: 0;
      transition: height 0.2s var(--m3-easing-emphasized);
    }

    .nav-item:hover .nav-pill {
      height: 20px;
    }

    .nav-item.active .nav-pill {
      height: 40px;
    }

    .nav-divider {
      width: 32px;
      height: 2px;
      background-color: var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-full);
      margin: 4px 0;
    }
  `,
})
export class NavSidebarComponent implements OnInit, OnDestroy {
  config = blogConfig;
  private router = inject(Router);
  private routerSub?: Subscription;
  currentUrl = signal('/');

  ngOnInit(): void {
    this.currentUrl.set(this.router.url.split('?')[0]?.split('#')[0] ?? '/');
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.currentUrl.set(e.urlAfterRedirects.split('?')[0]?.split('#')[0] ?? '/');
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  isHomeOrPost(): boolean {
    const url = this.currentUrl();
    return url === '/' || url.startsWith('/posts/');
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
