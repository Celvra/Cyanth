// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
import type { ElementRef, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal, effect, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MusicPlayerService } from '../../../core/services/music-player.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-music-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @if (mp.showPlayer()) {
      <div class="music-player">
        <div class="player-bar">
          <div class="bar-info">
            <div class="cover-wrapper">
              @if (mp.currentSong().cover) {
                <img
                  [src]="mp.currentSong().cover"
                  alt=""
                  class="bar-cover"
                  [class.paused]="!mp.isPlaying()"
                  referrerpolicy="no-referrer"
                  (error)="onBarCoverError($event)"
                />
              } @else {
                <div class="bar-cover bar-cover--empty" [class.paused]="!mp.isPlaying()">
                  <span class="material-symbols-outlined">music_note</span>
                </div>
              }
            </div>
            <div class="bar-meta" [class.fade]="songSwitch()">
              <span class="bar-title">{{ mp.currentSong().title }}</span>
              <span class="bar-artist">{{ mp.currentSong().artist }}</span>
            </div>
          </div>

          <div class="slider-row">
            <span class="slider-time">{{ formatTime(mp.currentTime()) }}</span>
            <div
              class="md3-slider"
              #progressBar
              (pointerdown)="onProgressDown($event)"
              (pointermove)="onProgressMove($event)"
              (pointerup)="onProgressUp()"
              (pointercancel)="onProgressUp()"
            >
              <div class="slider-track">
                <div class="slider-fill" [class.instant]="progressDragging()" [style.width.%]="progressPct()"></div>
                <div class="slider-thumb" [style.left.%]="progressPct()" [class.dragging]="progressDragging()"></div>
              </div>
            </div>
            <span class="slider-time">{{ formatTime(mp.duration()) }}</span>
          </div>

          <div class="bar-controls">
            <button class="ctrl-btn" [class.active]="mp.isShuffled()" (click)="mp.toggleShuffle()">
              <span class="material-symbols-outlined">shuffle</span>
            </button>
            <button class="ctrl-btn" (click)="mp.prev()">
              <span class="material-symbols-outlined">skip_previous</span>
            </button>
            <button class="ctrl-btn ctrl-btn--play" (click)="onTogglePlay()">
              <span class="material-symbols-outlined play-icon" [class.show]="!mp.isPlaying()">play_arrow</span>
              <span class="material-symbols-outlined pause-icon" [class.show]="mp.isPlaying()">pause</span>
              @if (mp.isLoading()) {
                <span class="loading-ring"></span>
              }
            </button>
            <button class="ctrl-btn" (click)="mp.next()">
              <span class="material-symbols-outlined">skip_next</span>
            </button>
            <button class="ctrl-btn" [class.active]="mp.repeatMode() > 0" (click)="mp.toggleRepeat()">
              <span class="material-symbols-outlined">{{ repeatIcon() }}</span>
            </button>
          </div>

          <div class="bar-bottom">
            <div class="bar-volume">
              <button class="ctrl-btn ctrl-btn--sm" (click)="mp.toggleMute()">
                <span class="material-symbols-outlined">{{
                  mp.isMuted() ? 'volume_off' : mp.volume() > 0.5 ? 'volume_up' : 'volume_down'
                }}</span>
              </button>
              <div
                class="md3-slider md3-slider--sm"
                #volumeBar
                (pointerdown)="onVolumeDown($event)"
                (pointermove)="onVolumeMove($event)"
                (pointerup)="onVolumeUp()"
                (pointercancel)="onVolumeUp()"
              >
                <div class="slider-track">
                  <div class="slider-fill" [style.width.%]="mp.isMuted() ? 0 : mp.volume() * 100"></div>
                  <div
                    class="slider-thumb"
                    [style.left.%]="mp.isMuted() ? 0 : mp.volume() * 100"
                    [class.dragging]="volumeDragging()"
                  ></div>
                </div>
              </div>
            </div>
            <button class="ctrl-btn ctrl-btn--sm" [class.active]="mp.showPlaylist()" (click)="mp.togglePlaylist()">
              <span class="material-symbols-outlined">queue_music</span>
            </button>
          </div>
        </div>

        <div class="playlist-wrapper" [class.open]="mp.showPlaylist()">
          <div class="playlist">
            <div class="playlist-header">
              <span class="playlist-title">{{ 'music.playlist' | t }}</span>
              <span class="playlist-count">{{ mp.playlist().length }}</span>
            </div>
            <div class="playlist-list">
              @for (song of mp.playlist(); track song.id; let i = $index) {
                <button
                  class="playlist-item"
                  [class.active]="mp.currentIndex() === i"
                  [style.animation-delay.ms]="mp.showPlaylist() ? i * 30 : 0"
                  (click)="mp.playIndex(i)"
                >
                  <div class="pl-cover-box">
                    @if (song.cover) {
                      <img
                        [src]="song.cover"
                        alt=""
                        class="pl-cover"
                        referrerpolicy="no-referrer"
                        (error)="$any($event.target).style.display = 'none'"
                      />
                    }
                    <span class="material-symbols-outlined pl-cover-icon">music_note</span>
                  </div>
                  <div class="pl-info">
                    <span class="pl-title">{{ song.title }}</span>
                    <span class="pl-artist">{{ song.artist }}</span>
                  </div>
                  @if (mp.currentIndex() === i && mp.isPlaying()) {
                    <div class="pl-bars">
                      <span class="bar1"></span>
                      <span class="bar2"></span>
                      <span class="bar3"></span>
                    </div>
                  }
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      flex-shrink: 0;
    }

    .music-player {
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      overflow: hidden;
    }

    /* ─── Player Bar ──────────────────────────────────── */
    .player-bar {
      padding: 12px 14px 10px;
    }
    .bar-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .cover-wrapper {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      position: relative;
    }
    .bar-cover {
      width: 40px;
      height: 40px;
      border-radius: var(--md-sys-shape-corner-full);
      object-fit: cover;
      animation: spin 6s linear infinite;
    }
    .bar-cover.paused {
      animation-play-state: paused;
    }
    .bar-cover--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
    }
    .bar-cover--empty .material-symbols-outlined {
      font-size: 18px;
    }
    .bar-meta {
      flex: 1;
      min-width: 0;
    }
    .bar-meta.fade {
      animation: meta-switch 0.3s var(--m3-easing-decelerate);
    }
    .bar-title {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bar-artist {
      display: block;
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
    }

    /* ─── MD3 Slider ──────────────────────────────────── */
    .slider-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .slider-time {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
      min-width: 28px;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    .md3-slider {
      flex: 1;
      height: 24px;
      display: flex;
      align-items: center;
      cursor: pointer;
      touch-action: none;
      user-select: none;
    }
    .md3-slider--sm {
      height: 20px;
    }
    .slider-track {
      position: relative;
      width: 100%;
      height: 4px;
      background: var(--md-sys-color-surface-container-highest);
      border-radius: 2px;
    }
    .md3-slider:hover .slider-track {
      height: 6px;
    }
    .slider-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: var(--md-sys-color-primary);
      border-radius: 2px;
      transition: width 0.45s linear;
    }
    .md3-slider .slider-fill.instant {
      transition: none;
    }
    .slider-thumb {
      position: absolute;
      top: 50%;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--md-sys-color-primary);
      transform: translate(-50%, -50%) scale(0);
      transition: transform 0.15s var(--m3-easing-standard);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      pointer-events: none;
    }
    .md3-slider:hover .slider-thumb,
    .slider-thumb.dragging {
      transform: translate(-50%, -50%) scale(1);
    }
    .slider-thumb.dragging {
      transform: translate(-50%, -50%) scale(1.3);
    }
    .md3-slider--sm .slider-thumb {
      width: 12px;
      height: 12px;
    }
    .md3-slider--sm .slider-fill {
      transition: none;
    }

    /* ─── Controls ────────────────────────────────────── */
    .bar-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .ctrl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      border-radius: var(--md-sys-shape-corner-full);
      font-family: inherit;
      transition:
        background-color 0.15s,
        transform 0.1s,
        color 0.15s;
    }
    .ctrl-btn:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 12%, transparent);
    }
    .ctrl-btn:active {
      transform: scale(0.88);
    }
    .ctrl-btn .material-symbols-outlined {
      font-size: 20px;
    }
    .ctrl-btn.active {
      color: var(--md-sys-color-primary);
    }
    .ctrl-btn--sm {
      width: 28px;
      height: 28px;
    }
    .ctrl-btn--sm .material-symbols-outlined {
      font-size: 18px;
    }
    .ctrl-btn--play {
      width: 40px;
      height: 40px;
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      position: relative;
      overflow: hidden;
    }
    .ctrl-btn--play:hover {
      background: var(--md-sys-color-primary);
      opacity: 0.9;
    }
    .ctrl-btn--play:active {
      transform: scale(0.9);
    }
    .ctrl-btn--play .material-symbols-outlined {
      position: absolute;
      font-size: 22px;
      opacity: 0;
      pointer-events: none;
    }
    .ctrl-btn--play .play-icon.show,
    .ctrl-btn--play .pause-icon.show {
      opacity: 1;
      pointer-events: auto;
    }
    .loading-ring {
      position: absolute;
      inset: 2px;
      border: 2px solid transparent;
      border-top-color: var(--md-sys-color-on-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      pointer-events: none;
    }

    /* ─── Bottom row ──────────────────────────────────── */
    .bar-bottom {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .bar-volume {
      display: flex;
      align-items: center;
      gap: 2px;
      flex: 1;
    }

    /* ─── Playlist ────────────────────────────────────── */
    .playlist-wrapper {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.35s var(--m3-easing-standard);
    }
    .playlist-wrapper.open {
      grid-template-rows: 1fr;
    }
    .playlist-wrapper > .playlist {
      overflow: hidden;
    }
    .playlist-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface-variant);
    }
    .playlist-count {
      font-size: 11px;
      background: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
      padding: 1px 6px;
      border-radius: var(--md-sys-shape-corner-full);
    }
    .playlist-list {
      max-height: 220px;
      overflow-y: auto;
      padding: 0 4px 4px;
    }
    .playlist-list::-webkit-scrollbar {
      width: 4px;
    }
    .playlist-list::-webkit-scrollbar-thumb {
      background: var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-full);
    }
    .playlist-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 6px 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      border-radius: var(--md-sys-shape-corner-small);
      transition:
        background-color 0.15s,
        transform 0.1s;
    }
    .playlist-item:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 8%, transparent);
    }
    .playlist-item:active {
      transform: scale(0.98);
    }
    .playlist-item.active {
      background-color: var(--md-sys-color-secondary-container);
    }
    .pl-cover-box {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      position: relative;
      background: var(--md-sys-color-surface-container-highest);
      border-radius: var(--md-sys-shape-corner-extra-small);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pl-cover {
      width: 32px;
      height: 32px;
      border-radius: var(--md-sys-shape-corner-extra-small);
      object-fit: cover;
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    .playlist-item:hover .pl-cover {
      transform: scale(1.05);
    }
    .pl-cover-icon {
      font-size: 16px;
      color: var(--md-sys-color-on-surface-variant);
      position: relative;
      z-index: 0;
    }
    .pl-info {
      flex: 1;
      min-width: 0;
    }
    .pl-title {
      display: block;
      font-size: 13px;
      color: var(--md-sys-color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pl-artist {
      display: block;
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ─── Playing bars ────────────────────────────────── */
    .pl-bars {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 16px;
      padding: 0 2px;
    }
    .pl-bars span {
      display: block;
      width: 3px;
      background: var(--md-sys-color-primary);
      border-radius: 1px;
      animation: eq 0.6s ease-in-out infinite alternate;
    }
    .pl-bars .bar1 {
      height: 60%;
      animation-delay: 0s;
    }
    .pl-bars .bar2 {
      height: 100%;
      animation-delay: 0.2s;
    }
    .pl-bars .bar3 {
      height: 40%;
      animation-delay: 0.4s;
    }

    /* ─── Keyframes ───────────────────────────────────── */
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @keyframes eq {
      0% {
        height: 20%;
      }
      100% {
        height: 100%;
      }
    }
    @keyframes meta-switch {
      0% {
        opacity: 0;
        transform: translateY(6px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class MusicPlayerComponent implements OnInit {
  mp = inject(MusicPlayerService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  songSwitch = signal(false);
  progressDragging = signal(false);
  volumeDragging = signal(false);
  seekTarget = signal<number | null>(null);

  progressBar = viewChild<ElementRef>('progressBar');
  volumeBar = viewChild<ElementRef>('volumeBar');

  private progressPctInternal = signal(0);
  private volumePctInternal = signal(0);

  constructor() {
    effect(() => {
      const song = this.mp.currentSong();
      if (song.id >= 0) {
        this.songSwitch.set(true);
        setTimeout(() => this.songSwitch.set(false), 300);
      }
    });

    effect(() => {
      const ct = this.mp.currentTime();
      const d = this.mp.duration();
      const target = this.seekTarget();
      if (target !== null && d > 0) {
        if (Math.abs((ct / d) * 100 - target) < 2) {
          this.seekTarget.set(null);
        }
      }
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      void this.mp.init();
    }
  }

  onTogglePlay(): void {
    this.mp.toggle();
  }

  get progressPct(): () => number {
    return () => {
      if (this.progressDragging()) {
        return this.progressPctInternal();
      }
      const seek = this.seekTarget();
      if (seek !== null) {
        return seek;
      }
      const d = this.mp.duration();
      return d > 0 ? (this.mp.currentTime() / d) * 100 : 0;
    };
  }

  get repeatIcon(): () => string {
    return () => {
      const m = this.mp.repeatMode();
      return m === 0 ? 'repeat' : m === 1 ? 'repeat_one' : 'repeat';
    };
  }

  formatTime(sec: number): string {
    if (!sec || sec < 0) {
      return '0:00';
    }
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + s.toString().padStart(2, '0');
  }

  onProgressDown(e: PointerEvent): void {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this.progressDragging.set(true);
    this.updateProgress(e);
  }
  onProgressMove(e: PointerEvent): void {
    if (!this.progressDragging()) {
      return;
    }
    this.updateProgress(e);
  }
  onProgressUp(): void {
    if (!this.progressDragging()) {
      return;
    }
    const target = this.progressPctInternal();
    this.seekTarget.set(target);
    this.mp.seek(target / 100);
    this.progressDragging.set(false);
  }
  private updateProgress(e: PointerEvent): void {
    const el = this.progressBar()?.nativeElement as HTMLElement | undefined;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    this.progressPctInternal.set(pct);
  }

  onVolumeDown(e: PointerEvent): void {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this.volumeDragging.set(true);
    this.updateVolume(e);
  }
  onVolumeMove(e: PointerEvent): void {
    if (!this.volumeDragging()) {
      return;
    }
    this.updateVolume(e);
  }
  onVolumeUp(): void {
    if (!this.volumeDragging()) {
      return;
    }
    this.mp.setVolume(this.volumePctInternal() / 100);
    this.volumeDragging.set(false);
  }
  private updateVolume(e: PointerEvent): void {
    const el = this.volumeBar()?.nativeElement as HTMLElement | undefined;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    this.volumePctInternal.set(pct);
    this.mp.setVolume(pct / 100);
  }

  onBarCoverError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
