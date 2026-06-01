// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({ name: 'readingTime', standalone: true })
export class ReadingTimePipe implements PipeTransform {
  transform(text: string): string {
    if (!text) {
      return '0 min read';
    }
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  }
}
