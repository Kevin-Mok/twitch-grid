import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { decodeShare, defaultData, encodeShare, MAX_BACKUP_BYTES, MAX_SHARE_LENGTH, parseBackup, restoreBackup, validateData, type AppData, type WatchSession } from '../domain';
import { importViewingtonCode } from '../viewington';

export interface TransferPanelProps {
  mode: 'share' | 'backup' | null;
  close(): void;
  data: AppData;
  restore(data: AppData): void;
  originalRaw: string | null;
  applySession(session: WatchSession): void;
  onError(message: string): void;
}

export function downloadText(text: string, name: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: name.endsWith('.json') ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function parseWatchInput(input: string): WatchSession {
  const trimmed = input.trim();
  if (trimmed.length > MAX_SHARE_LENGTH + 2048) throw new Error('Watch link is too large. Use a JSON backup instead.');
  const value = /^https?:\/\//i.test(trimmed) ? new URL(trimmed).hash : trimmed;
  return decodeShare(value.startsWith('#watch=') ? value.slice('#watch='.length) : value);
}

export function TransferPanel({ mode, close, data, restore, originalRaw, applySession, onError }: TransferPanelProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const shareLinkField = useRef<HTMLTextAreaElement>(null);
  const shareCodeField = useRef<HTMLTextAreaElement>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [watchInput, setWatchInput] = useState('');
  const [backupInput, setBackupInput] = useState('');
  const [legacyInput, setLegacyInput] = useState('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [replaceConfirmed, setReplaceConfirmed] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [pendingShare, setPendingShare] = useState<WatchSession | null>(null);
  const share = useMemo(() => {
    try { return { code: encodeShare(data.session), error: '' }; }
    catch (error) { return { code: '', error: error instanceof Error ? error.message : 'Cannot share this session.' }; }
  }, [data.session]);
  const shareLink = share.code ? `${location.origin}${location.pathname}#watch=${share.code}` : '';

  useEffect(() => {
    const element = dialog.current;
    if (mode && element && !element.open) element.showModal();
    if (!mode && element?.open) element.close();
    setError('');
    setStatus('');
    setReplaceConfirmed(false);
  }, [mode]);

  useEffect(() => {
    const readHash = () => {
      setPendingShare(null);
      if (!location.hash.startsWith('#watch=')) return;
      try { setPendingShare(parseWatchInput(location.hash)); }
      catch (error) { onErrorRef.current(error instanceof Error ? error.message : 'Invalid shared watch link.'); }
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  function report(error: unknown) {
    const message = error instanceof Error ? error.message : 'The transfer could not be completed.';
    setError(message);
    setStatus('');
    onError(message);
  }

  function dismissShare() {
    setPendingShare(null);
    history.replaceState(history.state, '', `${location.pathname}${location.search}`);
  }

  async function copy(text: string, field: HTMLTextAreaElement | null) {
    setError('');
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied to clipboard.');
    } catch {
      field?.focus();
      field?.select();
      setStatus('Clipboard unavailable. Select and copy the text manually.');
    }
  }

  async function readBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setError('');
    setBackupInput('');
    setReplaceConfirmed(false);
    setReadingFile(true);
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 1 MiB size limit.');
      const text = await file.text();
      parseBackup(text);
      setBackupInput(text);
      setStatus(`Loaded ${file.name}. Choose merge or replace, then restore.`);
    } catch (error) { report(error); }
    finally { setReadingFile(false); }
  }

  function restoreJson() {
    try {
      if (restoreMode === 'replace' && !replaceConfirmed) throw new Error('Confirm replacement of your current session and saved profiles.');
      const incoming = parseBackup(backupInput);
      restore(restoreBackup(data, incoming, restoreMode));
      close();
    } catch (error) { report(error); }
  }

  return <>
    {pendingShare && <section className="shared-banner" aria-label="Shared watch configuration">
      <div><strong>Shared watch configuration</strong><p>{pendingShare.channels.length ? pendingShare.channels.map((channel) => channel.login).join(', ') : 'Empty watch list'}. Applying changes your current streams and keeps saved profiles.</p></div>
      <div className="button-row">
        <button type="button" onClick={() => { applySession(pendingShare); dismissShare(); }}>Apply shared channels</button>
        <button type="button" onClick={dismissShare}>Dismiss</button>
      </div>
    </section>}
    <dialog ref={dialog} className="transfer-dialog" aria-labelledby="transfer-title" onCancel={(event) => { event.preventDefault(); close(); }}>
      <div className="dialog-heading"><h2 id="transfer-title">{mode === 'share' ? 'Share streams' : 'Backups & imports'}</h2><button type="button" onClick={close} aria-label="Close transfer panel">Close</button></div>
      <div className="dialog-content">
        {mode === 'share' ? <>
          <p>Share channel order, global quality and layout. Audio choices, chat settings and saved profiles stay local.</p>
          {share.error && <p className="form-error" role="alert">{share.error}</p>}
          <label htmlFor="share-link">Watch link</label>
          <textarea id="share-link" ref={shareLinkField} value={shareLink} readOnly rows={3} onFocus={(event) => event.currentTarget.select()} />
          <div className="button-row"><button type="button" disabled={!share.code} onClick={() => void copy(shareLink, shareLinkField.current)}>Copy link</button></div>
          <label htmlFor="share-code">Share code</label>
          <textarea id="share-code" ref={shareCodeField} value={share.code} readOnly rows={2} onFocus={(event) => event.currentTarget.select()} />
          <div className="button-row"><button type="button" disabled={!share.code} onClick={() => void copy(share.code, shareCodeField.current)}>Copy code</button></div>
          <hr />
          <label htmlFor="watch-input">Watch link or code to open</label>
          <textarea id="watch-input" value={watchInput} onChange={(event) => setWatchInput(event.target.value)} rows={3} maxLength={MAX_SHARE_LENGTH + 2048} />
          <p>Applying replaces your current watch configuration. Saved profiles are kept.</p>
          <button type="button" disabled={!watchInput.trim()} onClick={() => {
            try { applySession(parseWatchInput(watchInput)); close(); }
            catch (error) { report(error); }
          }}>Apply shared channels</button>
        </> : <>
          <p>Your data belongs to this browser and site address. Export a backup to transfer it to another browser, device or domain, or before clearing site data.</p>
          <div className="button-row">
            <button type="button" onClick={() => {
              try { downloadText(JSON.stringify(validateData(data), null, 2), `twitch-multiplayer-backup-${new Date().toISOString().slice(0, 10)}.json`); }
              catch (error) { report(error); }
            }}>Download JSON backup</button>
            {originalRaw !== null && <button type="button" onClick={() => {
              try { downloadText(originalRaw, 'twitch-multiplayer-original-storage.txt'); }
              catch (error) { report(error); }
            }}>Download original stored data</button>}
          </div>
          <hr />
          <label htmlFor="backup-file">Choose JSON backup (up to 1 MiB)</label>
          <input id="backup-file" type="file" accept=".json,application/json" disabled={readingFile} onChange={(event) => void readBackup(event)} />
          <label htmlFor="backup-input">Or paste backup JSON</label>
          <textarea id="backup-input" value={backupInput} onChange={(event) => { setBackupInput(event.target.value); setReplaceConfirmed(false); }} rows={5} maxLength={MAX_BACKUP_BYTES} />
          <label htmlFor="restore-mode">Restore behavior</label>
          <select id="restore-mode" value={restoreMode} onChange={(event) => { setRestoreMode(event.target.value === 'replace' ? 'replace' : 'merge'); setReplaceConfirmed(false); }}>
            <option value="merge">Merge saved profiles; keep current session</option>
            <option value="replace">Replace current session and all saved profiles</option>
          </select>
          <p>Merge adds saved profiles and keeps your current streams. A backup without saved profiles adds nothing when merged.</p>
          {restoreMode === 'replace' && <label className="confirm-replace" htmlFor="confirm-replace"><input id="confirm-replace" type="checkbox" checked={replaceConfirmed} onChange={(event) => setReplaceConfirmed(event.target.checked)} /> I understand this replaces my current session and all saved profiles.</label>}
          <button type="button" disabled={readingFile || !backupInput.trim() || (restoreMode === 'replace' && !replaceConfirmed)} onClick={restoreJson}>{readingFile ? 'Reading backup…' : 'Restore backup'}</button>
          <hr />
          <label htmlFor="viewington-input">Viewington profile code</label>
          <textarea id="viewington-input" value={legacyInput} onChange={(event) => setLegacyInput(event.target.value)} rows={3} maxLength={MAX_SHARE_LENGTH} />
          <p>Import verified Viewington base64 or compressed profile codes. Channel lists become saved profiles with muted playback defaults; your current streams stay selected.</p>
          <button type="button" disabled={!legacyInput.trim()} onClick={() => {
            try { restore(restoreBackup(data, { ...defaultData(), profiles: importViewingtonCode(legacyInput) }, 'merge')); close(); }
            catch (error) { report(error); }
          }}>Import Viewington profiles</button>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {status && <p role="status">{status}</p>}
      </div>
    </dialog>
  </>;
}
