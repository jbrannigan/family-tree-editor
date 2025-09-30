[![CI](https://github.com/jbrannigan/family-tree-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/jbrannigan/family-tree-editor/actions/workflows/ci.yml)
[![Pages](https://github.com/jbrannigan/family-tree-editor/actions/workflows/pages.yml/badge.svg)](https://github.com/jbrannigan/family-tree-editor/actions/workflows/pages.yml)
[![Pages deploy](https://img.shields.io/github/deployments/jbrannigan/family-tree-editor/github-pages?label=pages&logo=github)](https://github.com/jbrannigan/family-tree-editor/deployments/github-pages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

# Family Tree Editor

A React-based editor for building, viewing, and sharing family trees.

- **Edit in text** using the simple **TreeDown** syntax (invented by Larry McGinty)
- **Preview instantly** as an interactive, collapsible tree
- **Export in multiple formats** (SVG, HTML, JSON, TreeDown)
- **Focused exports**: isolate a branch by selecting a person/union and setting **focus** (🔍); then export just their ancestors or their ancestors + descendants
- **Collaboration-friendly**: export a focused branch, share it for edits, and re-import/merge later

## Why?

We had a legacy version of the Clan Family Tree trapped in an obsolete AutoCAD clone. The essential content was rescued as a file using tab indents to denote parent-child level. We wanted to keep that as a base level of communication due to its universality and being archival friendly. The first goal was to enable quality control of the text file through different visualizations.

## Live Demo

➡️ https://jbrannigan.github.io/family-tree-editor/

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Export Options](#export-options)
- [Development](#development)
- [Contributing](#contributing)
- [Testing](#testing)
- [License](#license)

---

## Installation

Requirements: Node 18 or 20, npm

```bash
git clone https://github.com/jbrannigan/family-tree-editor.git
cd family-tree-editor
npm install
npm start
```

Open http://localhost:3000

---

## Usage

1. Enter your family tree in the text editor panel using the **TreeDown** format
2. See a live preview in the collapsible tree viewer and diagram view
3. Use the **Focus** buttons to zoom in on any branch
4. Export the full tree or a focused view in your preferred format

Accessibility: the tree uses `role="tree"` / `role="treeitem"`, roving `tabIndex`, `aria-expanded`, and a visible focus outline.

### TreeDown Example

```treedown
John McGinty & Margaret Kirk
    James McGinty b.1854 d.1932
        Mary (Mollie) b.1880
        Patrick McGinty b.1882 d.1945
    Ellen McGinty b.1856
```

- Indentation shows parent/child relationships
- A line with `&` shows a marriage/union
- Dates: `b.` for birth, `d.` for death
- Nicknames in parentheses
- Children inherit the last name of their parent unless specified

---

## Export Options

The editor supports several ways to export the tree for sharing, printing, or further editing. In addition to full-tree exports, you can export a _focused view_ of the tree based on the currently selected person or union.

### Focused Exports

When a node is focused, two export modes are available:

- **Ancestors Only**  
  Produces a **pedigree-style chart**: the selected person (focus) plus all direct ancestors up to the root(s).  
  Useful for:
  - Creating compact lineage charts for printing or sharing
  - Reviewing inherited attributes (names, dates) without descendant clutter
  - Extracting a clean lineage snippet when merging edits from collaborators

- **Ancestors + Subtree**  
  Produces a **descendant chart starting at the focus**, with the full lineage above.  
  Useful for:
  - Sharing or printing an entire branch
  - Reviewing or editing a subtree in isolation
  - Preparing a self-contained export for re-import or merge

### Export Formats

All export modes support multiple formats:

- **SVG** – styled diagram with right-angle connectors and shaded boxes
- **HTML** – collapsible tree view, identical to the in-app UI
- **JSON** – structured representation for automation or programmatic editing
- **TreeDown (.txt)** – plain text in the TreeDown syntax for sharing or editing

---

⚡️ _Tip:_ Focused exports are especially handy when collaborating. A contributor can work on just one branch in TreeDown form, then return it for merge without needing the full tree.

---

## Development

This project uses [Create React App](https://create-react-app.dev/).

- `npm start` – run in development mode
- `npm run build` – build for production
- `npm test` – run tests

### Notes

- Three‑pane layout (`left` editor, `right` tree, `bottom` graph.)
- Tree View shows subtle vertical **indent guides**; they automatically hide while a focus is active.
- Focus tools live in the Tree View toolbar: **Expand all**, **Collapse all**, **Unfocus**.
- HTML export includes a self‑contained collapsible tree for easy sharing.

### Future Features

- QC the text file for consistent representation of names, birth, death, marriage/divorced time and place.
- Move the existing semantics to a JSON format which will then be expanded to any new semantics that are required.
- Allow an "edit card" type of entry that exposes the JSON semantics
- Preserve any new semantics in the same tabbed text file representation (export/import)
- Improve visualization reflecting improved semantics
- Export to GEDCOM for future custodians

---

## Contributing

Pull requests are welcome!  
Please open an issue first to discuss any significant changes.

---

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

## License

MIT License. See [LICENSE](LICENSE) file for details.

<!-- preview check: 2025-08-17T05:02:55Z -->
