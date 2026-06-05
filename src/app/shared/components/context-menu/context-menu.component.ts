// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { ChangeDetectionStrategy, Component, signal, HostListener, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface MenuItem {
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  dividerAfter?: boolean;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @if (isOpen()) {
      <div class="context-menu-backdrop" (click)="close()"></div>
      <div class="context-menu" [style.left.px]="position().x" [style.top.px]="position().y">
        @for (item of items(); track item.label) {
          <button class="menu-item" (click)="item.action(); close()">
            @if (item.icon) {
              <span class="material-symbols-outlined item-icon">{{ item.icon }}</span>
            }
            <span class="item-label">{{ item.label }}</span>
            @if (item.shortcut) {
              <span class="item-shortcut">{{ item.shortcut }}</span>
            }
          </button>
          @if (item.dividerAfter) {
            <div class="menu-divider"></div>
          }
        }
      </div>
    }
  `,
  styles: `
    .context-menu-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9998;
    }

    .context-menu {
      position: fixed;
      z-index: 9999;
      min-width: 180px;
      max-width: 280px;
      padding: 4px;
      background-color: var(--md-sys-color-surface-container);
      border-radius: var(--md-sys-shape-corner-small);
      box-shadow: var(--md-sys-elevation-level2);
      animation: m3-scale-enter 0.15s var(--m3-easing-decelerate) both;
      transform-origin: top left;
      user-select: none;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface);
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      text-align: left;
      border-radius: var(--md-sys-shape-corner-extra-small);
    }

    .menu-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
    }

    .item-icon {
      font-size: 20px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .item-label {
      flex: 1;
    }

    .item-shortcut {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
      font-family: 'JetBrains Mono', monospace;
    }

    .menu-divider {
      height: 1px;
      background-color: var(--md-sys-color-outline-variant);
      margin: 4px 0;
    }
  `,
})
export class ContextMenuComponent {
  private i18n = inject(I18nService);
  isOpen = signal(false);
  position = signal({ x: 0, y: 0 });
  items = signal<MenuItem[]>([]);

  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
      return;
    }

    if (window.matchMedia('(max-width: 767px)').matches || ('ontouchstart' in window && !('pointerType' in event))) {
      return;
    }

    event.preventDefault();

    const selectedText = window.getSelection()?.toString() ?? '';
    const menuItems: MenuItem[] = [
      { label: this.i18n.t('ctx.back'), icon: 'arrow_back', shortcut: 'Alt+Left', action: () => window.history.back() },
      {
        label: this.i18n.t('ctx.forward'),
        icon: 'arrow_forward',
        shortcut: 'Alt+Right',
        action: () => window.history.forward(),
      },
      {
        label: this.i18n.t('ctx.reload'),
        icon: 'refresh',
        shortcut: 'Ctrl+R',
        action: () => window.location.reload(),
        dividerAfter: true,
      },
      {
        label: this.i18n.t('ctx.copy_link'),
        icon: 'link',
        action: () => {
          void navigator.clipboard.writeText(window.location.href);
        },
      },
      { label: this.i18n.t('ctx.home'), icon: 'home', action: () => (window.location.href = '/') },
    ];

    if (selectedText.length > 0) {
      menuItems.unshift({
        label: this.i18n.t('ctx.copy'),
        icon: 'content_copy',
        shortcut: 'Ctrl+C',
        action: () => {
          void navigator.clipboard.writeText(selectedText);
        },
        dividerAfter: true,
      });
    }

    this.items.set(menuItems);
    this.position.set({ x: event.clientX, y: event.clientY });
    this.isOpen.set(true);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    this.isOpen.set(false);
  }
}
