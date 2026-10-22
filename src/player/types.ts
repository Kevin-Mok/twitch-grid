import type { Channel } from '../domain';

export type LiveState = 'unknown' | 'online' | 'offline' | 'error';
export type PlaybackState = 'loading' | 'playing' | 'paused' | 'buffering' | 'blocked' | 'error';
export interface PlayerSnapshot {
  live: LiveState;
  playback: PlaybackState;
  quality: string;
  qualities: string[];
  fallback: string | null;
  error: string | null;
  lastSignal: number;
  audioPending: boolean;
}
export type PlayerEvent =
  | { type: 'ready' | 'online' | 'offline' | 'play' | 'playing' | 'pause' | 'blocked' }
  | { type: 'error'; message: string }
  | { type: 'sample'; quality: string; qualities: string[]; muted: boolean; volume: number; paused: boolean };
export interface PlayerHandle {
  play(): void;
  pause(): void;
  setMuted(value: boolean): void;
  setVolume(value: number): void;
  setQuality(value: string): void;
  sample(): void;
  destroy(): void;
}
export type PlayerFactory = (host: HTMLElement, channel: string, emit: (event: PlayerEvent) => void) => Promise<PlayerHandle>;
export interface PlayerSlot {
  channel: Channel;
  element: HTMLElement;
  host: HTMLElement;
  header: HTMLElement;
  snapshot: PlayerSnapshot;
}
