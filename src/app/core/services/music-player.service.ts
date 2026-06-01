// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { blogConfig } from '../config';

interface MetingItem {
  name?: string;
  title?: string;
  songname?: string;
  artist?: string | Array<string | { name?: string }>;
  author?: string;
  ar?: Array<{ name?: string }>;
  pic?: string;
  cover?: string;
  al?: { picUrl?: string };
  url?: string;
  duration?: number;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  url: string;
  duration: number;
}

export type RepeatMode = 0 | 1 | 2;

const STORAGE_KEY_VOLUME = 'music-player-volume';
const DEFAULT_VOLUME = 0.7;
const DEFAULT_SONG: Song = { id: 0, title: 'Not Loaded', artist: '-', cover: '', url: '', duration: 0 };

@Injectable({ providedIn: 'root' })
export class MusicPlayerService {
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;

  currentSong = signal<Song>(DEFAULT_SONG);
  playlist = signal<Song[]>([]);
  currentIndex = signal(0);
  isPlaying = signal(false);
  isLoading = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(DEFAULT_VOLUME);
  isMuted = signal(false);
  isShuffled = signal(false);
  repeatMode = signal<RepeatMode>(0);
  showPlaylist = signal(false);
  showPlayer = signal(false);

  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  async init(): Promise<void> {
    if (!this.isBrowser || this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    const cfg = blogConfig.music;
    if (!cfg.enable) {
      return;
    }

    this.audio = new Audio();
    this.audio.volume = this.volume();
    this.loadVolume();
    this.setupListeners();
    this.showPlayer.set(true);

    if (cfg.mode === 'meting') {
      await this.fetchMeting(cfg);
    } else {
      this.loadLocal(cfg.localPlaylist);
    }
  }

  private setupListeners(): void {
    if (!this.audio) {
      return;
    }
    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime.set(this.audio.currentTime);
      }
    });
    this.audio.addEventListener('loadeddata', () => {
      this.isLoading.set(false);
      if (this.audio?.duration && this.audio.duration > 1) {
        this.duration.set(Math.floor(this.audio.duration));
      }
    });
    this.audio.addEventListener('loadstart', () => this.isLoading.set(true));
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('error', () => {
      this.isLoading.set(false);
      this.skipOnError();
    });
  }

  private onEnded(): void {
    if (this.repeatMode() === 1) {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
    } else {
      this.next();
    }
  }

  private skipOnError(): void {
    const pl = this.playlist();
    if (pl.length > 1) {
      setTimeout(() => this.next(), 1000);
    }
  }

  private loadVolume(): void {
    try {
      const v = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (v) {
        const vol = parseFloat(v);
        if (!isNaN(vol) && vol >= 0 && vol <= 1) {
          this.volume.set(vol);
          if (this.audio) {
            this.audio.volume = vol;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  private saveVolume(): void {
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(this.volume()));
    } catch {
      /* ignore */
    }
  }

  private async fetchMeting(cfg: typeof blogConfig.music): Promise<void> {
    const api = cfg.metingApi;
    const id = cfg.metingId;
    if (!api || !id) {
      return;
    }
    this.isLoading.set(true);
    const url = api
      .replace(':server', cfg.metingServer)
      .replace(':type', cfg.metingType)
      .replace(':id', id)
      .replace(':auth', '')
      .replace(':r', Date.now().toString());
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('meting error');
      }
      const list: MetingItem[] = (await res.json()) as MetingItem[];
      const songs: Song[] = list.map((s, i) => {
        const artist = Array.isArray(s.artist)
          ? s.artist.map(a => (typeof a === 'object' ? (a.name ?? '') : a)).join(', ')
          : (s.artist ?? s.author ?? s.ar?.map(a => a.name ?? '').join(', ') ?? '');
        return {
          id: i,
          title: s.name ?? s.title ?? s.songname ?? 'Unknown',
          artist: artist || 'Unknown',
          cover: s.pic ?? s.cover ?? s.al?.picUrl ?? '',
          url: s.url ?? '',
          duration: s.duration ?? 0,
        };
      });
      this.playlist.set(songs);
      if (songs.length > 0) {
        this.loadSong(0, false);
      }
    } catch {
      this.isLoading.set(false);
    }
  }

  private loadLocal(songs: Song[]): void {
    this.playlist.set(songs);
    if (songs.length > 0) {
      this.loadSong(0, false);
    }
  }

  private loadSong(index: number, autoplay = true): void {
    const pl = this.playlist();
    const song = pl[index];
    if (!song) {
      return;
    }
    this.currentIndex.set(index);
    this.currentSong.set(song);
    if (this.audio) {
      this.audio.src = song.url;
      this.currentTime.set(0);
      this.duration.set(song.duration || 0);
      if (autoplay) {
        this.audio.play().catch(() => {});
      }
    }
  }

  toggle(): void {
    if (!this.audio) {
      return;
    }
    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play().catch(() => {});
    }
  }

  next(): void {
    const pl = this.playlist();
    if (pl.length === 0) {
      return;
    }
    let idx: number;
    if (this.isShuffled()) {
      idx = Math.floor(Math.random() * pl.length);
    } else {
      idx = (this.currentIndex() + 1) % pl.length;
    }
    this.loadSong(idx);
  }

  prev(): void {
    const pl = this.playlist();
    if (pl.length === 0) {
      return;
    }
    if (this.audio && this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    let idx: number;
    if (this.isShuffled()) {
      idx = Math.floor(Math.random() * pl.length);
    } else {
      idx = (this.currentIndex() - 1 + pl.length) % pl.length;
    }
    this.loadSong(idx);
  }

  seek(pct: number): void {
    if (!this.audio || !this.duration()) {
      return;
    }
    this.audio.currentTime = pct * this.duration();
  }

  setVolume(v: number): void {
    this.volume.set(v);
    this.isMuted.set(v === 0);
    if (this.audio) {
      this.audio.volume = v;
      this.audio.muted = v === 0;
    }
    this.saveVolume();
  }

  toggleMute(): void {
    if (!this.audio) {
      return;
    }
    const muted = !this.isMuted();
    this.isMuted.set(muted);
    this.audio.muted = muted;
  }

  toggleShuffle(): void {
    this.isShuffled.update(v => !v);
  }

  toggleRepeat(): void {
    this.repeatMode.update(v => ((v + 1) % 3) as RepeatMode);
  }

  playIndex(i: number): void {
    this.loadSong(i);
  }

  togglePlaylist(): void {
    this.showPlaylist.update(v => !v);
  }
}
