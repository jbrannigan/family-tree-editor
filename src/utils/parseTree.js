// utils/parseTree.js
// Parse tab-indented text into an array of root nodes.
// - Tabs are the source of truth for indentation.
// - Optionally normalize leading groups of 4 spaces into a single tab.
// - Generates stable-ish ids for React keys and focus behavior.

export function parseTree(text, { normalizeSpaces = true } = {}) {
  const src = String(text || "");
  const linesRaw = src.split("\n");

  const normalizeIndent = (line) => {
    if (!normalizeSpaces) return line;
    const m = line.match(/^[ \t]*/)?.[0] ?? "";
    const tabs = m.replace(/ {4}/g, "\t").replace(/ +(?=\t)/g, "");
    return tabs + line.slice(m.length);
  };

  const lines = linesRaw
    .map((l) => normalizeIndent(l))
    .filter((l) => l.trim() !== "");

  const roots = [];
  const stack = []; // { level, node }

  let idSeq = 0;
  const makeNode = (name) => ({ id: `n-${idSeq++}`, name, children: [] });

  for (const line of lines) {
    const m = line.match(/^(\t*)(.*)$/);
    const level = (m?.[1] || "").length;
    const name = (m?.[2] || "").trim();
    const node = makeNode(name);

    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();

    if (stack.length === 0) {
      roots.push(node);
      stack.push({ level, node });
      continue;
    }
    const parent = stack[stack.length - 1].node;
    parent.children.push(node);
    stack.push({ level, node });
  }

  return roots;
}
