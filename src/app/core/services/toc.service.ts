// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal } from '@angular/core';

export interface TocHeading {
  depth: number;
  text: string;
  slug: string;
}

@Injectable({ providedIn: 'root' })
export class TocService {
  headings = signal<TocHeading[]>([]);
  activeHeading = signal('');
  drawerOpen = signal(false);
}
