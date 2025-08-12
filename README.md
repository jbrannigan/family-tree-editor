# Family Tree Editor (v1.0.0-beta)

A lightweight, tab-indented text → interactive family tree editor.  
Paste or load a `.txt` with tab-indented lines and get:

- Live **Tree View** (collapsible nodes, focus/unfocus)
- **SVG View** (auto-generated diagram; downloadable)
- **Exports**: HTML, JSON, SVG (filenames include a timestamp suffix)

> **Beta:** The layout and styling are under active polish. Core parsing & views work.

---

## Demo (Quick Start)

1. **Install**
   ```bash
   npm install

3. **Run**
   ```bash
   npm start

4. **Use**
* Click **Choose File** or paste your tree text into the editor
* Expand/collapse nodes; click focus to isolate a branch
* **Unfocus** to return to the full tree
* **Download** HTML / JSON / SVG

---

## Text Format
Use tabs to indicate hierachy:

```
John McGinty (1870-1909) & Margaret Kirk (1871-1906)
\tJames Lynch McGinty (1896-1950) & Theresa Curtis (1894-1952)
\t\tJohn G. McGinty (1922-1991)
\t\tLoreen (1953)
```
* Tabs are the source of truth for nesting.
* Mixed tabs/spaces are tolerated for *outdent*; prefer tabs overall.

---

## Features
* **Two-pane UI**: Editor (left) + Tree View (right); SVG Tree diagram below
* **Focus mode**: focus/unfocus any node
* **Exports**: HTML (collapsible), JSON, SVG
* **Timestamped filenames**;e.g. ```family_tree-31JUL2025-1422.html```

---

## Roadmap
* Tree View polish (grid lines, improved spacing)
* SVG layout: smarter sizing, long-text handling
* Better keyboard navigation in TreeView
* Optional space-based indentation mode

---

## Scripts
* ```npm start``` - dev server (React)
* ```npm run build``` production build
 
---

## Contributing
Issues and PRs are welcome.For bug reports, include:
* OS/Browser
* The tree text (or a minimal repro)
* Console errors (if any)

---

## License
MIT License

Copyright (c) 2025 James C. Brannigan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: 
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software. 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


---

### **Release Notes** (for GitHub Releases page)

**v1.0.0-beta – First Public Beta**

🚀 **New**  
- Interactive Tree View with collapsible nodes and focus/unfocus  
- Live SVG diagram generation from parsed tree  
- Upload `.txt` files or paste tab-indented text  
- HTML, JSON, and SVG export with timestamped filenames  
- Responsive split-pane layout for editor and views  

⚠️ **Known Issues**  
- SVG layout can clip long names in some cases  
- Tree View expand/collapse needs spacing tweaks  
- No drag-and-drop rearranging yet  
- Only tab-indented format supported  

---

### **CHANGELOG.md**

```markdown
# Changelog

## [1.0.0-beta] – 2025-08-10
### Added
- Upload button to load `.txt` files into editor
- Live parsing of tab-indented text to JSON tree
- Interactive Tree View with collapsible nodes
- Focus/unfocus feature in Tree View
- SVG diagram generation
- Download buttons for HTML, JSON, SVG (timestamped filenames)
- Split-pane layout: editor + tree view, SVG view below

### Changed
- Unified layout with header toolbar for key actions

### Known Issues
- SVG text may overflow in rare cases
- Tree View expand/collapse spacing could be improved
- No drag/drop editing in Tree View
