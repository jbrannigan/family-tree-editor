import { describe, it, expect } from 'vitest';
import { parseTree } from '../utils/parseTree.js';

describe('parseTree', () => {
  const sample = [
    'Parent',
    '\tChild A',
    '\t\tGrandchild A1',
    '\tChild B',
    'Parent 2',
    '    Indented with spaces (treated as tab)',
  ].join('\n');

  it('returns an array of roots with stable ids', () => {
    const roots = parseTree(sample);
    expect(Array.isArray(roots)).toBe(true);
    expect(roots.length).toBe(2);
    const [p1, p2] = roots;
    expect(p1).toHaveProperty('id');
    expect(p2).toHaveProperty('id');
    expect(p1.children.length).toBe(2);
  });

  it('normalizes leading 4-space indents to tabs by default', () => {
    const roots = parseTree(sample);
    const second = roots[1];
    expect(second.children.length).toBe(1);
    expect(second.children[0].name).toMatch(/Indented with spaces/);
  });

  it('respects tabs as source of truth and leaves inline spaces intact', () => {
    const roots = parseTree('A\n\tB  with  inline  spaces');
    expect(roots[0].children[0].name).toBe('B  with  inline  spaces');
  });
});
