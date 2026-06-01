// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFileRouter, withExtraRoutes, requestContextInterceptor } from '@analogjs/router';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';
import { withPrismHighlighter } from '@analogjs/content/prism-highlighter';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideFileRouter(withExtraRoutes(appRoutes)),
    provideContent(withMarkdownRenderer(), withPrismHighlighter()),
    provideHttpClient(withFetch(), withInterceptors([requestContextInterceptor])),
    provideClientHydration(),
    provideAnimationsAsync(),
  ],
};
