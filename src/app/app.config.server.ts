// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { ApplicationConfig } from '@angular/core';
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
