import { describe, expect, it } from 'vitest';
import { treeToText } from '../utils/treeToText';

const sampleTree = [
  {
    id: 'a',
    name: 'Parent',
    children: [
      { id: 'b', name: 'Child 1', children: [] },
      {
        id: 'c',
        name: 'Child 2',
        children: [{ id: 'd', name: 'Grandchild', children: [] }],
      },
    ],
  },
];

describe('treeToText', () => {
  it('converts a forest into indented text', () => {
    expect(treeToText(sampleTree)).toBe(
      ['Parent', '    Child 1', '    Child 2', '        Grandchild'].join('\n'),
    );
  });

  it('normalizes empty or whitespace names to "(unnamed)"', () => {
    const forest = [{ id: 'x', name: '', children: [{ id: 'y', name: '   ', children: [] }] }];
    expect(treeToText(forest)).toBe(['(unnamed)', '    (unnamed)'].join('\n'));
  });

  it('returns an empty string for null or empty input', () => {
    expect(treeToText(null)).toBe('');
    expect(treeToText([])).toBe('');
  });
});
