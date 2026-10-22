import { describe, expect, it } from 'vitest';
import { calculateLayout, type LayoutResult } from './layout';

function expectUsable(result: LayoutResult, count: number) {
  expect(result.tiles).toHaveLength(count);
  for (const [index, tile] of result.tiles.entries()) {
    expect(tile.x).toBeGreaterThanOrEqual(0);
    expect(tile.y).toBeGreaterThanOrEqual(0);
    expect(tile.width).toBeGreaterThanOrEqual(400);
    expect(tile.height - 72).toBeGreaterThanOrEqual(300);
    expect(tile.x + tile.width).toBeLessThanOrEqual(result.width + 0.001);
    expect(tile.y + tile.height).toBeLessThanOrEqual(result.height + 0.001);
    expect(tile.height - 72).toBeCloseTo(Math.max(300, tile.width * 9 / 16), 5);
    for (const other of result.tiles.slice(index + 1)) {
      const separated = tile.x + tile.width <= other.x + 0.001
        || other.x + other.width <= tile.x + 0.001
        || tile.y + tile.height <= other.y + 0.001
        || other.y + other.height <= tile.y + 0.001;
      expect(separated).toBe(true);
    }
  }
}

describe('deterministic video layout', () => {
  it.each([1, 2, 3, 5, 8])('places %i players at practical desktop viewports without cropping or overlap', (count) => {
    for (const [width, height] of [[1440, 900], [1280, 720], [1920, 1080]]) {
      const result = calculateLayout(count, width, height);
      expectUsable(result, count);
      expect(result).toEqual(calculateLayout(count, width, height));
      expect(result.width).toBe(width);
    }
  });

  it('centers a single 16:9 video within the available surface', () => {
    const result = calculateLayout(1, 1200, 800);
    expect(result).toEqual({ width: 1200, height: 800, tiles: [{ x: 0, y: 26.5, width: 1200, height: 747 }] });
  });

  it('centers incomplete rows and honors requested column counts', () => {
    const result = calculateLayout(5, 1440, 900, 3);
    expectUsable(result, 5);
    expect(result.tiles[0].y).toBe(result.tiles[2].y);
    expect(result.tiles[3].y).toBeGreaterThan(result.tiles[0].y);
    expect(result.tiles[3].x).toBeGreaterThan(result.tiles[0].x);
    expect(result.tiles[3].x + result.tiles[4].x + result.tiles[4].width).toBeCloseTo(1440);
  });

  it('scrolls at narrow sizes without shrinking embeds below Twitch minimums', () => {
    const result = calculateLayout(3, 320, 300);
    expectUsable(result, 3);
    expect(result.width).toBe(400);
    expect(result.height).toBeGreaterThan(300);
    expect(result.tiles.map((tile) => tile.x)).toEqual([0, 0, 0]);
  });

  it('fits five streams into a useful 3-column desktop grid', () => {
    const result = calculateLayout(5, 1440, 900);
    expect(result.height).toBe(900);
    expect(result.tiles[0].y).toBe(result.tiles[2].y);
    expect(result.tiles[3].y).toBeGreaterThan(result.tiles[0].y);
  });

  it('makes the focused player larger while retaining order-indexed tiles for all others', () => {
    const result = calculateLayout(5, 1440, 1000, 'auto', 3);
    expectUsable(result, 5);
    expect(result.tiles[3].width).toBeGreaterThan(result.tiles[0].width);
    expect(result.tiles[3].y).toBeLessThan(result.tiles[0].y);
    expect(result.tiles[0].x).toBeLessThan(result.tiles[1].x);
    expect(result.tiles[2].y).toBeLessThanOrEqual(result.tiles[4].y);
  });

  it('enlarges a focused pair beyond its ordinary side-by-side size on a wide monitor', () => {
    const normal = calculateLayout(2, 1920, 1080);
    const focused = calculateLayout(2, 1920, 1080, 'auto', 0);
    expectUsable(focused, 2);
    expect(focused.tiles[0].width).toBeGreaterThan(normal.tiles[0].width);
    expect(focused.tiles[1].width).toBeLessThan(focused.tiles[0].width);
  });

  it('handles empty surfaces and ignores a stale focus selection', () => {
    expect(calculateLayout(0, 320, 200)).toEqual({ width: 320, height: 200, tiles: [] });
    expect(calculateLayout(2, 1200, 800, 'auto', 99)).toEqual(calculateLayout(2, 1200, 800));
    expectUsable(calculateLayout(1, 0, 0), 1);
  });

  it.each([[-1, 1000, 600], [1.5, 1000, 600], [33, 1000, 600], [1, NaN, 600], [1, 1000, Infinity]])
  ('rejects invalid dimensions or stream count %#', (count, width, height) => {
    expect(() => calculateLayout(count, width, height)).toThrow(/layout|dimension|count|channel/i);
  });
});
