import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addChannels, decodeShare, defaultData, encodeShare, type AppData } from '../domain';
import { TransferPanel, type TransferPanelProps } from './TransferPanel';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

function render(props: Partial<TransferPanelProps> = {}) {
  const data = defaultData();
  data.session = addChannels(data.session, 'alpha,beta');
  const complete = { mode: 'share' as const, close: vi.fn(), data, restore: vi.fn(), originalRaw: null, applySession: vi.fn(), onError: vi.fn(), ...props };
  act(() => root.render(createElement(TransferPanel, complete)));
  return complete;
}

function button(label: string): HTMLButtonElement {
  const found = [...container.querySelectorAll('button')].find((element) => element.textContent?.trim() === label);
  if (!found) throw new Error(`Missing button: ${label}`);
  return found;
}

function textarea(id: string, value: string) {
  const field = container.querySelector<HTMLTextAreaElement>(`#${id}`);
  if (!field) throw new Error(`Missing textarea: ${id}`);
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('transfer panel', () => {
  it('omits unrelated query parameters and fragments from generated watch links', () => {
    history.replaceState(null, '', '/watch?token=private-example&ref=personal#unrelated');
    render();
    const link = new URL(container.querySelector<HTMLTextAreaElement>('#share-link')!.value);
    expect(link.pathname).toBe('/watch');
    expect(link.search).toBe('');
    expect(link.href).not.toContain('private-example');
    expect(decodeShare(link.hash.slice('#watch='.length)).channels.map((channel) => channel.login)).toEqual(['alpha', 'beta']);
  });

  it('offers a self-contained watch link and a manual copy fallback', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) } });
    render();
    const field = container.querySelector<HTMLTextAreaElement>('#share-link');
    expect(field).not.toBeNull();
    expect(decodeShare(new URL(field!.value).hash.slice('#watch='.length)).channels.map((channel) => channel.login)).toEqual(['alpha', 'beta']);
    await act(async () => { button('Copy link').click(); });
    expect(container.textContent).toMatch(/copy.*manually|select.*copy/i);
  });

  it('applies a pasted watch code only to the current session', () => {
    const props = render();
    const shared = addChannels(defaultData().session, 'gamma');
    textarea('watch-input', encodeShare(shared));
    act(() => button('Apply shared channels').click());
    expect(props.applySession).toHaveBeenCalledWith(shared);
    expect(props.restore).not.toHaveBeenCalled();
  });

  it('rejects malformed pasted shared data without applying it', () => {
    const props = render();
    textarea('watch-input', 'broken');
    act(() => button('Apply shared channels').click());
    expect(props.applySession).not.toHaveBeenCalled();
    expect(container.querySelector('.form-error')?.textContent).toMatch(/share|code/i);
  });

  it('requires explicit application for a direct share fragment and retains saved profiles', () => {
    const shared = addChannels(defaultData().session, 'gamma');
    history.replaceState(null, '', `/#watch=${encodeShare(shared)}`);
    const props = render({ mode: null });
    expect(container.querySelector('.shared-banner')?.textContent).toContain('gamma');
    expect(props.applySession).not.toHaveBeenCalled();
    act(() => button('Apply shared channels').click());
    expect(props.applySession).toHaveBeenCalledWith(shared);
    expect(props.restore).not.toHaveBeenCalled();
    expect(location.hash).toBe('');
  });

  it('observes hash changes and reports invalid fragments without changing current data', () => {
    const props = render({ mode: null });
    act(() => {
      history.replaceState(null, '', `/#watch=${encodeShare(addChannels(defaultData().session, 'delta'))}`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(container.querySelector('.shared-banner')?.textContent).toContain('delta');
    act(() => {
      history.replaceState(null, '', '/#watch=broken');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(props.onError).toHaveBeenCalledWith(expect.stringMatching(/share|code/i));
    expect(props.applySession).not.toHaveBeenCalled();
  });

  it('merges a backup while preserving the current watching session', () => {
    const props = render({ mode: 'backup' });
    const imported: AppData = { ...defaultData(), profiles: [{ id: 'saved', name: 'Imported', session: addChannels(defaultData().session, 'gamma') }] };
    textarea('backup-input', JSON.stringify(imported));
    act(() => button('Restore backup').click());
    expect(props.restore).toHaveBeenCalledWith({ ...props.data, profiles: imported.profiles });
  });

  it('requires confirmation before replacing local data', () => {
    const props = render({ mode: 'backup' });
    textarea('backup-input', JSON.stringify(defaultData()));
    const select = container.querySelector<HTMLSelectElement>('#restore-mode')!;
    act(() => { select.value = 'replace'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(button('Restore backup').disabled).toBe(true);
    expect(props.restore).not.toHaveBeenCalled();
    act(() => container.querySelector<HTMLInputElement>('#confirm-replace')!.click());
    act(() => button('Restore backup').click());
    expect(props.restore).toHaveBeenCalledWith(defaultData());
  });

  it('resets replacement confirmation when the backup payload changes', () => {
    render({ mode: 'backup' });
    textarea('backup-input', JSON.stringify(defaultData()));
    const select = container.querySelector<HTMLSelectElement>('#restore-mode')!;
    act(() => { select.value = 'replace'; select.dispatchEvent(new Event('change', { bubbles: true })); });
    act(() => container.querySelector<HTMLInputElement>('#confirm-replace')!.click());
    expect(button('Restore backup').disabled).toBe(false);
    const changed = defaultData();
    changed.session = addChannels(changed.session, 'gamma');
    textarea('backup-input', JSON.stringify(changed));
    expect(button('Restore backup').disabled).toBe(true);
    expect(container.querySelector<HTMLInputElement>('#confirm-replace')?.checked).toBe(false);
  });

  it('rejects malformed backups without changing state', () => {
    const props = render({ mode: 'backup' });
    textarea('backup-input', '{bad');
    act(() => button('Restore backup').click());
    expect(props.restore).not.toHaveBeenCalled();
    expect(container.querySelector('.form-error')?.textContent).toMatch(/JSON|backup/i);
  });

  it('checks a selected file size before reading or restoring it', async () => {
    const props = render({ mode: 'backup' });
    textarea('backup-input', JSON.stringify(defaultData()));
    const input = container.querySelector<HTMLInputElement>('#backup-file')!;
    const file = new File(['x'.repeat(1024 * 1024 + 1)], 'large.json');
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(props.restore).not.toHaveBeenCalled();
    expect(container.querySelector('.form-error')?.textContent).toMatch(/1 MiB|size|large/i);
    expect(container.querySelector<HTMLTextAreaElement>('#backup-input')?.value).toBe('');
    expect(button('Restore backup').disabled).toBe(true);
  });

  it('imports verified Viewington code as saved profiles without switching current streams', () => {
    const props = render({ mode: 'backup' });
    textarea('viewington-input', 'VGVzdCx0d2l0Y2gsbW9uc3RlcmNhdA==');
    act(() => button('Import Viewington profiles').click());
    const restored = vi.mocked(props.restore).mock.calls[0]?.[0] as AppData | undefined;
    expect(restored?.session).toEqual(props.data.session);
    expect(restored?.profiles[0].name).toBe('Test');
    expect(restored?.profiles[0].session.channels.map((channel) => channel.login)).toEqual(['twitch', 'monstercat']);
  });
});
