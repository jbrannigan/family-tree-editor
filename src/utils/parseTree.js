// utils/parseTree.js
//
// Robust indentation parser:
// - Accepts tabs and spaces at line start
// - 1 tab = 1 level; every 4 leading spaces = 1 level
// - Empty/whitespace-only lines are ignored
// - Falls back to "(unnamed)" when a line has no label
// - Returns an array of root nodes: [{ id, name, children: [...] }, ...]
//
// Both named and default export provided for convenience.

let _idCounter = 0;
const newId = () => `n-${_idCounter++}`;

function normalize(text) {
  if (!text) return '';
  // Strip UTF-8 BOM, normalize newlines
  const noBom = text.replace(/^\uFEFF/, '');
  return noBom.replace(/\r\n?/g, '\n');
}

function measureIndent(line) {
  // Count leading tabs & spaces, compute "levels" (tabs + floor(spaces/4))
  let i = 0;
  let tabs = 0;
  let spaces = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '\t') {
      tabs += 1;
      i += 1;
      continue;
    }
    if (ch === ' ') {
      // count contiguous spaces until a non-space
      while (i < line.length && line[i] === ' ') {
        spaces += 1;
        i += 1;
      }
      break; // stop once non-space or end is hit
    }
    break;
  }
  const levels = tabs + Math.floor(spaces / 4);
  return { levels, startIndex: i };
}

export function parseTree(text) {
  _idCounter = 0; // reset per parse
  const lines = normalize(text).split('\n');

  const roots = [];
  const stack = []; // stack[depth] = last node at that depth

  for (const raw of lines) {
    if (!raw || raw.trim() === '') continue;

    const { levels: depth, startIndex } = measureIndent(raw);
    // Remainder of the line is the label
    const nameRaw = raw.slice(startIndex).trim();
    const name = nameRaw || '(unnamed)';

    const node = { id: newId(), name, children: [] };

    if (depth <= 0) {
      // New root
      roots.push(node);
      stack.length = 0;
      stack[0] = node;
    } else {
      // Ensure stack is not deeper than current depth
      if (stack.length > depth) stack.length = depth;
      const parent = stack[depth - 1];
      if (!parent) {
        // Malformed indent (child without parent): treat as root
        roots.push(node);
        stack.length = 0;
        stack[0] = node;
      } else {
        parent.children.push(node);
        stack[depth] = node;
      }
    }
  }

  return roots;
}

export default parseTree;
