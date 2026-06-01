// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WallpaperService } from './core/services/wallpaper.service';
import { blogConfig } from './core/config';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LightboxComponent } from './shared/components/lightbox/lightbox.component';
import { ContextMenuComponent } from './shared/components/context-menu/context-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainLayoutComponent, LightboxComponent, ContextMenuComponent],
  template: `
    <div class="wallpaper-loading" [class.fade-out]="!wallpaper.isLoading()" [class.hidden]="wallpaper.isHidden()">
      <svg width="48" height="48" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          [attr.stroke]="'var(--md-sys-color-primary, #6750A4)'"
          stroke-width="4"
          stroke-dasharray="90 150"
          stroke-dashoffset="0"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <app-main-layout />
    <app-lightbox />
    <app-context-menu />
  `,
})
export class AppComponent implements OnInit {
  wallpaper = inject(WallpaperService);

  ngOnInit(): void {
    void this.wallpaper.loadWallpaper();
    this.setFavicon();
  }

  private setFavicon(): void {
    const favicon = blogConfig.site.favicon;
    if (favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        document.head.appendChild(newLink);
        link = newLink;
      }
      link.href = favicon;
    }
  }
}
