import { describe, expect, it } from 'vitest';
import { buildPedigreeTree } from '../utils/buildPedigree';

const tree = [
  {
    id: 'root',
    name: 'Root',
    children: [
      {
        id: 'branch-a',
        name: 'Branch A',
        children: [
          { id: 'leaf-a1', name: 'Leaf A1', children: [] },
          {
            id: 'leaf-a2',
            name: 'Leaf A2',
            children: [{ id: 'great', name: 'Great Grandchild', children: [] }],
          },
        ],
      },
      {
        id: 'branch-b',
        name: 'Branch B',
        children: [{ id: 'leaf-b1', name: 'Leaf B1', children: [] }],
      },
    ],
  },
];

describe('buildPedigreeTree', () => {
  it('returns a single lineage from the focused node up to the root', () => {
    const pedigree = buildPedigreeTree(tree, 'leaf-a2');
    expect(pedigree).toEqual([
      {
        id: 'root',
        name: 'Root',
        children: [
          {
            id: 'branch-a',
            name: 'Branch A',
            children: [
              {
                id: 'leaf-a2',
                name: 'Leaf A2',
                children: [{ id: 'great', name: 'Great Grandchild', children: [] }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('returns null when the target cannot be found', () => {
    expect(buildPedigreeTree(tree, 'missing')).toBeNull();
  });
});
