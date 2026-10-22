import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { addChannels, defaultData } from '../domain';
import { ChatPanel } from './ChatPanel';

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

function render(channel: string | null = 'alpha') {
  const session = addChannels(defaultData().session, 'alpha bravo');
  act(() => root.render(createElement(ChatPanel, { channels: session.channels, settings: { ...session.chat, open: true, channel }, update: vi.fn() })));
}
function button(label: string) {
  const result = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  expect(result).not.toBeNull();
  return result!;
}

it('keeps one channel dropdown in the header after load and switches chats directly', () => {
  const session = addChannels(defaultData().session, 'alpha bravo');
  const update = vi.fn();
  act(() => root.render(createElement(ChatPanel, { channels: session.channels, settings: { ...session.chat, open: true, channel: 'alpha' }, update })));
  const select = container.querySelector<HTMLSelectElement>('.chat-header select')!;
  expect(select).not.toBeNull();
  expect(container.querySelectorAll('select')).toHaveLength(1);
  expect(container.querySelector('.chat-channel')).toBeNull();
  const frame = container.querySelector('iframe')!;
  act(() => frame.dispatchEvent(new Event('load')));
  expect(container.querySelector('.chat-header select')).toBe(select);
  expect(container.querySelector('.chat-note')).toBeNull();
  act(() => { select.value = 'bravo'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(update).toHaveBeenCalledWith({ ...session.chat, open: true, channel: 'bravo' });
  act(() => button('Chat help').click());
  expect(container.querySelector('.chat-note a')?.getAttribute('href')).toContain('/popout/alpha/chat');
  expect(container.querySelector('iframe')).toBe(frame);
  render('bravo');
  expect(container.querySelector('iframe')).toBe(frame);
  expect(frame.getAttribute('src')).toContain('/bravo/chat');
  act(() => frame.dispatchEvent(new Event('load')));
  expect(container.querySelector('.chat-note')).toBeNull();
});

it('offers header channel selection without an embed and preserves collapse', () => {
  render(null);
  expect(container.querySelector<HTMLSelectElement>('.chat-header select')?.value).toBe('');
  expect(container.querySelector('iframe')).toBeNull();
  expect(button('Collapse chat')).not.toBeNull();
});
