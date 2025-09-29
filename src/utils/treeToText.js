// src/utils/treeToText.js
// Convert a tree (single root or array of roots) into the tab-indented
// text format understood by the editor. Used when exporting a focused
// sub-tree or pedigree as plain text.

function ensureArray(tree) {
  if (!tree) return [];
  return Array.isArray(tree) ? tree : [tree];
}

function formatName(value) {
  const name = value == null ? '' : String(value);
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : '(unnamed)';
}

function walk(nodes, lines, depth) {
  const indent = depth > 0 ? '    '.repeat(depth) : '';

  nodes.forEach((node) => {
    if (!node) return;
    const label = formatName(node.name);
    lines.push(`${indent}${label}`);

    if (Array.isArray(node.children) && node.children.length > 0) {
      walk(node.children, lines, depth + 1);
    }
  });
}

export function treeToText(tree) {
  const lines = [];
  walk(ensureArray(tree), lines, 0);
  return lines.join('\n');
}

export default treeToText;
