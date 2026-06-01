// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LightboxService {
  isOpen = signal(false);
  imageSrc = signal('');
  loading = signal(false);

  open(src: string): void {
    this.imageSrc.set(src);
    this.loading.set(true);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen.set(false);
    this.imageSrc.set('');
    document.body.style.overflow = '';
  }
}
