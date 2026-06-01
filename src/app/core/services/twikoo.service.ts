// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { blogConfig } from '../config';

interface TwikooResponse {
  code: number;
  data?: {
    comments?: TwikooComment[];
    count?: number;
    id?: string;
  };
}

export interface TwikooComment {
  id: string;
  url: string;
  nick: string;
  mail: string;
  link: string;
  comment: string;
  created: number;
  relativeTime: string;
  like: number;
  liked: boolean;
  reply: TwikooComment[];
  master: boolean;
  rid: string;
  pid: string;
}

@Injectable({ providedIn: 'root' })
export class TwikooService {
  private envId = '';
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const cfg = blogConfig.comments.twikoo;
    this.envId = cfg.envId;
  }

  get enabled(): boolean {
    return blogConfig.comments.enabled && !!this.envId;
  }

  async getComments(url: string): Promise<{ comments: TwikooComment[]; count: number }> {
    if (!this.isBrowser || !this.envId) {
      return { comments: [], count: 0 };
    }
    try {
      const res = await fetch(this.envId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'COMMENT_GET', url }),
      });
      const data = (await res.json()) as TwikooResponse;
      if (data.code === 0) {
        return { comments: data.data?.comments ?? [], count: data.data?.count ?? 0 };
      }
      return { comments: [], count: 0 };
    } catch {
      return { comments: [], count: 0 };
    }
  }

  async postComment(params: {
    url: string;
    nick: string;
    mail: string;
    link?: string;
    comment: string;
    rid?: string;
    pid?: string;
  }): Promise<{ success: boolean; id?: string }> {
    if (!this.isBrowser || !this.envId) {
      return { success: false };
    }
    try {
      const res = await fetch(this.envId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'COMMENT_CREATE',
          url: params.url,
          nick: params.nick,
          mail: params.mail,
          link: params.link ?? '',
          comment: params.comment,
          rid: params.rid ?? '',
          pid: params.pid ?? '',
        }),
      });
      const data = (await res.json()) as TwikooResponse;
      return { success: data.code === 0, id: data.data?.id };
    } catch {
      return { success: false };
    }
  }
}
