import type { LayoutMode } from './domain';

export interface TileRect { x: number; y: number; width: number; height: number }
export interface LayoutResult { width: number; height: number; tiles: TileRect[] }

const GAP = 8;
const MIN_WIDTH = 400;
const MIN_VIDEO_HEIGHT = 300;
const CHROME_HEIGHT = 36;

function tileHeight(width: number): number {
  return Math.max(MIN_VIDEO_HEIGHT, width * 9 / 16) + CHROME_HEIGHT;
}

function grid(count: number, width: number, height: number, columns: number): LayoutResult {
  const rows = Math.ceil(count / columns);
  const canvasWidth = Math.max(width, columns * MIN_WIDTH + (columns - 1) * GAP);
  const availableWidth = (canvasWidth - (columns - 1) * GAP) / columns;
  const availableVideoHeight = (height - (rows - 1) * GAP) / rows - CHROME_HEIGHT;
  const tileWidth = availableVideoHeight >= MIN_VIDEO_HEIGHT
    ? Math.max(MIN_WIDTH, Math.min(availableWidth, availableVideoHeight * 16 / 9))
    : availableWidth;
  const tileH = tileHeight(tileWidth);
  const contentHeight = rows * tileH + (rows - 1) * GAP;
  const canvasHeight = Math.max(height, contentHeight);
  const top = (canvasHeight - contentHeight) / 2;
  const tiles = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, count - row * columns);
    const rowWidth = inRow * tileWidth + (inRow - 1) * GAP;
    return { x: (canvasWidth - rowWidth) / 2 + (index % columns) * (tileWidth + GAP), y: top + row * (tileH + GAP), width: tileWidth, height: tileH };
  });
  return { width: canvasWidth, height: canvasHeight, tiles };
}

export function calculateLayout(count: number, width: number, height: number, columns: LayoutMode = 'auto', focusIndex: number | null = null): LayoutResult {
  if (!Number.isInteger(count) || count < 0 || count > 32) throw new Error('Layout channel count must be an integer from 0 to 32.');
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) throw new Error('Layout dimensions must be finite, non-negative numbers.');
  if (columns !== 'auto' && ![1, 2, 3, 4].includes(columns)) throw new Error('Layout columns must be auto or 1–4.');
  if (count === 0) return { width, height, tiles: [] };

  if (count > 1 && focusIndex !== null && Number.isInteger(focusIndex) && focusIndex >= 0 && focusIndex < count) {
    let smallColumns = columns === 'auto' ? Math.max(1, Math.floor((width + GAP) / (MIN_WIDTH + GAP))) : columns;
    smallColumns = Math.min(smallColumns, Math.max(2, count - 1));
    if (smallColumns === 1 && width >= MIN_WIDTH * 2 + GAP) smallColumns = 2;
    const smaller = grid(count - 1, width, 0, smallColumns);
    const focusWidth = Math.min(smaller.width, smaller.tiles[0].width * 2 + GAP);
    const focusHeight = tileHeight(focusWidth);
    const contentHeight = focusHeight + GAP + smaller.height;
    const canvasHeight = Math.max(height, contentHeight);
    const top = (canvasHeight - contentHeight) / 2;
    let smallIndex = 0;
    const tiles = Array.from({ length: count }, (_, index) => {
      if (index === focusIndex) return { x: (smaller.width - focusWidth) / 2, y: top, width: focusWidth, height: focusHeight };
      const tile = smaller.tiles[smallIndex++];
      return { ...tile, y: top + focusHeight + GAP + tile.y };
    });
    return { width: smaller.width, height: canvasHeight, tiles };
  }

  if (columns !== 'auto') return grid(count, width, height, Math.min(count, columns));
  const maxColumns = Math.min(count, Math.max(1, Math.floor((width + GAP) / (MIN_WIDTH + GAP))));
  const candidates = Array.from({ length: maxColumns }, (_, index) => grid(count, width, height, index + 1));
  candidates.sort((a, b) => {
    const aFits = a.height <= height + 0.001;
    const bFits = b.height <= height + 0.001;
    if (aFits !== bFits) return aFits ? -1 : 1;
    if (!aFits && Math.abs(a.height - b.height) > 0.001) return a.height - b.height;
    return b.tiles[0].width - a.tiles[0].width;
  });
  return candidates[0];
}
