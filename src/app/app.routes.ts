// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'categories/:category',
    loadComponent: async () => import('./pages/category/index.page'),
  },
  {
    path: 'tags/:tag',
    loadComponent: async () => import('./pages/tag/index.page'),
  },
];
