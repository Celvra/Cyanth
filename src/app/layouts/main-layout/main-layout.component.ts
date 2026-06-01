// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavSidebarComponent } from './nav-sidebar/nav-sidebar.component';
import { ChannelSidebarComponent } from './channel-sidebar/channel-sidebar.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { MemberSidebarComponent } from './member-sidebar/member-sidebar.component';
import { MusicPlayerComponent } from '../../shared/components/music-player/music-player.component';
import { blogConfig } from '../../core/config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NavSidebarComponent,
    ChannelSidebarComponent,
    TopBarComponent,
    MemberSidebarComponent,
    MusicPlayerComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  config = blogConfig;
  mobileMenuOpen = false;
  memberMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleMemberMenu(): void {
    this.memberMenuOpen = !this.memberMenuOpen;
  }

  closeMemberMenu(): void {
    this.memberMenuOpen = false;
  }
}
