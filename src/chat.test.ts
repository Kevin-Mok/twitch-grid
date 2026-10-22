import { expect, it } from 'vitest';
import { embedParents, twitchChat } from './chat';

it('uses current hostname and explicit ancestors without ports or duplicate parents', () => {
  expect(embedParents('localhost', 'example.com, localhost')).toEqual(['localhost', 'example.com']);
  expect(embedParents('branch-123.vercel.app')).toEqual(['branch-123.vercel.app']);
  expect(() => embedParents('localhost', 'https://example.com/path')).toThrow();
});
it('creates only official chat URLs and rejects injected channels', () => {
  const url = new URL(twitchChat.embedUrl('somechannel', ['localhost', 'example.com']));
  expect(url.origin).toBe('https://www.twitch.tv');
  expect(url.pathname).toBe('/embed/somechannel/chat');
  expect(url.searchParams.getAll('parent')).toEqual(['localhost', 'example.com']);
  expect(url.searchParams.get('darkpopout')).toBe('');
  expect(() => twitchChat.embedUrl('../bad', ['localhost'])).toThrow();
  expect(twitchChat.externalUrl('somechannel')).toBe('https://www.twitch.tv/popout/somechannel/chat?popout=');
});
