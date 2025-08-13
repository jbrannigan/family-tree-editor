# Family Tree Editor

A lightweight web app for editing a plain‑text family tree and viewing it as an interactive tree and SVG diagram. You can **focus** on a sub‑tree (🔍), **unfocus** to restore the full view, and **export** HTML / SVG / JSON (optionally just the focused view).

---

## Quick start

**Requirements:** Node 18 or 20, npm

```bash
npm install
npm start
```

Open http://localhost:3000

---

## Using the app

1. **Choose file** to load your tree text (or paste into the editor).
2. Edit in the **Tree Text Editor** (left pane).  
   - Use tabs for indentation (there’s a Normalize indentation tool if you start with spaces).
3. The **Tree View** (right pane) updates live and provides keyboard navigation.
4. Click 🔍 to **focus** on any node. Click **Unfocus** in the Tree View toolbar to restore.
5. Turn on **Export focused view** (top‑right) to export only the focused sub‑tree.

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
- **Download HTML** — static interactive page (collapsible tree)  
- **Download SVG** — the graph view as raw SVG  
- **Download JSON** — the current tree data

> Tip: check **Export focused view** to export only the currently focused sub‑tree.

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
