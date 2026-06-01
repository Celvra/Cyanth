// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { PipeTransform } from '@angular/core';
import { Pipe, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

// eslint-disable-next-line @angular-eslint/no-pipe-impure -- Must be impure to react to locale signal changes
@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);
  transform(key: string): string {
    return this.i18n.t(key);
  }
}
