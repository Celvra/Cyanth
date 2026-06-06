// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable } from '@angular/core';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';
import type { PostFrontmatter, Heading } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private marked: Marked;

  constructor() {
    this.marked = new Marked(
      markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code: string, lang: string) {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return hljs.highlightAuto(code).value;
        },
      }),
      gfmHeadingId(),
    );

    this.marked.use({
      renderer: {
        image({ href, title, text }) {
          const t = title ? ` title="${title}"` : '';
          return `<span class="img-placeholder"><img src="${href}" alt="${text}"${t} loading="lazy" onload="this.parentElement.classList.add('loaded')" onerror="this.parentElement.classList.add('error')"/></span>`;
        },
      },
    });
  }

  render(markdown: string): string {
    const { body } = this.separateFrontmatter(markdown);
    return this.marked.parse(body) as string;
  }

  extractFrontmatter(markdown: string): PostFrontmatter {
    const { data } = this.separateFrontmatter(markdown);
    const getString = (key: string): string => (typeof data[key] === 'string' ? data[key] : '');
    const getBool = (key: string): boolean => (typeof data[key] === 'boolean' ? data[key] : false);
    const getArr = (key: string): string[] => (Array.isArray(data[key]) ? (data[key] as string[]) : []);
    const getOpt = (key: string): string | undefined => (typeof data[key] === 'string' ? data[key] : undefined);
    return {
      title: getString('title') || 'Untitled',
      published: getString('published') || new Date().toISOString(),
      description: getString('description'),
      tags: getArr('tags'),
      category: getString('category'),
      draft: getBool('draft'),
      cover: getOpt('cover'),
      appIcon: getOpt('appIcon'),
      screenshots: getArr('screenshots'),
      platforms: getArr('platforms'),
      version: getOpt('version'),
      downloadLink: getOpt('downloadLink'),
      detailLink: getOpt('detailLink'),
    };
  }

  extractHeadings(markdown: string): Heading[] {
    const { body } = this.separateFrontmatter(markdown);
    const headings: Heading[] = [];
    const regex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(body)) !== null) {
      const level = match[1];
      const raw = match[2];
      if (!level || !raw) {
        continue;
      }
      const text = raw.replace(/[#]*$/g, '').trim();
      const slug = this.slugify(text);
      headings.push({
        depth: level.length,
        text,
        slug,
      });
    }
    return headings;
  }

  extractExcerpt(markdown: string, maxLength = 200): string {
    const { body } = this.separateFrontmatter(markdown);
    const plain = body
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();
    return plain.length > maxLength ? plain.slice(0, maxLength) + '...' : plain;
  }

  private separateFrontmatter(markdown: string): { data: Record<string, unknown>; body: string } {
    const fmRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = fmRegex.exec(markdown);

    const yaml = match?.[1];
    const body = match?.[2];
    if (!yaml || body === undefined) {
      return { data: {}, body: markdown };
    }

    const data = this.parseYaml(yaml);
    return { data, body };
  }

  private parseYaml(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        continue;
      }

      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();
      const strVal = value as string;

      if (strVal === 'true') {
        value = true;
      } else if (strVal === 'false') {
        value = false;
      } else if (strVal === '' || strVal === 'null') {
        value = null;
      } else if (strVal.startsWith('[') && strVal.endsWith(']')) {
        try {
          value = JSON.parse(strVal.replace(/'/g, '"'));
        } catch {
          value = strVal
            .slice(1, -1)
            .split(',')
            .map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
        }
      } else if (/^\d{4}-\d{2}-\d{2}/.test(strVal)) {
        // keep date string as-is
      } else {
        value = strVal.replace(/^["']|["']$/g, '');
      }

      result[key] = value;
    }

    return result;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w一-鿿\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
