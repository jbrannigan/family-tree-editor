[![CI](https://github.com/jbrannigan/family-tree-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/jbrannigan/family-tree-editor/actions/workflows/ci.yml)
[![Pages](https://github.com/jbrannigan/family-tree-editor/actions/workflows/pages.yml/badge.svg)](https://github.com/jbrannigan/family-tree-editor/actions/workflows/pages.yml)
[![Pages deploy](https://img.shields.io/github/deployments/jbrannigan/family-tree-editor/github-pages?label=pages&logo=github)](https://github.com/jbrannigan/family-tree-editor/deployments/github-pages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# Family Tree Editor

A lightweight web app for editing a plain‑text family tree and viewing it as an interactive tree and SVG diagram. You can **focus** on a sub‑tree (🔍), surface a **pedigree lineage** for the focused person, **unfocus** to restore the full view, and **export** HTML / SVG / JSON (optionally just the focused or pedigree view). You can filter the tree to find instances of a string.

---

## Live demo

➡️ https://jbrannigan.github.io/family-tree-editor/

## Quick start

**Requirements:** Node 18 or 20, npm

```bash
npm install
npm start
```

Open http://localhost:3000

---

## Why?

We had a legacy version of the Clan Family Tree trapped in an obsolete AutoCAD clone. The essential content was rescued as a file using tab indents to denote parent-child level. We wanted to keep that as a base level of communication due to its universality and being archival friendly. The first goal was to enable quality control of the text file through different visualizations.

## Future Features

- QC the text file for consistent representation of names, birth, death, marriage/divorced time and place.
- Move the existing semantics to a JSON format which will then be expanded to any new semantics that are required.
- Allow an "edit card" type of entry that exposes the JSON semantics
- Preserve any new semantics in the same tabbed text file representation (export/import)
- Improve visualization reflecting improved semantics
- Export to GEDCOM for future custodians

## Using the app

1. **Choose file** to load your tree text (or paste into the editor).
2. Edit in the **Tree Text Editor** (left pane).
   - Use tabs for indentation (there’s a Normalize indentation tool if you start with spaces).
3. The **Tree View** (right pane) updates live and provides keyboard navigation.
4. Click 🔍 to **focus** on any node. Click **Unfocus** in the Tree View toolbar to restore.
5. Turn on **Export focused view** (top‑right) to export only the focused sub‑tree.
6. While a focus is active, enable **Show pedigree when focused** (Graph View) to display and export just that lineage.

---

## Keyboard (Tree View)

- **↑ / ↓** — move to previous/next visible node
- **→** — expand node (or move into first child if already expanded)
- **←** — collapse node (or move to parent if already collapsed)
- **Enter / Space** — toggle expand/collapse (or focus leaf)
- **Home / End** — jump to first / last visible node

Accessibility: the tree uses `role="tree"` / `role="treeitem"`, roving `tabIndex`, `aria-expanded`, and a visible focus outline.

---

## Exports & downloads

- **Save edited text** — downloads the current editor text as `.txt`
- **Download HTML** — static interactive page (collapsible tree or pedigree)
- **Download SVG** — the graph view as raw SVG
- **Download JSON** — the current tree data

> Tip: check **Export focused view** to export only the currently focused sub‑tree, and pair it with **Show pedigree when focused** to export the lineage instead of the entire branch.

---

## Testing

Unit tests (Vitest):

```bash
npm run test:unit
```

End‑to‑end tests (Playwright):

```bash
npm run test:e2e:install   # first time only
npm run test:e2e
```

---

## Development notes

- Two‑pane layout with a draggable resizer (`left` editor, `right` tree).
- Tree View shows subtle vertical **indent guides**; they automatically hide while a focus is active.
- Focus tools live in the Tree View toolbar: **Expand all**, **Collapse all**, **Unfocus**.
- HTML export includes a self‑contained collapsible tree for easy sharing.

---

## License

MIT. See `LICENSE` (or the license section in this repository).

<!-- preview check: 2025-08-17T05:02:55Z -->
